import fs from "node:fs";
import path from "node:path";

const read = (f) => JSON.parse(fs.readFileSync(`src/data/${f}`, "utf8"));
const info = read("info.json");
const projects = read("projects.json");
const showcase = read("showcase.json");
const images = read("images.json");
const commands = read("commands.json");
const demos = read("demos.json").demos;
const site = info.siteUrl.replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);
const absoluteAsset = (value) => new URL(value, site + "/").href;
const assetExists = (value) => Boolean(value && (/^https:\/\//.test(value) || fs.existsSync(path.join("public", value.replace(/^\//, "")))));
const portraitUrl = assetExists(info.profileImage) ? absoluteAsset(info.profileImage) : "";
// og:image priority: explicit seo.ogImage > the published portrait shown in the hero > brand card.
const og = assetExists(info.seo.ogImage) ? absoluteAsset(info.seo.ogImage) : portraitUrl || absoluteAsset("/og-image.jpg");
const ogIsPortrait = Boolean(portraitUrl && og === portraitUrl);
const ogAlt = ogIsPortrait ? info.portrait.alt : `${info.name} (${info.brand}) — developer portfolio`;
const escapeAttribute = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person", "@id": `${site}/#person`, name: info.name, alternateName: info.aliases,
      url: site, ...(portraitUrl ? { image: portraitUrl } : {}), email: `mailto:${info.email}`, telephone: info.phoneTel,
      jobTitle: info.titles, description: info.seo.description,
      address: { "@type": "PostalAddress", addressLocality: "Burewala", addressRegion: "Punjab", addressCountry: "PK" },
      sameAs: info.socials.filter((s) => s.url.startsWith("http")).map((s) => s.url),
      knowsAbout: ["Full-stack web development", "ProBoy-MD", "WhatsApp bot development", "Shopify", "Gemini AI"],
    },
    { "@type": "WebSite", "@id": `${site}/#website`, url: site, name: "Shahan Ali — ProBoy Portfolio", publisher: { "@id": `${site}/#person` } },
    {
      "@type": "SoftwareApplication", name: "ProBoy-MD", applicationCategory: "DeveloperApplication", operatingSystem: "Node.js",
      description: projects[0].summary, author: { "@id": `${site}/#person` },
      codeRepository: "https://github.com/ProBoy315/ProBoy-MD", url: `${site}/proboy-md`,
    },
    { "@type": "FAQPage", mainEntity: info.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    { "@type": "ItemList", name: "Projects by Shahan Ali (ProBoy)", itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, description: p.summary, url: `${site}/projects/${p.slug}` })) },
    { "@type": "ItemList", name: "Showcase demos by Shahan Ali (ProBoy)", itemListElement: showcase.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title, description: s.description, url: `${site}/showcase/${s.slug}` })) },
    ...images.map((img) => ({ "@type": "ImageObject", contentUrl: img.src, name: img.caption || img.alt, description: img.alt, creator: { "@id": `${site}/#person` } })),
  ],
};

