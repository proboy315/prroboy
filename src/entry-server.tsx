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
          codeRepository: "https://github.com/ProBoy315/ProBoy-MD",
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
      description: `Explore Shahan Ali's web development, WhatsApp bot, Shopify and AI services. See what each service includes and how to get in touch.`,
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
      title: "ProBoy-MD Commands & Pairing | Shahan Ali",
      description: `Explore ProBoy-MD, Shahan Ali's open-source WhatsApp bot. Search ${commandMeta.repositoryCommandFiles} command files and find pairing and source links.`,
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
          codeRepository: "https://github.com/ProBoy315/ProBoy-MD",
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
      title: `Engineering Notes | Shahan Ali (PROBOY)`,
      description: `Read Shahan Ali's notes on ProBoy-MD and building web apps, bots and AI tools. Practical lessons from projects he has worked on.`,
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
      title: `${post.title.split(":")[0]} | ${info.name} (${info.brand})`,
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
      path: "/demos/control-room",
      title: `Demo Control Room | Shahan Ali (PROBOY)`,
      description: "Local browser sandbox to customize, reorder, hide/show, and preview interactive demo cards built by Shahan Ali (PROBOY).",
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
  return routes;
}

export function renderRoute(route: RouteMeta) {
  const html = renderToString(<App initialPath={route.path} />);
  const og = resolveOgImage();
  const canonicalUrl = `${site}${route.path === "/" ? "/" : route.path}`;
  return { html, og, canonicalUrl };
}
