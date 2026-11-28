// First-party, cookie-less, aggregate analytics.
//
// What is stored (per UTC day, as counters in a private store):
//   page views, daily-unique visitors, sessions, new/returning, top paths, referrer DOMAINS,
//   device / browser / OS families, country code (ISO-2, only if the host provides it), custom event names.
// What is NOT stored: IP addresses, user-agent strings, cookies, precise location, form contents, titles of
//   private pages, query strings or URL fragments.
// "Unique visitors" use a salted hash of (IP + UA) with a salt that rotates every UTC day, held only in the
//   daily-unique set (which expires after 2 days). Visitors therefore cannot be linked across days, so
//   multi-day visitor numbers are a SUM of daily uniques (an upper-bound estimate) and are labelled as such.
import { clientIp, hmac, randomId, today } from "./lib.mjs";
import { hgetallMany } from "./store.mjs";

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|curl|wget|python-requests|node-fetch|axios|monitor|uptime/i;

export function parseUa(ua = "") {
  const bot = BOT_RE.test(ua);
  const device = /ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)
    ? "tablet"
    : /mobi|iphone|ipod|android/i.test(ua) ? "mobile" : "desktop";
  const browser = /edg(e|a|ios)?\//i.test(ua) ? "Edge"
    : /opr\/|opera/i.test(ua) ? "Opera"
    : /samsungbrowser/i.test(ua) ? "Samsung Internet"
    : /firefox|fxios/i.test(ua) ? "Firefox"
    : /chrome|crios/i.test(ua) ? "Chrome"
    : /safari/i.test(ua) ? "Safari" : "Other";
  const os = /windows/i.test(ua) ? "Windows"
    : /android/i.test(ua) ? "Android"
    : /iphone|ipad|ipod/i.test(ua) ? "iOS"
    : /cros/i.test(ua) ? "ChromeOS"
    : /mac os x|macintosh/i.test(ua) ? "macOS"
    : /linux|x11/i.test(ua) ? "Linux" : "Other";
  return { bot, device, browser, os };
}

const clean = (s) => String(s).replace(/[|\u0000-\u001f\u007f]/g, "");

export function normalizePath(p) {
  if (typeof p !== "string" || !p.startsWith("/") || p.startsWith("//")) return null;
  let path = clean(p.split("?")[0].split("#")[0]).slice(0, 160);
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (/^\/(admin|api)(\/|$)/i.test(path)) return null; // never record the private panel or API
  return path || "/";
}

export function refDomain(ref, selfHost) {
  try {
    if (!ref) return "(direct)";
    const h = new URL(ref).hostname.replace(/^www\./, "").toLowerCase();
    if (!h || h === String(selfHost).replace(/^www\./, "").toLowerCase()) return "(internal)";
    return clean(h).slice(0, 80);
  } catch {
    return "(direct)";
  }
}

const EVENT_RE = /^[a-z0-9][a-z0-9_:.-]{0,39}$/;

/** Handle one public collection request. Always answers 204 for "ignored" so nothing leaks about config. */
export async function collect({ request, store, config, secret, selfHosts, country, rateLimit }) {
  const ignore = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  if (!config.analytics.enabled) return ignore(); // master switch OFF: nothing is stored
  const h = request.headers;
  if (h.get("dnt") === "1" || h.get("sec-gpc") === "1") return ignore(); // honour browser privacy signals

  const origin = h.get("origin");
  let originHost = "";
  try { originHost = origin ? new URL(origin).host : ""; } catch { /* invalid */ }
  if (!originHost || !selfHosts.includes(originHost)) return new Response(null, { status: 403 });

  const raw = await request.text();
  if (raw.length > 2048) return new Response(null, { status: 413 });
  let b;
  try { b = JSON.parse(raw); } catch { return new Response(null, { status: 400 }); }
  if (!b || typeof b !== "object") return new Response(null, { status: 400 });

  const ua = h.get("user-agent") || "";
  const { bot, device, browser, os } = parseUa(ua);
  if (bot) return ignore();

  const path = normalizePath(b.path);
  if (!path) return ignore();
  const type = b.t === "ev" ? "ev" : "pv";
  if (type === "ev" && (!config.analytics.trackEvents || !EVENT_RE.test(String(b.name || "")))) return ignore();

  const day = today();
  const salt = hmac(secret, `salt:${day}`);
  const ip = clientIp(request);
  const vid = hmac(salt, `${ip}|${ua}`).slice(0, 24);

  if (rateLimit && !(await rateLimit(`rl:collect:${vid}`, 60, 120))) return new Response(null, { status: 429 });

  const ttl = Math.max(7, config.analytics.retentionDays) * 86400;
  const dk = `an:d:${day}`;
  const ops = [];
  const inc = (f, n = 1) => ops.push(store.hincrby(dk, f, n));

  if (type === "pv") {
    inc("pv");
    const uniq = await store.sadd(`an:v:${day}`, vid);
    if (uniq) {
      inc("vis");
      inc(b.ret ? "ret" : "new");
      ops.push(store.expire(`an:v:${day}`, 2 * 86400));
      inc(`d|${device}`); inc(`b|${browser}`); inc(`o|${os}`);
      if (country && /^[A-Z]{2}$/.test(country)) inc(`c|${country}`);
    }
    const sid = typeof b.sid === "string" ? clean(b.sid).slice(0, 24) : "";
    if (sid && (await store.sadd(`an:s:${day}`, hmac(salt, sid).slice(0, 16)))) {
      inc("sess");
      ops.push(store.expire(`an:s:${day}`, 2 * 86400));
    }
    const pathField = (await store.hlen(dk)) > 1500 ? "p|(other)" : `p|${path}`;
    inc(pathField);
    inc(`r|${refDomain(b.ref, originHost)}`);
  } else {
    inc(`e|${b.name}`);
  }
  ops.push(store.expire(dk, ttl), store.sadd("an:days", day));
  await Promise.all(ops);
  return ignore();
}

