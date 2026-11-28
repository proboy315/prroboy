#!/usr/bin/env node
// Static crawl of the BUILT site (dist/). Verifies what Google would see in the HTML it receives:
// titles, descriptions, canonicals, robots, JSON-LD validity/duplication, internal-link resolution,
// sitemap hygiene, images, and standalone HTML tools that are not part of the prerendered app.
//   npm run build && node scripts/audit-site.mjs        (writes docs/SEO-AUDIT.md)
import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve("dist");
const SITE = "https://proboy.vercel.app";
const vercel = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
const redirects = new Map((vercel.redirects || []).map((r) => [r.source, r.destination]));

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/^(assets|intro-animation|node_modules)$/.test(e.name)) walk(p); }
    else if (e.name.endsWith(".html")) {
      if (e.name === "index.html" && d !== DIST) {
        const flat = path.join(path.dirname(d), `${path.basename(d)}.html`);
        if (fs.existsSync(flat) && fs.readFileSync(p, "utf8").includes('data-proboy-route="')) continue;
      }
      files.push(p);
    }
  }
})(DIST);

const toUrl = (f) => {
  let rel = "/" + path.relative(DIST, f).replace(/\\/g, "/");
  rel = rel.replace(/\/index\.html$/, "") || "/";
  return rel === "/404.html" ? "/404" : rel;
};
const pick = (h, re) => (h.match(re) || [])[1];
const pages = files.map((f) => {
  const html = fs.readFileSync(f, "utf8");
  const head = html.slice(0, html.indexOf("</head>") + 7);
  const prerendered = html.includes("<!-- SEO:START -->");
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return {
    file: path.relative(DIST, f), url: prerendered ? toUrl(f).replace(/\.html$/, "") : toUrl(f), prerendered, size: html.length,
    title: pick(head, /<title>([\s\S]*?)<\/title>/i) || "",
    description: pick(head, /<meta name="description" content="([^"]*)"/i) || "",
    canonicals: [...head.matchAll(/<link rel="canonical" href="([^"]*)"/gi)].map((m) => m[1]),
    robots: pick(head, /<meta name="robots" content="([^"]*)"/i) || "",
    siteName: pick(head, /<meta property="og:site_name" content="([^"]*)"/i) || "",
    h1: (html.match(/<h1[\s>]/g) || []).length,
    words: text.split(" ").length,
    ld, html,
  };
});

