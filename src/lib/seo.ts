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
    meta("property", "og:locale", "en_US");
    meta("name", "geo.region", info.geo.region);
    meta("name", "geo.placename", info.geo.placename);
    meta("name", "geo.position", `${info.geo.lat};${info.geo.lng}`);
    if (url) meta("property", "og:url", url);
    if (site) {
      // og:image follows the hero: explicit seo.ogImage > published portrait > brand card.
      const source = info.seo.ogImage || info.profileImage || "/og-image.jpg";
      const image = new URL(source, site + "/").href;
      const isPortrait = Boolean(info.profileImage && source === info.profileImage);
      meta("property", "og:image", image);
      meta("property", "og:image:alt", isPortrait ? info.portrait.alt : `${info.name} (${info.brand}) — developer portfolio`);
      meta("name", "twitter:card", "summary_large_image");
      meta("name", "twitter:site", "@itx_proboy");
      meta("name", "twitter:title", o.title);
      meta("name", "twitter:description", o.description);
      meta("name", "twitter:image", image);
    }
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (o.noindex) link?.remove();
    else if (url) { if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); } link.href = url; }
    else link?.remove();
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
