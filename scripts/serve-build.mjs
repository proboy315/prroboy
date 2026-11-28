import { createServer } from "node:http";
import { readFileSync, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";
import { gzipSync } from "node:zlib";
import { createHandler } from "../server/handler.mjs";

const dir = resolve(process.env.PROBOY_DIST || "dist");
const option = (name) => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined;
const port = Number(option("--port") || process.env.PORT || 4173);
const host = option("--host") || "127.0.0.1";
const alias = new Map(JSON.parse(readFileSync("vercel.json", "utf8")).redirects.map(r => [r.source, r.destination]));
const api = createHandler({ env: {} });
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".avif": "image/avif",
  ".gif": "image/gif", ".mp3": "audio/mpeg", ".mp4": "video/mp4", ".woff2": "font/woff2",
};
const files = new Map();
function lookup(name) {
  const file = resolve(dir, `.${name}`);
  if (!file.startsWith(dir + sep)) return;
  try { if (statSync(file).isFile()) return file; } catch { /* exact file not present */ }
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
    const requested = decodeURIComponent(url.pathname);
    if (requested.startsWith("/api/")) {
      // Emulate the public GET endpoint with no production credentials or storage.
      const response = req.method === "GET" ? await api(new Request(url)) : new Response(null, { status: 405 });
      res.writeHead(response.status, Object.fromEntries(response.headers)).end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") return res.writeHead(405, { Allow: "GET, HEAD" }).end();
    if (requested.includes("\\") || requested.split("/").some(part => part.startsWith(".")) || /^\/_/.test(requested)) {
      return res.writeHead(404).end();
    }
    const path = requested.replace(/\/+$/, "") || "/";
    let canonical = alias.get(path);
    let file, status = 200;
    if (!canonical && path !== "/404") {
      if (path === "/index" || path === "/index.html") canonical = "/";
      else if (path.endsWith("/index") || path.endsWith("/index.html")) {
        const parent = path.replace(/\/index(?:\.html)?$/, "");
        if (lookup(`${parent}.html`) || lookup(`${parent}/index.html`)) canonical = parent;
      } else if (path.endsWith(".html") && lookup(path)) canonical = path.slice(0, -5);
      if (!canonical) file = path === "/" ? lookup("/index.html") : lookup(path) || lookup(`${path}.html`) || lookup(`${path}/index.html`);
      if (file && path !== requested) canonical = path;
    }
    if (canonical) return res.writeHead(308, { Location: encodeURI(canonical) + url.search }).end();
    if (!file) { file = lookup("/404.html"); status = 404; }
    if (!file) return res.writeHead(404).end();
    const type = types[extname(file).toLowerCase()] || "application/octet-stream";
    let data = files.get(file);
    if (!data) {
      const body = readFileSync(file);
      const gzip = /^(text|application)/.test(type) && body.length > 300 ? gzipSync(body) : undefined;
      data = { body, gzip };
      files.set(file, data);
    }
    const compressed = data.gzip && /\bgzip\b/.test(req.headers["accept-encoding"] || "");
    const payload = compressed ? data.gzip : data.body;
    const immutable = status === 200 && /^\/assets\/[^/]+-[\w-]{8}\.(js|css|woff2)$/.test(path);
    res.writeHead(status, {
      "Content-Type": type, "Content-Length": payload.length, "X-Content-Type-Options": "nosniff",
      "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
      ...(data.gzip ? { Vary: "Accept-Encoding" } : {}),
      ...(compressed ? { "Content-Encoding": "gzip" } : {}),
    }).end(req.method === "HEAD" ? undefined : payload);
  } catch {
    res.writeHead(400).end();
  }
}).listen(port, host, () => console.log(`Serving ${dir} at http://${host}:${port} (no SPA fallback)`));