const urlSet = new Set(pages.map((p) => p.url));
const exists = (u) => {
  const p = u.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
  if (urlSet.has(p)) return true;
  const rel = p.replace(/^\//, "");
  return [rel, rel + ".html", rel + "/index.html"].some((c) => c && fs.existsSync(path.join(DIST, c)) && fs.statSync(path.join(DIST, c)).isFile());
};

const findings = { broken: [], noindex: [], canonical: [], sitemap: [], ld: [], dup: [], thin: [], static: [], images: [], meta: [] };
const incoming = new Map();

for (const p of pages.filter((x) => x.prerendered)) {
  for (const m of p.html.matchAll(/<a [^>]*href="([^"#?][^"]*)"/g)) {
    const href = m[1].replace(/&amp;/g, "&");
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const clean = href.split("#")[0].split("?")[0].replace(/\/$/, "") || "/";
    incoming.set(clean, (incoming.get(clean) || 0) + 1);
    if (redirects.has(clean)) continue;
    if (!exists(clean)) findings.broken.push(`${p.url} → ${href}`);
  }
  for (const m of p.html.matchAll(/<img [^>]*>/g)) {
    const tag = m[0];
    const src = (pick(tag, /src="([^"]*)"/) || "").replace(/&amp;/g, "&");
    if (!/alt="/.test(tag)) findings.images.push(`${p.url}: <img> without alt (${src})`);
    if (src && src.startsWith("/") && !exists(src)) findings.broken.push(`${p.url} → image ${src}`);
  }
  if (!p.title || p.title.length > 70) findings.meta.push(`${p.url}: title ${p.title ? p.title.length + " chars" : "missing"}`);
  if (!p.description || p.description.length < 60 || p.description.length > 175) findings.meta.push(`${p.url}: description ${p.description ? p.description.length + " chars" : "missing"}`);
  if (p.h1 !== 1 && p.url !== "/404") findings.meta.push(`${p.url}: ${p.h1} <h1> elements`);
  if (p.siteName !== "ProBoy") findings.meta.push(`${p.url}: og:site_name = "${p.siteName}"`);
  const noindex = /noindex/i.test(p.robots);
  if (noindex) findings.noindex.push(`${p.url} (${p.robots}${p.canonicals.length ? ", has canonical!" : ""})`);
  else {
    const want = SITE + (p.url === "/" ? "/" : p.url);
    if (p.canonicals.length !== 1) findings.canonical.push(`${p.url}: ${p.canonicals.length} canonical tags`);
    else if (p.canonicals[0] !== want) findings.canonical.push(`${p.url}: canonical ${p.canonicals[0]} ≠ ${want}`);
    if (p.words < 150) findings.thin.push(`${p.url}: ${p.words} words`);
  }
  // JSON-LD
  const types = [];
  for (const raw of p.ld) {
    try {
      const j = JSON.parse(raw);
      for (const n of Array.isArray(j) ? j : j["@graph"] || [j]) types.push(n["@type"]);
    } catch (e) { findings.ld.push(`${p.url}: INVALID JSON-LD (${e.message})`); }
  }
  const count = (t) => types.filter((x) => x === t).length;
  if (count("WebSite") > 1) findings.ld.push(`${p.url}: ${count("WebSite")} WebSite entities`);
  if (count("Person") > 1) findings.ld.push(`${p.url}: ${count("Person")} Person entities`);
  if (p.url !== "/" && count("WebSite")) findings.ld.push(`${p.url}: WebSite schema outside the homepage`);
}

// duplicates
for (const key of ["title", "description"]) {
  const m = new Map();
  for (const p of pages.filter((x) => x.prerendered && !/noindex/.test(x.robots))) m.set(p[key], [...(m.get(p[key]) || []), p.url]);
  for (const [v, urls] of m) if (urls.length > 1) findings.dup.push(`${key} shared by ${urls.join(", ")}`);
}

// sitemap
const sm = fs.readFileSync(path.join(DIST, "sitemap.xml"), "utf8");
const locs = [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
const byUrl = new Map(pages.map((p) => [SITE + (p.url === "/" ? "/" : p.url), p]));
for (const l of locs) {
  const p = byUrl.get(l);
  if (!p) findings.sitemap.push(`${l}: no matching file`);
  else if (/noindex/.test(p.robots)) findings.sitemap.push(`${l}: listed but noindex`);
  else if (p.canonicals[0] !== l) findings.sitemap.push(`${l}: canonical mismatch`);
}
if (new Set(locs).size !== locs.length) findings.sitemap.push("duplicate <loc> entries");
for (const p of pages.filter((x) => x.prerendered && !/noindex/.test(x.robots) && x.url !== "/404")) if (!locs.includes(SITE + (p.url === "/" ? "/" : p.url))) findings.sitemap.push(`${p.url}: indexable page missing from sitemap`);

// standalone (non-app) HTML shipped from /public
for (const p of pages.filter((x) => !x.prerendered)) {
  findings.static.push({
    url: p.url, file: p.file, kb: Math.round(p.size / 1024), title: p.title.slice(0, 50), robots: p.robots || "(none → indexable)",
    canonical: p.canonicals.length ? "yes" : "no", inLinks: incoming.get(p.url) || incoming.get("/" + p.file.replace(/\/index\.html$/, "")) || 0, inSitemap: locs.includes(SITE + p.url),
  });
}

const sec = (t, a, empty = "none found") => `### ${t}\n${a.length ? a.map((x) => `- ${typeof x === "string" ? x : JSON.stringify(x)}`).join("\n") : `- ${empty}`}\n`;
const prer = pages.filter((p) => p.prerendered);
const report = `# Site audit (generated by scripts/audit-site.mjs)

Prerendered app routes: **${prer.length}** · standalone HTML files from /public: **${findings.static.length}** · sitemap URLs: **${locs.length}**

${sec("Broken internal links / assets (would 404)", [...new Set(findings.broken)])}
${sec("Intentional noindex pages", findings.noindex)}
${sec("Canonical problems", findings.canonical)}
${sec("Sitemap problems", findings.sitemap)}
${sec("Structured data problems", findings.ld)}
${sec("Duplicate titles/descriptions", findings.dup)}
${sec("Thin indexable pages (<150 words)", findings.thin)}
${sec("Metadata warnings", findings.meta)}
${sec("Images without alt", [...new Set(findings.images)])}
### Standalone HTML files (not part of the React app, not in sitemap)
| URL | size | title | robots | canonical | internal links to it |
|---|---|---|---|---|---|
${findings.static.map((s) => `| ${s.url} | ${s.kb} KB | ${s.title} | ${s.robots} | ${s.canonical} | ${s.inLinks} |`).join("\n")}
`;
fs.mkdirSync("docs", { recursive: true });
fs.writeFileSync("docs/SEO-AUDIT.md", report);
console.log(report.split("### Standalone")[0]);
console.log(`standalone files: ${findings.static.length} (see docs/SEO-AUDIT.md)`);
const hard = findings.broken.length + findings.canonical.length + findings.ld.length + findings.sitemap.length;
process.exitCode = hard ? 1 : 0;
