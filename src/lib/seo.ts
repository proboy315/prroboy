import { useEffect } from "react";
import { info, site } from "./data";

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

export function useSeo(o: SeoConfig) {
  useEffect(() => {
    document.title = o.title;
    const cleanPath = o.path === "/" ? "/" : o.path.replace(/\/$/, "");
    const url = site ? site + cleanPath : "";
    const og = resolveOgImage();

    meta("name", "description", o.description);
    meta("name", "robots", o.noindex ? "noindex, follow" : "index, follow");
    meta("property", "og:title", o.title);
    meta("property", "og:description", o.description);
    meta("property", "og:type", o.ogType || "website");
    meta("property", "og:site_name", `${info.name} / ${info.brand}`);
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
  jobTitle: info.titles,
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
  sameAs: [info.linkedin, info.github],
  knowsAbout: [
    "Full-stack web development",
    "React",
    "TypeScript",
    "Node.js",
    "ProBoy-MD",
    "WhatsApp bot development",
    "Baileys API",
    "Shopify Online Store 2.0",
    "Shopify Liquid",
    "Google Gemini AI",
    "Automation development",
  ],
});

export const websiteLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": site ? `${site}/#website` : undefined,
  url: site,
  name: `${info.name} (${info.brand}) — Portfolio`,
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
