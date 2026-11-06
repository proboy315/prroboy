import { renderToString } from "react-dom/server";
import App from "./App";
import { blogPosts, demos, gallery, info, projects, services, site } from "./lib/data";
import { breadcrumbLd, personLd, resolveOgImage, websiteLd } from "./lib/seo";
import { commandMeta } from "./components/CommandDirectory";

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
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "ProBoy-MD",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Node.js",
          description: projects[0]?.summary,
          author: { "@id": `${site}/#person` },
          codeRepository: "https://github.com/proboy315/ProBoy-MD",
          url: `${site}/proboy-md`,
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: info.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        },
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
      title: `About ${info.name} (${info.brand}) — Developer Profile, Education & Work`,
      description: `Biography, current ICS education at Govt Graduate College Burewala, technical stack, ProBoy-MD bot architecture, and verified profile links for ${info.name} (${info.aliases.join(", ")}) from ${info.location}.`,
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
      title: `Development Services — ${info.name} (${info.brand})`,
      description: `Full-Stack Web Development, WhatsApp Bot Development & Automation, Shopify Online Store 2.0 Development, and AI Integrations by ${info.name} (${info.brand}) in ${info.location}.`,
      ogType: "website",
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Services", "/services"],
        ]),
        personLd(),
        ...services.map((svc) => ({
          "@context": "https://schema.org",
          "@type": "Service",
          name: svc.title,
          serviceType: svc.title,
          description: svc.summary,
          url: `${site}/services/${svc.slug}`,
          provider: { "@id": `${site}/#person` },
          areaServed: "Worldwide",
        })),
      ],
    },
    ...services.map((svc) => ({
      path: `/services/${svc.slug}`,
      title: `${svc.title} — ${info.name} (${info.brand})`,
      description: svc.summary,
      ogType: "website" as const,
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Services", "/services"],
          [svc.title, `/services/${svc.slug}`],
        ]),
        {
          "@context": "https://schema.org",
          "@type": "Service",
          name: svc.title,
          serviceType: svc.title,
          description: svc.summary,
          url: `${site}/services/${svc.slug}`,
          provider: { "@id": `${site}/#person` },
          areaServed: "Worldwide",
        },
      ],
    })),
    {
      path: "/projects",
      title: `Projects by ${info.name} (${info.brand}) — Bots, Web Apps & Security Tools`,
      description: `Production software projects and interactive demos built by ${info.name} (${info.brand}), including ProBoy-MD, ProBoy CamLink, ProBoy JS Obfuscator, ProBoy Encrypt & Decrypt, and ProBoy-SiM_Database.`,
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
      title: `${p.title} by ${info.name} (${info.brand}) — ${p.category}`,
      description: p.summary,
      ogType: "website" as const,
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Projects", "/projects"],
          [p.title, `/projects/${p.slug}`],
        ]),
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: p.title,
          applicationCategory: p.category,
          description: p.summary,
          url: `${site}/projects/${p.slug}`,
          author: {
            "@id": `${site}/#person`,
            "@type": "Person",
            name: info.name,
            alternateName: info.aliases,
          },
          ...(p.repo ? { codeRepository: p.repo } : {}),
        },
      ],
    })),
    {
      path: "/proboy-md",
      title: "ProBoy-MD Commands & WhatsApp Pairing — Shahan Ali (ProBoy)",
      description: `ProBoy-MD is the WhatsApp Multi-Device bot by Shahan Ali (ProBoy), version ${commandMeta.version}, prefix ${commandMeta.prefix}. Search ${commandMeta.repositoryCommandFiles} verified commands, browse categories and get a WhatsApp pairing code.`,
      ogType: "website",
      jsonLd: [
        personLd(),
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "@id": `${site}/proboy-md#software`,
          name: "ProBoy-MD",
          alternateName: ["ProBoy MD", "ProBoy315 WhatsApp Bot"],
          version: commandMeta.version,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Node.js",
          description: `ProBoy-MD is a Node.js WhatsApp Multi-Device bot by Shahan Ali (ProBoy) with AI, group, media, utility, text-maker and developer commands, prefix ${commandMeta.prefix}.`,
          codeRepository: "https://github.com/proboy315/ProBoy-MD",
          url: `${site}/proboy-md`,
          softwareVersion: commandMeta.version,
          author: { "@id": `${site}/#person`, name: info.name, alternateName: info.aliases },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
        breadcrumbLd([
          ["Home", "/"],
          ["ProBoy-MD", "/proboy-md"],
        ]),
      ],
    },
    {
      path: "/blog",
      title: `Engineering Notes & Blog — ${info.name} (${info.brand})`,
      description: `Technical articles and architecture notes by ${info.name} (${info.brand}) on Node.js WhatsApp bots (ProBoy-MD), full-stack web engineering, Shopify Liquid, and AI workflows.`,
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
    ...blogPosts.map((post) => ({
      path: `/blog/${post.slug}`,
      title: `${post.title} — ${info.name} (${info.brand})`,
      description: post.summary,
      ogType: "article" as const,
      jsonLd: [
        breadcrumbLd([
          ["Home", "/"],
          ["Blog", "/blog"],
          [post.title, `/blog/${post.slug}`],
        ]),
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.summary,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt,
          url: `${site}/blog/${post.slug}`,
          author: { "@id": `${site}/#person`, "@type": "Person", name: info.name },
          publisher: { "@id": `${site}/#person`, "@type": "Person", name: info.name },
          keywords: post.tags.join(", "),
        },
      ],
    })),
    {
      path: "/contact",
      title: `Contact ${info.name} (${info.brand}) — Hire Full-Stack, Bot & Shopify Developer`,
      description: `Contact ${info.name} (${info.brand}) in ${info.location} for Full-Stack Web Development, WhatsApp Bot Automation, Shopify Online Store 2.0, and Gemini AI integrations.`,
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
    ...demos.map((d) => ({
      path: `/demos/${d.slug}`,
      title: `${d.name} — ${d.kind} demo by Shahan Ali (ProBoy)`,
      description: `${d.name} is an interactive ${d.category.toLowerCase()} demo by Shahan Ali (ProBoy). ${d.summary}`,
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
  return routes;
}

export function renderRoute(route: RouteMeta) {
  const html = renderToString(<App initialPath={route.path} />);
  const og = resolveOgImage();
  const canonicalUrl = `${site}${route.path === "/" ? "/" : route.path}`;
  return { html, og, canonicalUrl };
}
