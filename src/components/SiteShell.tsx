import { useEffect, useState, useSyncExternalStore } from "react";
import { getConsent, privacySignalActive, setConsent, subscribeConsent } from "../lib/collector";
import { exitPreview, isPreviewMode, useSiteConfig } from "../lib/siteConfig";
import { onLink } from "../lib/router";
import { info } from "../lib/data";

/** Circular icon well with the iridescent ring (the signature element of the ProBoy UI). */
export function RingIcon({ children, active = false, className = "" }: { children: React.ReactNode; active?: boolean; className?: string }) {
  return (
    <span className={`pb-ring-icon${active ? " is-active" : ""} ${className}`.trim()} aria-hidden="true">
      {children}
    </span>
  );
}

/** Everything below renders only after mount so server HTML and first client render are identical. */
function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function ScrollProgress() {
  const cfg = useSiteConfig();
  return cfg.motion.scrollProgress && cfg.motion.enabled ? <div className="pb-progress" aria-hidden="true" /> : null;
}

export function AnnouncementPill() {
  const mounted = useMounted();
  const { announcement: a } = useSiteConfig();
  const key = `pb_ann_${a.text.length}_${a.text.slice(0, 24)}`;
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    try { setClosed(sessionStorage.getItem(key) === "1"); } catch { /* ignore */ }
  }, [key]);
  if (!mounted || !a.enabled || !a.text || closed) return null;
  return (
    <div className={`pb-announce is-${a.tone}`} role="status">
      <span className="pb-announce-dot" aria-hidden="true" />
      <span className="pb-announce-text">{a.text}</span>
      {a.link && (
        <a href={a.link} onClick={onLink} className="pb-announce-link">
          {a.linkLabel}
        </a>
      )}
      <button
        type="button"
        className="pb-announce-x"
        aria-label="Dismiss announcement"
        onClick={() => {
          setClosed(true);
          try { sessionStorage.setItem(key, "1"); } catch { /* ignore */ }
        }}
      >
        ×
      </button>
    </div>
  );
}

export function MaintenanceOverlay({ path }: { path: string }) {
  const mounted = useMounted();
  const { maintenance: m } = useSiteConfig();
  if (!mounted || !m.enabled || path.startsWith("/admin") || isPreviewMode()) return null;
  return (
    <div className="pb-maint" role="alertdialog" aria-modal="true" aria-labelledby="pb-maint-title" aria-describedby="pb-maint-msg">
      <div className="pb-maint-card">
        <RingIcon active className="pb-ring-lg">
          <img src="/favicon-48x48.png" alt="" width={48} height={48} />
        </RingIcon>
        <h1 id="pb-maint-title">{m.title}</h1>
        <p id="pb-maint-msg">{m.message}</p>
        <p className="pb-maint-meta">{info.brand} · {info.name}</p>
      </div>
    </div>
  );
}

export function PreviewBadge() {
  const mounted = useMounted();
  if (!mounted || !isPreviewMode()) return null;
  return (
    <div className="pb-preview" role="status">
      Previewing unpublished draft
      <button type="button" onClick={exitPreview}>Exit preview</button>
    </div>
  );
}

export function PrivacyNotice() {
  const mounted = useMounted();
  const cfg = useSiteConfig();
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => "unset" as const);
  if (!mounted || !import.meta.env.PROD || !cfg.analytics.enabled || !cfg.features.privacyNotice || privacySignalActive()) return null;
  const optin = cfg.analytics.consentMode === "optin";
  if (consent !== "unset") return null;
  return (
    <aside className="pb-consent" aria-label="Analytics notice">
      <p>
        <strong>Privacy-first analytics.</strong> This site counts page visits to improve itself — no cookies, no IP
        addresses stored, no ads.{" "}
        <a href="/privacy" onClick={onLink}>Details</a>
      </p>
      <div>
        <button type="button" className="pb-btn-ghost" onClick={() => setConsent("denied")}>
          {optin ? "No thanks" : "Opt out"}
        </button>
        <button type="button" className="pb-btn-solid" onClick={() => setConsent("granted")}>
          {optin ? "Allow" : "Got it"}
        </button>
      </div>
    </aside>
  );
}
