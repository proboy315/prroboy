import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { build, defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { assertCleanDist, preserveBlockedPublicData, publicBlockedPaths } from "./scripts/private-paths.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isSplitAssets = process.env.PROBOY_SPLIT_ASSETS === "1";

const escapeHtml = (value: string) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

type ManifestEntry = {
  file: string;
  css?: string[];
  imports?: string[];
};

const COMMERCE_SLUGS = new Set([
  "luxecart-store",
  "ember-kitchen",
  "haven-properties",
  "atelier-noir",
  "voltix-gear",
  "kanso-living",
  "lumina-botanicals",
  "freshcart-market",
  "solis-stays",
  "apex-motors",
]);

function routeEntryKeys(routePath: string): string[] {
  if (routePath === "/") return [];
  if (routePath === "/about") return ["src/pages/About.tsx"];
  if (routePath === "/services" || routePath.startsWith("/services/")) return ["src/pages/Services.tsx"];
  if (routePath === "/projects") return ["src/pages/ProjectsPage.tsx"];
  if (routePath.startsWith("/projects/") || routePath === "/404") return ["src/pages/Detail.tsx"];
  if (routePath === "/proboy-md") return ["src/pages/ProBoyMd.tsx"];
  if (routePath === "/proboy-md/docs" || routePath.startsWith("/proboy-md/docs/")) return ["src/pages/BotDocs.tsx"];
  if (routePath === "/press") return ["src/pages/Press.tsx"];
  if (routePath === "/mentions") return ["src/pages/Mentions.tsx"];
  if (routePath === "/blog" || routePath.startsWith("/blog/")) return ["src/pages/Blog.tsx"];
  if (routePath === "/contact") return ["src/pages/Contact.tsx"];
  if (routePath === "/demos" || routePath === "/demos/control-room") return ["src/pages/DemosDirectory.tsx"];
  if (routePath.startsWith("/demos/")) {
    const slug = routePath.slice("/demos/".length);
    return [
      "src/pages/Demos.tsx",
      COMMERCE_SLUGS.has(slug) ? "src/pages/DemosCommerce.tsx" : "src/pages/DemosWorkspaces.tsx",
    ];
  }
  if (routePath === "/privacy") return ["src/pages/Privacy.tsx"];
  if (routePath === "/admin") return ["src/pages/Admin.tsx"];
  return [];
}

function collectAssetsFromManifest(manifest: Record<string, ManifestEntry>, keys: string[]) {
  const css = new Set<string>();
  const js = new Set<string>();
  const visited = new Set<string>();

  function walk(k: string) {
    if (visited.has(k)) return;
    visited.add(k);
    const entry = manifest[k];
    if (!entry) return;
    if (entry.file) js.add(entry.file);
    for (const c of entry.css || []) css.add(c);
    for (const imp of entry.imports || []) walk(imp);
  }

  for (const k of keys) walk(k);
  return { css: [...css], js: [...js] };
}

/**
 * Guard every build path, including someone running `vite build` directly instead
 * of `npm run build`. Preservation happens before Vite can copy public/ to dist/.
 */
function privacyGuardPlugin(): Plugin {
  let isSsrBuild = false;
  return {
    name: "proboy-private-data-guard",
    apply: "build",
    configResolved(config) {
      isSsrBuild = Boolean(config.build.ssr);
    },
    buildStart() {
      if (isSsrBuild) return;
      const moved = preserveBlockedPublicData();
      if (moved.length) {
        this.info(`preserved ${moved.length} flagged public path(s) in preserved-data/ (outside dist/)`);
      }
      if (publicBlockedPaths("public").length) {
        this.error("Privacy guard: flagged public/ paths remain after automatic preservation.");
      }
    },
    closeBundle() {
      if (isSsrBuild) return;
      assertCleanDist(path.resolve(__dirname, "dist"));
    },
  };
}

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
      const manifestPath = path.join(distDir, ".vite", "manifest.json");
      const manifest: Record<string, ManifestEntry> = fs.existsSync(manifestPath)
        ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
        : {};
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
                inlineDynamicImports: true,
              },
            },
          },
        });

        const serverEntry = await import(pathToFileURL(path.join(ssrOutDir, "entry-server.mjs")).href);
        const routes = serverEntry.getPrerenderRoutes();

        for (const route of routes) {
          const { html: rawAppHtml, og, canonicalUrl } = await serverEntry.renderRoute(route);
          // Strip any inline React 19 <link rel="preload" ...> inside #root to guarantee zero duplicate preloads.
          const appHtml = rawAppHtml.replace(/<link\b[^>]*\brel="preload"[^>]*\/?>/gi, "");
          const robots = route.noindex ? "noindex, follow" : "index, follow";

          const extraAssets = Object.keys(manifest).length
            ? collectAssetsFromManifest(manifest, routeEntryKeys(route.path))
            : { css: [], js: [] };

          const extraHeadTags = [
            ...extraAssets.css
              .filter((c) => !template.includes(`/${c}`))
              .map((c) => `<link rel="stylesheet" crossorigin href="/${c}" />`),
            ...extraAssets.js
              .filter((j) => !template.includes(`/${j}`))
              .map((j) => `<link rel="modulepreload" crossorigin href="/${j}" />`),
          ].join("\n    ");

          const seoBlock = [
            "<!-- SEO:START -->",
            !route.noindex ? `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />` : "",
            `<meta name="robots" content="${robots}" />`,
            route.path === "/"
              ? `<link rel="preload" as="image" type="image/avif" imagesrcset="/images/shahan-ali-portrait-480.avif 480w, /images/shahan-ali-portrait-800.avif 800w, /images/shahan-ali-portrait-1200.avif 1200w" imagesizes="(max-width: 639px) 92vw, (max-width: 1099px) 580px, 640px" fetchpriority="high" />`
              : "",
            `<meta property="og:type" content="${route.ogType}" />`,
            `<meta property="og:site_name" content="ProBoy" />`,
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

          if (extraHeadTags) {
            pageHtml = pageHtml.replace("</head>", `    ${extraHeadTags}\n  </head>`);
          }

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
        fs.rmSync(path.join(distDir, ".vite"), { recursive: true, force: true });
      }
    },
  };
}

export default defineConfig({
  plugins: [
    privacyGuardPlugin(),
    react(),
    tailwindcss(),
    ...(isSplitAssets ? [] : [viteSingleFile()]),
    prerenderRoutesPlugin(),
  ],
  build: {
    manifest: isSplitAssets ? ".vite/manifest.json" : false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
