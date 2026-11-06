import { useEffect, useState } from "react";

export function navigate(to: string) {
  if (typeof window === "undefined") return;
  history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
  if (!to.includes("#")) window.scrollTo(0, 0);
}

export function usePath(initialPath?: string) {
  const [p, setP] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : initialPath || "/"
  );
  useEffect(() => {
    const f = () => setP(window.location.pathname);
    window.addEventListener("popstate", f);
    return () => window.removeEventListener("popstate", f);
  }, []);
  return p;
}

export function onLink(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href") || "";
  if (
    e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    e.currentTarget.target === "_blank" ||
    !href.startsWith("/")
  ) {
    return;
  }
  e.preventDefault();
  const [rawPath, hash] = href.split("#");
  const path = rawPath || "/";
  if (path !== window.location.pathname || window.location.hash !== (hash ? `#${hash}` : "")) {
    history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      if (hash) document.getElementById(hash)?.scrollIntoView({ behavior });
      else window.scrollTo({ top: 0, behavior });
    })
  );
}
