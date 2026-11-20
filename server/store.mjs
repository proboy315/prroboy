// Storage adapter. Production = Upstash Redis over its REST API (TLS in transit, encrypted at rest by
// the provider). Works identically from Vercel and Netlify functions; Vercel's Upstash/KV integration
// injects the same variables. A process-local memory store exists ONLY for local development and tests
// (it is not durable on serverless platforms), and must be opted into explicitly.

class MemoryStore {
  kind = "memory";
  durable = false;
  constructor() { this.d = new Map(); this.exp = new Map(); }
  _live(k) { const e = this.exp.get(k); if (e && e < Date.now()) { this.d.delete(k); this.exp.delete(k); } return this.d.get(k); }
  async get(k) { return this._live(k) ?? null; }
  async set(k, v, ttl) { this.d.set(k, String(v)); ttl ? this.exp.set(k, Date.now() + ttl * 1000) : this.exp.delete(k); }
  async del(k) { this.d.delete(k); this.exp.delete(k); }
  async incr(k, ttl) { const n = Number(this._live(k) || 0) + 1; this.d.set(k, String(n)); if (n === 1 && ttl) this.exp.set(k, Date.now() + ttl * 1000); return n; }
  async hincrby(k, f, n = 1) { const h = this._live(k) || new Map(); h.set(f, Number(h.get(f) || 0) + n); this.d.set(k, h); }
  async hlen(k) { return (this._live(k) || new Map()).size; }
  async hgetall(k) { return Object.fromEntries(this._live(k) || []); }
  async sadd(k, m) { const s = this._live(k) || new Set(); const had = s.has(m); s.add(m); this.d.set(k, s); return had ? 0 : 1; }
  async smembers(k) { return [...(this._live(k) || [])]; }
  async srem(k, m) { (this._live(k) || new Set()).delete(m); }
  async expire(k, ttl) { if (this.d.has(k)) this.exp.set(k, Date.now() + ttl * 1000); }
  async lpushTrim(k, v, max) { const l = this._live(k) || []; l.unshift(v); this.d.set(k, l.slice(0, max)); }
  async lrange(k, n) { return (this._live(k) || []).slice(0, n); }
  async pipeline(fn) { for (const c of fn) await c(); }
}

class UpstashStore {
  kind = "upstash";
  durable = true;
  constructor(url, token) { this.url = url.replace(/\/$/, ""); this.token = token; }
  async cmd(...args) {
    const r = await fetch(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args.map((a) => (typeof a === "number" ? a : String(a)))),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.error) throw new Error("store_error");
    return j.result;
  }
  async batch(cmds) {
    const r = await fetch(`${this.url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmds),
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !Array.isArray(j)) throw new Error("store_error");
    return j.map((x) => x.result);
  }
  get(k) { return this.cmd("GET", k); }
  async set(k, v, ttl) { await (ttl ? this.cmd("SET", k, v, "EX", ttl) : this.cmd("SET", k, v)); }
  async del(k) { await this.cmd("DEL", k); }
  async incr(k, ttl) { const [n] = await this.batch([["INCR", k], ...(ttl ? [["EXPIRE", k, ttl, "NX"]] : [])]); return n; }
  async hincrby(k, f, n = 1) { await this.cmd("HINCRBY", k, f, n); }
  hlen(k) { return this.cmd("HLEN", k); }
  async hgetall(k) {
    const arr = (await this.cmd("HGETALL", k)) || [];
    const o = {};
    for (let i = 0; i < arr.length; i += 2) o[arr[i]] = arr[i + 1];
    return o;
  }
  sadd(k, m) { return this.cmd("SADD", k, m); }
  smembers(k) { return this.cmd("SMEMBERS", k); }
  async srem(k, m) { await this.cmd("SREM", k, m); }
  async expire(k, ttl) { await this.cmd("EXPIRE", k, ttl); }
  async lpushTrim(k, v, max) { await this.batch([["LPUSH", k, v], ["LTRIM", k, 0, max - 1]]); }
  lrange(k, n) { return this.cmd("LRANGE", k, 0, n - 1); }
  /** Batch hgetall for many keys in one round trip. */
  async hgetallMany(keys) {
    const res = await this.batch(keys.map((k) => ["HGETALL", k]));
    return res.map((arr) => { const o = {}; for (let i = 0; i < (arr || []).length; i += 2) o[arr[i]] = arr[i + 1]; return o; });
  }
}

export function createStore(env = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (url && token) return new UpstashStore(url, token);
  if (env.PROBOY_ALLOW_MEMORY_STORE === "1") return new MemoryStore();
  return null;
}

export async function hgetallMany(store, keys) {
  if (store.hgetallMany) return store.hgetallMany(keys);
  return Promise.all(keys.map((k) => store.hgetall(k)));
}
