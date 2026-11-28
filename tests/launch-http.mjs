import assert from "node:assert/strict";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const base = (process.env.QA_BASE || "http://127.0.0.1:4173").replace(/\/$/, "");
const site = "https://proboy.vercel.app";
const image = `${site}/images/og-shahan-ali.jpg`;
const isPreview = process.argv.includes("--preview");
const read = (file) => readFileSync(`dist/${file}`, "utf8");
const doc = (path) => path === "/" ? "index.html" : `${path.slice(1)}.html`;
const body = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
const headings = (html) => [...body(html).matchAll(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/gi)].map(([, s]) => s.replace(/<[^>]+>/g, "").trim());
const tags = (html, regex) => [...html.matchAll(regex)].map((m) => m[1]);
const indexable = new Set();
const htmlFiles = readdirSync("dist", { recursive: true }).filter(f => f.endsWith(".html") && !(
  f !== "index.html" && f.endsWith("/index.html") && readdirSync("dist", { recursive: true }).includes(f.replace("/index.html", ".html")) && read(f).includes('data-proboy-route="')
));
const paths = htmlFiles.map(f => {
  const html = read(f);
  return html.includes('id="ld-static"') ? html.match(/data-proboy-route="([^"]+)"/)?.[1] : null;
}).filter(Boolean).sort();
const rows = [];
const errors = [];
const standalone = [];
const assets = new Set(["/images/og-shahan-ali.jpg", "/favicon.ico"]);
const fetchPath = (path, options) => fetch(base + path, { redirect: "manual", signal: AbortSignal.timeout(12000), ...options });
const reportFailure = (path, reason) => errors.push({ path, reason: String(reason.message || reason) });