const css = `body{margin:0;background:#07070a;color:#eee;font:16px/1.6 system-ui,sans-serif}a{color:#f87171}main{max-width:820px;margin:auto;padding:48px 20px}h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.1}.muted{color:#a1a1aa}li{margin:6px 0}`;
function page({ title, description, path: p, body, extraLd = [] }) {
  const url = site + p;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${description.replace(/"/g, "&quot;")}">
<link rel="canonical" href="${url}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description.replace(/"/g, "&quot;")}">
<meta property="og:url" content="${url}"><meta property="og:type" content="article"><meta property="og:image" content="${og}"><meta property="og:image:alt" content="${escapeAttribute(ogAlt)}"><meta name="author" content="Shahan Ali">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@itx_proboy"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description.replace(/"/g, "&quot;")}"><meta name="twitter:image" content="${og}">
<script type="application/ld+json">${JSON.stringify([{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: site + "/" }, { "@type": "ListItem", position: 2, name: title, item: url }] }, ...extraLd])}</script>
<style>${css}</style></head><body><main>${body}<p><a href="${site}/">Back to Shahan Ali — ProBoy</a></p></main></body></html>`;
}

function write(rel, html) {
  const file = path.join("public", rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

const urls = ["/", "/proboy-md", ...projects.map((p) => `/projects/${p.slug}`), ...showcase.map((s) => `/showcase/${s.slug}`), ...demos.map((d) => `/demos/${d.slug}`)];

const noscript = [
  `<h1>Shahan Ali (ProBoy) — portfolio</h1><p>${info.seo.description}</p>`,
  `<h2>Projects</h2><ul>${projects.map((p) => `<li><a href="/projects/${p.slug}">${p.title}</a> — ${p.summary}</li>`).join("")}</ul>`,
  `<h2>Showcase concept demos</h2><ul>${showcase.map((s) => `<li><a href="/showcase/${s.slug}">${s.title}</a> — ${s.description}</li>`).join("")}</ul>`,
  `<h2>Interactive demo websites by Shahan Ali (ProBoy)</h2><ul>${demos.map((d) => `<li><a href="/demos/${d.slug}">${d.name}</a> — ${d.kind}: ${d.summary} Works: ${d.features.join(", ")}.</li>`).join("")}</ul>`,
  `<h2>ProBoy-MD commands</h2><p>ProBoy-MD v${commands.meta.version}, prefix ${commands.meta.prefix}. The menu generated 4 November 2026 reported ${commands.meta.reportedMenuTotal} commands; parsing the repository found ${commands.meta.repositoryCommandFiles} command files across ${commands.categories.length} categories (${commands.categories.map((c) => `${c.id} ${c.count}`).join(", ")}). Pairing website: <a href="${commands.meta.pairingUrl}">${commands.meta.pairingUrl}</a>.</p>`,
  `<p>Certificate: ${images[0].alt}</p>`,
  `<h2>About Shahan Ali</h2><p>${info.name} (${info.aliases[0]}) is a full-stack developer, bot architect and Shopify expert from ${info.location}. Shahan Ali created the ProBoy-MD WhatsApp bot and builds the ${info.brand} developer portfolio, including ${demos.length} interactive demo websites and ${showcase.length} showcase concepts.</p>`,
  `<h2>Contact Shahan Ali</h2><p>Reach Shahan Ali (${info.brand}) at <a href="mailto:${info.email}">${info.email}</a> or WhatsApp ${info.phone}, ${info.location}.</p>`,
].join("");
let html = fs.readFileSync("index.html", "utf8");
const block = [
  "<!-- SEO:START -->",
  `<link rel="canonical" href="${site}/" />`,
  portraitUrl ? `<link rel="preload" as="image" href="${escapeAttribute(info.profileImage)}" fetchpriority="high" />` : "",
  '<meta property="og:type" content="profile" />',
  `<meta property="og:site_name" content="${escapeAttribute(info.name + " / " + info.brand)}" />`,
  `<meta property="og:title" content="${escapeAttribute(info.seo.title)}" />`,
  `<meta property="og:description" content="${escapeAttribute(info.seo.description)}" />`,
  `<meta property="og:url" content="${site}/" />`,
  `<meta property="og:image" content="${og}" />`,
  `<meta property="og:image:alt" content="${escapeAttribute(ogAlt)}" />`,
  `<meta property="og:locale" content="en_US" />`,
  `<meta name="twitter:card" content="summary_large_image" />`,
  `<meta name="twitter:site" content="@itx_proboy" />`,
  `<meta name="twitter:creator" content="@itx_proboy" />`,
  `<meta name="twitter:title" content="${escapeAttribute(info.seo.title)}" />`,
  `<meta name="twitter:description" content="${escapeAttribute(info.seo.description)}" />`,
  `<meta name="twitter:image" content="${og}" />`,
  `<meta name="geo.region" content="${info.geo.region}" />`,
  `<meta name="geo.placename" content="${info.geo.placename}" />`,
  `<meta name="geo.position" content="${info.geo.lat};${info.geo.lng}" />`,
  `<meta name="ICBM" content="${info.geo.lat}, ${info.geo.lng}" />`,
  `<script type="application/ld+json" id="ld-static">${JSON.stringify(graph).replaceAll("<", "\\u003c")}</script>`,
  "<!-- SEO:END -->",
].filter(Boolean).join("\n    ");
html = html.includes("<!-- SEO:START -->")
  ? html.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, block)
  : html.replace("</head>", `    ${block}\n  </head>`);
html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>\n      ${noscript}\n    </noscript>`);
html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${info.seo.title}</title>`);
html = html.replace(/<meta name="description" content="[\s\S]*?" \/>/, `<meta name="description" content="${info.seo.description}" />`);
fs.writeFileSync("index.html", html);
console.log(`SEO files written. ${urls.length} URLs.`);
