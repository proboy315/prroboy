// Platform-neutral API: (Request, ctx) => Response. Vercel (api/) and Netlify (netlify/functions/) wrap this.
//
// Public routes:   GET  /api/health          POST /api/collect          GET /api/site-config
// Owner session:   POST /api/admin/login|logout     GET /api/admin/me|status|audit
//                  GET/PUT/POST /api/admin/config[/publish|/revert|/reset|/discard]
//                  GET/DELETE/POST /api/admin/devices[/:id|/revoke-all]
//                  GET/POST/DELETE /api/admin/keys[/:id[/rotate]]
//                  POST /api/admin/analytics/enabled|clear   GET /api/admin/analytics/export
// Owner OR scoped bot key (Authorization: Bearer pbk_...):  GET /api/analytics/summary
import {
  decryptJson, deriveKey, encryptJson, fail, hmac, isSecureRequest, json, parseCookies, randomId, randomToken,
  safeEqual, serializeCookie, sha256, today, verifyPassword, verifyTotp, clientIp,
} from "./lib.mjs";
import { createStore } from "./store.mjs";
import { clearAll, collect, exportAll, summarize } from "./analytics.mjs";
import { DEFAULT_CONFIG, publicConfig, sanitizeConfig } from "../shared/siteConfig.mjs";

export const SCOPES = ["analytics:read"];
const SESSION_TTL = 12 * 3600;

