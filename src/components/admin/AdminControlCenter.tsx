import { useCallback, useEffect, useMemo, useState } from "react";
import { DEFAULT_CONFIG, HOME_SECTIONS } from "../../../shared/siteConfig.mjs";
import type { SiteConfig } from "../../../shared/siteConfig.mjs";
import { api, errorText, fmtDate } from "../../lib/adminApi";
import { demos, projects, services } from "../../lib/data";
import "../../styles/admin-control.css";

type Toast = (type: "ok" | "err" | "info", msg: string) => void;
type TabProps = { onToast: Toast; goTo: (tab: string) => void };

/* ======================= small form controls ======================= */
function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="cc-row">
      <div className="cc-row-text"><b>{label}</b>{hint && <span>{hint}</span>}</div>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`cc-switch ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}><i /></button>
    </div>
  );
}
function Range({ label, value, min, max, step = 1, suffix = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (v: number) => void }) {
  return (
    <label className="cc-field">
      <span className="cc-label">{label}<em>{value}{suffix}</em></span>
      <input type="range" className="cc-range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
function Pick({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="cc-field">
      <span className="cc-label">{label}</span>
      <select className="ad-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="cc-field">
      <span className="cc-label">{label}<em>{value}</em></span>
      <span className="cc-color"><input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} /><input className="ad-input" value={value} maxLength={7} onChange={(e) => onChange(e.target.value)} spellCheck={false} /></span>
    </label>
  );
}
function TextField({ label, value, onChange, max = 120, area = false, placeholder }: { label: string; value: string; onChange: (v: string) => void; max?: number; area?: boolean; placeholder?: string }) {
  return (
    <label className="cc-field">
      <span className="cc-label">{label}<em>{value.length}/{max}</em></span>
      {area
        ? <textarea className="ad-input" rows={3} maxLength={max} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        : <input className="ad-input" maxLength={max} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}
function Card({ title, sub, keywords = "", q, children }: { title: string; sub?: string; keywords?: string; q: string; children: React.ReactNode }) {
  if (q && !`${title} ${sub} ${keywords}`.toLowerCase().includes(q.toLowerCase())) return null;
  return (
    <section className="ad-card cc-card">
      <div className="ad-card-head"><div><h3 className="ad-card-title">{title}</h3>{sub && <p className="ad-card-sub">{sub}</p>}</div></div>
      <div className="cc-body">{children}</div>
    </section>
  );
}

/* ======================= server login gate ======================= */
type Me = { authenticated: boolean; configured: boolean; verificationConfigured: boolean };

export function ServerGate({ children, onToast }: { children: (signOut: () => void) => React.ReactNode; onToast: Toast }) {
  const [state, setState] = useState<"loading" | "unavailable" | "in" | "out">("loading");
  const [me, setMe] = useState<Me | null>(null);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const check = useCallback(async () => {
    const r = await api<Me>("GET", "/admin/me");
    if (r.unavailable) return setState("unavailable");
    setMe(r.data);
    setState(r.data.authenticated ? "in" : "out");
  }, []);
  useEffect(() => { void check(); }, [check]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await api("POST", "/admin/login", { username: u, password: p, totp: step ? code : undefined, remember });
    setBusy(false);
    if (r.ok) { setP(""); setCode(""); setStep(false); onToast("ok", "Signed in."); return setState("in"); }
    if (r.data?.step === "verify") { setStep(true); return; }
    setErr(errorText(r.data?.error));
  };
  const signOut = async () => { await api("POST", "/admin/logout", {}); setState("out"); setStep(false); onToast("info", "Signed out of the server session."); };

  if (state === "loading") return <p className="cc-muted">Checking server session…</p>;
  if (state === "unavailable")
    return (
      <div className="ad-card cc-card"><div className="cc-body">
        <h3 className="ad-card-title">Server API not reachable</h3>
        <p className="cc-muted">This page is being served without the serverless API (for example a static preview or local <code>vite dev</code>). Deploy to Vercel or Netlify with the environment variables from <code>.env.example</code>, or run the host's dev server (<code>vercel dev</code> / <code>netlify dev</code>).</p>
      </div></div>
    );
  if (state === "in") return <>{children(signOut)}</>;

  return (
    <div className="ad-card cc-card cc-login"><div className="cc-body">
      <h3 className="ad-card-title">Owner sign-in</h3>
      <p className="cc-muted">The Control Center, analytics and security tools use a separate server session (HttpOnly cookie). Your existing vault unlock is unchanged.</p>
      {me && !me.configured && (
        <div className="cc-warn">Owner login is not configured on the server yet. Run <code>npm run admin:setup</code> locally, then add <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD_HASH</code>, <code>SESSION_SECRET</code>, <code>ADMIN_TOTP_SECRET</code> and the <code>UPSTASH_REDIS_REST_*</code> variables in your host settings and redeploy.</div>
      )}
      <form onSubmit={submit} autoComplete="off">
        <label className="cc-field"><span className="cc-label">Username</span><input className="ad-input" value={u} onChange={(e) => setU(e.target.value)} autoComplete="off" required disabled={step} /></label>
        <label className="cc-field"><span className="cc-label">Password</span><input className="ad-input" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="off" required disabled={step} /></label>
        {step && (
          <label className="cc-field"><span className="cc-label">Verification code (authenticator app)</span><input className="ad-input" inputMode="numeric" pattern="[0-9 ]*" maxLength={7} value={code} onChange={(e) => setCode(e.target.value)} autoFocus autoComplete="one-time-code" required /></label>
        )}
        {(step || me?.verificationConfigured) && (
          <label className="cc-check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember this device (skips the code on this browser until it expires or you revoke it)</label>
        )}
        {err && <p className="cc-error" role="alert">{err}</p>}
        <button className="ad-btn ad-btn-primary" disabled={busy || (me ? !me.configured : false)}>{busy ? "Signing in…" : step ? "Verify & sign in" : "Sign in"}</button>
      </form>
    </div></div>
  );
}

/* ======================= Control Center ======================= */
type Status = { storage: { configured: boolean; kind: string | null; durable: boolean }; auth: { adminConfigured: boolean; verificationConfigured: boolean; trustedDeviceDays: number }; analytics: { enabled: boolean; today: { pageViews: number; visitors: number } | null }; config: { version?: number; publishedAt?: number | null; hasDraft?: boolean }; warnings: string[] };

export function ControlCenterTab(props: TabProps) {
  return <ServerGate onToast={props.onToast}>{(signOut) => <ControlInner {...props} signOut={signOut} />}</ServerGate>;
}

function ControlInner({ onToast, goTo, signOut }: TabProps & { signOut: () => void }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [published, setPublished] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState<SiteConfig>(DEFAULT_CONFIG); // last server draft (or published)
  const [form, setForm] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [hasDraft, setHasDraft] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [busy, setBusy] = useState("");
  const [q, setQ] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [c, s] = await Promise.all([api("GET", "/admin/config"), api("GET", "/admin/status")]);
    if (c.ok) {
      setPublished(c.data.published);
      const base = c.data.draft || c.data.published;
      setSaved(base); setForm(base); setHasDraft(Boolean(c.data.draft)); setHistoryCount(c.data.history?.length || 0);
    } else onToast("err", errorText(c.data?.error));
    if (s.ok) setStatus(s.data);
    setLoaded(true);
  }, [onToast]);
  useEffect(() => { void load(); }, [load]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  const set = <K extends keyof SiteConfig>(group: K, key: keyof SiteConfig[K], value: any) =>
    setForm((f) => ({ ...f, [group]: { ...(f[group] as object), [key]: value } }));

  const run = async (name: string, fn: () => Promise<void>) => { setBusy(name); try { await fn(); } finally { setBusy(""); } };
  const saveDraft = () => run("save", async () => {
    const r = await api("PUT", "/admin/config", { config: form });
    if (!r.ok) return onToast("err", errorText(r.data?.error));
    setSaved(r.data.draft); setForm(r.data.draft); setHasDraft(true); onToast("ok", "Draft saved (not public yet).");
  });
  const publish = () => run("publish", async () => {
    if (dirty) { const s = await api("PUT", "/admin/config", { config: form }); if (!s.ok) return onToast("err", errorText(s.data?.error)); }
    if (!window.confirm("Publish these settings to the live website now?")) return;
    const r = await api("POST", "/admin/config/publish", {});
    if (!r.ok) return onToast("err", errorText(r.data?.error));
    onToast("ok", `Published as version ${r.data.meta?.version}.`); await load();
  });
  const discard = () => run("discard", async () => {
    if (!window.confirm("Discard your unpublished draft and go back to the live settings?")) return;
    await api("POST", "/admin/config/discard", {}); onToast("info", "Draft discarded."); await load();
  });
  const revert = () => run("revert", async () => {
    if (!window.confirm("Restore the previously published version? The current live settings will be replaced.")) return;
    const r = await api("POST", "/admin/config/revert", {});
    if (!r.ok) return onToast("err", errorText(r.data?.error));
    onToast("ok", "Previous version restored and live."); await load();
  });
  const reset = () => run("reset", async () => {
    if (!window.confirm("Reset ALL appearance, feature and privacy settings to the defaults and publish them? You can undo this with “Restore previous version”.")) return;
    const r = await api("POST", "/admin/config/reset", { confirm: "RESET" });
    if (!r.ok) return onToast("err", errorText(r.data?.error));
    onToast("ok", "Defaults restored and published."); await load();
  });
  const preview = async () => {
    if (dirty) { const r = await api("PUT", "/admin/config", { config: form }); if (!r.ok) return onToast("err", errorText(r.data?.error)); setSaved(r.data.draft); setHasDraft(true); }
    window.open("/?pbpreview=1", "_blank", "noopener");
  };

  if (!loaded) return <p className="cc-muted">Loading Control Center…</p>;
  const { ui, motion } = form;
  const activeFeatures = Object.values(form.features).filter(Boolean).length + Object.values(form.sections).filter(Boolean).length;

  return (
    <div className="cc-wrap">
      {/* ---- overview (real data only) ---- */}
      <div className="ad-grid-4 cc-stats">
        <div className="ad-stat"><p className="ad-stat-label">Live settings</p><p className="ad-stat-num">v{status?.config.version || 0}</p><p className="ad-stat-foot">{status?.config.publishedAt ? fmtDate(status.config.publishedAt) : "Defaults (never published)"}</p></div>
        <div className="ad-stat"><p className="ad-stat-label">Analytics</p><p className="ad-stat-num">{status?.analytics.enabled ? "ON" : "OFF"}</p><p className="ad-stat-foot">{status?.analytics.today ? `${status.analytics.today.pageViews} views today` : "No storage"}</p></div>
        <div className="ad-stat"><p className="ad-stat-label">Content</p><p className="ad-stat-num">{projects.length + services.length + demos.length}</p><p className="ad-stat-foot">{projects.length} projects · {services.length} services · {demos.length} demos</p></div>
        <div className="ad-stat"><p className="ad-stat-label">Active toggles</p><p className="ad-stat-num">{activeFeatures}</p><p className="ad-stat-foot">{hasDraft ? "Unpublished draft exists" : "Live = saved"}</p></div>
      </div>
      {status && status.warnings.length > 0 && (
        <div className="cc-warn" role="status"><b>Configuration warnings</b><ul>{status.warnings.map((w) => <li key={w}>{w}</li>)}</ul></div>
      )}
      <div className="cc-quick">
        <button className="ad-quick-btn" onClick={() => goTo("content")}><b>Edit content</b><span>Text, services, gallery, social links</span></button>
        <button className="ad-quick-btn" onClick={() => goTo("projects")}><b>Project cards</b><span>Add, feature or reorder</span></button>
        <button className="ad-quick-btn" onClick={() => goTo("seo")}><b>SEO titles &amp; descriptions</b><span>Committed to the repo, then redeployed</span></button>
        <button className="ad-quick-btn" onClick={() => goTo("analytics")}><b>Analytics reports</b><span>Switch on/off, view traffic</span></button>
      </div>

      {/* ---- sticky action bar ---- */}
      <div className="cc-bar" role="toolbar" aria-label="Settings actions">
        <input type="search" className="ad-input cc-search" placeholder="Search settings (color, motion, maintenance…)" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search settings" />
        <span className={`cc-pill ${dirty ? "warn" : "ok"}`}>{dirty ? "Unsaved changes" : hasDraft ? "Draft saved" : "Up to date"}</span>
        <button className="ad-btn ad-btn-sm" onClick={() => setForm(saved)} disabled={!dirty || !!busy}>Cancel</button>
        <button className="ad-btn ad-btn-sm" onClick={saveDraft} disabled={!dirty || !!busy}>{busy === "save" ? "Saving…" : "Save draft"}</button>
        <button className="ad-btn ad-btn-sm" onClick={preview} disabled={!!busy}>Preview</button>
        <button className="ad-btn ad-btn-primary ad-btn-sm" onClick={publish} disabled={(!dirty && !hasDraft) || !!busy}>{busy === "publish" ? "Publishing…" : "Publish"}</button>
      </div>

      <div className="ad-grid-2 cc-grid">
        <Card q={q} title="Theme & color" sub="Palette and background" keywords="theme accent color palette background obsidian crimson aurora iridescent ring glow">
          <Pick label="Theme" value={ui.theme} options={["iridescent", "obsidian", "crimson", "aurora"]} onChange={(v) => set("ui", "theme", v)} />
          <ColorField label="Accent color" value={ui.accent} onChange={(v) => set("ui", "accent", v)} />
          <ColorField label="Secondary accent" value={ui.accent2} onChange={(v) => set("ui", "accent2", v)} />
          <ColorField label="Page background" value={ui.background} onChange={(v) => set("ui", "background", v)} />
          <Range label="Glow strength" value={ui.glow} min={0} max={100} suffix="%" onChange={(v) => set("ui", "glow", v)} />
          <Range label="Iridescent ring glow" value={ui.ringGlow} min={0} max={100} suffix="%" onChange={(v) => set("ui", "ringGlow", v)} />
        </Card>
        <Card q={q} title="Typography & layout" sub="Fonts, sizes, spacing, radius" keywords="font typography size scale spacing density radius corners card style button header">
          <Pick label="Font family" value={ui.fontFamily} options={["inter", "system", "serif", "mono"]} onChange={(v) => set("ui", "fontFamily", v)} />
          <Range label="Font size scale" value={ui.fontScale} min={0.85} max={1.25} step={0.01} suffix="×" onChange={(v) => set("ui", "fontScale", v)} />
          <Range label="Corner radius" value={ui.radius} min={0} max={36} suffix="px" onChange={(v) => set("ui", "radius", v)} />
          <Pick label="Spacing" value={ui.spacing} options={["compact", "comfortable", "spacious"]} onChange={(v) => set("ui", "spacing", v)} />
          <Pick label="Card style" value={ui.cardStyle} options={["glass", "solid", "outline"]} onChange={(v) => set("ui", "cardStyle", v)} />
          <Pick label="Button style" value={ui.buttonStyle} options={["pill", "rounded", "sharp"]} onChange={(v) => set("ui", "buttonStyle", v)} />
          <Pick label="Header style" value={ui.headerStyle} options={["glass", "solid", "transparent"]} onChange={(v) => set("ui", "headerStyle", v)} />
        </Card>
        <Card q={q} title="Motion & 3D" sub="Animation, scroll and hover effects (respects each visitor's reduced-motion setting)" keywords="animation motion intensity 3d tilt parallax reveal hover scroll smooth progress ambient background">
          <Toggle label="Animations" hint="Master switch for motion" checked={motion.enabled} onChange={(v) => set("motion", "enabled", v)} />
          <Range label="Animation intensity" value={motion.intensity} min={0} max={100} suffix="%" onChange={(v) => set("motion", "intensity", v)} />
          <Range label="3D card tilt" value={motion.tilt3d} min={0} max={100} suffix="%" onChange={(v) => set("motion", "tilt3d", v)} />
          <Toggle label="Scroll reveal" checked={motion.reveal} onChange={(v) => set("motion", "reveal", v)} />
          <Toggle label="Parallax" checked={motion.parallax} onChange={(v) => set("motion", "parallax", v)} />
          <Toggle label="Hover effects" checked={motion.hover} onChange={(v) => set("motion", "hover", v)} />
          <Toggle label="Scroll progress bar" checked={motion.scrollProgress} onChange={(v) => set("motion", "scrollProgress", v)} />
          <Toggle label="Smooth scrolling" checked={motion.smoothScroll} onChange={(v) => set("motion", "smoothScroll", v)} />
          <Toggle label="Ambient background drift" hint="Continuous slow movement — off saves battery" checked={motion.ambientBackground} onChange={(v) => set("motion", "ambientBackground", v)} />
        </Card>
        <Card q={q} title="Sections & features" sub="What visitors can see" keywords="header footer section visibility home about services projects demos certificates qa contact intro back to top privacy notice feature flags">
          <Toggle label="Show header" checked={ui.showHeader} onChange={(v) => set("ui", "showHeader", v)} />
          <Toggle label="Show footer" checked={ui.showFooter} onChange={(v) => set("ui", "showFooter", v)} />
          {HOME_SECTIONS.map((s: string) => (
            <Toggle key={s} label={`Home: ${s}`} checked={form.sections[s as keyof SiteConfig["sections"]]} onChange={(v) => set("sections", s as keyof SiteConfig["sections"], v)} />
          ))}
          <Toggle label="Intro animation" checked={form.features.intro} onChange={(v) => set("features", "intro", v)} />
          <Toggle label="Back-to-top button" checked={form.features.backToTop} onChange={(v) => set("features", "backToTop", v)} />
          <Toggle label="Analytics privacy notice" checked={form.features.privacyNotice} onChange={(v) => set("features", "privacyNotice", v)} />
        </Card>
        <Card q={q} title="Announcement" sub="A floating pill shown to visitors" keywords="announcement banner message notice link">
          <Toggle label="Show announcement" checked={form.announcement.enabled} onChange={(v) => set("announcement", "enabled", v)} />
          <TextField label="Text" value={form.announcement.text} max={240} area onChange={(v) => set("announcement", "text", v)} />
          <TextField label="Link (path or https://)" value={form.announcement.link} max={300} placeholder="/projects" onChange={(v) => set("announcement", "link", v)} />
          <TextField label="Link label" value={form.announcement.linkLabel} max={40} onChange={(v) => set("announcement", "linkLabel", v)} />
          <Pick label="Tone" value={form.announcement.tone} options={["info", "success", "warning"]} onChange={(v) => set("announcement", "tone", v)} />
        </Card>
        <Card q={q} title="Maintenance mode" sub="Covers the public site with a notice. /admin stays available." keywords="maintenance offline down notice">
          <Toggle label="Maintenance mode" hint="Visitors see the message below instead of the site" checked={form.maintenance.enabled} onChange={(v) => set("maintenance", "enabled", v)} />
          <TextField label="Title" value={form.maintenance.title} max={80} onChange={(v) => set("maintenance", "title", v)} />
          <TextField label="Message" value={form.maintenance.message} max={400} area onChange={(v) => set("maintenance", "message", v)} />
          <p className="cc-muted">Note: this is a client-side notice; search engines still receive the normal pages (HTTP 200).</p>
        </Card>
        <Card q={q} title="Analytics & privacy" sub="Takes effect when published. The master ON/OFF switch is on the Analytics tab." keywords="analytics consent opt-in notice retention events privacy">
          <Pick label="Consent mode" value={form.analytics.consentMode} options={["notice", "optin"]} onChange={(v) => set("analytics", "consentMode", v)} />
          <p className="cc-muted">notice = counted unless the visitor opts out · optin = nothing is sent until the visitor accepts. Do Not Track and Global Privacy Control are always honoured.</p>
          <Range label="Data retention" value={form.analytics.retentionDays} min={7} max={730} suffix=" days" onChange={(v) => set("analytics", "retentionDays", v)} />
          <Toggle label="Track interaction events" hint="contact/outbound clicks, by name only" checked={form.analytics.trackEvents} onChange={(v) => set("analytics", "trackEvents", v)} />
        </Card>
        <Card q={q} title="Trusted devices" sub="Remember-this-device lifetime" keywords="trusted device remember days security expiry">
          <Range label="Trusted-device lifetime" value={form.security.trustedDeviceDays} min={1} max={90} suffix=" days" onChange={(v) => set("security", "trustedDeviceDays", v)} />
          <p className="cc-muted">Applies to devices trusted after publishing. Manage or revoke devices on the Security tab.</p>
        </Card>
      </div>

      <div className="cc-footer-actions">
        <button className="ad-btn ad-btn-sm" onClick={discard} disabled={!hasDraft || !!busy}>Discard draft</button>
        <button className="ad-btn ad-btn-sm" onClick={revert} disabled={!historyCount || !!busy}>Restore previous version ({historyCount})</button>
        <button className="ad-btn ad-btn-sm cc-danger" onClick={reset} disabled={!!busy}>Reset to defaults</button>
        <button className="ad-btn ad-btn-sm" onClick={signOut}>Sign out of server session</button>
      </div>
      {JSON.stringify(published) !== JSON.stringify(DEFAULT_CONFIG) && <p className="cc-muted">Live settings differ from the built-in defaults.</p>}
    </div>
  );
}

/* ======================= Analytics (server) ======================= */
type Summary = { range: { from: string; to: string; granularity: string; daysWithData: number }; totals: { pageViews: number; visitors: number; sessions: number; newVisitors: number; returningVisitors: number }; notes: Record<string, string>; series: { bucket: string; pageViews: number; visitors: number }[]; pages: Row[]; referrers: Row[]; devices: Row[]; browsers: Row[]; os: Row[]; countries: Row[]; events: Row[] };
type Row = { name: string; count: number };
const iso = (d: Date) => d.toISOString().slice(0, 10);

export function AnalyticsTab(props: TabProps) {
  return <ServerGate onToast={props.onToast}>{() => <AnalyticsInner {...props} />}</ServerGate>;
}

function Chart({ data }: { data: Summary["series"] }) {
  const W = 640, H = 190, P = 26;
  const max = Math.max(1, ...data.map((d) => d.pageViews));
  const bw = (W - P * 2) / Math.max(1, data.length);
  const pts = data.map((d, i) => `${(P + i * bw + bw / 2).toFixed(1)},${(H - P - (d.visitors / max) * (H - P * 2)).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="cc-chart" role="img" aria-label="Page views and visitors over time">
      <line x1={P} x2={W - P} y1={H - P} y2={H - P} stroke="rgba(255,255,255,.15)" />
      {data.map((d, i) => {
        const h = (d.pageViews / max) * (H - P * 2);
        return <rect key={d.bucket} x={P + i * bw + bw * 0.15} width={bw * 0.7} y={H - P - h} height={h} rx={2} fill="var(--pb-accent, #ef1d3e)" opacity={0.85}><title>{`${d.bucket}: ${d.pageViews} views, ${d.visitors} visitors`}</title></rect>;
      })}
      {data.length > 1 && <polyline points={pts} fill="none" stroke="#38bdf8" strokeWidth={2} />}
      <text x={P} y={H - 6} fill="#8b93ab" fontSize="11">{data[0]?.bucket}</text>
      <text x={W - P} y={H - 6} fill="#8b93ab" fontSize="11" textAnchor="end">{data[data.length - 1]?.bucket}</text>
      <text x={P} y={14} fill="#8b93ab" fontSize="11">peak {max}</text>
    </svg>
  );
}
function Table({ title, rows, total }: { title: string; rows: Row[]; total: number }) {
  return (
    <section className="ad-card cc-card"><div className="cc-body">
      <h3 className="ad-card-title">{title}</h3>
      {rows.length === 0 ? <p className="cc-muted">No data in this range.</p> : (
        <div className="cc-table-wrap"><table className="cc-table"><tbody>
          {rows.slice(0, 10).map((r) => (
            <tr key={r.name}><td className="cc-t-name" title={r.name}>{r.name}</td><td className="cc-t-num">{r.count}</td><td className="cc-t-bar"><i style={{ width: `${Math.max(3, (r.count / Math.max(1, total)) * 100)}%` }} /></td></tr>
          ))}
        </tbody></table></div>
      )}
    </div></section>
  );
}

