import fs from "node:fs";
import path from "node:path";

const read = (f) => JSON.parse(fs.readFileSync(`src/data/${f}`, "utf8"));
const info = read("info.json");
const projects = read("projects.json");
const showcase = read("showcase.json");
const images = read("images.json");
const site = info.siteUrl.replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);
const absoluteAsset = (value) => new URL(value, site + "/").href;
const assetExists = (value) => Boolean(value && (/^https:\/\//.test(value) || fs.existsSync(path.join("public", value.replace(/^\//, "")))));
const portraitUrl = assetExists(info.profileImage) ? absoluteAsset(info.profileImage) : "";
const og = assetExists(info.seo.ogImage) ? absoluteAsset(info.seo.ogImage) : "";
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
<meta property="og:url" content="${url}"><meta property="og:type" content="article"><meta name="author" content="Shahan Ali">
<script type="application/ld+json">${JSON.stringify([{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: site + "/" }, { "@type": "ListItem", position: 2, name: title, item: url }] }, ...extraLd])}</script>
<style>${css}</style></head><body><main>${body}<p><a href="${site}/">Back to Shahan Ali — ProBoy</a></p></main></body></html>`;
}

function write(rel, html) {
  const file = path.join("public", rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

write("proboy-md/index.html", page({
  title: "ProBoy-MD by Shahan Ali (ProBoy) | WhatsApp Bot Documentation",
  description: "ProBoy-MD is a Node.js WhatsApp multi-device bot by Shahan Ali (ProBoy, ProBoy315), built with Baileys. This page describes its command categories, architecture and links.",
  path: "/proboy-md",
  extraLd: graph["@graph"].filter((n) => n["@type"] === "SoftwareApplication"),
  body: `<p class="muted">Project documentation · Shahan Ali (ProBoy)</p><h1>ProBoy-MD</h1><p>${projects[0].summary}</p>${projects[0].description.map((d) => `<p>${d}</p>`).join("")}<h2>Feature categories</h2><ul><li>AI tools — chat, coding and image-related helpers, depending on the configured provider.</li><li>Media utilities — conversion and media commands, subject to service terms.</li><li>Textmaker — text effects.</li><li>Group administration — moderation commands with admin checks.</li><li>Developer tools — owner-restricted utilities. Not a guide to remote command execution.</li><li>Fun and general utilities.</li></ul><h2>How it is structured</h2><p>Baileys opens a WhatsApp multi-device session. A handler checks the prefix, command name and permissions, then a command file replies. Reported files include index.js, proboy.js, commands/, database/ and settings/. Do not publish session files or tokens.</p><h2>Safety</h2><p>A partial audit flagged remote-execution paths, stored tokens, and privacy-sensitive commands such as camera or phone lookups. Those should be reviewed, restricted and not used to monitor anyone without consent. This page does not document how to exploit them.</p><p>Source: <a href="https://github.com/ProBoy315/ProBoy-MD">github.com/ProBoy315/ProBoy-MD</a></p><p>Contact: <a href="mailto:${info.email}">${info.email}</a> · <a href="${info.whatsapp}">${info.phone}</a></p>`,
}));

for (const p of projects) {
  write(`projects/${p.slug}/index.html`, page({
    title: `${p.title} by Shahan Ali (ProBoy) — ${p.category}`,
    description: p.summary,
    path: `/projects/${p.slug}`,
    extraLd: [{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: p.title, applicationCategory: p.category, description: p.summary, author: { "@type": "Person", name: "Shahan Ali", alternateName: "ProBoy" }, ...(p.repo ? { codeRepository: p.repo } : {}) }],
    body: `<p class="muted">${p.category} · Created by ${p.creator}</p><h1>${p.title}</h1><p>${p.summary}</p>${p.description.map((d) => `<p>${d}</p>`).join("")}<h2>Capabilities</h2><ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul><p class="muted">Technologies: ${p.technologies.join(", ")}</p>${p.docs ? `<p><a href="${site}${p.docs}">Documentation</a></p>` : ""}${p.repo ? `<p><a href="${p.repo}">Source</a></p>` : ""}${p.demo ? `<p><a href="${p.demo}">Related link</a></p>` : ""}`,
  }));
}
for (const s of showcase) {
  write(`showcase/${s.slug}/index.html`, page({
    title: `${s.title} — ${s.industry} showcase by Shahan Ali (ProBoy)`,
    description: s.description,
    path: `/showcase/${s.slug}`,
    extraLd: [{ "@context": "https://schema.org", "@type": "CreativeWork", name: s.title, description: s.longDescription, genre: s.category, creator: { "@type": "Person", name: "Shahan Ali", alternateName: "ProBoy" } }],
    body: `<p class="muted">${s.category} · ${s.industry} · Concept demo, not a client project</p><h1>${s.title}</h1><p>${s.longDescription}</p><h2>What the demo includes</h2><ul>${s.features.map((f) => `<li>${f}</li>`).join("")}</ul>`,
  }));
}

const urls = ["/", "/proboy-md", ...projects.map((p) => `/projects/${p.slug}`), ...showcase.map((s) => `/showcase/${s.slug}`)];
fs.writeFileSync("public/sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.map((u) => `  <url><loc>${site}${u}</loc><lastmod>${today}</lastmod>${u === "/" ? images.map((img) => `<image:image><image:loc>${img.src}</image:loc><image:caption>${img.alt}</image:caption></image:image>`).join("") : ""}</url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync("public/robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`);
fs.writeFileSync("public/llms.txt", `# ${info.name} (${info.aliases.join(", ")})\n\n> ${info.about.join(" ")}\n\n- Site: ${site}\n- Email: ${info.email}\n- WhatsApp: ${info.phone}\n\n## Projects\n${projects.map((p) => `- [${p.title}](${site}/projects/${p.slug}): ${p.summary}`).join("\n")}\n\n## Showcase demos\n${showcase.map((s) => `- [${s.title}](${site}/showcase/${s.slug}): ${s.description}`).join("\n")}\n\n## ProBoy-MD\n- [Documentation](${site}/proboy-md)\n- [Source](https://github.com/ProBoy315/ProBoy-MD)\n`);

const noscript = `<h1>Shahan Ali (ProBoy) — portfolio</h1><p>${info.seo.description}</p><h2>Projects</h2><ul>${projects.map((p) => `<li><a href="/projects/${p.slug}">${p.title}</a> — ${p.summary}</li>`).join("")}</ul><h2>Showcase</h2><ul>${showcase.map((s) => `<li><a href="/showcase/${s.slug}">${s.title}</a> — ${s.description}</li>`).join("")}</ul><p>Certificate image: ${images[0].alt}</p>`;
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
  og ? `<meta property="og:image" content="${og}" /><meta property="og:image:alt" content="${escapeAttribute(info.portrait.alt)}" /><meta name="twitter:image" content="${og}" />` : "",
  `<meta name="twitter:card" content="${og ? "summary_large_image" : "summary"}" />`,
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
