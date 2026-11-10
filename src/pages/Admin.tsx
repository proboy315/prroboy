import { useEffect, useState } from "react";
import AdminContentTab from "../components/admin/AdminContentTab";
import AdminProjectsTab from "../components/admin/AdminProjectsTab";
import AdminPublicStudioTab from "../components/admin/AdminPublicStudioTab";
import AdminSeoTab from "../components/admin/AdminSeoTab";
import AdminThemeTab from "../components/admin/AdminThemeTab";
import Icon from "../components/Icon";
import {
  LiquidButton,
  LiquidCard,
  LiquidDock,
  LiquidPill,
  LiquidStat,
  Toasts,
} from "../components/LiquidGlass";
import type { ToastItem } from "../components/LiquidGlass";
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
import { onLink } from "../lib/router";
import { useSeo } from "../lib/seo";

type TabId = "overview" | "seo" | "projects" | "public" | "content" | "theme";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "seo", label: "SEO & OG Tags", icon: "globe" },
  { id: "projects", label: "Projects", icon: "folder" },
  { id: "public", label: "public/ & Code Studio", icon: "code" },
  { id: "content", label: "Site Content", icon: "layers" },
  { id: "theme", label: "Liquid Glass", icon: "palette" },
];

export default function Admin() {
  useSeo({
    title: `Admin Control Panel | ${info.brand}`,
    description: "Private GitHub-backed admin panel for managing SEO, OG tags, projects, public folder code, and Liquid Glass theme.",
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
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (type: ToastItem["type"], msg: string) => {
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
      saveGitHubConfig(finalCfg);
      setRepoInfo(infoRes);
      setBranches(branchList);
      await refreshCommits(finalCfg);
      pushToast("ok", `Connected to ${infoRes.fullName} (${chosenBranch})`);
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
    const saved = loadGitHubConfig();
    if (saved.owner && saved.repo && saved.token) {
      void connect(saved);
    }
  }, []);

  // Keyboard shortcuts 1–6 to jump between workspaces (ignored while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)
      ) {
        return;
      }
      const idx = ["1", "2", "3", "4", "5", "6"].indexOf(e.key);
      if (idx >= 0) setTab(TABS[idx].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const disconnect = () => {
    clearGitHubConfig();
    setRepoInfo(null);
    setCommits([]);
    setCfg((prev) => ({ ...prev, token: "" }));
    pushToast("info", "Disconnected and cleared stored token.");
  };

  const connected = Boolean(repoInfo);

  return (
    <section className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10 pt-28 sm:pt-32 pb-20 space-y-7">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 lg-enter">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <LiquidPill crimson>
              <span
                className={`inline-flex w-2 h-2 rounded-full lg-pulse-dot ${
                  connected ? "bg-emerald-400 text-emerald-400" : "bg-amber-400 text-amber-400"
                }`}
              />
              {connected ? `Live: ${repoInfo?.fullName}` : "GitHub Repo Control Center"}
            </LiquidPill>
            {repoInfo?.permissions?.push === false && (
              <LiquidPill>Read-only token (needs Contents: Write)</LiquidPill>
            )}
            {repoInfo?.rateRemaining && (
              <LiquidPill>API Limit: {repoInfo.rateRemaining}</LiquidPill>
            )}
          </div>
          <h1 className="mt-3 text-3xl sm:text-[2.6rem] font-extrabold tracking-tight text-white leading-tight">
            {info.brand}{" "}
            <span className="bg-gradient-to-r from-red-400 via-rose-200 to-red-500 bg-clip-text text-transparent">
              GitHub Admin
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Control SEO &amp; OG tags, upload OG/portrait images, manage projects, create folders &amp; code inside{" "}
            <code className="text-zinc-200">public/</code>, and tune the Liquid Glass theme — every save commits
            straight to GitHub.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <a href="/" onClick={onLink} className="lg-btn">
            View Portfolio <Icon name="external" className="w-4 h-4" />
          </a>
          {connected && (
            <LiquidButton onClick={disconnect}>
              <Icon name="logout" className="w-4 h-4 text-red-400" />
              Disconnect
            </LiquidButton>
          )}
        </div>
      </div>

      {/* GitHub Credentials Bar */}
      <LiquidCard tilt={false} className="p-5 sm:p-6 lg-enter" >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void connect();
          }}
          className="grid md:grid-cols-[1fr_1fr_160px_1.5fr_auto] gap-3 items-end"
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

          <LiquidButton type="submit" variant="primary" disabled={connecting} className="h-[42px]">
            {connecting ? (
              <Icon name="refresh" className="w-4 h-4 animate-spin" />
            ) : (
              <Icon name="key" className="w-4 h-4" />
            )}
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
            Remember token in this browser (uncheck to store only for current session)
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
      <div className="space-y-2 lg-enter" style={{ "--lg-d": "80ms" } as React.CSSProperties}>
        <div className="overflow-x-auto pb-1">
          <LiquidDock>
            {TABS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                title={`${t.label} (press ${i + 1})`}
                onClick={() => setTab(t.id)}
                className={`lg-tab ${tab === t.id ? "is-active" : ""}`}
              >
                <Icon name={t.icon} className="w-4 h-4" />
                <span>{t.label}</span>
                <kbd className="lg-kbd hidden sm:inline-grid">{i + 1}</kbd>
              </button>
            ))}
          </LiquidDock>
        </div>
        <p className="text-[11px] text-zinc-500 pl-1">Tip: press 1–6 on your keyboard to switch workspaces instantly.</p>
      </div>

      {/* Active Workspace (spring transition on every switch) */}
      <div key={tab} className="lg-view-enter">
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <LiquidStat label="Projects" value={projects.length} hint="src/data/projects.json" icon="folder" delay={0} onOpen={() => setTab("projects")} />
              <LiquidStat label="Services" value={services.length} hint="src/data/services.json" icon="layers" delay={70} onOpen={() => setTab("content")} />
              <LiquidStat label="Interactive Demos" value={demos.length} hint="src/data/demos.json" icon="grid" delay={140} onOpen={() => setTab("content")} />
              <LiquidStat label="Gallery Assets" value={gallery.length} hint="src/data/images.json" icon="image" delay={210} onOpen={() => setTab("content")} />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <LiquidCard tilt={false} className="p-6 space-y-4">
                <h2 className="text-lg font-bold text-white">Quick Actions</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {(
                    [
                      ["seo", "globe", "Edit SEO & OG Image", "Meta title, description, og:image, Twitter cards, robots.txt"],
                      ["public", "code", "Create Folder / Code in public/", "Build folders, write HTML/CSS/JS, upload assets"],
                      ["projects", "folder", "Add / Edit Projects", "Upload covers, manage features & live links"],
                      ["theme", "palette", "Customize Liquid Glass", "Tune glass blur, saturation, radius & crimson glow"],
                    ] as [TabId, string, string, string][]
                  ).map(([id, icon, title, desc], i) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTab(id)}
                      style={{ "--lg-d": `${i * 60}ms` } as React.CSSProperties}
                      className="lg-enter group text-left p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-red-500/50 hover:bg-white/[0.06] transition"
                    >
                      <span className="inline-grid place-items-center w-8 h-8 rounded-xl bg-red-500/15 border border-red-400/25 text-red-300 mb-2.5 group-hover:scale-110 transition-transform">
                        <Icon name={icon} className="w-4 h-4" />
                      </span>
                      <p className="font-semibold text-sm text-white">{title}</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{desc}</p>
                    </button>
                  ))}
                </div>
              </LiquidCard>

              <LiquidCard tilt={false} className="p-6 space-y-4">
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
                {connecting ? (
                  <div className="space-y-2.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="lg-skeleton h-[52px]" />
                    ))}
                  </div>
                ) : !connected ? (
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
                      <li key={c.sha} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs hover:border-white/25 transition">
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
                    {!commits.length && (
                      <li className="text-xs text-zinc-500 py-4 text-center">No commits found on this branch yet.</li>
                    )}
                  </ul>
                )}
              </LiquidCard>
            </div>
          </div>
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
      </div>

      <Toasts items={toasts} />
    </section>
  );
}
