import { useEffect } from "react";
import { info, site } from "./data";
function meta(attr: string, key: string, val: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.content = val;
}
export function useSeo(o: { title: string; description: string; path: string; jsonLd?: object[]; noindex?: boolean }) {
  useEffect(() => {
    document.title = o.title;
    const url = site ? site + o.path : "";
    meta("name", "description", o.description);
    meta("name", "robots", o.noindex ? "noindex, follow" : "index, follow");
    meta("property", "og:title", o.title); meta("property", "og:description", o.description);
    meta("property", "og:type", "website"); meta("property", "og:site_name", info.brand);
    meta("name", "twitter:card", info.seo.ogImage ? "summary_large_image" : "summary");
    meta("property", "og:locale", "en_US");
    meta("name", "geo.region", info.geo.region);
    meta("name", "geo.placename", info.geo.placename);
    meta("name", "geo.position", `${info.geo.lat};${info.geo.lng}`);
    if (url) meta("property", "og:url", url);
    if (site && info.seo.ogImage) {
      const image = new URL(info.seo.ogImage, site + "/").href;
      meta("property", "og:image", image);
      meta("name", "twitter:image", image);
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[property="og:image:alt"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (url) { if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); } link.href = url; } else link?.remove();
    document.getElementById("ld-static")?.remove();
    document.getElementById("ld")?.remove();
    const s = document.createElement("script"); s.type = "application/ld+json"; s.id = "ld";
    s.textContent = JSON.stringify(o.jsonLd ?? []); document.head.appendChild(s);
  }, [o.title, o.description, o.path, o.noindex]);
}
export const personLd = () => ({
  "@context": "https://schema.org", "@type": "Person", "@id": site ? `${site}/#person` : undefined,
  name: info.name, givenName: "Shahan", familyName: "Ali", alternateName: info.aliases,
  jobTitle: info.titles, description: info.seo.description, email: `mailto:${info.email}`, telephone: info.phoneTel,
  address: { "@type": "PostalAddress", addressLocality: info.geo.placename, addressRegion: "Punjab", addressCountry: "PK" },
  ...(site ? { url: site } : {}),
  ...(site && info.profileImage ? { image: new URL(info.profileImage, site + "/").href } : {}),
  sameAs: info.socials.filter((s) => s.url && !s.url.startsWith("mailto")).map((s) => s.url),
  knowsAbout: [...info.skills.map((s) => s.label), "WhatsApp bot development", "Shopify Liquid", "ProBoy-MD"],
});
