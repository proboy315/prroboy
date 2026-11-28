import { useCallback, useEffect, useMemo, useState } from "react";
import AdminContentTab from "../components/admin/AdminContentTab";
import AdminProjectsTab from "../components/admin/AdminProjectsTab";
import AdminPublicStudioTab from "../components/admin/AdminPublicStudioTab";
import AdminSeoTab from "../components/admin/AdminSeoTab";
import AdminThemeTab from "../components/admin/AdminThemeTab";
import { AnalyticsTab, ControlCenterTab, SecurityTab } from "../components/admin/AdminControlCenter";
import Icon from "../components/Icon";
import { demos, gallery, info, projects } from "../lib/data";
import {
  clearEvents,
  getRecentActivity,
  getStats,
  readEvents,
  timeAgo,
} from "../lib/analytics";
import { listBranches, listCommits, verifyGitHubRepo } from "../lib/githubApi";
import type { GitHubCommit, GitHubConfig, GitHubRepoInfo } from "../lib/githubApi";
import { onLink } from "../lib/router";
import { useSeo } from "../lib/seo";
import {
  changeVaultPassphrase,
  clearLegacyPlaintextConfig,
  createVault,
  deleteVault,
  lockVault,
  persistGithubToVault,
  unlockVault,
  vaultExists,
} from "../lib/vault";
import "../styles/admin.css";

type TabId = "dashboard" | "seo" | "projects" | "files" | "content" | "theme" | "settings" | "control" | "analytics" | "security";
type Toast = { id: number; type: "ok" | "err" | "info"; msg: string };

const TAB_META: Record<TabId, { title: string; sub: string }> = {
  dashboard: { title: "Mission Dashboard", sub: "Content health, repository activity and local history" },
  seo: { title: "SEO & Social", sub: "Meta tags, OG image, Twitter cards, robots" },
  projects: { title: "Projects", sub: "Portfolio builds, covers & links" },
  files: { title: "Files & Public Studio", sub: "Folders, code & uploads in public/" },
  content: { title: "Site Content", sub: "Profile, services, gallery, demos, blog" },
  theme: { title: "Theme Studio", sub: "Public site glass tuning" },
  control: { title: "Control Center", sub: "Appearance, motion, features, announcements & publishing" },
  analytics: { title: "Analytics", sub: "Server-side first-party reports and the ON/OFF switch" },
  security: { title: "Security", sub: "Trusted devices, bot API keys & audit log" },
  settings: { title: "Control Settings", sub: "Connection, analytics, vault & security" },
};

