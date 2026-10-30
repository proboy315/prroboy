import { useEffect, useState } from "react";
export function navigate(to: string) {
  history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
  if (!to.includes("#")) window.scrollTo(0, 0);
}
export function usePath() {
  const [p, setP] = useState(location.pathname);
  useEffect(() => { const f = () => setP(location.pathname); addEventListener("popstate", f); return () => removeEventListener("popstate", f); }, []);
  return p;
}
export function onLink(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href") || "";
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.currentTarget.target === "_blank" || !href.startsWith("/")) return;
  e.preventDefault();
  const [path, hash] = href.split("#");
  if (path !== location.pathname || location.hash !== (hash ? `#${hash}` : "")) {
    history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (hash) document.getElementById(hash)?.scrollIntoView({ behavior });
    else window.scrollTo({ top: 0, behavior });
  }));
}