function verifyHead(path, html, expected, row) {
  assert.deepEqual(headings(html), headings(expected));
  assert.equal(headings(html).length, 1);
  row.h1 = headings(html)[0];
  row.title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  assert.ok(row.title);
  assert.equal(row.title, expected.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
  assert.ok(html.includes(`data-proboy-route="${path}"`), "wrong route body or generic shell");
  const canonical = tags(html, /<link rel="canonical" href="([^"]+)"/g);
  assert.ok(canonical.length < 2);
  if (canonical.length) {
    assert.deepEqual(canonical, [site + path]);
    indexable.add(site + path);
  } else assert.match(html, /<meta name="robots" content="noindex/);
  if (isPreview) assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  assert.equal(tags(html, /<meta name="description" content="([^"]+)"/g).length, 1);
  assert.deepEqual(tags(html, /<meta property="og:url" content="([^"]+)"/g), [site + path]);
  assert.deepEqual(tags(html, /<meta property="og:image" content="([^"]+)"/g), [image]);
  assert.deepEqual(tags(html, /<meta name="twitter:image" content="([^"]+)"/g), [image]);
  assert.match(html, /property="og:image:width" content="1200"/);
  assert.match(html, /property="og:image:height" content="630"/);
  const schema = tags(html, /<script type="application\/ld\+json" id="ld-static">([\s\S]*?)<\/script>/g);
  assert.equal(schema.length, 1);
  const entities = JSON.parse(schema[0]);
  assert.ok(Array.isArray(entities));
  assert.ok(entities.every(e => e["@context"] === "https://schema.org" && e["@type"]));
  assert.ok(entities.length || !canonical.length, "public structured data missing");
  assert.doesNotMatch(html, /<script\b(?![^>]*\bsrc=)(?![^>]*\btype="application\/ld\+json")[^>]*>\s*\S/i);
  for (const url of tags(html, /(?:src|href)="(\/assets\/[^"#]+)"/g)) assets.add(url);
  for (const url of tags(html, /<(?:img|source|link)\b[^>]*?\bsrc="(\/(?!\/)[^"]+)"/gi)) assets.add(url.replaceAll("&amp;", "&"));
  for (const srcset of tags(html, /(?:image)?srcset="([^"]+)"/gi)) {
    for (const entry of srcset.split(",")) {
      const url = entry.trim().split(/\s+/)[0];
      if (url.startsWith("/") && !url.startsWith("//")) assets.add(url.replaceAll("&amp;", "&"));
    }
  }
}

assert.ok(paths.length > 80 && new Set(paths).size === paths.length, "Build output is missing or has duplicate documents. Run npm run build.");
for (let i = 0; i < paths.length; i += 8) {
  await Promise.all(paths.slice(i, i + 8).map(async path => {
    const row = { path, status: 0, correct: false };
    rows.push(row);
    try {
      const res = await fetchPath(path);
      row.status = res.status;
      assert.equal(res.status, path === "/404" ? 404 : 200);
      assert.match(res.headers.get("content-type") || "", /^text\/html/);
      const html = await res.text();
      verifyHead(path, html, read(doc(path)), row);
      row.correct = true;
    } catch (err) { reportFailure(path, err); }
  }));
}

try {
  const response = await fetchPath("/sitemap.xml");
  assert.equal(response.status, isPreview ? 404 : 200);
  if (!isPreview) {
    const locs = tags(await response.text(), /<loc>([^<]+)<\/loc>/g);
    assert.equal(locs.length, new Set(locs).size);
    assert.deepEqual(new Set(locs), indexable);
  }
} catch (err) { reportFailure("/sitemap.xml", err); }

try {
  const robots = await fetchPath("/robots.txt");
  assert.equal(robots.status, 200);
  const advertised = tags(await robots.text(), /^Sitemap:\s*(\S+)/gim);
  assert.deepEqual(advertised, isPreview ? [] : [`${site}/sitemap.xml`]);
} catch (err) { reportFailure("/robots.txt", err); }

for (const path of ["/launch-gate-missing", "/services/launch-gate-missing", "/projects/launch-gate-missing", "/blog/launch-gate-missing", "/proboy-md/docs/launch-gate-missing", "/demos/launch-gate-missing", "/connections.json", "/otp.json", "/sessions/index.json"]) {
  try {
    const res = await fetchPath(path);
    assert.equal(res.status, 404);
    assert.match(await res.text(), /data-proboy-route="\/404"/);
  } catch (err) { reportFailure(path, err); }
}

for (const [from, to] of [["/index.html", "/"], ["/services/", "/services"], ["/services/frontend-development.html", "/services/frontend-development"], ["/services/frontend-development/index.html", "/services/frontend-development"], ["/projects/camlink", "/projects/proboy-camlink"], ["/contact/?service=shopify-development", "/contact?service=shopify-development"]]) {
  try {
    const res = await fetchPath(from);
    assert.ok([301, 308].includes(res.status));
    assert.equal(new URL(res.headers.get("location"), base).href, base + to);
    assert.equal((await fetchPath(to)).status, 200);
  } catch (err) { reportFailure(from, err); }
}

// Check the legacy HTML as static responses only; do not run their scripts or submit any data.
const appFiles = new Set(paths.map(doc));
const legacyPaths = new Map();
for (const file of htmlFiles.filter(f => !appFiles.has(f))) {
  const path = "/" + file.replace(/\/index\.html$|\.html$/, "");
  legacyPaths.set(path, [...(legacyPaths.get(path) || []), file]);
}
const legacy = [...legacyPaths];
for (let i = 0; i < legacy.length; i += 8) await Promise.all(legacy.slice(i, i + 8).map(async ([path, candidates]) => {
  try {
    const res = await fetchPath(path, { redirect: "follow" });
    assert.equal(res.status, 200);
    if (path === "/showcase/luxecart") assert.ok(res.url.endsWith("/demos/luxecart-store"));
    else {
      const html = await res.text();
      assert.ok(candidates.some(file => html === read(file)), "static response did not match its own build file");
    }
    standalone.push({ path, status: res.status });
  } catch (err) { reportFailure(path, err); }
}));

const homepage = read("index.html");
const preload = tags(homepage, /(<link rel="preload" as="image"[^>]*>)/g);
const portrait = homepage.match(/<picture class="portrait-picture">\s*<source type="image\/avif"[^>]*>/)?.[0] || "";
assert.equal(preload.length, 1);
assert.ok(portrait.includes(tags(preload[0], /imagesrcset="([^"]+)"/g)[0]), "preload candidates differ from picture");
assert.ok(portrait.includes(tags(preload[0], /imagesizes="([^"]+)"/g)[0]), "preload size differs from picture");

function jpegSize(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8);
  for (let i = 2; i < bytes.length - 9;) {
    assert.equal(bytes[i], 0xff);
    const marker = bytes[i + 1];
    assert.notEqual(marker, 0xda, "JPEG dimensions missing");
    if ([0xc0, 0xc1, 0xc2, 0xc3].includes(marker)) return [bytes.readUInt16BE(i + 7), bytes.readUInt16BE(i + 5)];
    i += 2 + bytes.readUInt16BE(i + 2);
  }
  throw new Error("JPEG dimensions missing");
}

const files = [...assets].sort();
for (let i = 0; i < files.length; i += 10) await Promise.all(files.slice(i, i + 10).map(async path => {
  try {
    const res = await fetchPath(path, { method: path === "/images/og-shahan-ali.jpg" ? "GET" : "HEAD" });
    assert.equal(res.status, 200);
    assert.doesNotMatch(res.headers.get("content-type") || "", /^text\/html/);
    if (path.startsWith("/assets/")) assert.match(res.headers.get("cache-control") || "", /immutable/);
    if (path === "/images/og-shahan-ali.jpg") {
      assert.match(res.headers.get("content-type") || "", /^image\/jpeg/);
      assert.deepEqual(jpegSize(Buffer.from(await res.arrayBuffer())), [1200, 630]);
    }
  } catch (err) { reportFailure(path, err); }
}));

mkdirSync(".work", { recursive: true });
writeFileSync(`.work/launch-http${isPreview ? "-preview" : ""}.json`, JSON.stringify({ base, rows, standalone, assets: files, errors }, null, 2));
console.log(`${rows.filter(row => row.correct).length}/${paths.length} route documents, ${indexable.size} canonicals, ${standalone.length} legacy HTML responses, ${files.length} assets; ${errors.length} failure(s).`);
for (const issue of errors) console.error(issue.path, issue.reason);
process.exitCode = Number(errors.length > 0);