function AnalyticsInner({ onToast }: TabProps) {
  const [days, setDays] = useState("30");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [gran, setGran] = useState("day");
  const [data, setData] = useState<Summary | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const end = to || iso(new Date());
    const start = from || iso(new Date(Date.now() - (Number(days) - 1) * 86400000));
    const [s, st] = await Promise.all([api("GET", `/analytics/summary?from=${start}&to=${end}&granularity=${gran}`), api("GET", "/admin/status")]);
    if (s.ok) setData(s.data); else onToast("err", errorText(s.data?.error));
    if (st.ok) { setEnabled(st.data.analytics.enabled); setWarnings(st.data.warnings); }
    setLoading(false);
  }, [days, from, to, gran, onToast]);
  useEffect(() => { void load(); }, [load]);

  const toggle = async () => {
    const next = !enabled;
    const r = await api("POST", "/admin/analytics/enabled", { enabled: next });
    if (!r.ok) return onToast("err", errorText(r.data?.error));
    setEnabled(next); onToast("ok", next ? "Analytics is ON. Visitors are counted as soon as the next page loads." : "Analytics is OFF. No new events are collected; existing reports are kept.");
  };
  const exportData = async () => {
    const r = await api("GET", "/admin/analytics/export");
    if (!r.ok) return onToast("err", errorText(r.data?.error));
    const url = URL.createObjectURL(new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = `proboy-analytics-${iso(new Date())}.json`; a.click(); URL.revokeObjectURL(url);
    onToast("ok", "Export downloaded.");
  };
  const clear = async () => {
    const typed = window.prompt("This permanently deletes ALL collected analytics. Type DELETE to confirm.");
    if (typed !== "DELETE") return typed !== null && onToast("info", "Cancelled — nothing was deleted.");
    const r = await api("POST", "/admin/analytics/clear", { confirm: "DELETE" });
    if (r.ok) { onToast("ok", `Deleted ${r.data.daysDeleted} day(s) of analytics.`); void load(); } else onToast("err", errorText(r.data?.error));
  };

  const t = data?.totals;
  const empty = !loading && data && t && t.pageViews === 0 && data.events.length === 0;
  const ret = t ? t.newVisitors + t.returningVisitors : 0;

  return (
    <div className="cc-wrap">
      <section className="ad-card cc-card"><div className="cc-body cc-master">
        <div><h3 className="ad-card-title">Analytics collection</h3>
          <p className="cc-muted">{enabled === null ? "Loading…" : enabled ? "ON — anonymous, cookie-free counters are being stored." : "OFF — nothing is collected. Existing reports stay available."}</p></div>
        <button role="switch" aria-checked={!!enabled} aria-label="Analytics master switch" className={`cc-switch cc-switch-lg ${enabled ? "on" : ""}`} onClick={toggle} disabled={enabled === null}><i /><span>{enabled ? "ON" : "OFF"}</span></button>
      </div></section>
      {warnings.filter((w) => !w.startsWith("Analytics is OFF")).length > 0 && <div className="cc-warn">{warnings.filter((w) => !w.startsWith("Analytics is OFF")).map((w) => <p key={w}>{w}</p>)}</div>}

      <div className="cc-bar">
        <select className="ad-input" value={days} onChange={(e) => { setDays(e.target.value); setFrom(""); setTo(""); }} aria-label="Date range">
          {["1", "7", "14", "30", "90", "180", "365"].map((d) => <option key={d} value={d}>{d === "1" ? "Today" : `Last ${d} days`}</option>)}
        </select>
        <input type="date" className="ad-input" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
        <input type="date" className="ad-input" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
        <select className="ad-input" value={gran} onChange={(e) => setGran(e.target.value)} aria-label="Report granularity">
          <option value="day">Daily</option><option value="week">Weekly</option><option value="month">Monthly</option>
        </select>
        <button className="ad-btn ad-btn-sm" onClick={() => void load()} disabled={loading}>{loading ? "Loading…" : "Refresh"}</button>
      </div>

      {empty && <div className="cc-empty"><b>No analytics data in this range yet.</b><p>Reports only show data that was actually received. Turn collection ON, then visit the live site; counts appear here once events arrive.</p></div>}
      {data && t && !empty && (
        <>
          <div className="ad-grid-4 cc-stats">
            <div className="ad-stat"><p className="ad-stat-label">Page views</p><p className="ad-stat-num">{t.pageViews}</p><p className="ad-stat-foot">{data.range.from} → {data.range.to}</p></div>
            <div className="ad-stat"><p className="ad-stat-label">Visitors (est.)</p><p className="ad-stat-num">{t.visitors}</p><p className="ad-stat-foot" title={data.notes.visitors}>sum of daily uniques</p></div>
            <div className="ad-stat"><p className="ad-stat-label">Sessions (approx.)</p><p className="ad-stat-num">{t.sessions}</p><p className="ad-stat-foot" title={data.notes.sessions}>per browser tab/day</p></div>
            <div className="ad-stat"><p className="ad-stat-label">New / returning (est.)</p><p className="ad-stat-num">{ret ? `${Math.round((t.newVisitors / ret) * 100)}% / ${Math.round((t.returningVisitors / ret) * 100)}%` : "—"}</p><p className="ad-stat-foot" title={data.notes.newReturning}>{t.newVisitors} new · {t.returningVisitors} returning</p></div>
          </div>
          <section className="ad-card cc-card"><div className="cc-body">
            <h3 className="ad-card-title">Traffic over time <span className="cc-muted">· bars = views, line = visitors ({data.range.granularity})</span></h3>
            <Chart data={data.series} />
          </div></section>
          <div className="ad-grid-2 cc-grid">
            <Table title="Most visited pages" rows={data.pages} total={t.pageViews} />
            <Table title="Traffic sources (referrer domains)" rows={data.referrers} total={t.pageViews} />
            <Table title="Devices" rows={data.devices} total={t.visitors} />
            <Table title="Browsers" rows={data.browsers} total={t.visitors} />
            <Table title="Operating systems" rows={data.os} total={t.visitors} />
            <Table title="Countries (when the host supplies it)" rows={data.countries} total={t.visitors} />
            <Table title="Events" rows={data.events} total={Math.max(1, ...data.events.map((e) => e.count))} />
          </div>
          <p className="cc-muted">Visitor, session and new/returning figures are estimates by design: no cookies, no IP storage and daily-rotating hashes mean visitors cannot be tracked across days.</p>
        </>
      )}
      <div className="cc-footer-actions">
        <button className="ad-btn ad-btn-sm" onClick={exportData}>Export data (JSON)</button>
        <button className="ad-btn ad-btn-sm cc-danger" onClick={clear}>Delete all analytics data</button>
      </div>
    </div>
  );
}

