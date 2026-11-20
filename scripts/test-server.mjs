// End-to-end tests for the serverless API core (server/handler.mjs) using the in-memory store.
//   npm run test:server
// Fake credentials only. Exercises auth, TOTP verification, trusted devices, API keys, config
// publish/revert, analytics ON/OFF, privacy signals and authorization boundaries.
import assert from "node:assert/strict";
import { createHandler } from "../server/handler.mjs";
import { createStore } from "../server/store.mjs";
import { generateTotpSecret, hashPassword, totpAt } from "../server/lib.mjs";

const TOTP = generateTotpSecret();
const env = {
  ADMIN_USERNAME: "owner-test",
  ADMIN_PASSWORD_HASH: hashPassword("correct horse battery staple", { N: 4096 }),
  ADMIN_TOTP_SECRET: TOTP,
  SESSION_SECRET: "x".repeat(48),
  SITE_URL: "https://proboy.example",
  PROBOY_ALLOW_MEMORY_STORE: "1",
};
const store = createStore(env);
const handle = createHandler({ env, store });
const ORIGIN = "https://proboy.example";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36";

let passed = 0;
const results = [];
async function t(name, fn) {
  try { await fn(); passed++; results.push(`  ✓ ${name}`); }
  catch (e) { results.push(`  ✗ ${name}\n      ${e.message}`); process.exitCode = 1; }
}

class Jar {
  c = {};
  absorb(res) {
    for (const sc of res.headers.getSetCookie?.() ?? []) {
      const [pair, ...attrs] = sc.split("; ");
      const i = pair.indexOf("=");
      const name = pair.slice(0, i), value = decodeURIComponent(pair.slice(i + 1));
      if (attrs.some((a) => /^Max-Age=0$/i.test(a))) delete this.c[name]; else this.c[name] = value;
    }
  }
  header() { return Object.entries(this.c).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("; "); }
}
async function call(method, path, { body, jar, headers = {}, origin = ORIGIN, ua = UA } = {}) {
  const h = { "x-forwarded-proto": "https", host: "proboy.example", "user-agent": ua, "x-forwarded-for": "203.0.113.9", ...headers };
  if (origin) h.origin = origin;
  if (body !== undefined) h["content-type"] = "application/json";
  if (jar?.header()) h.cookie = jar.header();
  const res = await handle(new Request(`https://proboy.example${path}`, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) }));
  jar?.absorb(res);
  const text = await res.text();
  let data = null; try { data = JSON.parse(text); } catch { /* 204 */ }
  return { status: res.status, data, headers: res.headers };
}
const good = { username: "owner-test", password: "correct horse battery staple" };
const code = () => totpAt(TOTP);

const owner = new Jar();
const device = new Jar(); // persists only the trusted-device cookie between sessions

