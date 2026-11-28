// Cross-page links resolve through the published documents, including for new tabs and refreshes.
export function onLink(e: React.MouseEvent<HTMLAnchorElement>) {
  const anchor = e.currentTarget;
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
    anchor.target || anchor.hasAttribute("download")) return;
  const target = new URL(anchor.href);
  if (target.origin !== location.origin || target.pathname !== location.pathname || target.search !== location.search) return;
  if (!target.hash && !location.hash) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
}
