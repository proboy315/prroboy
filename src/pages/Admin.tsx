import { useEffect, useState } from "react";
import AdminAnalyticsTab from "../components/admin/AdminAnalyticsTab";
import AdminContentTab from "../components/admin/AdminContentTab";
import AdminProjectsTab from "../components/admin/AdminProjectsTab";
import AdminPublicStudioTab from "../components/admin/AdminPublicStudioTab";
import AdminSeoTab from "../components/admin/AdminSeoTab";
import AdminThemeTab from "../components/admin/AdminThemeTab";
import Icon from "../components/Icon";
import { LiquidButton, LiquidCard, LiquidDock, LiquidPill } from "../components/LiquidGlass";
import { demos, gallery, info, projects, services } from "../lib/data";
import {
  clearGitHubConfig,
  listBranches,
  listCommits,
  loadGitHubConfig,
  saveGitHubConfig,
  verifyGitHubRepo,
} from "../lib/githubApi";
import type { GitHubCommit, GitHubConfig, GitHubRepoInfo } from "../lib/githubApi";
import {
  createVault,
  deleteVault,
  hasVault,
  lockVaultSession,
  unlockVault,
} from "../lib/vault";
import { onLink } from "../lib/router";
import { useSeo } from "../lib/seo";

type TabId = "overview" | "analytics" | "seo" | "projects" | "public" | "content" | "theme";

type Toast = {
  id: number;
  type: "ok" | "err" | "info";
  msg: string;
};