await t("health endpoint is public", async () => assert.equal((await call("GET", "/api/health")).status, 200));
await t("site-config serves safe defaults, no secrets", async () => {
  const r = await call("GET", "/api/site-config");
  assert.equal(r.status, 200); assert.equal(r.data.analytics.enabled, false);
  assert.equal(JSON.stringify(r.data).includes("retention"), false);
});
await t("admin endpoints reject anonymous requests", async () => {
  for (const p of ["/api/admin/status", "/api/admin/config", "/api/admin/devices", "/api/admin/keys", "/api/analytics/summary"])
    assert.equal((await call("GET", p)).status, 401, p);
});
await t("login rejects wrong password and unknown user", async () => {
  assert.equal((await call("POST", "/api/admin/login", { body: { ...good, password: "nope" } })).status, 401);
  assert.equal((await call("POST", "/api/admin/login", { body: { username: "x", password: good.password } })).status, 401);
});
await t("login with correct password asks for verification and sets no session", async () => {
  const j = new Jar(); const r = await call("POST", "/api/admin/login", { body: good, jar: j });
  assert.equal(r.status, 401); assert.equal(r.data.step, "verify"); assert.equal(Object.keys(j.c).length, 0);
});
await t("wrong verification code is rejected", async () => assert.equal((await call("POST", "/api/admin/login", { body: { ...good, totp: "000000" } })).status, 401));
await t("login from a foreign origin is blocked (CSRF)", async () => assert.equal((await call("POST", "/api/admin/login", { body: { ...good, totp: code() }, origin: "https://evil.example" })).status, 403));
await t("verified login sets HttpOnly/Secure/SameSite=Strict session + trusted-device cookies", async () => {
  const r = await call("POST", "/api/admin/login", { body: { ...good, totp: code(), remember: true }, jar: owner });
  assert.equal(r.status, 200); assert.equal(r.data.trustedDevice, true);
  const cookies = r.headers.getSetCookie();
  assert.equal(cookies.length, 2);
  for (const c of cookies) assert.match(c, /HttpOnly/), assert.match(c, /Secure/), assert.match(c, /SameSite=Strict/), assert.match(c, /^__Host-/);
  for (const [k, v] of Object.entries(owner.c)) if (k.includes("dev")) device.c[k] = v;
});
await t("session grants owner access", async () => {
  assert.equal((await call("GET", "/api/admin/me", { jar: owner })).data.authenticated, true);
  assert.equal((await call("GET", "/api/admin/status", { jar: owner })).status, 200);
});
await t("only a hash of the device token is stored (no raw token in the store)", async () => {
  const token = Object.values(device.c)[0].split(".")[1];
  for (const v of store.d.values()) assert.equal(typeof v === "string" && v.includes(token), false);
});
await t("trusted device skips the verification step but still requires the password", async () => {
  const j = new Jar(); j.c = { ...device.c };
  assert.equal((await call("POST", "/api/admin/login", { body: { ...good, password: "wrong" }, jar: j })).status, 401);
  const r = await call("POST", "/api/admin/login", { body: good, jar: j });
  assert.equal(r.status, 200); assert.equal(r.data.trustedDevice, true);
  device.c = Object.fromEntries(Object.entries(j.c).filter(([k]) => k.includes("dev"))); // rotated credential
});
await t("a stale (pre-rotation) device cookie is no longer trusted", async () => {
  const j = new Jar(); j.c = { ...owner.c }; // owner jar still has the ORIGINAL device token
  for (const k of Object.keys(j.c)) if (!k.includes("dev")) delete j.c[k];
  const r = await call("POST", "/api/admin/login", { body: good, jar: j });
  assert.equal(r.data.step, "verify");
});
await t("device list shows the trusted device; revoking it forces verification again", async () => {
  const list = await call("GET", "/api/admin/devices", { jar: owner });
  assert.equal(list.data.devices.length, 1);
  assert.equal((await call("DELETE", `/api/admin/devices/${list.data.devices[0].id}`, { jar: owner })).status, 200);
  const j = new Jar(); j.c = { ...device.c };
  assert.equal((await call("POST", "/api/admin/login", { body: good, jar: j })).data.step, "verify");
});

/* ---- analytics ---- */
const pv = (extra = {}, opts = {}) => call("POST", "/api/collect", { body: { t: "pv", path: "/about", sid: "s1", ref: "https://news.example/x?y=1", ...extra }, ...opts });
const summary = async (jar = owner) => (await call("GET", "/api/analytics/summary", { jar })).data;
await t("analytics OFF by default: events are accepted-and-dropped, nothing stored", async () => {
  assert.equal((await pv()).status, 204);
  assert.equal((await summary()).totals.pageViews, 0);
});
await t("owner can switch analytics ON; public config reflects it immediately", async () => {
  assert.equal((await call("POST", "/api/admin/analytics/enabled", { body: { enabled: true }, jar: owner })).data.enabled, true);
  assert.equal((await call("GET", "/api/site-config")).data.analytics.enabled, true);
});
await t("page view is counted with referrer domain only, device/browser/OS families", async () => {
  assert.equal((await pv()).status, 204);
  const s = await summary();
  assert.equal(s.totals.pageViews, 1); assert.equal(s.totals.visitors, 1); assert.equal(s.totals.sessions, 1);
  assert.deepEqual(s.referrers[0], { name: "news.example", count: 1 });
  assert.equal(s.devices[0].name, "desktop"); assert.equal(s.browsers[0].name, "Chrome"); assert.equal(s.os[0].name, "Windows");
  assert.equal(s.pages[0].name, "/about");
});
await t("raw IP and user-agent are never written to the store", async () => {
  for (const [k, v] of store.d.entries()) {
    const blob = k + JSON.stringify(v instanceof Map ? [...v] : v instanceof Set ? [...v] : v);
    assert.equal(blob.includes("203.0.113.9"), false); assert.equal(blob.includes("Mozilla"), false);
  }
});
await t("Do Not Track and Global Privacy Control are honoured", async () => {
  const before = (await summary()).totals.pageViews;
  await pv({ path: "/x" }, { headers: { dnt: "1" } }); await pv({ path: "/y" }, { headers: { "sec-gpc": "1" } });
  assert.equal((await summary()).totals.pageViews, before);
});
await t("bots, private paths and foreign origins are not recorded", async () => {
  const before = (await summary()).totals.pageViews;
  await pv({}, { ua: "Googlebot/2.1" }); await pv({ path: "/admin" }); await pv({ path: "/api/x" });
  assert.equal((await pv({}, { origin: "https://evil.example" })).status, 403);
  assert.equal((await summary()).totals.pageViews, before);
});
await t("custom events: valid names counted, invalid names dropped", async () => {
  await call("POST", "/api/collect", { body: { t: "ev", name: "contact_click", path: "/" } });
  await call("POST", "/api/collect", { body: { t: "ev", name: "Bad Name!", path: "/" } });
  const s = await summary(); assert.deepEqual(s.events, [{ name: "contact_click", count: 1 }]);
});
await t("oversized or malformed bodies are rejected", async () => {
  assert.equal((await call("POST", "/api/collect", { body: { t: "pv", path: "/", pad: "x".repeat(3000) } })).status, 413);
});

