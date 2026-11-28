import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const routes = JSON.parse(readFileSync("dist/route-inventory.json", "utf8"));
const out = [
  "# PROBOY route inventory",
  "",
  "Generated from the prerendered route list. Canonicals always use `https://proboy.vercel.app`. Unknown URLs are not listed and must return HTTP 404.",
  "",
  `- App documents: **${routes.length}**`,
  `- Sitemap entries: **${routes.filter((r) => r.indexable).length}**`,
  `- Noindex documents: **${routes.filter((r) => r.noindex).length}**`,
  "",
  "| Route | Intended page | Source | Canonical | Indexable | Expected HTTP |",
  "|---|---|---|---|---|---:|",
  ...routes.map((r) => `| \`${r.path}\` | ${r.title.replace(/\|/g, "\\|")} | ${r.source.map((s) => `\`${s}\``).join(", ")} | ${r.canonical || "—"} | ${r.indexable ? "Yes" : "No"} | ${r.expectedStatus} |`),
  "",
  "Run `npm run build` and `node scripts/route-inventory.mjs` to regenerate this inventory. HTTP and browser verification results are separate: `tests/launch-http.mjs` and `tests/launch-browser.mjs`.",
].join("\n");

mkdirSync("docs", { recursive: true });
writeFileSync("docs/ROUTE-INVENTORY.md", out + "\n");
console.log(`Documented ${routes.length} routes.`);