export default function Admin() {
  useSeo({
    title: `Admin Control Panel | ${info.brand}`,
    description: "Private encrypted admin panel. Sign in to manage the portfolio.",
    path: "/admin",
    noindex: true,
  });

  const [phase, setPhase] = useState<"checking" | "setup" | "locked" | "ready">("checking");

  // setup form — intentionally empty, autocomplete OFF everywhere
  const [sUser, setSUser] = useState("");
  const [sPass, setSPass] = useState("");
  const [sConfirm, setSConfirm] = useState("");
  const [sOwner, setSOwner] = useState("");
  const [sRepo, setSRepo] = useState("");
  const [sBranch, setSBranch] = useState("main");
  const [sToken, setSToken] = useState("");
  const [showSPass, setShowSPass] = useState(false);
  const [setupErr, setSetupErr] = useState("");
  const [setupBusy, setSetupBusy] = useState(false);

  // lock form
  const [lUser, setLUser] = useState("");
  const [lPass, setLPass] = useState("");
  const [showLPass, setShowLPass] = useState(false);
  const [lockErr, setLockErr] = useState("");
  const [lockBusy, setLockBusy] = useState(false);

  // live session
  const [cfg, setCfg] = useState<GitHubConfig>({ owner: "", repo: "", branch: "main", token: "", remember: true });
  const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [verifying, setVerifying] = useState(false);

  const [tab, setTab] = useState<TabId>("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [tick, setTick] = useState(0);

  // settings
  const [showToken, setShowToken] = useState(false);
  const [secBusy, setSecBusy] = useState(false);
  const [cUser, setCUser] = useState("");
  const [cPass, setCPass] = useState("");
  const [nUser, setNUser] = useState("");
  const [nPass, setNPass] = useState("");

  const pushToast = useCallback((type: Toast["type"], msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((p) => [...p.slice(-3), { id, type, msg }]);
    window.setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 5200);
  }, []);

  useEffect(() => {
    clearLegacyPlaintextConfig();
    setPhase(vaultExists() ? "locked" : "setup");
  }, []);

  useEffect(() => {
    if (phase !== "ready") return;
    const t = window.setInterval(() => setTick((v) => v + 1), 8000);
    return () => window.clearInterval(t);
  }, [phase]);

  const refreshCommits = async (c: GitHubConfig) => {
    try {
      setCommits(await listCommits(c, 10));
    } catch {
      // ignore
    }
  };

  const verify = async (c: GitHubConfig) => {
    setVerifying(true);
    try {
      const ri = await verifyGitHubRepo(c);
      const bl = await listBranches(c).catch(() => [ri.defaultBranch]);
      const branch = bl.includes(c.branch) ? c.branch : ri.defaultBranch;
      const final = { ...c, branch };
      setCfg(final);
      setRepoInfo(ri);
      setBranches(bl);
      try {
        await persistGithubToVault(final);
      } catch {
        // fallback-mode: vault updates need passphrase re-entry; session still works
      }
      await refreshCommits(final);
      return true;
    } catch (e) {
      pushToast("err", e instanceof Error ? e.message : "GitHub verify failed.");
      return false;
    } finally {
      setVerifying(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupErr("");
    if (sPass !== sConfirm) {
      setSetupErr("Passphrases do not match.");
      return;
    }
    setSetupBusy(true);
    try {
      await createVault(sUser, sPass, { owner: sOwner, repo: sRepo, branch: sBranch || "main", token: sToken });
      const c: GitHubConfig = { owner: sOwner.trim(), repo: sRepo.trim(), branch: sBranch.trim() || "main", token: sToken.trim(), remember: true };
      setCfg(c);
      setPhase("ready");
      pushToast("ok", "Encrypted vault created. Verifying repository…");
      await verify(c);
    } catch (err) {
      setSetupErr(err instanceof Error ? err.message : "Setup failed.");
    } finally {
      setSetupBusy(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLockErr("");
    setLockBusy(true);
    try {
      const c = await unlockVault(lUser, lPass);
      setCfg(c);
      setLPass("");
      setPhase("ready");
      pushToast("ok", `Welcome back, ${lUser.trim()}. Vault unlocked.`);
      await verify(c);
    } catch (err) {
      setLockErr(err instanceof Error ? err.message : "Unlock failed.");
    } finally {
      setLockBusy(false);
    }
  };

  const handleLock = () => {
    lockVault();
    setRepoInfo(null);
    setCommits([]);
    setLUser("");
    setLPass("");
    setPhase("locked");
    pushToast("info", "Vault locked. Credentials stay encrypted.");
  };

  const stats = useMemo(() => getStats(), [tick, tab, phase]);
  const recent = useMemo(() => getRecentActivity(14), [tick, tab, phase]);
  const maxDay = Math.max(1, ...stats.daily.map((d) => d.views));

  const connected = Boolean(repoInfo);

  const NAV: { id: TabId; label: string; icon: string; count?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: "grid" },
    { id: "seo", label: "SEO & Social", icon: "globe" },
    { id: "projects", label: "Projects", icon: "folder", count: projects.length },
    { id: "files", label: "Files & Studio", icon: "code" },
    { id: "content", label: "Site Content", icon: "layers" },
    { id: "theme", label: "Theme Studio", icon: "palette" },
    { id: "settings", label: "Settings", icon: "sliders" },
  ];

  /* ---------------- LOCK / SETUP SCREENS ---------------- */
  if (phase === "checking") {
    return (
      <div className="ad-shell">
        <div className="ad-lock-wrap">
          <h1 className="sr-only">Admin Control Panel | PROBOY</h1>
          <p style={{ color: "#7c86a3", fontSize: 13 }}>Opening secure panel…</p>
        </div>
      </div>
    );
  }

  if (phase === "setup") {
    return (
      <div className="ad-shell">
        <div className="ad-lock-wrap">
          <div className="ad-lock-card">
            <div className="ad-lock-top">
              <div className="ad-lock-mark">
                <Icon name="lock" className="w-6 h-6" />
              </div>
              <div>
                <p className="ad-brand-sub">PROBOY · Private Admin</p>
                <h1 className="ad-lock-title">Create your admin login</h1>
              </div>
            </div>
            <form className="ad-lock-body" onSubmit={handleSetup} autoComplete="off">
              <p className="ad-lock-desc">
                First step: choose a <strong style={{ color: "#fff" }}>panel username + passphrase</strong>. Your GitHub
                owner, repo &amp; token are then stored <strong style={{ color: "#fff" }}>AES-256 encrypted</strong> in
                this browser only — never in the website code, never suggested to anyone.
              </p>
              <div className="ad-form-grid">
                <div className="ad-field">
                  <label className="ad-label" htmlFor="ad-su">Panel username</label>
                  <input
                    id="ad-su"
                    className="ad-input"
                    value={sUser}
                    onChange={(e) => setSUser(e.target.value)}
                    placeholder="Choose a private username"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label" htmlFor="ad-sp">Passphrase (min 6)</label>
                  <input
                    id="ad-sp"
                    type={showSPass ? "text" : "password"}
                    className="ad-input"
                    value={sPass}
                    onChange={(e) => setSPass(e.target.value)}
                    placeholder="Choose a strong passphrase"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
              <div className="ad-form-grid">
                <div className="ad-field">
                  <label className="ad-label" htmlFor="ad-sc">Confirm passphrase</label>
                  <input
                    id="ad-sc"
                    type={showSPass ? "text" : "password"}
                    className="ad-input"
                    value={sConfirm}
                    onChange={(e) => setSConfirm(e.target.value)}
                    placeholder="Repeat passphrase"
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">&nbsp;</label>
                  <button type="button" className="ad-btn" onClick={() => setShowSPass((v) => !v)}>
                    {showSPass ? "Hide" : "Show"} passphrase
                  </button>
                </div>
              </div>

              <p className="ad-brand-sub" style={{ marginTop: 22 }}>Connect repository (typed once, then encrypted)</p>
              <div className="ad-form-grid">
                <div className="ad-field">
                  <label className="ad-label" htmlFor="ad-so">GitHub owner</label>
                  <input id="ad-so" className="ad-input ad-mono" value={sOwner} onChange={(e) => setSOwner(e.target.value)} placeholder="owner" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} required />
                </div>
                <div className="ad-field">
                  <label className="ad-label" htmlFor="ad-sr">Repository</label>
                  <input id="ad-sr" className="ad-input ad-mono" value={sRepo} onChange={(e) => setSRepo(e.target.value)} placeholder="repository" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} required />
                </div>
                <div className="ad-field">
                  <label className="ad-label" htmlFor="ad-sb">Branch</label>
                  <input id="ad-sb" className="ad-input ad-mono" value={sBranch} onChange={(e) => setSBranch(e.target.value)} placeholder="main" autoComplete="off" autoCapitalize="off" spellCheck={false} />
                </div>
                <div className="ad-field">
                  <label className="ad-label" htmlFor="ad-st">Auth token (PAT)</label>
                  <input id="ad-st" type={showSPass ? "text" : "password"} className="ad-input ad-mono" value={sToken} onChange={(e) => setSToken(e.target.value)} placeholder="ghp_… / github_pat_…" autoComplete="new-password" spellCheck={false} required />
                </div>
              </div>

              {setupErr && <p className="ad-error" role="alert">{setupErr}</p>}
              <div className="ad-row" style={{ marginTop: 20 }}>
                <button type="submit" className="ad-btn ad-btn-primary" disabled={setupBusy} style={{ flex: 1 }}>
                  <Icon name="key" className="w-4 h-4" /> {setupBusy ? "Encrypting…" : "Create vault & connect"}
                </button>
              </div>
              <p className="ad-hint">Token needs <code>repo</code> scope (classic) or <code>Contents: Read &amp; write</code> (fine-grained). After this, opening <code>/admin</code> will ask for your panel username — your real GitHub owner/repo are never suggested.</p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "locked") {
    return (
      <div className="ad-shell">
        <div className="ad-lock-wrap">
          <div className="ad-lock-card">
            <div className="ad-lock-top">
              <div className="ad-lock-mark">
                <Icon name="lock" className="w-6 h-6" />
              </div>
              <div>
                <p className="ad-brand-sub">PROBOY · Private Admin</p>
                <h1 className="ad-lock-title">Unlock admin panel</h1>
              </div>
            </div>
            <form className="ad-lock-body" onSubmit={handleUnlock} autoComplete="off">
              <p className="ad-lock-desc">
                Enter your <strong style={{ color: "#fff" }}>panel username + passphrase</strong> to decrypt this
                browser's saved repository connection. Nothing is prefilled or suggested.
              </p>
              <div className="ad-field">
                <label className="ad-label" htmlFor="ad-lu">Panel username</label>
                <input
                  id="ad-lu"
                  className="ad-input"
                  value={lUser}
                  onChange={(e) => setLUser(e.target.value)}
                  placeholder="Your private panel username"
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
              </div>
              <div className="ad-field">
                <label className="ad-label" htmlFor="ad-lp">Passphrase</label>
                <input
                  id="ad-lp"
                  type={showLPass ? "text" : "password"}
                  className="ad-input"
                  value={lPass}
                  onChange={(e) => setLPass(e.target.value)}
                  placeholder="Your passphrase"
                  autoComplete="new-password"
                  required
                />
              </div>
              {lockErr && <p className="ad-error" role="alert">{lockErr}</p>}
              <div className="ad-row" style={{ marginTop: 20 }}>
                <button type="button" className="ad-btn" onClick={() => setShowLPass((v) => !v)}>
                  {showLPass ? "Hide" : "Show"}
                </button>
                <button type="submit" className="ad-btn ad-btn-primary" disabled={lockBusy} style={{ flex: 1 }}>
                  <Icon name="unlock" className="w-4 h-4" /> {lockBusy ? "Decrypting…" : "Unlock panel"}
                </button>
              </div>
              <div className="ad-row" style={{ marginTop: 14, justifyContent: "space-between" }}>
                <a href="/" onClick={onLink} style={{ fontSize: 12.5, color: "#8b93ad" }}>← Back to site</a>
                <button
                  type="button"
                  style={{ fontSize: 12.5, color: "#f43f5e", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => {
                    if (window.confirm("Delete the encrypted vault in this browser? You will need owner/repo/token again.")) {
                      deleteVault();
                      setPhase("setup");
                    }
                  }}
                >
                  Forgot login? Reset vault
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- MAIN APP ---------------- */
  return (
    <div className="ad-shell">
      <div className="ad-layout">
        {sideOpen && <div className="ad-scrim" onClick={() => setSideOpen(false)} />}

        {/* Sidebar */}
        <aside className={`ad-sidebar ${sideOpen ? "open" : ""}`}>
          <div className="ad-side-head">
            <div className="ad-side-logo">P</div>
            <div>
              <p className="ad-side-title">PROBOY Admin</p>
              <p className="ad-side-sub">Encrypted control center</p>
            </div>
          </div>
          <nav className="ad-side-nav" aria-label="Admin sections">
            <p className="ad-side-section">Manage</p>
            {NAV.slice(0, 6).map((n) => (
              <button
                key={n.id}
                className={`ad-side-link ${tab === n.id ? "active" : ""}`}
                onClick={() => {
                  setTab(n.id);
                  setSideOpen(false);
                }}
              >
                <Icon name={n.icon} className="w-4 h-4" />
                {n.label}
                {typeof n.count === "number" && <span className="ad-count">{n.count}</span>}
              </button>
            ))}
            <p className="ad-side-section">Control Center</p>
            {([["control", "Site Controls", "sliders"], ["analytics", "Analytics", "chart"], ["security", "Security", "shield"]] as const).map(([id, label, icon]) => (
              <button key={id} className={`ad-side-link ${tab === id ? "active" : ""}`} onClick={() => { setTab(id as TabId); setSideOpen(false); }}>
                <Icon name={icon} className="w-4 h-4" /> {label}
              </button>
            ))}
            <p className="ad-side-section">System</p>
            <button className={`ad-side-link ${tab === "settings" ? "active" : ""}`} onClick={() => { setTab("settings"); setSideOpen(false); }}>
              <Icon name="sliders" className="w-4 h-4" /> Settings
            </button>
            <a href="/" onClick={onLink} className="ad-side-link">
              <Icon name="external" className="w-4 h-4" /> View live site
            </a>
          </nav>
          <div className="ad-side-foot">
            <div className="ad-conn">
              <span className={`ad-dot ${connected ? "on" : "off"}`} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {connected ? `${cfg.owner}/${cfg.repo} · ${cfg.branch}` : "Repo not verified"}
              </span>
            </div>
            <button className="ad-btn ad-btn-sm" onClick={handleLock}>
              <Icon name="lock" className="w-4 h-4" /> Lock vault
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="ad-main">
          <div className="ad-topbar">
            <button className="ad-burger" onClick={() => setSideOpen(true)} aria-label="Open menu">
              <Icon name="menu" className="w-5 h-5" />
            </button>
            <div>
              <h1 className="ad-page-title">{TAB_META[tab].title}</h1>
              <p className="ad-page-sub">{TAB_META[tab].sub}</p>
            </div>
            <div className="ad-top-actions">
              <span className={`ad-status ${connected ? "ok" : ""}`}>
                <span className={`ad-dot ${connected ? "on" : "off"}`} />
                {verifying ? "Verifying…" : connected ? "Connected" : "Offline"}
              </span>
              <button className="ad-btn ad-btn-sm" onClick={() => void verify(cfg)} disabled={verifying}>
                <Icon name="refresh" className={`w-4 h-4 ${verifying ? "animate-spin" : ""}`} />
                <span className="hide-sm">Sync</span>
              </button>
            </div>
          </div>

          <div className="ad-content">
            {tab === "dashboard" && (
              <>
                <div className="ad-grid-4">
                  <div className="ad-stat">
                    <p className="ad-stat-label">Page views</p>
                    <p className="ad-stat-num">{stats.totalViews}</p>
                    <p className="ad-stat-foot">{stats.todayViews} today · {stats.sessions} sessions</p>
                  </div>
                  <div className="ad-stat">
                    <p className="ad-stat-label">Unique visitors</p>
                    <p className="ad-stat-num">{stats.uniqueVisitors}</p>
                    <p className="ad-stat-foot">{stats.onlineNow} online (5 min)</p>
                  </div>
                  <div className="ad-stat">
                    <p className="ad-stat-label">Projects</p>
                    <p className="ad-stat-num">{projects.length}</p>
                    <p className="ad-stat-foot">{demos.length} demos · {gallery.length} assets</p>
                  </div>
                  <div className="ad-stat">
                    <p className="ad-stat-label">Repo pushes</p>
                    <p className="ad-stat-num">{commits.length}</p>
                    <p className="ad-stat-foot">{connected ? `${cfg.branch} branch` : "connect to sync"}</p>
                  </div>
                </div>

                <div className="ad-grid-2">
                  <div className="ad-card">
                    <div className="ad-card-head">
                      <div>
                        <h2 className="ad-card-title">Traffic — last 7 days</h2>
                        <p className="ad-card-sub">Historical on-device visits. New reports are in the Analytics tab.</p>
                      </div>
                      <button className="ad-btn ad-btn-sm" onClick={() => setTick((v) => v + 1)}>
                        <Icon name="refresh" className="w-3.5 h-3.5" /> Refresh
                      </button>
                    </div>
                    {stats.totalViews === 0 ? (
                      <p className="ad-hint">No historical visits are stored on this device.</p>
                    ) : (
                      <div className="ad-bars">
                        {stats.daily.map((d) => (
                          <div key={d.label} className="ad-bar-col">
                            <span className="ad-bar-val">{d.views}</span>
                            <div className={`ad-bar ${d.views === 0 ? "dim" : ""}`} style={{ height: `${Math.max(6, (d.views / maxDay) * 100)}px` }} />
                            <span className="ad-bar-label">{d.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="ad-card">
                    <h2 className="ad-card-title">Where visitors go</h2>
                    <p className="ad-card-sub">Top paths + entry sources.</p>
                    <div className="ad-list" style={{ marginTop: 14 }}>
                      {stats.topPaths.length === 0 && <p className="ad-hint">Nothing yet — browse the site to generate trails.</p>}
                      {stats.topPaths.map((t) => (
                        <div key={t.path} className="ad-item">
                          <span className="ad-mono" style={{ flex: 1, color: "#fff" }}>{t.path}</span>
                          <span className="ad-pill">{t.views} views</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                      {stats.referrers.map((r) => (
                        <span key={r.ref} className="ad-pill">{r.ref} · {r.views}</span>
                      ))}
                    </div>
                    <p className="ad-hint" style={{ marginTop: 12 }}>
                      Devices — mobile {stats.devices.mobile} · tablet {stats.devices.tablet} · desktop {stats.devices.desktop}
                    </p>
                  </div>
                </div>

                <div className="ad-grid-2">
                  <div className="ad-card">
                    <div className="ad-card-head">
                      <div>
                        <h2 className="ad-card-title">Live activity feed</h2>
                        <p className="ad-card-sub">Who came, from where, which page, on what device.</p>
                      </div>
                      <span className="ad-pill ad-pill-green">{stats.onlineNow} live</span>
                    </div>
                    <div className="ad-table-wrap">
                      <table className="ad-table">
                        <thead>
                          <tr>
                            <th>When</th>
                            <th>Path</th>
                            <th>From</th>
                            <th>Device</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recent.map((e) => (
                            <tr key={e.id}>
                              <td style={{ whiteSpace: "nowrap" }}>{timeAgo(e.ts)}</td>
                              <td className="ad-mono" style={{ color: "#fff" }}>{e.path}</td>
                              <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {e.source || (e.referrer ? (() => { try { return new URL(e.referrer).hostname; } catch { return e.referrer; } })() : "Direct")}
                              </td>
                              <td>{e.device} · {e.lang}</td>
                            </tr>
                          ))}
                          {recent.length === 0 && (
                            <tr>
                              <td colSpan={4} style={{ color: "#7c86a3" }}>No activity yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="ad-card">
                      <h2 className="ad-card-title">Quick actions</h2>
                      <div className="ad-quick" style={{ marginTop: 14 }}>
                        <button className="ad-quick-btn" onClick={() => setTab("seo")}><b>Edit SEO &amp; OG image</b><span>Title, description, cards, robots</span></button>
                        <button className="ad-quick-btn" onClick={() => setTab("files")}><b>New folder / code</b><span>Build inside public/</span></button>
                        <button className="ad-quick-btn" onClick={() => setTab("projects")}><b>Add project</b><span>Covers, links, features</span></button>
                        <button className="ad-quick-btn" onClick={() => setTab("theme")}><b>Tune theme</b><span>Site glass &amp; accent</span></button>
                      </div>
                    </div>
                    <div className="ad-card">
                      <div className="ad-card-head">
                        <h2 className="ad-card-title">Recent pushes</h2>
                        <button className="ad-btn ad-btn-sm" onClick={() => void refreshCommits(cfg)} disabled={!connected}>Refresh</button>
                      </div>
                      <div className="ad-list">
                        {!connected && <p className="ad-hint">Unlock + verify to stream commits.</p>}
                        {commits.map((c) => (
                          <div key={c.sha} className="ad-item">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 12.5, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.message.split("\n")[0]}</p>
                              <p style={{ fontSize: 11, color: "#7c86a3", marginTop: 2 }}>{c.author} · {c.date ? new Date(c.date).toLocaleString() : ""}</p>
                            </div>
                            <a href={c.htmlUrl} target="_blank" rel="noopener noreferrer" className="ad-mono" style={{ color: "#f43f5e" }}>{c.sha.slice(0, 7)}</a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {tab === "control" && <ControlCenterTab onToast={pushToast} goTo={(t) => setTab(t as TabId)} />}
            {tab === "analytics" && <AnalyticsTab onToast={pushToast} goTo={(t) => setTab(t as TabId)} />}
            {tab === "security" && <SecurityTab onToast={pushToast} goTo={(t) => setTab(t as TabId)} />}
            {tab === "seo" && <AdminSeoTab cfg={cfg} connected={connected} onToast={pushToast} onRepoChange={() => void refreshCommits(cfg)} />}
            {tab === "projects" && <AdminProjectsTab cfg={cfg} connected={connected} onToast={pushToast} onRepoChange={() => void refreshCommits(cfg)} />}
            {tab === "files" && <AdminPublicStudioTab cfg={cfg} connected={connected} onToast={pushToast} onRepoChange={() => void refreshCommits(cfg)} />}
            {tab === "content" && <AdminContentTab cfg={cfg} connected={connected} onToast={pushToast} onRepoChange={() => void refreshCommits(cfg)} />}
            {tab === "theme" && <AdminThemeTab cfg={cfg} connected={connected} onToast={pushToast} onRepoChange={() => void refreshCommits(cfg)} />}

            {tab === "settings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="ad-card">
                  <div className="ad-card-head">
                    <div>
                      <h2 className="ad-card-title">Repository connection</h2>
                      <p className="ad-card-sub">Saved AES-256 encrypted. Fields never autocomplete or suggest.</p>
                    </div>
                    <button className="ad-btn ad-btn-sm" onClick={() => void verify(cfg)} disabled={verifying}>
                      <Icon name="refresh" className={`w-4 h-4 ${verifying ? "animate-spin" : ""}`} /> {verifying ? "Verifying…" : "Re-verify"}
                    </button>
                  </div>
                  <form
                    autoComplete="off"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void verify(cfg);
                    }}
                  >
                    <div className="ad-form-grid">
                      <div>
                        <label className="ad-label">GitHub owner</label>
                        <input className="ad-input ad-mono" value={cfg.owner} onChange={(e) => setCfg({ ...cfg, owner: e.target.value })} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} placeholder="owner" />
                      </div>
                      <div>
                        <label className="ad-label">Repository</label>
                        <input className="ad-input ad-mono" value={cfg.repo} onChange={(e) => setCfg({ ...cfg, repo: e.target.value })} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} placeholder="repository" />
                      </div>
                      <div>
                        <label className="ad-label">Branch</label>
                        {branches.length ? (
                          <select className="ad-select ad-mono" value={cfg.branch} onChange={async (e) => { const n = { ...cfg, branch: e.target.value }; setCfg(n); try { await persistGithubToVault(n); } catch { /* ignore */ } void refreshCommits(n); }}>
                            {branches.map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                        ) : (
                          <input className="ad-input ad-mono" value={cfg.branch} onChange={(e) => setCfg({ ...cfg, branch: e.target.value })} autoComplete="off" />
                        )}
                      </div>
                      <div>
                        <label className="ad-label">Auth token</label>
                        <input type={showToken ? "text" : "password"} className="ad-input ad-mono" value={cfg.token} onChange={(e) => setCfg({ ...cfg, token: e.target.value })} autoComplete="new-password" spellCheck={false} placeholder="••••••••" />
                      </div>
                    </div>
                    <div className="ad-row" style={{ marginTop: 14, flexWrap: "wrap" }}>
                      <button type="button" className="ad-btn ad-btn-sm" onClick={() => setShowToken((v) => !v)}>{showToken ? "Hide token" : "Show token"}</button>
                      <button
                        type="button"
                        className="ad-btn ad-btn-primary ad-btn-sm"
                        disabled={verifying}
                        onClick={async () => {
                          try {
                            await persistGithubToVault(cfg);
                            pushToast("ok", "Connection re-encrypted & saved.");
                          } catch {
                            pushToast("info", "Saved for this session. Re-enter passphrase to persist on this browser.");
                          }
                        }}
                      >
                        Save encrypted
                      </button>
                    </div>
                  </form>
                  {repoInfo && (
                    <p className="ad-hint">Signed in as <code>@{repoInfo.viewerLogin}</code> · {repoInfo.private ? "private" : "public"} repo · {repoInfo.permissions?.push === false ? "read-only token!" : "write access OK"}</p>
                  )}
                </div>

                <div className="ad-card">
                  <h2 className="ad-card-title">Historical browser analytics</h2>
                  <p className="ad-card-sub">The old forwarding system is retired. Existing local records can be exported or cleared here. Go to Analytics for authenticated aggregate reporting.</p>
                  <div className="ad-row" style={{ marginTop: 14, flexWrap: "wrap" }}>
                    <button
                      className="ad-btn ad-btn-sm"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(readEvents(), null, 2)], { type: "application/json" });
                        const a = document.createElement("a");
                        a.href = URL.createObjectURL(blob);
                        a.download = "proboy-analytics.json";
                        a.click();
                      }}
                    >
                      <Icon name="download" className="w-4 h-4" /> Export data
                    </button>
                    <button
                      className="ad-btn ad-btn-sm"
                      onClick={() => {
                        if (window.confirm("Clear all locally stored visit data on this device?")) {
                          clearEvents();
                          setTick((v) => v + 1);
                          pushToast("info", "Local analytics cleared.");
                        }
                      }}
                    >
                      <Icon name="trash" className="w-4 h-4" /> Clear data
                    </button>
                    <span className="ad-pill">{readEvents().length} events stored</span>
                  </div>
                </div>

                <div className="ad-card">
                  <h2 className="ad-card-title">Vault &amp; security</h2>
                  <p className="ad-card-sub">Change panel login or wipe the encrypted vault.</p>
                  <div className="ad-form-grid" style={{ marginTop: 12 }}>
                    <div>
                      <label className="ad-label">Current username</label>
                      <input className="ad-input" value={cUser} onChange={(e) => setCUser(e.target.value)} autoComplete="off" />
                    </div>
                    <div>
                      <label className="ad-label">Current passphrase</label>
                      <input type="password" className="ad-input" value={cPass} onChange={(e) => setCPass(e.target.value)} autoComplete="new-password" />
                    </div>
                    <div>
                      <label className="ad-label">New username</label>
                      <input className="ad-input" value={nUser} onChange={(e) => setNUser(e.target.value)} autoComplete="off" placeholder="Leave blank to keep" />
                    </div>
                    <div>
                      <label className="ad-label">New passphrase</label>
                      <input type="password" className="ad-input" value={nPass} onChange={(e) => setNPass(e.target.value)} autoComplete="new-password" placeholder="Min 6 chars" />
                    </div>
                  </div>
                  <div className="ad-row" style={{ marginTop: 14, flexWrap: "wrap" }}>
                    <button
                      className="ad-btn ad-btn-sm"
                      disabled={secBusy}
                      onClick={async () => {
                        if (!cUser || !cPass || !nPass) return pushToast("err", "Fill current login + new passphrase.");
                        setSecBusy(true);
                        try {
                          await changeVaultPassphrase(cUser, cPass, nUser || cUser, nPass);
                          setCUser("");
                          setCPass("");
                          setNUser("");
                          setNPass("");
                          pushToast("ok", "Panel login rotated & re-encrypted.");
                        } catch (e) {
                          pushToast("err", e instanceof Error ? e.message : "Rotate failed.");
                        } finally {
                          setSecBusy(false);
                        }
                      }}
                    >
                      {secBusy ? "Rotating…" : "Rotate login"}
                    </button>
                    <button className="ad-btn ad-btn-sm" onClick={handleLock}>Lock now</button>
                    <button
                      className="ad-btn ad-btn-sm"
                      onClick={() => {
                        if (window.confirm("Delete encrypted vault from this browser?")) {
                          deleteVault();
                          setPhase("setup");
                        }
                      }}
                    >
                      Delete vault
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ad-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`ad-toast ${t.type}`}>
            {t.msg}
          </div>
        ))}
      </div>
    </div>
  );
}