/* ---- API keys for bots ---- */
let botKey;
await t("owner mints a scoped key (secret shown once); stored encrypted + hashed", async () => {
  const r = await call("POST", "/api/admin/keys", { body: { name: "report-bot", scopes: ["analytics:read"], expiresInDays: 30 }, jar: owner });
  assert.equal(r.status, 201); botKey = r.data.secret; assert.match(botKey, /^pbk_/);
  const stored = store.d.get("apikeys"); assert.equal(stored.includes(botKey.split("_")[2]), false); assert.match(stored, /^v1\./);
  assert.equal(JSON.stringify((await call("GET", "/api/admin/keys", { jar: owner })).data).includes(botKey), false);
});
await t("bot key reads analytics but nothing administrative", async () => {
  const auth = { authorization: `Bearer ${botKey}` };
  assert.equal((await call("GET", "/api/analytics/summary", { headers: auth })).status, 200);
  for (const p of ["/api/admin/config", "/api/admin/devices", "/api/admin/keys", "/api/admin/analytics/export"])
    assert.equal((await call("GET", p, { headers: auth })).status, 401, p);
  assert.equal((await call("POST", "/api/admin/analytics/clear", { headers: auth, body: { confirm: "DELETE" } })).status, 401);
});
await t("rotating a key invalidates the old secret; revoking disables the new one", async () => {
  const id = botKey.split("_")[1];
  const rot = await call("POST", `/api/admin/keys/${id}/rotate`, { jar: owner, body: {} });
  assert.equal((await call("GET", "/api/analytics/summary", { headers: { authorization: `Bearer ${botKey}` } })).status, 401);
  const fresh = rot.data.secret;
  assert.equal((await call("GET", "/api/analytics/summary", { headers: { authorization: `Bearer ${fresh}` } })).status, 200);
  await call("DELETE", `/api/admin/keys/${id}`, { jar: owner });
  assert.equal((await call("GET", "/api/analytics/summary", { headers: { authorization: `Bearer ${fresh}` } })).status, 401);
});