/* ---------------- reporting ---------------- */
const DAY = 86400000;
const parseDay = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00Z`) : null);

export function bucketKey(day, gran) {
  if (gran === "month") return day.slice(0, 7);
  if (gran === "week") {
    const d = parseDay(day);
    const dow = (d.getUTCDay() + 6) % 7; // Monday start
    return today(new Date(d.getTime() - dow * DAY));
  }
  return day;
}

export async function summarize({ store, from, to, granularity = "day" }) {
  const end = parseDay(to) || parseDay(today());
  let start = parseDay(from) || new Date(end.getTime() - 29 * DAY);
  if (start > end) start = end;
  if ((end - start) / DAY > 365) start = new Date(end.getTime() - 365 * DAY);
  const gran = ["day", "week", "month"].includes(granularity) ? granularity : "day";

  const days = [];
  for (let t = start.getTime(); t <= end.getTime(); t += DAY) days.push(today(new Date(t)));
  const hashes = await hgetallMany(store, days.map((d) => `an:d:${d}`));

  const totals = { pageViews: 0, visitors: 0, sessions: 0, newVisitors: 0, returningVisitors: 0 };
  const dims = { pages: {}, referrers: {}, devices: {}, browsers: {}, os: {}, countries: {}, events: {} };
  const prefix = { p: "pages", r: "referrers", d: "devices", b: "browsers", o: "os", c: "countries", e: "events" };
  const series = new Map();
  let daysWithData = 0;

  days.forEach((day, i) => {
    const h = hashes[i] || {};
    const pv = Number(h.pv || 0);
    if (Object.keys(h).length) daysWithData++;
    totals.pageViews += pv;
    totals.visitors += Number(h.vis || 0);
    totals.sessions += Number(h.sess || 0);
    totals.newVisitors += Number(h.new || 0);
    totals.returningVisitors += Number(h.ret || 0);
    const key = bucketKey(day, gran);
    const s = series.get(key) || { bucket: key, pageViews: 0, visitors: 0, sessions: 0 };
    s.pageViews += pv; s.visitors += Number(h.vis || 0); s.sessions += Number(h.sess || 0);
    series.set(key, s);
    for (const [f, v] of Object.entries(h)) {
      const sep = f.indexOf("|");
      if (sep < 0) continue;
      const dim = prefix[f.slice(0, sep)];
      if (dim) dims[dim][f.slice(sep + 1)] = (dims[dim][f.slice(sep + 1)] || 0) + Number(v);
    }
  });

  const top = (o, n = 25) => Object.entries(o).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, n);
  return {
    range: { from: today(start), to: today(end), granularity: gran, daysWithData },
    totals,
    notes: {
      visitors: "Sum of daily-unique visitors (salted per day, not linkable across days). An upper-bound estimate.",
      newReturning: "Based on a first-visit flag kept in the visitor's own browser; estimate only.",
      sessions: "Approximate: one per browser tab session per day.",
      countries: "Only present when the hosting platform supplies a country header; no precise location is stored.",
    },
    series: [...series.values()].sort((a, b) => a.bucket.localeCompare(b.bucket)),
    pages: top(dims.pages), referrers: top(dims.referrers), devices: top(dims.devices),
    browsers: top(dims.browsers), os: top(dims.os), countries: top(dims.countries), events: top(dims.events),
  };
}

export async function exportAll(store) {
  const days = (await store.smembers("an:days")).sort();
  const hashes = await hgetallMany(store, days.map((d) => `an:d:${d}`));
  const out = {};
  days.forEach((d, i) => { if (Object.keys(hashes[i]).length) out[d] = hashes[i]; });
  return { exportedAt: new Date().toISOString(), format: "proboy-analytics-v1", days: out };
}

export async function clearAll(store) {
  const days = await store.smembers("an:days");
  for (const d of days) { await store.del(`an:d:${d}`); await store.del(`an:v:${d}`); await store.del(`an:s:${d}`); await store.srem("an:days", d); }
  await store.del("an:recent");
  return days.length;
}

export const newEventId = randomId;