export default function Admin() {
  useSeo({
    title: `Admin Control Panel | ${info.brand}`,
    description: "Private GitHub-backed admin panel for managing SEO, OG tags, projects, public folder code, visitor analytics and Liquid Glass theme.",
    path: "/admin",
    noindex: true,
  });

  const [cfg, setCfg] = useState<GitHubConfig>(() => loadGitHubConfig());
  const [showToken, setShowToken] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [repoInfo, setRepoInfo] = useState<GitHubRepoInfo | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [connectError, setConnectError] = useState("");
  const [tab, setTab] = useState<TabId>("overview");
  const [toasts, setToasts] = useState<Toast[]>([]);

  /* Encrypted vault state */
  const [vaultLocked, setVaultLocked] = useState(() => hasVault());
  const [vaultOpen, setVaultOpen] = useState(false);
  const [vaultPass, setVaultPass] = useState("");
  const [unlockPass, setUnlockPass] = useState("");

  const pushToast = (type: Toast["type"], msg: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev.slice(-3), { id, type, msg }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5200);
  };

  const refreshCommits = async (currentCfg: GitHubConfig) => {
    try {
      const list = await listCommits(currentCfg, 10);
      setCommits(list);
    } catch {
      // ignore
    }
  };

  const connect = async (customCfg?: GitHubConfig) => {
    const active = customCfg || cfg;
    setConnecting(true);
    setConnectError("");
    try {
      const infoRes = await verifyGitHubRepo(active);
      const branchList = await listBranches(active).catch(() => [infoRes.defaultBranch]);
      const chosenBranch = branchList.includes(active.branch) ? active.branch : infoRes.defaultBranch;
      const finalCfg = { ...active, branch: chosenBranch };

      setCfg(finalCfg);
      saveGitHubConfig(finalCfg); // owner/repo/branch only — token is NEVER stored plain
      setRepoInfo(infoRes);
      setBranches(branchList);
      await refreshCommits(finalCfg);

      if (vaultPass.trim().length >= 8) {
        try {
          await createVault(
            {
              owner: finalCfg.owner.trim(),
              repo: finalCfg.repo.trim(),
              branch: finalCfg.branch,
              token: finalCfg.token,
              remember: true,
              updatedAt: new Date().toISOString(),
            },
            vaultPass.trim()
          );
          setVaultLocked(false);
          setVaultOpen(true);
          setVaultPass("");
          pushToast("ok", `Connected + login sealed into AES-256 encrypted vault.`);
        } catch (ve) {
          pushToast("err", ve instanceof Error ? ve.message : "Vault encryption failed — connected for this session only.");
        }
      } else {
        pushToast("ok", `Connected to ${infoRes.fullName} (${chosenBranch})`);
        if (!hasVault()) {
          pushToast("info", "Tip: enter a vault passphrase (8+ chars) to keep this login encrypted across visits.");
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not connect to GitHub.";
      setConnectError(msg);
      setRepoInfo(null);
      pushToast("err", msg);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    try {
      if (window.localStorage.getItem("proboy_admin_vault_v1")) {
        setVaultLocked(true);
        return;
      }
    } catch {
      // storage unavailable — fall through to plain prefill
    }
    const saved = loadGitHubConfig();
    if (saved.owner && saved.repo && saved.token) {
      void connect(saved);
    }
  }, []);

  const unlockNow = async () => {
    if (!unlockPass) {
      pushToast("err", "Enter your vault passphrase to unlock.");
      return;
    }
    setConnecting(true);
    try {
      const payload = await unlockVault(unlockPass);
      setUnlockPass("");
      const full: GitHubConfig = {
        owner: payload.owner,
        repo: payload.repo,
        branch: payload.branch,
        token: payload.token,
        remember: true,
      };
      setVaultLocked(false);
      setVaultOpen(true);
      await connect(full);
    } catch (e) {
      pushToast("err", e instanceof Error ? e.message : "Unlock failed.");
    } finally {
      setConnecting(false);
    }
  };

  const lockNow = () => {
    lockVaultSession();
    setVaultOpen(false);
    setVaultLocked(hasVault());
    setCfg((p) => ({ ...p, token: "" }));
    setRepoInfo(null);
    setCommits([]);
    pushToast("info", "Vault locked. Token cleared from memory.");
  };

  const disconnect = () => {
    clearGitHubConfig();
    lockVaultSession();
    setVaultOpen(false);
    setVaultLocked(hasVault());
    setRepoInfo(null);
    setCommits([]);
    setCfg((prev) => ({ ...prev, token: "" }));
    setVaultPass("");
    pushToast("info", "Disconnected. Encrypted vault (if any) is kept — unlock to reconnect.");
  };

  const connected = Boolean(repoInfo);

  const TABS: { id: TabId; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "analytics", label: "Analytics & Vault", icon: "chart" },
    { id: "seo", label: "SEO & OG Tags", icon: "globe" },
    { id: "projects", label: "Projects", icon: "folder" },
    { id: "public", label: "public/ & Code Studio", icon: "code" },
    { id: "content", label: "Site Content", icon: "layers" },
    { id: "theme", label: "Liquid Glass", icon: "palette" },
  ];

  return (
    <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 pt-28 sm:pt-32 pb-20 space-y-7">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <LiquidPill crimson>
              <Icon name={connected ? "unlock" : "lock"} className="w-3.5 h-3.5" />
              {connected ? `Connected: ${repoInfo?.fullName}` : "GitHub Repo Control Center"}
            </LiquidPill>
            {vaultOpen && <LiquidPill>Vault open (AES-256)</LiquidPill>}
            {vaultLocked && <LiquidPill>Vault locked</LiquidPill>}
            {repoInfo?.permissions?.push === false && (
              <LiquidPill>Read-only token (needs Contents: Write)</LiquidPill>
            )}
            {repoInfo?.rateRemaining && (
              <LiquidPill>API Limit: {repoInfo.rateRemaining}</LiquidPill>
            )}
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {info.brand} GitHub Admin Panel
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Control SEO &amp; OG tags, upload OG/portrait images, manage projects, create folders &amp; code inside{" "}
            <code className="text-zinc-200">public/</code>, track visits, and customize Liquid Glass.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <a href="/" onClick={onLink} className="lg-btn">
            View Portfolio <Icon name="external" className="w-4 h-4" />
          </a>
          {vaultOpen && connected && (
            <LiquidButton onClick={lockNow}>
              <Icon name="lock" className="w-4 h-4 text-amber-300" />
              Lock Vault
            </LiquidButton>
          )}
          {connected && (
            <LiquidButton onClick={disconnect}>
              <Icon name="logout" className="w-4 h-4 text-red-400" />
              Disconnect
            </LiquidButton>
          )}
        </div>
      </div>

      {/* Vault unlock banner */}
      {vaultLocked && (
        <LiquidCard className="p-5 sm:p-6 border-amber-400/40">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-400/15 border border-amber-300/40 grid place-items-center text-amber-300 shrink-0">
              <Icon name="lock" className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-[220px]">
              <h2 className="font-bold text-white">Encrypted vault locked</h2>
              <p className="text-xs text-zinc-400">
                Your GitHub login is sealed with AES-256-GCM in this browser. Enter your vault passphrase to unlock.
              </p>
            </div>
            <input
              type="password"
              className="lg-input sm:w-64"
              value={unlockPass}
              onChange={(e) => setUnlockPass(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void unlockNow();
              }}
              placeholder="Vault passphrase"
            />
            <LiquidButton variant="primary" onClick={unlockNow} disabled={connecting}>
              <Icon name="unlock" className="w-4 h-4" />
              {connecting ? "Unlocking..." : "Unlock & Connect"}
            </LiquidButton>
            <LiquidButton
              onClick={() => {
                if (window.confirm("Delete the encrypted vault from this browser? You will need the token to reconnect.")) {
                  deleteVault();
                  setVaultLocked(false);
                  setVaultOpen(false);
                  pushToast("info", "Vault deleted from this browser.");
                }
              }}
            >
              Forget Vault
            </LiquidButton>
          </div>
        </LiquidCard>
      )}

      {/* GitHub Credentials Bar */}
      <LiquidCard className="p-5 sm:p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void connect();
          }}
          className="grid md:grid-cols-[1fr_1fr_130px_1.2fr_1.2fr_auto] gap-3 items-end"
        >
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">GitHub Username / Owner</label>
            <input
              className="lg-input"
              value={cfg.owner}
              onChange={(e) => setCfg({ ...cfg, owner: e.target.value })}
              placeholder="proboy315"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Repository Name</label>
            <input
              className="lg-input"
              value={cfg.repo}
              onChange={(e) => setCfg({ ...cfg, repo: e.target.value })}
              placeholder="prroboy"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Branch</label>
            {branches.length > 0 ? (
              <select
                className="lg-input"
                value={cfg.branch}
                onChange={(e) => {
                  const next = { ...cfg, branch: e.target.value };
                  setCfg(next);
                  saveGitHubConfig(next);
                  void refreshCommits(next);
                }}
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="lg-input"
                value={cfg.branch}
                onChange={(e) => setCfg({ ...cfg, branch: e.target.value })}
                placeholder="main"
              />
            )}
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">
              GitHub Auth Token (PAT)
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                className="lg-input pr-16 font-mono text-xs"
                value={cfg.token}
                onChange={(e) => setCfg({ ...cfg, token: e.target.value })}
                placeholder="ghp_... or github_pat_..."
                required
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 hover:text-white px-2 py-1"
              >
                {showToken ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Vault Passphrase (8+ chars)</label>
            <input
              type="password"
              className="lg-input font-mono text-xs"
              value={vaultPass}
              onChange={(e) => setVaultPass(e.target.value)}
              placeholder="Encrypts & saves login"
            />
          </div>

          <LiquidButton type="submit" variant="primary" disabled={connecting} className="h-[42px]">
            <Icon name="key" className="w-4 h-4" />
            {connecting ? "Connecting..." : connected ? "Re-Verify" : "Connect Repo"}
          </LiquidButton>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cfg.remember}
              onChange={(e) => {
                const next = { ...cfg, remember: e.target.checked };
                setCfg(next);
                saveGitHubConfig(next);
              }}
              className="accent-red-500"
            />
            Remember repo in this browser (token is NEVER stored plain — only inside the encrypted vault)
          </label>

          {repoInfo && (
            <div className="flex items-center gap-3">
              {repoInfo.ownerAvatar && (
                <img src={repoInfo.ownerAvatar} alt="" className="w-5 h-5 rounded-full border border-white/20" />
              )}
              <span className="text-emerald-300">
                Authenticated as @{repoInfo.viewerLogin} · {repoInfo.private ? "Private" : "Public"} repo
              </span>
              <a
                href={repoInfo.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:underline"
              >
                Open on GitHub ↗
              </a>
            </div>
          )}
        </div>

        {connectError && (
          <p role="alert" className="mt-3 text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2.5">
            {connectError}
          </p>
        )}
      </LiquidCard>

      {/* Navigation Dock */}
      <div className="overflow-x-auto pb-1">
        <LiquidDock>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`lg-tab ${tab === t.id ? "is-active" : ""}`}
            >
              <Icon name={t.icon} className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          ))}
        </LiquidDock>
      </div>

      {/* Active Workspace */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Projects", val: projects.length, target: "projects" as TabId, desc: "src/data/projects.json" },
              { label: "Services", val: services.length, target: "content" as TabId, desc: "src/data/services.json" },
              { label: "Interactive Demos", val: demos.length, target: "content" as TabId, desc: "src/data/demos.json" },
              { label: "Gallery Assets", val: gallery.length, target: "content" as TabId, desc: "src/data/images.json" },
            ].map((card) => (
              <LiquidCard key={card.label} className="p-5">
                <p className="text-xs uppercase tracking-widest text-zinc-400">{card.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-white">{card.val}</p>
                <p className="mt-1 text-xs font-mono text-zinc-500">{card.desc}</p>
                <button
                  type="button"
                  onClick={() => setTab(card.target)}
                  className="mt-4 text-xs text-red-400 hover:text-red-300 inline-flex items-center gap-1"
                >
                  Manage <Icon name="arrow" className="w-3.5 h-3.5" />
                </button>
              </LiquidCard>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <LiquidCard className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-white">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTab("analytics")}
                  className="text-left p-4 rounded-xl bg-emerald-500/[0.07] border border-emerald-400/25 hover:border-emerald-400/60 transition"
                >
                  <p className="font-semibold text-sm text-white">Enable Analytics &amp; Vault</p>
                  <p className="text-xs text-zinc-400 mt-1">Track every visit into GitHub JSON with encryption</p>
                </button>
                <button
                  type="button"
                  onClick={() => setTab("seo")}
                  className="text-left p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-red-500/50 transition"
                >
                  <p className="font-semibold text-sm text-white">Edit SEO &amp; OG Image</p>
                  <p className="text-xs text-zinc-400 mt-1">Meta title, description, og:image, Twitter cards, robots.txt</p>
                </button>
                <button
                  type="button"
                  onClick={() => setTab("public")}
                  className="text-left p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-red-500/50 transition"
                >
                  <p className="font-semibold text-sm text-white">Create Folder / Code in public/</p>
                  <p className="text-xs text-zinc-400 mt-1">Build folders, write HTML/CSS/JS, upload assets</p>
                </button>
                <button
                  type="button"
                  onClick={() => setTab("projects")}
                  className="text-left p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-red-500/50 transition"
                >
                  <p className="font-semibold text-sm text-white">Add / Edit Projects</p>
                  <p className="text-xs text-zinc-400 mt-1">Upload covers, manage features &amp; live links</p>
                </button>
                <button
                  type="button"
                  onClick={() => setTab("theme")}
                  className="text-left p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-red-500/50 transition"
                >
                  <p className="font-semibold text-sm text-white">Customize Liquid Glass</p>
                  <p className="text-xs text-zinc-400 mt-1">Tune glass blur, saturation, radius &amp; crimson glow</p>
                </button>
              </div>
            </LiquidCard>

            <LiquidCard className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Icon name="history" className="w-4 h-4 text-red-400" /> Recent GitHub Commits
                </h2>
                {connected && (
                  <LiquidButton onClick={() => void refreshCommits(cfg)}>
                    <Icon name="refresh" className="w-3.5 h-3.5" />
                  </LiquidButton>
                )}
              </div>
              {!connected ? (
                <div className="text-xs text-zinc-400 leading-relaxed space-y-2">
                  <p>
                    Enter your <strong className="text-zinc-200">GitHub Username</strong>,{" "}
                    <strong className="text-zinc-200">Repository Name</strong>, and a{" "}
                    <strong className="text-zinc-200">Personal Access Token</strong> above to unlock live pushes.
                  </p>
                  <p>
                    Token scope needed: Classic PAT with <code className="text-zinc-200">repo</code> scope, or
                    Fine-grained PAT with <code className="text-zinc-200">Contents: Read and write</code>.
                  </p>
                  <p className="text-zinc-500">
                    Every commit you make here pushes directly to GitHub — if Vercel is connected to this repo, it
                    automatically rebuilds &amp; deploys your updated portfolio!
                  </p>
                </div>
              ) : (
                <ul className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {commits.map((c) => (
                    <li key={c.sha} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-zinc-100 truncate">{c.message.split("\n")[0]}</span>
                        <a
                          href={c.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-red-400 hover:underline shrink-0"
                        >
                          {c.sha.slice(0, 7)}
                        </a>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        {c.author} · {c.date ? new Date(c.date).toLocaleString() : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </LiquidCard>
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <AdminAnalyticsTab
          cfg={cfg}
          connected={connected}
          onToast={pushToast}
          onRepoChange={() => void refreshCommits(cfg)}
        />
      )}

      {tab === "seo" && (
        <AdminSeoTab
          cfg={cfg}
          connected={connected}
          onToast={pushToast}
          onRepoChange={() => void refreshCommits(cfg)}
        />
      )}

      {tab === "projects" && (
        <AdminProjectsTab
          cfg={cfg}
          connected={connected}
          onToast={pushToast}
          onRepoChange={() => void refreshCommits(cfg)}
        />
      )}

      {tab === "public" && (
        <AdminPublicStudioTab
          cfg={cfg}
          connected={connected}
          onToast={pushToast}
          onRepoChange={() => void refreshCommits(cfg)}
        />
      )}

      {tab === "content" && (
        <AdminContentTab
          cfg={cfg}
          connected={connected}
          onToast={pushToast}
          onRepoChange={() => void refreshCommits(cfg)}
        />
      )}

      {tab === "theme" && (
        <AdminThemeTab
          cfg={cfg}
          connected={connected}
          onToast={pushToast}
          onRepoChange={() => void refreshCommits(cfg)}
        />
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[90] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto lg-surface px-4 py-3 text-xs leading-relaxed border ${
                t.type === "err"
                  ? "border-red-500/60 text-red-100"
                  : t.type === "ok"
                  ? "border-emerald-400/50 text-emerald-100"
                  : "border-white/25 text-zinc-100"
              }`}
            >
              {t.msg}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
