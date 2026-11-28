// First-party analytics client. Sends minimal, anonymous events to our own /api/collect.
// Nothing is sent unless ALL are true: production build, master switch ON (from the server config),
// no Do-Not-Track / Global Privacy Control signal, visitor has not opted out, and — when the owner chose
// "opt-in" mode — the visitor has accepted. No cookies. Form contents, keystrokes and identifiers are never read.
import { getSiteConfig, whenConfigReady } from "./siteConfig";
import type { SiteConfig } from "./siteConfig";
import { site } from "./data";

const CONSENT_KEY = "pb_analytics_consent"; // "granted" | "denied"
const SID_KEY = "pb_sid";
const SEEN_KEY = "pb_seen";
export type Consent = "granted" | "denied" | "unset";

const listeners = new Set<() => void>();
export const subscribeConsent = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn));

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}
export function setConsent(v: "granted" | "denied") {
  try { localStorage.setItem(CONSENT_KEY, v); } catch { /* ignore */ }
  if (v === "denied") {
    try { localStorage.removeItem(SEEN_KEY); sessionStorage.removeItem(SID_KEY); } catch { /* ignore */ }
  }
  listeners.forEach((l) => l());
}

export function privacySignalActive(): boolean {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.doNotTrack === "1" || n.globalPrivacyControl === true;
}

export function analyticsAllowed(cfg: SiteConfig = getSiteConfig()): boolean {
  if (typeof window === "undefined" || !import.meta.env.PROD || window.location.origin !== site) return false;
  if (!cfg.analytics.enabled || privacySignalActive()) return false;
  const c = getConsent();
  if (c === "denied") return false;
  return !(cfg.analytics.consentMode === "optin" && c !== "granted");
}

function sessionId(): string {
  try {
    let s = sessionStorage.getItem(SID_KEY);
    if (!s) {
      const a = new Uint8Array(9);
      crypto.getRandomValues(a);
      s = Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 16);
      sessionStorage.setItem(SID_KEY, s);
    }
    return s;
  } catch {
    return "";
  }
}

function post(body: Record<string, unknown>) {
  try {
    void fetch("/api/collect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
      credentials: "omit",
    }).catch(() => {});
  } catch { /* analytics must never break the site */ }
}

let lastPath = "";
export async function sendPageView(path: string) {
  if (path.startsWith("/admin")) return;
  await whenConfigReady();
  if (!analyticsAllowed() || path === lastPath) return;
  lastPath = path;
  let ret = false;
  try { ret = localStorage.getItem(SEEN_KEY) === "1"; localStorage.setItem(SEEN_KEY, "1"); } catch { /* ignore */ }
  let ref = "";
  try { ref = new URL(document.referrer).origin; } catch { /* direct visit */ }
  post({ t: "pv", path, title: document.title.slice(0, 120), ref, sid: sessionId(), ret });
}

export async function sendEvent(name: string, path = window.location.pathname) {
  await whenConfigReady();
  const cfg = getSiteConfig();
  if (!analyticsAllowed(cfg) || !cfg.analytics.trackEvents || path.startsWith("/admin")) return;
  if (!/^[a-z0-9][a-z0-9_:.-]{0,39}$/.test(name)) return;
  post({ t: "ev", name, path, sid: sessionId() });
}

let bound = false;
/** Anonymous interaction events by delegation: contact/outbound clicks and elements marked data-track. */
export function initEventTracking() {
  if (bound || typeof document === "undefined") return;
  bound = true;
  document.addEventListener("click", (e) => {
    const el = e.target as Element | null;
    const tagged = el?.closest?.("[data-track]");
    if (tagged) return void sendEvent(tagged.getAttribute("data-track") || "");
    const a = el?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (/wa\.me|whatsapp\.com/i.test(href)) return void sendEvent("whatsapp_click");
    if (/^(mailto:|tel:)/i.test(href)) return void sendEvent("contact_click");
    if (/github\.com\/ProBoy315/i.test(href)) return void sendEvent("github_click");
    if (a.classList.contains("header-contact") || href.startsWith("/contact")) return void sendEvent("contact_cta");
    try {
      if (/^https?:/i.test(href) && new URL(href).host !== location.host) sendEvent("outbound_click");
    } catch { /* ignore */ }
  }, { capture: true, passive: true });
}