/* ---- config draft / publish / revert ---- */
await t("draft is validated, clamped and NOT public until published", async () => {
  const r = await call("PUT", "/api/admin/config", { jar: owner, body: { config: { ui: { accent: "javascript:alert(1)", radius: 9999, theme: "crimson" }, maintenance: { enabled: true, title: "Updating", message: "Back soon" }, announcement: { enabled: true, text: "Hello", link: "javascript:alert(1)" } } } });
  assert.equal(r.data.draft.ui.radius, 36); assert.equal(r.data.draft.ui.accent, "#ef1d3e"); assert.equal(r.data.draft.announcement.link, "");
  assert.equal((await call("GET", "/api/site-config")).data.maintenance.enabled, false);
  assert.equal((await call("GET", "/api/site-config?preview=1", { jar: owner })).data.maintenance.enabled, true);
  assert.equal((await call("GET", "/api/site-config?preview=1")).data.maintenance.enabled, false); // anonymous cannot preview
});
await t("publish makes it public; revert restores the previous version", async () => {
  assert.equal((await call("POST", "/api/admin/config/publish", { jar: owner, body: {} })).status, 200);
  const pub = (await call("GET", "/api/site-config")).data;
  assert.equal(pub.maintenance.enabled, true); assert.equal(pub.ui.theme, "crimson"); assert.equal(pub.analytics.enabled, true);
  assert.equal((await call("POST", "/api/admin/config/revert", { jar: owner, body: {} })).status, 200);
  assert.equal((await call("GET", "/api/site-config")).data.maintenance.enabled, false);
});
await t("reset to defaults requires explicit confirmation", async () => {
  assert.equal((await call("POST", "/api/admin/config/reset", { jar: owner, body: {} })).status, 400);
  assert.equal((await call("POST", "/api/admin/config/reset", { jar: owner, body: { confirm: "RESET" } })).status, 200);
  assert.equal((await call("GET", "/api/site-config")).data.ui.theme, "iridescent");
});

/* ---- analytics switch OFF / export / clear ---- */
await t("analytics OFF stops collection but keeps history; export works", async () => {
  await call("POST", "/api/admin/analytics/enabled", { body: { enabled: true }, jar: owner });
  await pv({ path: "/projects", sid: "s9" });
  const before = (await summary()).totals.pageViews;
  await call("POST", "/api/admin/analytics/enabled", { body: { enabled: false }, jar: owner });
  await pv({ path: "/projects", sid: "s10" });
  assert.equal((await summary()).totals.pageViews, before);
  const ex = await call("GET", "/api/admin/analytics/export", { jar: owner });
  assert.equal(ex.data.format, "proboy-analytics-v1"); assert.ok(Object.keys(ex.data.days).length >= 1);
});
await t("clearing analytics needs confirmation and then empties the reports", async () => {
  assert.equal((await call("POST", "/api/admin/analytics/clear", { jar: owner, body: {} })).status, 400);
  assert.equal((await call("POST", "/api/admin/analytics/clear", { jar: owner, body: { confirm: "DELETE" } })).status, 200);
  assert.equal((await summary()).totals.pageViews, 0);
});

/* ---- audit, revoke-all, logout ---- */
await t("audit log records security events (encrypted at rest)", async () => {
  const a = (await call("GET", "/api/admin/audit", { jar: owner })).data.entries.map((e) => e.action);
  for (const k of ["login_ok", "device_trusted", "key_created", "analytics_cleared", "config_publish"]) assert.ok(a.includes(k), k);
  assert.match(store.d.get("audit"), /^v1\./);
});
await t("revoke-all ends sessions and trusted devices", async () => {
  assert.equal((await call("POST", "/api/admin/devices/revoke-all", { jar: owner, body: {} })).status, 200);
  assert.equal((await call("GET", "/api/admin/status", { jar: owner })).status, 401);
});
await t("logout invalidates the session cookie", async () => {
  const j = new Jar();
  await call("POST", "/api/admin/login", { body: { ...good, totp: code() }, jar: j });
  assert.equal((await call("GET", "/api/admin/me", { jar: j })).data.authenticated, true);
  await call("POST", "/api/admin/logout", { jar: j, body: {} });
  assert.equal((await call("GET", "/api/admin/me", { jar: j })).data.authenticated, false);
});
await t("brute force is rate limited", async () => {
  let last = 0;
  for (let i = 0; i < 12; i++) last = (await call("POST", "/api/admin/login", { body: { ...good, password: "bad" + i }, headers: { "x-forwarded-for": "198.51.100.77" } })).status;
  assert.equal(last, 429);
});
await t("without storage/admin env the API fails closed", async () => {
  const bare = createHandler({ env: {}, store: null });
  const r = await bare(new Request("https://proboy.example/api/admin/status", { headers: { host: "proboy.example" } }));
  assert.equal(r.status, 503);
  const c = await bare(new Request("https://proboy.example/api/collect", { method: "POST", body: "{}", headers: { origin: ORIGIN } }));
  assert.equal(c.status, 204);
});

console.log(results.join("\n"));
console.log(`\n${passed}/${results.length} passed`);
