import { renderToString } from "react-dom/server";
import fs from "node:fs";
import path from "node:path";
import App from "./App";
import { demos, gallery, info, projects, services, site } from "./lib/data";
import { articles } from "./data/editorial";
import { botDocs } from "./data/botDocs";
import { articleSeo } from "./pages/Blog";
import { docSeo } from "./pages/BotDocs";
import { botLd, breadcrumbLd, faqLd, personLd, projectLd, resolveOgImage, serviceLd, websiteLd } from "./lib/seo";
import { botFaq } from "./data/botSource";
import { commandMeta } from "./components/CommandDirectory";
import { normalizePath, preloadRoute } from "./routes/routeMap";

export type RouteMeta = {
  path: string;
  title: string;
  description: string;
  ogType: "website" | "profile" | "article";
  noindex?: boolean;
  jsonLd: object[];
};

export function getPrerenderRoutes(): RouteMeta[] {
  const routes: RouteMeta[] = [
    {
      path: "/",
      title: info.seo.title,
      description: info.seo.description,
      ogType: "profile",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          name: info.seo.title,
          url: `${site}/`,
          mainEntity: { "@id": `${site}/#person` },
        },
        personLd(),
        websiteLd(),
        botLd(),
        faqLd(info.faq),
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Real Projects by Shahan Ali (PROBOY)",
          itemListElement: projects.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.title,
            description: p.summary,
            url: `${site}/projects/${p.slug}`,
          })),
        },
        {
          "@context": "https://schema.org",
          "@type": "ImageObject",
          name: info.certificate.title,
          description: gallery[0]?.alt,
          contentUrl: site ? new URL(info.certificate.image, site + "/").href : info.certificate.image,
          creator: { "@id": `${site}/#person` },
        },
      ],
    },
    {
      path: "/about",
      title: `About Shahan Ali | Developer in Burewala`,
      description: `Meet Shahan Ali (PROBOY), a developer and ICS student in Burewala. Read about his work, ProBoy-MD, education and contact links.`,
      ogType: "profile",
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["About", "/about"],
        ]),
        {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          name: `About ${info.name} (${info.brand})`,
          url: `${site}/about`,
          mainEntity: { "@id": `${site}/#person` },
        },
        personLd(),
      ],
    },
    {
      path: "/services",
      title: `Development Services | Shahan Ali (PROBOY)`,
      description: "React and Node.js full-stack development, frontend engineering, Shopify Liquid, Baileys bots and Gemini automation services by Shahan Ali.",
      ogType: "website",
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Services", "/services"],
        ]),
        personLd(),
        ...services.map(serviceLd),
      ],
    },
    ...services.map((svc) => ({
      path: `/services/${svc.slug}`,
      title: `${svc.title} | ${info.name} (${info.brand})`,
      description: svc.summary,
      ogType: "website" as const,
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Services", "/services"],
          [svc.title, `/services/${svc.slug}`],
        ]),
        serviceLd(svc),
        ...(svc.faqs?.length ? [faqLd(svc.faqs)] : []),
      ],
    })), 
    {
      path: "/projects",
      title: `Projects | Shahan Ali (PROBOY)`,
      description: `Explore Shahan Ali's real projects: ProBoy-MD, web tools and browser utilities. See what each build does and try the separate interactive demos.`,
      ogType: "website",
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Projects", "/projects"],
        ]),
        personLd(),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Projects by ${info.name} (${info.brand})`,
          url: `${site}/projects`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: projects.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.title,
              description: p.summary,
              url: `${site}/projects/${p.slug}`,
            })),
          },
        },
      ],
    },
    ...projects.map((p) => ({
      path: `/projects/${p.slug}`,
      title: `${p.title} | Shahan Ali (PROBOY)`,
      description: p.summary,
      ogType: "website" as const,
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Projects", "/projects"],
          [p.title, `/projects/${p.slug}`],
        ]),
        projectLd(p),
      ],
    })),
    {
      path: "/projects/proboy-camlink",
      title: "ProBoy CamLink (Archived) | Shahan Ali",
      description: "Archive note for the former ProBoy CamLink device diagnostics project. It is not offered as a public tool or current service proof.",
      ogType: "website",
      noindex: true,
      jsonLd: [],
    },
    {
      path: "/proboy-md",
      title: "ProBoy-MD Commands & Pairing | Shahan Ali",
      description: `Explore ProBoy-MD, Shahan Ali's open-source WhatsApp bot. Search ${commandMeta.repositoryCommandFiles} command files and find pairing and source links.`,
      ogType: "website",
      jsonLd: [
        personLd(),
        botLd(),
        faqLd(botFaq),
        breadcrumbLd([
          ["Home", "/"],
          ["ProBoy-MD", "/proboy-md"],
        ]),
      ],
    },
    {
      path: "/blog",
      title: `Engineering Notes | Shahan Ali (PROBOY)`,
      description: "Source-checked guides on ProBoy-MD, React SEO, accessibility and honest developer project practice.",
      ogType: "website",
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Blog", "/blog"],
        ]),
        personLd(),
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${info.name} (${info.brand}) — Engineering Blog`,
          url: `${site}/blog`,
          author: { "@id": `${site}/#person` },
        },
      ],
    },
    ...articles.map((post) => articleSeo(post)),
    ...botDocs.map((doc) => ({ ...docSeo(doc.slug), ogType: "website" as const })),
    {
      path: "/press",
      title: "Press Kit & Brand Facts | Shahan Ali (PROBOY)",
      description:
        "Approved bios, verified brand facts, project notes and asset links for Shahan Ali (PROBOY), full-stack developer from Burewala, Pakistan. Facts checked against public source.",
      ogType: "website",
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Press kit", "/press"],
        ]),
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Press kit and brand facts",
          url: `${site}/press`,
          description: "Approved bios, verified brand facts and asset links for Shahan Ali (PROBOY).",
          mainEntity: { "@id": `${site}/#person` },
          dateModified: "2026-11-07",
        },
        personLd(),
      ],
    },
    {
      path: "/mentions",
      title: "Mentions & Publications | Shahan Ali (PROBOY)",
      description:
        "Verified third-party mentions, owned profiles, and citation verification policy for Shahan Ali (PROBOY) in Burewala, Pakistan.",
      ogType: "website",
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Mentions & publications", "/mentions"],
        ]),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Mentions and publications about Shahan Ali (PROBOY)",
          url: `${site}/mentions`,
          description: "Verified third-party publications and community contributions with publication date and canonical URL.",
          mainEntity: { "@id": `${site}/#person` },
          dateModified: "2026-11-07",
        },
        personLd(),
      ],
    },
    {
      path: "/contact",
      title: `Contact Shahan Ali | Web, Bots & Shopify`,
      description: `Contact Shahan Ali (PROBOY) about web apps, WhatsApp bots, Shopify stores or AI tools. Use the form, email or WhatsApp.`,
      ogType: "website",
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Contact", "/contact"],
        ]),
        personLd(),
        {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: `Contact ${info.name} (${info.brand})`,
          url: `${site}/contact`,
          mainEntity: { "@id": `${site}/#person` },
        },
      ],
    },
    {
      path: "/demos",
      title: `Interactive Demos (${demos.length}) | Shahan Ali (PROBOY)`,
      description: `Explore ${demos.length} interactive website and app demos by Shahan Ali (PROBOY) across e-commerce, SaaS, AI, hospitality, real estate, and developer tools.`,
      ogType: "website",
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Demos", "/demos"],
        ]),
        personLd(),
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Interactive Demos by ${info.name} (${info.brand})`,
          url: `${site}/demos`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: demos.map((d, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: d.name,
              description: d.summary,
              url: `${site}/demos/${d.slug}`,
            })),
          },
        },
      ],
    },
    {
      path: "/privacy",
      title: "Privacy & Analytics | ProBoy — Shahan Ali",
      description:
        "How ProBoy (Shahan Ali) handles visitor data: cookie-free, aggregate first-party analytics with opt-out, no IP storage and no advertising trackers.",
      ogType: "website",
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Privacy & analytics", "/privacy"],
        ]),
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Privacy & Analytics — ProBoy",
          url: `${site}/privacy`,
          isPartOf: { "@id": `${site}/#website` },
          about: { "@id": `${site}/#person` },
        },
      ],
    },
    {
      path: "/demos/control-room",
      title: `Demo Control Room | Shahan Ali (PROBOY)`,
      description: "Local browser sandbox to customize, reorder, hide/show, and preview interactive demo cards built by Shahan Ali (PROBOY).",
      ogType: "website",
      noindex: true,
      jsonLd: [],
    },
    {
      path: "/admin",
      title: `Admin Control Panel | ${info.brand}`,
      description: "Private GitHub-backed admin panel for managing SEO, OG tags, projects, public folder code, and Liquid Glass theme.",
      ogType: "website",
      noindex: true,
      jsonLd: [],
    },
    ...demos.map((d) => ({
      path: `/demos/${d.slug}`,
      title: `${d.name} Demo | Shahan Ali (PROBOY)`,
      description: `Try ${d.name}, a ${d.kind} demo by Shahan Ali. Explore working controls with sample data; this is not a client project.`,
      ogType: "website" as const,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: d.name,
          applicationCategory: d.category,
          description: d.summary,
          creator: { "@type": "Person", name: "Shahan Ali", alternateName: ["ProBoy", "ProBoy315"] },
        },
      ],
    })),
    {
      path: "/404",
      title: `404 — Page Not Found | ${info.brand}`,
      description: "The requested page does not exist on Shahan Ali (PROBOY) Portfolio.",
      ogType: "website",
      noindex: true,
      jsonLd: [],
    },
  ];
  // The build already calls this function while prerendering. Emit a sitemap from
  // the same public route inventory, so deploys never require a manual generator.
  const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const entries = routes.filter(r => !r.noindex).map(r => {
    const article = articles.find(a => r.path === `/blog/${a.slug}`);
    const doc = botDocs.find(d => r.path === (d.slug === "documentation-home" ? "/proboy-md/docs" : `/proboy-md/docs/${d.slug}`));
    return `  <url><loc>${escapeXml(site + r.path)}</loc>${article || doc ? `<lastmod>${article?.updatedAt || "2026-11-07"}</lastmod>` : ""}</url>`;
  });
  fs.writeFileSync(path.resolve("dist/sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`);
  const sourceFor = (route: string): string[] => {
    if (route === "/") return ["src/pages/Home.tsx", "src/components/Hero.tsx"];
    if (route === "/services") return ["src/pages/Services.tsx", "src/data/services.json"];
    if (route.startsWith("/services/")) return ["src/pages/Services.tsx", "src/components/ServiceProofs.tsx", "src/data/services.json"];
    if (route === "/projects") return ["src/pages/ProjectsPage.tsx", "src/data/projects.json"];
    if (route.startsWith("/projects/")) return ["src/pages/Detail.tsx", "src/data/projects.json"];
    if (route === "/proboy-md") return ["src/pages/ProBoyMd.tsx", "src/components/CommandDirectory.tsx", "src/data/commands.json"];
    if (route.startsWith("/proboy-md/docs")) return ["src/pages/BotDocs.tsx", "src/data/botDocs.ts"];
    if (route.startsWith("/blog")) return ["src/pages/Blog.tsx", "src/data/editorial.ts"];
    if (route === "/demos/control-room") return ["src/pages/DemosDirectory.tsx", "src/data/demos.json"];
    if (route.startsWith("/demos/")) return ["src/pages/Demos.tsx", "src/pages/DemosCommerce.tsx", "src/pages/DemosWorkspaces.tsx", "src/data/demos.json"];
    if (route === "/demos") return ["src/pages/DemosDirectory.tsx", "src/data/demos.json"];
    if (route === "/about") return ["src/pages/About.tsx"];
    if (route === "/contact") return ["src/pages/Contact.tsx", "src/components/ContactForm.tsx"];
    if (route === "/press") return ["src/pages/Press.tsx", "src/data/press.ts"];
    if (route === "/mentions") return ["src/pages/Mentions.tsx", "src/data/mentions.ts"];
    if (route === "/privacy") return ["src/pages/Privacy.tsx"];
    if (route === "/admin") return ["src/pages/Admin.tsx"];
    return ["src/pages/Detail.tsx"];
  };
  fs.writeFileSync(path.resolve("dist/.prerender-routes.json"), JSON.stringify(routes.map((route) => ({
    path: route.path, title: route.title, source: sourceFor(route.path), noindex: Boolean(route.noindex), indexable: !route.noindex,
    canonical: route.noindex ? null : `${site}${route.path}`, expectedStatus: route.path === "/404" ? 404 : 200,
  }))));
  return routes;
}

export async function renderRoute(route: RouteMeta) {
  const cleanPath = normalizePath(route.path);
  const preloadedPage = await preloadRoute(cleanPath);
  const html = renderToString(
    <App path={cleanPath} page={preloadedPage} />
  );
  const og = resolveOgImage();
  const canonicalUrl = `${site}${route.path === "/" ? "/" : route.path}`;
  return { html, og, canonicalUrl };
}
