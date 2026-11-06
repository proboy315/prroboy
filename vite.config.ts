import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { build, defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const escapeHtml = (value: string) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function prerenderRoutesPlugin(): Plugin {
  let isSsrBuild = false;
  let isServeCommand = false;

  return {
    name: "proboy-prerender-routes",
    apply: "build",
    configResolved(config) {
      isSsrBuild = Boolean(config.build.ssr);
      isServeCommand = config.command === "serve";
    },
    async closeBundle() {
      if (isSsrBuild || isServeCommand) return;

      const distDir = path.resolve(__dirname, "dist");
      const templatePath = path.join(distDir, "index.html");
      if (!fs.existsSync(templatePath)) return;

      const template = fs.readFileSync(templatePath, "utf8");
      const ssrOutDir = path.resolve(__dirname, ".vite-ssr-tmp");

      try {
        await build({
          configFile: false,
          root: __dirname,
          logLevel: "silent",
          plugins: [react()],
          resolve: {
            alias: {
              "@": path.resolve(__dirname, "src"),
            },
          },
          build: {
            ssr: path.resolve(__dirname, "src/entry-server.tsx"),
            outDir: ssrOutDir,
            emptyOutDir: true,
            write: true,
            rollupOptions: {
              output: {
                format: "esm",
                entryFileNames: "entry-server.mjs",
              },
            },
          },
        });

        const serverEntry = await import(pathToFileURL(path.join(ssrOutDir, "entry-server.mjs")).href);
        const routes = serverEntry.getPrerenderRoutes();

        for (const route of routes) {
          const { html: appHtml, og, canonicalUrl } = serverEntry.renderRoute(route);
          const robots = route.noindex ? "noindex, follow" : "index, follow";

          const seoBlock = [
            "<!-- SEO:START -->",
            !route.noindex ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />` : "",
            `<meta name="robots" content="${robots}" />`,
            route.path === "/"
              ? `<link rel="preload" as="image" href="/images/shahan-ali-portrait.jpg" fetchpriority="high" />`
              : "",
            `<meta property="og:type" content="${route.ogType}" />`,
            `<meta property="og:site_name" content="Shahan Ali / PROBOY" />`,
            `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
            `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
            `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
            `<meta property="og:image" content="${escapeHtml(og.url)}" />`,
            `<meta property="og:image:alt" content="${escapeHtml(og.alt)}" />`,
            `<meta property="og:image:width" content="${escapeHtml(og.width)}" />`,
            `<meta property="og:image:height" content="${escapeHtml(og.height)}" />`,
            `<meta property="og:locale" content="en_US" />`,
            `<meta name="twitter:card" content="summary_large_image" />`,
            `<meta name="twitter:site" content="@itx_proboy" />`,
            `<meta name="twitter:creator" content="@itx_proboy" />`,
            `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`,
            `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`,
            `<meta name="twitter:image" content="${escapeHtml(og.url)}" />`,
            `<meta name="geo.region" content="PK-PB" />`,
            `<meta name="geo.placename" content="Burewala" />`,
            `<meta name="geo.position" content="30.1667;72.6833" />`,
            `<meta name="ICBM" content="30.1667, 72.6833" />`,
            `<script type="application/ld+json" id="ld-static">${JSON.stringify(route.jsonLd).replace(/</g, "\\u003c")}</script>`,
            "<!-- SEO:END -->",
          ]
            .filter(Boolean)
            .join("\n    ");

          let pageHtml = template
            .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
            .replace(
              /<meta name="description" content="[\s\S]*?" \/>/,
              `<meta name="description" content="${escapeHtml(route.description)}" />`
            )
            .replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, seoBlock)
            .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

          let outFile: string;
          if (route.path === "/") {
            outFile = path.join(distDir, "index.html");
          } else if (route.path === "/404") {
            outFile = path.join(distDir, "404.html");
          } else {
            const cleanRel = route.path.replace(/^\//, "");
            outFile = path.join(distDir, cleanRel, "index.html");
          }

          fs.mkdirSync(path.dirname(outFile), { recursive: true });
          fs.writeFileSync(outFile, pageHtml, "utf8");
        }
      } finally {
        fs.rmSync(ssrOutDir, { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile(), prerenderRoutesPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
