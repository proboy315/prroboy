// Runtime site configuration published from the admin Control Center (served by /api/site-config).
// Safe by design: visual settings are applied through CSS variables / data-attributes on <html>, so the
// React tree is identical on server and client (no hydration mismatch). If the API is unreachable
// (static preview, API not configured) the built-in defaults are used and the site works normally.
import { useSyncExternalStore } from "react";
import { DEFAULT_CONFIG, HOME_SECTIONS, sanitizeConfig } from "../../shared/siteConfig.mjs";
import type { SiteConfig } from "../../shared/siteConfig.mjs";

export type { SiteConfig };
const CACHE_KEY = "pb_site_cfg_v1";
const PREVIEW_KEY = "pb_preview";

let current: SiteConfig = DEFAULT_CONFIG;
let loaded = false;
const listeners = new Set<() => void>();
let readyResolve: () => void = () => {};
const ready = new Promise<void>((r) => (readyResolve = r));

export const getSiteConfig = () => current;
export const subscribeSiteConfig = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn));
export const useSiteConfig = () => useSyncExternalStore(subscribeSiteConfig, getSiteConfig, () => DEFAULT_CONFIG);
/** Resolves once the first config response (or failure) has been handled. */
export const whenConfigReady = () => ready;
export const isConfigLoaded = () => loaded;

export function isPreviewMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get("pbpreview") === "1") sessionStorage.setItem(PREVIEW_KEY, "1");
    return sessionStorage.getItem(PREVIEW_KEY) === "1";
  } catch {
    return false;
  }
}
export function exitPreview() {
  try { sessionStorage.removeItem(PREVIEW_KEY); } catch { /* ignore */ }
  const u = new URL(window.location.href);
  u.searchParams.delete("pbpreview");
  window.location.replace(u.toString());
}

const FONT_STACKS: Record<string, string> = {
  inter: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  system: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
};

export function applyConfigToDom(cfg: SiteConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const { ui, motion, features } = cfg;
  const m = motion.enabled ? motion.intensity / 100 : 0;
  const set = (k: string, v: string) => root.style.setProperty(k, v);
  set("--pb-accent", ui.accent);
  set("--pb-accent-2", ui.accent2);
  set("--pb-bg", ui.background);
  set("--pb-radius", `${ui.radius}px`);
  set("--pb-glow", String(ui.glow / 100));
  set("--pb-ring", String(ui.ringGlow / 100));
  set("--pb-font-scale", String(ui.fontScale));
  set("--pb-font", FONT_STACKS[ui.fontFamily] || FONT_STACKS.inter);
  set("--pb-motion", String(m));
  set("--pb-tilt", `${((motion.enabled ? motion.tilt3d : 0) / 100) * 9}deg`);
  const d = root.dataset;
  d.theme = ui.theme;
  d.card = ui.cardStyle;
  d.btn = ui.buttonStyle;
  d.spacing = ui.spacing;
  d.header = ui.headerStyle;
  d.motion = motion.enabled ? "on" : "off";
  d.ambient = motion.ambientBackground && motion.enabled ? "on" : "off";
  d.reveal = motion.reveal ? "on" : "off";
  d.parallax = motion.parallax ? "on" : "off";
  d.hover = motion.hover ? "on" : "off";
  d.progress = motion.scrollProgress ? "on" : "off";
  d.smooth = motion.smoothScroll ? "on" : "off";
  d.showHeader = ui.showHeader ? "yes" : "no";
  d.showFooter = ui.showFooter ? "yes" : "no";
  d.backtotop = features.backToTop ? "on" : "off";

  let style = document.getElementById("pb-sections") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "pb-sections";
    document.head.appendChild(style);
  }
  style.textContent = HOME_SECTIONS.filter((k: string) => !cfg.sections[k as keyof SiteConfig["sections"]])
    .map((k: string) => `main #${k}{display:none!important}.rail-links a[href="/#${k}"],.drawer-links a[href="/#${k}"]{display:none!important}`)
    .join("");
}

function setConfig(cfg: SiteConfig) {
  current = cfg;
  applyConfigToDom(cfg);
  listeners.forEach((l) => l());
}

export function getCachedConfig(): SiteConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? sanitizeConfig(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export async function loadSiteConfig() {
  try {
    const preview = isPreviewMode();
    const res = await fetch(`/api/site-config${preview ? "?preview=1" : ""}`, { credentials: "same-origin", headers: { Accept: "application/json" } });
    if (res.ok && (res.headers.get("content-type") || "").includes("json")) {
      const cfg = sanitizeConfig(await res.json());
      if (!preview) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(cfg)); } catch { /* private mode */ } }
      setConfig(cfg);
    }
  } catch {
    /* defaults stay in place */
  } finally {
    loaded = true;
    readyResolve();
  }
}

/** Called once from main.tsx before React renders: apply cached look immediately (no flash), then refresh. */
export function bootSiteConfig() {
  if (typeof window === "undefined") return;
  const cached = isPreviewMode() ? null : getCachedConfig();
  applyConfigToDom(cached || DEFAULT_CONFIG);
  void loadSiteConfig();
}