export function createHandler({ env = process.env, store: injected } = {}) {
  const store = injected === undefined ? createStore(env) : injected;
  const secret = env.SESSION_SECRET || "";
  const secretOk = secret.length >= 32;
  const encKey = secretOk ? deriveKey(env.DATA_ENCRYPTION_KEY || secret, "records") : null;
  const adminReady = Boolean(env.ADMIN_USERNAME && env.ADMIN_PASSWORD_HASH && secretOk);
  const totpSecret = env.ADMIN_TOTP_SECRET || "";
  const secFp = sha256(`${env.ADMIN_PASSWORD_HASH}|${totpSecret}|${secret}`).slice(0, 16);
  let cfgCache = { at: 0, cfg: null };

  /* ---------- store helpers ---------- */
  const readEnc = async (key, fallback) => decryptJson(encKey, await store.get(key)) ?? fallback;
  const writeEnc = (key, val) => store.set(key, encryptJson(encKey, val));
  const readJson = async (key, fallback) => { try { const v = await store.get(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const audit = async (request, action, detail = "") => {
    try {
      const list = await readEnc("audit", []);
      list.unshift({ ts: Date.now(), action, detail: String(detail).slice(0, 200), ip: sha256(`${clientIp(request)}|${secret}`).slice(0, 8) });
      await writeEnc("audit", list.slice(0, 200));
    } catch { /* auditing must not break requests */ }
  };
  const rateLimit = async (key, windowSec, max) => (await store.incr(key, windowSec)) <= max;

  async function publishedConfig(force = false) {
    if (!force && cfgCache.cfg && Date.now() - cfgCache.at < 10_000) return cfgCache.cfg;
    const stored = store ? await readJson("cfg:published", null) : null;
    const cfg = sanitizeConfig(stored?.config ?? DEFAULT_CONFIG);
    cfgCache = { at: Date.now(), cfg, meta: stored ? { version: stored.version, publishedAt: stored.publishedAt } : { version: 0, publishedAt: null } };
    return cfg;
  }

  /* ---------- auth ---------- */
  const cookieNames = (request) => {
    const secure = isSecureRequest(request);
    return { secure, sess: secure ? "__Host-pb_sess" : "pb_sess", dev: secure ? "__Host-pb_dev" : "pb_dev" };
  };

  async function getSession(request) {
    if (!store || !secretOk) return null;
    const { sess } = cookieNames(request);
    const token = parseCookies(request.headers.get("cookie"))[sess];
    if (!token) return null;
    const rec = await readJson(`sess:${sha256(token)}`, null);
    if (!rec || rec.sec !== secFp) return null;
    if (String(rec.epoch) !== String((await store.get("cfg:epoch")) || "0")) return null;
    return { ...rec, tokenHash: sha256(token) };
  }

  function sameOrigin(request) {
    try {
      const o = new URL(request.headers.get("origin") || "");
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
      return o.host === host;
    } catch { return false; }
  }

  async function findTrustedDevice(request) {
    const { dev } = cookieNames(request);
    const raw = parseCookies(request.headers.get("cookie"))[dev];
    if (!raw) return null;
    const [id, token] = raw.split(".");
    const list = await readEnc("devices", []);
    const d = list.find((x) => x.id === id);
    if (!d || d.sec !== secFp || d.expiresAt < Date.now() || !token || !safeEqual(sha256(token), d.tokenHash)) return null;
    return { device: d, list };
  }

  async function issueSession(request, deviceId) {
    const token = randomToken();
    const epoch = (await store.get("cfg:epoch")) || "0";
    await store.set(`sess:${sha256(token)}`, JSON.stringify({ iat: Date.now(), dev: deviceId || null, sec: secFp, epoch }), SESSION_TTL);
    const { sess, secure } = cookieNames(request);
    return serializeCookie(sess, token, { maxAge: SESSION_TTL, secure });
  }

  /** Auth for protected routes: owner cookie session, or a bearer API key holding `scope`. */
  async function authorize(request, { scope, ownerOnly } = {}) {
    const session = await getSession(request);
    if (session) {
      if (request.method !== "GET" && request.method !== "HEAD" && !sameOrigin(request)) return { error: fail(403, "bad_origin") };
      return { owner: true, session };
    }
    const bearer = /^Bearer\s+(pbk_[A-Za-z0-9_-]+)$/.exec(request.headers.get("authorization") || "");
    if (bearer && !ownerOnly && scope && store && encKey) {
      const [, id, tok] = bearer[1].split("_");
      const keys = await readEnc("apikeys", []);
      const k = keys.find((x) => x.id === id);
      if (k && !k.revoked && (!k.expiresAt || k.expiresAt > Date.now()) && tok && safeEqual(sha256(tok), k.hash) && k.scopes.includes(scope))
        return { owner: false, key: k };
    }
    return { error: fail(401, "unauthorized") };
  }

  /* ---------- route handlers ---------- */
  async function login(request) {
    if (!adminReady) return fail(503, "admin_not_configured");
    if (!store) return fail(503, "storage_not_configured");
    if (!sameOrigin(request)) return fail(403, "bad_origin");
    const ipKey = sha256(`${clientIp(request)}|${secret}`).slice(0, 16);
    // Throttle on FAILED attempts only, so a legitimate owner is never locked out by successful logins.
    const failKeys = [`rl:login:${ipKey}`, "rl:login:all"];
    const [ipFails, allFails] = await Promise.all(failKeys.map(async (k) => Number((await store.get(k)) || 0)));
    if (ipFails >= 8 || allFails >= 60) return fail(429, "too_many_attempts");
    const recordFailure = () => Promise.all(failKeys.map((k) => store.incr(k, 900)));
    let b; try { b = await request.json(); } catch { return fail(400, "bad_json"); }

    const userOk = safeEqual(String(b.username || ""), env.ADMIN_USERNAME);
    const passOk = verifyPassword(String(b.password || ""), env.ADMIN_PASSWORD_HASH); // always evaluated
    if (!userOk || !passOk) { await recordFailure(); await audit(request, "login_failed"); return fail(401, "invalid_credentials"); }

    const trusted = totpSecret ? await findTrustedDevice(request) : null;
    let verified = Boolean(trusted);
    if (totpSecret && !trusted) {
      if (!b.totp) return json({ ok: false, step: "verify", error: "verification_required" }, 401);
      if (!verifyTotp(totpSecret, b.totp)) { await recordFailure(); await audit(request, "verify_failed"); return fail(401, "invalid_code"); }
      verified = true;
    }

    const extra = [];
    let deviceId = trusted?.device.id || null;
    const { dev, secure } = cookieNames(request);
    const days = (await publishedConfig()).security.trustedDeviceDays;
    if (totpSecret && verified && (trusted || b.remember === true)) {
      // create or rotate the trusted-device credential; only a hash is stored server-side
      const token = randomToken();
      const list = trusted ? trusted.list : await readEnc("devices", []);
      const now = Date.now();
      const rec = trusted
        ? Object.assign(trusted.device, { tokenHash: sha256(token), lastSeen: now, expiresAt: now + days * 86400000 })
        : { id: randomId(), tokenHash: sha256(token), label: String(b.label || "").slice(0, 60) || uaLabel(request), createdAt: now, lastSeen: now, expiresAt: now + days * 86400000, sec: secFp };
      if (!trusted) list.push(rec);
      await writeEnc("devices", list.filter((d) => d.expiresAt > now));
      deviceId = rec.id;
      extra.push(serializeCookie(dev, `${rec.id}.${token}`, { maxAge: days * 86400, secure }));
      if (!trusted) await audit(request, "device_trusted", rec.label);
    }
    extra.push(await issueSession(request, deviceId));
    await audit(request, "login_ok", trusted ? "trusted device" : totpSecret ? "verified" : "password only");
    return json({ ok: true, role: "owner", verification: Boolean(totpSecret), trustedDevice: Boolean(deviceId) }, 200, { "Set-Cookie": extra });
  }

  const uaLabel = (request) => {
    const ua = request.headers.get("user-agent") || "";
    const b = /edg/i.test(ua) ? "Edge" : /firefox/i.test(ua) ? "Firefox" : /chrome/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : "Browser";
    const o = /windows/i.test(ua) ? "Windows" : /android/i.test(ua) ? "Android" : /iphone|ipad/i.test(ua) ? "iOS" : /mac os/i.test(ua) ? "macOS" : /linux/i.test(ua) ? "Linux" : "device";
    return `${b} on ${o}`;
  };

  async function logout(request) {
    const s = await getSession(request);
    if (s) await store.del(`sess:${s.tokenHash}`);
    const { sess, secure } = cookieNames(request);
    return json({ ok: true }, 200, { "Set-Cookie": serializeCookie(sess, "", { maxAge: 0, secure }) });
  }

  async function status() {
    const cfg = await publishedConfig(true);
    const draft = await readJson("cfg:draft", null);
    const warnings = [];
    if (!store) warnings.push("No private storage configured (set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN).");
    else if (!store.durable) warnings.push("Using the non-durable in-memory store (local development only).");
    if (!totpSecret) warnings.push("Two-step verification is not configured (ADMIN_TOTP_SECRET); trusted devices are unavailable.");
    if (!env.DATA_ENCRYPTION_KEY) warnings.push("DATA_ENCRYPTION_KEY not set: record encryption key is derived from SESSION_SECRET.");
    if (!env.SITE_URL) warnings.push("SITE_URL not set: analytics accepts only the request host as origin.");
    if (!cfg.analytics.enabled) warnings.push("Analytics is OFF — no new events are being collected.");
    let todayStats = null;
    if (store) { const h = await store.hgetall(`an:d:${today()}`); todayStats = { pageViews: Number(h.pv || 0), visitors: Number(h.vis || 0) }; }
    return json({
      ok: true,
      storage: { configured: Boolean(store), kind: store?.kind || null, durable: Boolean(store?.durable) },
      auth: { adminConfigured: adminReady, verificationConfigured: Boolean(totpSecret), trustedDeviceDays: cfg.security.trustedDeviceDays },
      analytics: { enabled: cfg.analytics.enabled, consentMode: cfg.analytics.consentMode, retentionDays: cfg.analytics.retentionDays, today: todayStats },
      config: { ...(cfgCache.meta || {}), hasDraft: Boolean(draft) },
      warnings,
    });
  }

  async function configRoutes(request, sub) {
    const m = request.method;
    const meta = async () => (await publishedConfig(true), cfgCache.meta);
    if (m === "GET" && sub === "") {
      const draft = await readJson("cfg:draft", null);
      return json({ ok: true, published: await publishedConfig(true), draft: draft?.config || null, meta: await meta(), history: (await readJson("cfg:history", [])).map((h) => ({ version: h.version, publishedAt: h.publishedAt })) });
    }
    let body = {};
    if (m !== "GET" && m !== "DELETE") { try { body = await request.json(); } catch { body = {}; } }
    if (m === "PUT" && sub === "") {
      const base = (await readJson("cfg:draft", null))?.config || (await publishedConfig());
      const clean = sanitizeConfig(body.config, base);
      await store.set("cfg:draft", JSON.stringify({ config: clean, savedAt: Date.now() }));
      return json({ ok: true, draft: clean });
    }
    if (m === "POST" && sub === "/discard") { await store.del("cfg:draft"); return json({ ok: true }); }
    if (m === "POST" && sub === "/publish") {
      const draft = await readJson("cfg:draft", null);
      if (!draft) return fail(400, "no_draft");
      await publishConfig(request, draft.config, "publish");
      await store.del("cfg:draft");
      return json({ ok: true, meta: await meta() });
    }
    if (m === "POST" && sub === "/revert") {
      const history = await readJson("cfg:history", []);
      if (!history.length) return fail(400, "no_history");
      const prev = history.shift();
      await store.set("cfg:history", JSON.stringify(history));
      await store.set("cfg:published", JSON.stringify({ config: prev.config, version: prev.version, publishedAt: Date.now() }));
      cfgCache.at = 0;
      await audit(request, "config_revert", `to v${prev.version}`);
      return json({ ok: true, meta: await meta() });
    }
    if (m === "POST" && sub === "/reset") {
      if (body.confirm !== "RESET") return fail(400, "confirmation_required");
      await publishConfig(request, DEFAULT_CONFIG, "reset_defaults");
      await store.del("cfg:draft");
      return json({ ok: true, meta: await meta() });
    }
    return fail(404, "not_found");
  }

  async function publishConfig(request, config, action) {
    const clean = sanitizeConfig(config);
    const current = await readJson("cfg:published", null);
    if (current) {
      const history = await readJson("cfg:history", []);
      history.unshift({ config: current.config, version: current.version, publishedAt: current.publishedAt });
      await store.set("cfg:history", JSON.stringify(history.slice(0, 10)));
    }
    await store.set("cfg:published", JSON.stringify({ config: clean, version: (current?.version || 0) + 1, publishedAt: Date.now() }));
    cfgCache.at = 0;
    await audit(request, `config_${action}`, `v${(current?.version || 0) + 1}`);
  }

  async function deviceRoutes(request, sub) {
    const list = await readEnc("devices", []);
    const view = (d) => ({ id: d.id, label: d.label, createdAt: d.createdAt, lastSeen: d.lastSeen, expiresAt: d.expiresAt });
    const now = Date.now();
    if (request.method === "GET") return json({ ok: true, devices: list.filter((d) => d.expiresAt > now && d.sec === secFp).map(view) });
    if (request.method === "POST" && sub === "/revoke-all") {
      await writeEnc("devices", []);
      await store.set("cfg:epoch", String(Number((await store.get("cfg:epoch")) || 0) + 1)); // also ends every session
      await audit(request, "devices_revoke_all");
      const { dev, sess, secure } = cookieNames(request);
      return json({ ok: true }, 200, { "Set-Cookie": [serializeCookie(dev, "", { maxAge: 0, secure }), serializeCookie(sess, "", { maxAge: 0, secure })] });
    }
    if (request.method === "DELETE" && sub.startsWith("/")) {
      const id = sub.slice(1);
      await writeEnc("devices", list.filter((d) => d.id !== id));
      await audit(request, "device_revoked", id);
      return json({ ok: true });
    }
    return fail(404, "not_found");
  }

  async function keyRoutes(request, sub) {
    const keys = await readEnc("apikeys", []);
    const view = (k) => ({ id: k.id, name: k.name, scopes: k.scopes, createdAt: k.createdAt, expiresAt: k.expiresAt, revoked: Boolean(k.revoked), preview: `pbk_${k.id}_…` });
    const mint = () => { const id = randomId().replace(/[_-]/g, "x"); const tok = randomToken(24).replace(/[_-]/g, "x"); return { id, tok, secret: `pbk_${id}_${tok}` }; };
    if (request.method === "GET") return json({ ok: true, keys: keys.map(view), scopes: SCOPES });
    if (request.method === "POST" && sub === "") {
      let b; try { b = await request.json(); } catch { return fail(400, "bad_json"); }
      const scopes = (Array.isArray(b.scopes) ? b.scopes : []).filter((s) => SCOPES.includes(s));
      if (!scopes.length) return fail(400, "scopes_required");
      const { id, tok, secret: s } = mint();
      const days = Math.min(365, Math.max(1, Number(b.expiresInDays) || 90));
      keys.push({ id, name: String(b.name || "Bot").slice(0, 60), hash: sha256(tok), scopes, createdAt: Date.now(), expiresAt: Date.now() + days * 86400000 });
      await writeEnc("apikeys", keys);
      await audit(request, "key_created", `${id} ${scopes.join(",")}`);
      return json({ ok: true, secret: s, note: "Shown once. Store it in your bot's secret manager." }, 201);
    }
    const rot = /^\/([A-Za-z0-9]+)\/rotate$/.exec(sub);
    if (request.method === "POST" && rot) {
      const k = keys.find((x) => x.id === rot[1]);
      if (!k || k.revoked) return fail(404, "not_found");
      const { tok } = mint();
      k.hash = sha256(tok);
      await writeEnc("apikeys", keys);
      await audit(request, "key_rotated", k.id);
      return json({ ok: true, secret: `pbk_${k.id}_${tok}`, note: "Previous secret no longer works." });
    }
    if (request.method === "DELETE" && sub.startsWith("/")) {
      const k = keys.find((x) => x.id === sub.slice(1));
      if (!k) return fail(404, "not_found");
      k.revoked = true;
      await writeEnc("apikeys", keys);
      await audit(request, "key_revoked", k.id);
      return json({ ok: true });
    }
    return fail(404, "not_found");
  }

  /* ---------- main router ---------- */
  return async function handle(request, extra = {}) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, "").replace(/\/+$/, "") || "/";
    const m = request.method;
    try {
      if (path === "/health" && m === "GET") return json({ ok: true });

      if (path === "/site-config" && m === "GET") {
        if (!store) return json(publicConfig(DEFAULT_CONFIG), 200, { "X-Config-Source": "default", "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60" });
        if (url.searchParams.get("preview") === "1" && (await getSession(request))) {
          const d = await readJson("cfg:draft", null);
          return json(publicConfig(sanitizeConfig(d?.config || (await publishedConfig()))), 200, { "X-Config-Source": "draft-preview" });
        }
        return json(publicConfig(await publishedConfig()), 200, { "Cache-Control": "public, max-age=0, s-maxage=30, stale-while-revalidate=60", "X-Config-Source": "published" });
      }

      if (path === "/collect" && m === "POST") {
        if (!store || !secretOk) return new Response(null, { status: 204 });
        const selfHosts = [new URL(request.url).host, request.headers.get("host"), request.headers.get("x-forwarded-host")]
          .concat(env.SITE_URL ? [new URL(env.SITE_URL).host, new URL(env.SITE_URL).host.replace(/^www\./, ""), "www." + new URL(env.SITE_URL).host] : []).filter(Boolean);
        const country = (extra.country || request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "").toUpperCase();
        return collect({ request, store, config: await publishedConfig(), secret, selfHosts, country, rateLimit });
      }

      if (path === "/admin/login" && m === "POST") return login(request);
      if (path === "/admin/logout" && m === "POST") return logout(request);
      if (path === "/admin/me" && m === "GET") {
        const s = store && secretOk ? await getSession(request) : null;
        return json({ ok: true, authenticated: Boolean(s), role: s ? "owner" : null, configured: adminReady && Boolean(store), verificationConfigured: Boolean(totpSecret) });
      }

      if (path === "/analytics/summary" && m === "GET") {
        const a = await authorize(request, { scope: "analytics:read" });
        if (a.error) return a.error;
        const data = await summarize({ store, from: url.searchParams.get("from"), to: url.searchParams.get("to"), granularity: url.searchParams.get("granularity") });
        return json({ ok: true, ...data }, 200, { "Cache-Control": "private, no-store" });
      }

      if (path.startsWith("/admin/")) {
        if (!store || !secretOk) return fail(503, "not_configured");
        const a = await authorize(request, { ownerOnly: true });
        if (a.error) return a.error;
        if (path === "/admin/status" && m === "GET") return status();
        if (path === "/admin/audit" && m === "GET") return json({ ok: true, entries: (await readEnc("audit", [])).slice(0, 100) });
        if (path.startsWith("/admin/config")) return configRoutes(request, path.slice("/admin/config".length));
        if (path.startsWith("/admin/devices")) return deviceRoutes(request, path.slice("/admin/devices".length));
        if (path.startsWith("/admin/keys")) return keyRoutes(request, path.slice("/admin/keys".length));
        if (path === "/admin/analytics/enabled" && m === "POST") {
          const b = await request.json().catch(() => ({}));
          if (typeof b.enabled !== "boolean") return fail(400, "enabled_required");
          const cfg = { ...(await publishedConfig(true)), analytics: { ...(await publishedConfig()).analytics, enabled: b.enabled } };
          await publishConfig(request, cfg, b.enabled ? "analytics_on" : "analytics_off");
          return json({ ok: true, enabled: b.enabled });
        }
        if (path === "/admin/analytics/export" && m === "GET") { await audit(request, "analytics_export"); return json(await exportAll(store)); }
        if (path === "/admin/analytics/clear" && m === "POST") {
          const b = await request.json().catch(() => ({}));
          if (b.confirm !== "DELETE") return fail(400, "confirmation_required");
          const n = await clearAll(store);
          await audit(request, "analytics_cleared", `${n} days`);
          return json({ ok: true, daysDeleted: n });
        }
      }
      return fail(404, "not_found");
    } catch (e) {
      // never leak internals; details stay in server logs
      console.error("[api]", e?.message || e);
      return fail(500, "server_error");
    }
  };
}

export { hmac };
