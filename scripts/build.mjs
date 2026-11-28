import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { assertCleanDist, preserveBlockedPublicData, publicBlockedPaths } from "./private-paths.mjs";

const SITE = "https://proboy.vercel.app";
const dist = resolve("dist");
const read = (file) => readFileSync(file, "utf8");
const info = JSON.parse(read("src/data/info.json"));
const preview = process.argv.includes("--preview") ||
  (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") ||
  (process.env.CONTEXT && process.env.CONTEXT !== "production");

if (info.siteUrl.replace(/\/$/, "") !== SITE) throw new Error(`Production canonical origin must be ${SITE}`);
// Privacy guard: relocating happens BEFORE Vite copies public/ into dist/.
// Flagged files are preserved byte-for-byte in preserved-data/, outside the deployed
// output. Nothing is deleted, and no file contents are read or logged.
const preservedBeforeBuild = preserveBlockedPublicData();
if (preservedBeforeBuild.length) {
  console.log(
    `Privacy guard: preserved ${preservedBeforeBuild.length} flagged public path(s) outside dist/ (` +
    `${preservedBeforeBuild.reduce((sum, item) => sum + item.bytes, 0)} bytes retained).`,
  );
}
if (publicBlockedPaths("public").length) {
  throw new Error(
    "Privacy guard: flagged public/ paths remain after automatic preservation. " +
    "Build stopped before Vite could publish them. Check filesystem permissions; no file contents were read.",
  );
}
if (existsSync("public/assets")) throw new Error("Reserve /assets for Vite's fingerprinted build outputs.");
const essential = ["public/images/og-shahan-ali.jpg", "public/favicon-16x16.png", "public/favicon-32x32.png", "public/favicon-48x48.png"];
for (const path of essential) if (!existsSync(path)) {
  throw new Error(`Missing required build asset: ${path}. Keep the social card and favicon PNGs in the same commit as the build-script change.`);
}

execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
  env: { ...process.env, PROBOY_SPLIT_ASSETS: "1" },
  stdio: "inherit",
});

// Verify the publishable output itself, in case a plugin or generated file copied
// a blocked path after the pre-build check.
assertCleanDist(dist);
ensureFavicon();
const inventory = join(dist, ".prerender-routes.json");
const routes = JSON.parse(read(inventory));
const seen = new Set();
const sitemap = read(join(dist, "sitemap.xml"));
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
const hasIntro = existsSync(join(dist, info.introAnimation.directory, `${info.introAnimation.framePrefix}0${info.introAnimation.frameExtension}`));
const redirects = [];

function ensureFavicon() {
  const output = join(dist, "favicon.ico");
  if (existsSync(output)) return;
  const pngs = [16, 32, 48].map((size) => readFileSync(join("public", `favicon-${size}x${size}.png`)));
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  for (let i = 0; i < pngs.length; i++) {
    const size = [16, 32, 48][i]; const pos = 6 + i * 16;
    header[pos] = size; header[pos + 1] = size; header.writeUInt16LE(1, pos + 4);
    header.writeUInt16LE(32, pos + 6); header.writeUInt32LE(pngs[i].length, pos + 8); header.writeUInt32LE(offset, pos + 12);
    offset += pngs[i].length;
  }
  writeFileSync(output, Buffer.concat([header, ...pngs]));
}


for (const { path, noindex } of routes) {
  if (!/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/.test(path) || seen.has(path)) {
    throw new Error(`Invalid or duplicate prerender path: ${path}`);
  }
  seen.add(path);
  const flat = path === "/" ? "index.html" : `${path.slice(1)}.html`;
  const nested = path === "/" || path === "/404" ? flat : `${path.slice(1)}/index.html`;
  let html = read(join(dist, nested));
  if (!html.includes(`data-proboy-route="${path}"`) || !/<h1(?:\s[^>]*)?>/.test(html) || !html.includes('id="ld-static"')) {
    throw new Error(`Missing route-specific document: ${path}`);
  }
  const canonical = `rel="canonical" href="${SITE}${path}"`;
  if ((!noindex && !html.includes(canonical)) || locations.filter((url) => url === SITE + path).length !== (noindex ? 0 : 1)) {
    throw new Error(`Sitemap/canonical mismatch: ${path}`);
  }
  if (/<script\b(?![^>]*\bsrc=)(?![^>]*\btype="application\/ld\+json")[^>]*>\s*\S/i.test(html)) {
    throw new Error(`Unexpected inline JavaScript: ${path}`);
  }
  if (preview) html = html.replace(/<meta name="robots" content="[^"]*"\s*\/?>/, '<meta name="robots" content="noindex, nofollow" />');
  if (path === "/") {
    if (hasIntro) html = html.replace('id="root"', 'id="root" data-intro-available="true"');
    const picture = html.match(/<picture class="portrait-picture">([\s\S]*?)<\/picture>/)?.[1];
    const avif = picture?.match(/<source type="image\/avif"[^>]*>/)?.[0];
    const candidates = avif?.match(/\bsrcset="([^"]+)"/i)?.[1];
    const sizes = avif?.match(/\bsizes="([^"]+)"/i)?.[1];
    html = html.replace(/<link rel="preload" as="image"[^>]*>\s*/, candidates && sizes ?
      `<link rel="preload" as="image" type="image/avif" imagesrcset="${candidates}" imagesizes="${sizes}" fetchpriority="high" />\n    ` : "");
  }
  writeFileSync(join(dist, flat), html);
  if (flat !== nested) {
    // Retain both representations: Vercel clean URLs serve the flat HTML; simple
    // static hosts and directory-index previews can serve nested index.html.
    mkdirSync(join(dist, path.slice(1)), { recursive: true });
    writeFileSync(join(dist, nested), html);
    redirects.push(`${path}/index.html ${path} 301`, `${path}/index ${path} 301`, `${path} /${flat} 200`);
  }
}

if (locations.length !== routes.filter((route) => !route.noindex).length) throw new Error("Unexpected sitemap entries.");
const card = readFileSync(join(dist, "images/og-shahan-ali.jpg"));
if (card[0] !== 0xff || card[1] !== 0xd8) throw new Error("The required social card is not a JPEG.");
let cardDimensions;
for (let i = 2; i < card.length - 8;) {
  if (card[i] !== 0xff) break;
  if ([0xc0, 0xc1, 0xc2, 0xc3].includes(card[i + 1])) {
    cardDimensions = [card.readUInt16BE(i + 7), card.readUInt16BE(i + 5)]; break;
  }
  i += 2 + card.readUInt16BE(i + 2);
}
if (!cardDimensions || cardDimensions[0] !== 1200 || cardDimensions[1] !== 630) throw new Error("The share card must be 1200x630.");
writeFileSync(join(dist, "route-inventory.json"), JSON.stringify(routes, null, 2) + "\n");
rmSync(inventory);
mkdirSync(join(dist, "licenses"), { recursive: true });
copyFileSync("src/assets/Inter-OFL.txt", join(dist, "licenses/inter.txt"));

// These are exact Netlify rewrites, not a fallback. Vercel serves the .html files via cleanUrls.
writeFileSync(join(dist, "_redirects"), `${redirects.join("\n")}\n`);
if (preview) {
  writeFileSync(join(dist, "_headers"), "/*\n  X-Robots-Tag: noindex, nofollow\n");
  writeFileSync(join(dist, "robots.txt"), "User-agent: *\nAllow: /\n");
  rmSync(join(dist, "sitemap.xml"));
}
console.log(`Prepared ${routes.length} route-specific HTML documents (${preview ? "noindex preview" : "production-style"}).`);