/* ======================= Security ======================= */
type Device = { id: string; label: string; createdAt: number; lastSeen: number; expiresAt: number };
type Key = { id: string; name: string; scopes: string[]; createdAt: number; expiresAt: number; revoked: boolean };
type AuditEntry = { ts: number; action: string; detail: string; ip: string };

export function SecurityTab(props: TabProps) {
  return <ServerGate onToast={props.onToast}>{(signOut) => <SecurityInner {...props} signOut={signOut} />}</ServerGate>;
}

function SecurityInner({ onToast, signOut }: TabProps & { signOut: () => void }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [keys, setKeys] = useState<Key[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [secret, setSecret] = useState("");
  const [name, setName] = useState("Report bot");
  const [exp, setExp] = useState(90);

  const load = useCallback(async () => {
    const [d, k, a, s] = await Promise.all([api("GET", "/admin/devices"), api("GET", "/admin/keys"), api("GET", "/admin/audit"), api("GET", "/admin/status")]);
    if (d.ok) setDevices(d.data.devices); if (k.ok) setKeys(k.data.keys); if (a.ok) setAudit(a.data.entries); if (s.ok) setStatus(s.data);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const revoke = async (id: string) => {
    if (!window.confirm("Revoke this trusted device? It will need verification again.")) return;
    const r = await api("DELETE", `/admin/devices/${id}`); onToast(r.ok ? "ok" : "err", r.ok ? "Device revoked." : errorText(r.data?.error)); void load();
  };
  const revokeAll = async () => {
    if (!window.confirm("Revoke ALL trusted devices and end every admin session (including this one)?")) return;
    const r = await api("POST", "/admin/devices/revoke-all", {}); if (r.ok) { onToast("ok", "All devices revoked. Please sign in again."); window.location.reload(); } else onToast("err", errorText(r.data?.error));
  };
  const createKey = async () => {
    const r = await api("POST", "/admin/keys", { name, scopes: ["analytics:read"], expiresInDays: exp });
    if (!r.ok) return onToast("err", errorText(r.data?.error));
    setSecret(r.data.secret); onToast("ok", "Key created. Copy it now — it is shown only once."); void load();
  };
  const rotate = async (id: string) => {
    if (!window.confirm("Rotate this key? The old secret stops working immediately.")) return;
    const r = await api("POST", `/admin/keys/${id}/rotate`, {}); if (r.ok) { setSecret(r.data.secret); onToast("ok", "Key rotated. Copy the new secret now."); } else onToast("err", errorText(r.data?.error));
  };
  const revokeKey = async (id: string) => {
    if (!window.confirm("Revoke this API key permanently?")) return;
    const r = await api("DELETE", `/admin/keys/${id}`); onToast(r.ok ? "ok" : "err", r.ok ? "Key revoked." : errorText(r.data?.error)); void load();
  };

  return (
    <div className="cc-wrap">
      <div className="ad-grid-4 cc-stats">
        <div className="ad-stat"><p className="ad-stat-label">Your role</p><p className="ad-stat-num">Owner</p><p className="ad-stat-foot">single-owner system</p></div>
        <div className="ad-stat"><p className="ad-stat-label">Verification</p><p className="ad-stat-num">{status?.auth.verificationConfigured ? "ON" : "OFF"}</p><p className="ad-stat-foot">authenticator code</p></div>
        <div className="ad-stat"><p className="ad-stat-label">Trusted devices</p><p className="ad-stat-num">{devices.length}</p><p className="ad-stat-foot">{status?.auth.trustedDeviceDays || 30}-day lifetime</p></div>
        <div className="ad-stat"><p className="ad-stat-label">Storage</p><p className="ad-stat-num">{status?.storage.durable ? "Durable" : status?.storage.configured ? "Temp" : "None"}</p><p className="ad-stat-foot">{status?.storage.kind || "not configured"}</p></div>
      </div>
      {status && status.warnings.length > 0 && <div className="cc-warn"><b>Warnings</b><ul>{status.warnings.map((w) => <li key={w}>{w}</li>)}</ul></div>}

      <section className="ad-card cc-card"><div className="cc-body">
        <h3 className="ad-card-title">Trusted devices</h3>
        <p className="cc-muted">Devices that skip the verification code. Only a hash of each device token is stored on the server; the token itself lives in an HttpOnly cookie.</p>
        {devices.length === 0 ? <p className="cc-muted">No trusted devices. Tick “Remember this device” when signing in with a verification code.</p> : (
          <div className="cc-table-wrap"><table className="cc-table cc-table-wide"><thead><tr><th>Device</th><th>Added</th><th>Last used</th><th>Expires</th><th /></tr></thead><tbody>
            {devices.map((d) => <tr key={d.id}><td>{d.label}</td><td>{fmtDate(d.createdAt)}</td><td>{fmtDate(d.lastSeen)}</td><td>{fmtDate(d.expiresAt)}</td><td><button className="ad-btn ad-btn-sm" onClick={() => revoke(d.id)}>Revoke</button></td></tr>)}
          </tbody></table></div>
        )}
        <button className="ad-btn ad-btn-sm cc-danger" onClick={revokeAll}>Revoke all devices &amp; sessions</button>
      </div></section>

      <section className="ad-card cc-card"><div className="cc-body">
        <h3 className="ad-card-title">Bot / dashboard API keys</h3>
        <p className="cc-muted">Scoped, expiring, revocable credentials for your own bot. A key can only read analytics reports (<code>GET /api/analytics/summary</code>) — never settings, devices or keys. Send it as <code>Authorization: Bearer …</code> from your server or bot, never from public HTML.</p>
        <div className="cc-bar cc-bar-flat">
          <input className="ad-input" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-label="Key name" />
          <select className="ad-input" value={exp} onChange={(e) => setExp(Number(e.target.value))} aria-label="Expires after"><option value={30}>30 days</option><option value={90}>90 days</option><option value={180}>180 days</option><option value={365}>365 days</option></select>
          <button className="ad-btn ad-btn-primary ad-btn-sm" onClick={createKey}>Create read-only key</button>
        </div>
        {secret && <div className="cc-secret"><b>Copy this secret now — it will not be shown again</b><code>{secret}</code><button className="ad-btn ad-btn-sm" onClick={() => { void navigator.clipboard?.writeText(secret); onToast("ok", "Copied."); }}>Copy</button><button className="ad-btn ad-btn-sm" onClick={() => setSecret("")}>Hide</button></div>}
        {keys.length > 0 && <div className="cc-table-wrap"><table className="cc-table cc-table-wide"><thead><tr><th>Name</th><th>Scope</th><th>Expires</th><th>Status</th><th /></tr></thead><tbody>
          {keys.map((k) => <tr key={k.id}><td>{k.name}</td><td>{k.scopes.join(", ")}</td><td>{fmtDate(k.expiresAt)}</td><td>{k.revoked ? "revoked" : k.expiresAt < Date.now() ? "expired" : "active"}</td><td className="cc-actions">{!k.revoked && <><button className="ad-btn ad-btn-sm" onClick={() => rotate(k.id)}>Rotate</button><button className="ad-btn ad-btn-sm" onClick={() => revokeKey(k.id)}>Revoke</button></>}</td></tr>)}
        </tbody></table></div>}
      </div></section>

      <section className="ad-card cc-card"><div className="cc-body">
        <h3 className="ad-card-title">Recent activity (audit log)</h3>
        {audit.length === 0 ? <p className="cc-muted">No activity recorded yet.</p> : (
          <div className="cc-table-wrap"><table className="cc-table cc-table-wide"><thead><tr><th>When</th><th>Event</th><th>Detail</th></tr></thead><tbody>
            {audit.slice(0, 25).map((e, i) => <tr key={i}><td>{fmtDate(e.ts)}</td><td>{e.action}</td><td>{e.detail || "—"}</td></tr>)}
          </tbody></table></div>
        )}
      </div></section>
      <div className="cc-footer-actions"><button className="ad-btn ad-btn-sm" onClick={signOut}>Sign out of server session</button></div>
    </div>
  );
}
