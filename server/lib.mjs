// Shared server helpers: crypto (Node built-ins only), cookies, HTTP responses, TOTP.
// No custom cryptography: scrypt, HMAC-SHA256, AES-256-GCM and HOTP/TOTP (RFC 4226/6238)
// are all implemented with node:crypto primitives.
import crypto from "node:crypto";

export const sha256 = (v) => crypto.createHash("sha256").update(v).digest("hex");
export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("base64url");
export const randomId = () => crypto.randomBytes(9).toString("base64url");

export function safeEqual(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  if (x.length !== y.length) {
    crypto.timingSafeEqual(x, x); // keep timing roughly constant
    return false;
  }
  return crypto.timingSafeEqual(x, y);
}

/* ---------------- password hashing (scrypt) ----------------
   Format: scrypt$N$r$p$<salt b64url>$<hash b64url>  — generate with `npm run admin:hash`. */
export function hashPassword(password, { N = 32768, r = 8, p = 1 } = {}) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 32, { N, r, p, maxmem: 128 * N * r * 2 });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export function verifyPassword(password, stored) {
  try {
    const [alg, N, r, p, salt, hash] = String(stored).split("$");
    if (alg !== "scrypt") return false;
    const n = Number(N), rr = Number(r), pp = Number(p);
    const expected = Buffer.from(hash, "base64url");
    const actual = crypto.scryptSync(String(password), Buffer.from(salt, "base64url"), expected.length, {
      N: n, r: rr, p: pp, maxmem: 128 * n * rr * 2,
    });
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/* ---------------- HMAC + AES-256-GCM ---------------- */
export const hmac = (secret, data) => crypto.createHmac("sha256", secret).update(data).digest("hex");

export function deriveKey(secret, label) {
  return Buffer.from(crypto.hkdfSync("sha256", secret, "proboy-v1", label, 32));
}

export function encryptJson(key, value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return `v1.${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${enc.toString("base64url")}`;
}

export function decryptJson(key, payload) {
  if (!payload) return null;
  try {
    const [v, iv, tag, data] = String(payload).split(".");
    if (v !== "v1") return null;
    const d = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64url"));
    d.setAuthTag(Buffer.from(tag, "base64url"));
    const out = Buffer.concat([d.update(Buffer.from(data, "base64url")), d.final()]);
    return JSON.parse(out.toString("utf8"));
  } catch {
    return null;
  }
}

/* ---------------- TOTP (RFC 6238, SHA-1, 6 digits, 30s) ---------------- */
function base32Decode(input) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const ch of String(input).toUpperCase().replace(/[\s=-]/g, "")) {
    const idx = alphabet.indexOf(ch);
    if (idx < 0) throw new Error("invalid base32");
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export function totpAt(secretBase32, timeMs = Date.now(), step = 30) {
  const counter = Math.floor(timeMs / 1000 / step);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac("sha1", base32Decode(secretBase32)).update(buf).digest();
  const o = h[h.length - 1] & 0xf;
  const code = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

/** Accepts the current code and ±1 step of clock drift. */
export function verifyTotp(secretBase32, code, timeMs = Date.now()) {
  const c = String(code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(c)) return false;
  let ok = false;
  for (const drift of [-1, 0, 1]) if (safeEqual(totpAt(secretBase32, timeMs + drift * 30000), c)) ok = true;
  return ok;
}

export function generateTotpSecret() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  return Array.from(crypto.randomBytes(20), (b) => alphabet[b % 32]).join("");
}

/* ---------------- HTTP helpers ---------------- */
const BASE_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
};

export function json(data, status = 200, extra = {}) {
  const headers = new Headers({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...BASE_HEADERS });
  for (const [k, v] of Object.entries(extra)) {
    if (Array.isArray(v)) v.forEach((x) => headers.append(k, x));
    else headers.set(k, v);
  }
  return new Response(status === 204 ? null : JSON.stringify(data), { status, headers });
}

export const fail = (status, error, extra) => json({ ok: false, error }, status, extra);

export function parseCookies(header) {
  const out = {};
  for (const part of String(header || "").split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i)] = decodeURIComponent(part.slice(i + 1));
  }
  return out;
}

export function serializeCookie(name, value, { maxAge, secure, sameSite = "Strict" } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "HttpOnly", `SameSite=${sameSite}`];
  if (secure) parts.push("Secure");
  if (maxAge !== undefined) parts.push(`Max-Age=${Math.max(0, Math.floor(maxAge))}`);
  return parts.join("; ");
}

export const isSecureRequest = (request) => {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return new URL(request.url).protocol === "https:";
};

export function clientIp(request) {
  return (
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

export const today = (d = new Date()) => d.toISOString().slice(0, 10);
