import { useEffect } from "react";
import { info, site, type Project, type ServiceDetail } from "./data";

export type SeoConfig = {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "profile" | "article";
  jsonLd?: object[];
  noindex?: boolean;
};

function meta(attr: string, key: string, val: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = val;
}

export function resolveOgImage() {
  const source = info.seo.ogImage || info.profileImage || "/images/og-shahan-ali.jpg";
  const image = site ? new URL(source, site + "/").href : source;
  const isCustomCard = source === "/images/og-shahan-ali.jpg";
  return {
    url: image,
    alt: isCustomCard
      ? "Shahan Ali (PROBOY), developer from Burewala, Pakistan"
      : info.portrait.alt,
    width: isCustomCard ? "1200" : String(info.portrait.width),
    height: isCustomCard ? "630" : String(info.portrait.height),
  };
}

export function applyPreviewRobots() {
  if (window.location.origin !== site) meta("name", "robots", "noindex, nofollow");
}

export function useSeo(o: SeoConfig) {
  useEffect(() => {
    if (document.getElementById("root")?.dataset.prerendered === "true") return;
    document.title = o.title;
    const cleanPath = o.path === "/" ? "/" : o.path.replace(/\/$/, "");
    const url = site ? site + cleanPath : "";
    const og = resolveOgImage();

    meta("name", "description", o.description);
    meta("name", "robots", window.location.origin !== site ? "noindex, nofollow" : o.noindex ? "noindex, follow" : "index, follow");
    meta("property", "og:title", o.title);
    meta("property", "og:description", o.description);
    meta("property", "og:type", o.ogType || "website");
    meta("property", "og:site_name", "ProBoy");
    meta("property", "og:locale", "en_US");
    meta("name", "geo.region", info.geo.region);
    meta("name", "geo.placename", info.geo.placename);
    meta("name", "geo.position", `${info.geo.lat};${info.geo.lng}`);
    if (url) meta("property", "og:url", url);
    if (site) {
      meta("property", "og:image", og.url);
      meta("property", "og:image:alt", og.alt);
      meta("property", "og:image:width", og.width);
      meta("property", "og:image:height", og.height);
      meta("name", "twitter:card", "summary_large_image");
      meta("name", "twitter:site", "@itx_proboy");
      meta("name", "twitter:creator", "@itx_proboy");
      meta("name", "twitter:title", o.title);
      meta("name", "twitter:description", o.description);
      meta("name", "twitter:image", og.url);
    }

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (o.noindex) {
      link?.remove();
    } else if (url) {
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = url;
    } else {
      link?.remove();
    }

    document.getElementById("ld-static")?.remove();
    document.getElementById("ld")?.remove();
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = "ld";
    s.textContent = JSON.stringify(o.jsonLd ?? []);
    document.head.appendChild(s);
  }, [o.title, o.description, o.path, o.ogType, o.noindex]);
}

export const personLd = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": site ? `${site}/#person` : undefined,
  name: info.name,
  givenName: "Shahan",
  familyName: "Ali",
  alternateName: [info.brand, ...info.aliases],
  disambiguatingDescription:
    "Shahan Ali (PROBOY), full-stack developer and maintainer of the ProBoy-MD open-source WhatsApp bot, working from Burewala, Punjab, Pakistan. This profile describes the PROBOY developer and is not about other people who share the name.",
  jobTitle: [info.role, "Frontend Developer"],
  description: info.seo.description,
  email: `mailto:${info.email}`,
  telephone: info.phoneTel,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Burewala",
    addressRegion: "Punjab",
    addressCountry: "PK",
  },
  homeLocation: {
    "@type": "Place",
    name: "Burewala, Punjab, Pakistan",
  },
  affiliation: {
    "@type": "EducationalOrganization",
    name: "Govt Graduate College Burewala",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Burewala",
      addressRegion: "Punjab",
      addressCountry: "PK",
    },
  },
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    name: "Google Gemini QuizOff 2026 Certificate of Recognition",
    credentialCategory: "Certificate of Recognition",
    dateCreated: "2026-07-19",
  },
  ...(site ? { url: site } : {}),
  ...(site && info.profileImage ? { image: new URL(info.profileImage, site + "/").href } : {}),
  // Only owner-controlled profile URLs; no unverified LinkedIn profile is claimed.
  sameAs: [
    info.github,
    "https://t.me/itx_proboy",
    "https://www.tiktok.com/@itx_proboy",
    "https://instagram.com/itx___proboy",
  ],
  knowsAbout: [
    "Full-Stack Web Development",
    "Frontend Engineering",
    "React",
    "TypeScript",
    "Node.js",
    "REST APIs",
    "MySQL",
    "Firebase / Firestore",
    "Upstash Redis",
    "ProBoy-MD",
    "Baileys WhatsApp Bot Development",
    "Shopify Online Store 2.0",
    "Shopify Liquid",
    "Google Gemini AI",
    "Technical SEO",
    "Answer Engine Optimization (AEO)",
    "Web Security & Web Crypto API",
  ],
});

export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": site ? `${site}/#website` : undefined,
  url: site,
  name: "ProBoy",
  alternateName: ["Shahan Ali", "PROBOY"],
  inLanguage: "en",
  description: info.seo.description,
  publisher: site ? { "@id": `${site}/#person` } : undefined,
});

export const breadcrumbLd = (items: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    ...(site ? { item: site + (path === "/" ? "/" : path.replace(/\/$/, "")) } : {}),
  })),
});

export const faqLd = (items: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
});

export const serviceLd = (service: ServiceDetail) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name: service.title,
  serviceType: service.title,
  description: service.summary,
  url: `${site}/services/${service.slug}`,
  provider: { "@id": `${site}/#person` },
  areaServed: "Worldwide",
});

export const projectLd = (project: Project) => ({
  "@context": "https://schema.org",
  "@type": project.repo ? "SoftwareSourceCode" : project.slug === "proboy-sim-database" ? "WebPage" : "SoftwareApplication",
  name: project.title,
  ...(project.repo || project.slug === "proboy-sim-database" ? {} : { applicationCategory: project.category }),
  description: project.summary,
  url: `${site}/projects/${project.slug}`,
  author: { "@id": `${site}/#person`, "@type": "Person", name: info.name },
  ...(project.repo ? { codeRepository: project.repo } : {}),
});

export const botLd = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "@id": `${site}/proboy-md#software`,
  name: "ProBoy-MD",
  alternateName: ["ProBoy MD", "ProBoy315 WhatsApp Bot"],
  runtimePlatform: "Node.js",
  description: "A modular Node.js WhatsApp Multi-Device bot by Shahan Ali (PROBOY), using Baileys. It is separate from the official WhatsApp Business Platform.",
  codeRepository: "https://github.com/ProBoy315/ProBoy-MD",
  url: `${site}/proboy-md`,
  author: { "@id": `${site}/#person` },
});
