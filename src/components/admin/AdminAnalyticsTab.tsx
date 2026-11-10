import { useEffect, useState } from "react";
import {
  aggregateEvents,
  eventsToCsv,
  fetchEvents,
  fetchTrackingSettings,
  listEventFiles,
  purgeOldEvents,
  rebuildSummaryJson,
  saveTrackingSettings,
  testWriterToken,
} from "../../lib/analyticsStore";
import type { AnalyticsSummary, TopItem, TrackedEvent, TrackingSettings } from "../../lib/analyticsStore";
import { clearLocalQueue, getLocalQueue } from "../../lib/tracking";
import {
  changeVaultPassphrase,
  createVault,
  deleteVault,
  exportVaultBackup,
  hasVault,
  importVaultBackup,
  isVaultOpen,
  vaultFingerprint,
} from "../../lib/vault";
import { clearGitHubConfig, loadGitHubConfig } from "../../lib/githubApi";
import type { GitHubConfig } from "../../lib/githubApi";
import Icon from "../Icon";
import { LiquidButton, LiquidCard, LiquidPill } from "../LiquidGlass";

type Props = {
  cfg: GitHubConfig;
  connected: boolean;
  onToast: (type: "ok" | "err" | "info", msg: string) => void;
  onRepoChange: () => void;
};

function downloadFile(name: string, content: string, mime = "application/json") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 600);
}

function TopTable({ title, rows }: { title: string; rows: TopItem[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="rounded-xl bg-black/30 border border-white/10 p-4">
      <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">{title}</p>
      {rows.length === 0 && <p className="text-xs text-zinc-500">No data yet.</p>}
      <ul className="space-y-2">
        {rows.slice(0, 8).map((r) => (
          <li key={r.name}>
            <div className="flex justify-between gap-2 text-xs">
              <span className="truncate text-zinc-200" title={r.name}>
                {r.name}
              </span>
              <span className="font-mono text-zinc-400 shrink-0">{r.count}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-400"
                style={{ width: `${Math.max(3, (r.count / max) * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminAnalyticsTab({ cfg, connected, onToast, onRepoChange }: Props) {
  /* Tracking settings */
  const [tLoading, setTLoading] = useState(false);
  const [tSaving, setTSaving] = useState(false);
  const [tracking, setTracking] = useState<TrackingSettings | null>(null);
  const [writerInput, setWriterInput] = useState("");
  const [showWriter, setShowWriter] = useState(false);
  const [writerTest, setWriterTest] = useState<{ state: "idle" | "busy" | "ok" | "fail"; msg: string }>({
    state: "idle",
    msg: "",
  });

  /* Vault */
  const [vaultOn, setVaultOn] = useState(false);
  const [vaultOpenUi, setVaultOpenUi] = useState(false);
  const [fp, setFp] = useState("");
  const [vp1, setVp1] = useState("");
  const [vp2, setVp2] = useState("");
  const [legacyToken, setLegacyToken] = useState(false);

  /* Dashboard */
  const [dashLoading, setDashLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [sampleSize, setSampleSize] = useState(300);
  const [events, setEvents] = useState<TrackedEvent[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [filesTotal, setFilesTotal] = useState(0);
  const [purgeBefore, setPurgeBefore] = useState("");
  const [purging, setPurging] = useState(false);
  const [localCount, setLocalCount] = useState(0);

  const refreshVaultUi = () => {
    setVaultOn(hasVault());
    setVaultOpenUi(isVaultOpen());
    vaultFingerprint()
      .then(setFp)
      .catch(() => setFp(""));
  };

  const loadTracking = async () => {
    if (!connected) return;
    setTLoading(true);
    try {
      const { tracking: t } = await fetchTrackingSettings(cfg);
      setTracking(t);
      setWriterInput(t.writerToken || "");
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to load tracking config.");
    } finally {
      setTLoading(false);
    }
  };

  useEffect(() => {
    refreshVaultUi();
    try {
      setLegacyToken(Boolean(loadGitHubConfig().token));
    } catch {
      setLegacyToken(false);
    }
    setLocalCount(getLocalQueue().length);
    if (connected) void loadTracking();
  }, [connected, cfg.owner, cfg.repo, cfg.branch]);

  /* ---------------- Tracking controls ---------------- */

  const toggleTracking = async () => {
    if (!connected || !tracking) return;
    setTSaving(true);
    try {
      const next = await saveTrackingSettings(
        cfg,
        { enabled: !tracking.enabled },
        `analytics: ${!tracking.enabled ? "ENABLE" : "DISABLE"} visitor tracking via Admin`
      );
      setTracking(next);
      onToast("ok", next.enabled ? "Visitor analytics is now ON — redeploy picks it up live." : "Visitor analytics turned OFF.");
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to toggle tracking.");
    } finally {
      setTSaving(false);
    }
  };

  const saveTrackingFields = async () => {
    if (!connected || !tracking) return;
    setTSaving(true);
    try {
      const next = await saveTrackingSettings(cfg, {
        targetOwner: tracking.targetOwner.trim(),
        targetRepo: tracking.targetRepo.trim(),
        branch: tracking.branch.trim() || "main",
        dataDir: tracking.dataDir.trim() || "analytics/raw",
        sampleRate: Math.min(1, Math.max(0, Number(tracking.sampleRate) || 1)),
      });
      setTracking(next);
      onToast("ok", "Tracking target saved to info.json — redeploy to apply.");
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to save tracking settings.");
    } finally {
      setTSaving(false);
    }
  };

  const saveWriterToken = async () => {
    if (!connected) return;
    const ok = window.confirm(
      "The writer token is saved inside info.json, which ships inside your PUBLIC site bundle so visitors can log visits. Anyone can read it.\n\nUse a DEDICATED fine-grained token (single repo, Contents: Read & write only). Continue?"
    );
    if (!ok) return;
    setTSaving(true);
    try {
      const next = await saveTrackingSettings(cfg, { writerToken: writerInput.trim() }, "analytics: update writer token via Admin");
      setTracking(next);
      onToast("ok", "Writer token saved. Test it below, then redeploy.");
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to save writer token.");
    } finally {
      setTSaving(false);
    }
  };

  const runWriterTest = async () => {
    if (!tracking) return;
    const token = writerInput.trim() || tracking.writerToken;
    if (!token) {
      onToast("err", "Enter a writer token first.");
      return;
    }
    setWriterTest({ state: "busy", msg: "Writing + deleting a test file..." });
    try {
      await testWriterToken({
        owner: tracking.targetOwner,
        repo: tracking.targetRepo,
        branch: tracking.branch,
        dataDir: tracking.dataDir,
        token,
      });
      setWriterTest({ state: "ok", msg: "Writer token works — visits will auto-save to GitHub." });
    } catch (e) {
      setWriterTest({ state: "fail", msg: e instanceof Error ? e.message : "Writer test failed." });
    }
  };

  /* ---------------- Vault controls ---------------- */

  const sealVault = async () => {
    if (!connected || !cfg.token) {
      onToast("err", "Connect with your GitHub token first, then seal it into the vault.");
      return;
    }
    if (vp1 !== vp2) {
      onToast("err", "Passphrases do not match.");
      return;
    }
    try {
      await createVault(
        {
          owner: cfg.owner.trim(),
          repo: cfg.repo.trim(),
          branch: cfg.branch,
          token: cfg.token,
          remember: true,
          updatedAt: new Date().toISOString(),
        },
        vp1
      );
      clearGitHubConfig();
      setLegacyToken(false);
      setVp1("");
      setVp2("");
      refreshVaultUi();
      onToast("ok", "Login sealed with AES-256-GCM. Plain-text copy wiped from this browser.");
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Vault sealing failed.");
    }
  };

  const rotatePassphrase = async () => {
    try {
      await changeVaultPassphrase(vp1, vp2);
      setVp1("");
      setVp2("");
      refreshVaultUi();
      onToast("ok", "Vault passphrase changed.");
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Could not change passphrase.");
    }
  };

  const importBackup = async (file?: File) => {
    if (!file) return;
    try {
      const text = await file.text();
      importVaultBackup(text);
      refreshVaultUi();
      onToast("ok", "Vault backup imported — unlock it from the banner at the top.");
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Invalid backup file.");
    }
  };

  /* ---------------- Dashboard ---------------- */

  const loadDashboard = async () => {
    if (!connected || !tracking) return;
    setDashLoading(true);
    setProgress({ done: 0, total: 0 });
    try {
      const files = await listEventFiles(cfg, tracking.dataDir);
      setFilesTotal(files.length);
      const latest = files.slice(-Math.max(1, sampleSize)).map((f) => f.path);
      const ev = await fetchEvents(cfg, latest, (d, t) => setProgress({ done: d, total: t }));
      setEvents(ev);
      setSummary({ v: 1, kind: "proboy-analytics-summary", generatedAt: new Date().toISOString(), dataDir: tracking.dataDir, sample: { filesFound: files.length, filesRead: ev.length }, ...aggregateEvents(ev) });
      if (!ev.length) onToast("info", "No visit files found yet. Enable tracking + deploy, then visits will appear.");
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to load visit data.");
    } finally {
      setDashLoading(false);
    }
  };

  const rebuildSummary = async () => {
    if (!connected || !tracking) return;
    setDashLoading(true);
    try {
      const s = await rebuildSummaryJson(cfg, tracking.dataDir, sampleSize, (d, t) =>
        setProgress({ done: d, total: t })
      );
      setSummary(s);
      onToast("ok", `analytics/summary.json rebuilt from ${s.sample.filesRead} visits!`);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to rebuild summary.json.");
    } finally {
      setDashLoading(false);
    }
  };

  const runPurge = async () => {
    if (!connected || !tracking || !purgeBefore) return;
    const ok = window.confirm(`Delete ALL visit files before ${purgeBefore} from GitHub? This cannot be undone.`);
    if (!ok) return;
    setPurging(true);
    try {
      const removed = await purgeOldEvents(cfg, tracking.dataDir, purgeBefore, (d, t) =>
        setProgress({ done: d, total: t })
      );
      onToast("ok", `Purged ${removed} old visit file(s).`);
      await loadDashboard();
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Purge failed.");
    } finally {
      setPurging(false);
    }
  };

  const maxDay = summary?.perDay.reduce((m, d) => Math.max(m, d.count), 0) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <LiquidPill crimson>
              <Icon name={tracking?.enabled ? "eye" : "lock"} className="w-3.5 h-3.5" />
              Tracking {tracking?.enabled ? "ON" : "OFF"}
            </LiquidPill>
            <LiquidPill>
              <Icon name={vaultOn ? "shield" : "unlock"} className="w-3.5 h-3.5" />
              Vault {vaultOn ? (vaultOpenUi ? "open" : "locked") : "not created"}
            </LiquidPill>
            {tracking?.writerToken ? <LiquidPill>Writer token set</LiquidPill> : <LiquidPill>No writer token</LiquidPill>}
          </div>
          <h2 className="mt-2 text-2xl font-bold text-white">Visitor Analytics &amp; Encrypted Vault</h2>
          <p className="text-sm text-zinc-400">
            Turn tracking on, seal your GitHub login with AES-256 encryption, and read every visit from GitHub JSON.
          </p>
        </div>
        <LiquidButton onClick={loadTracking} disabled={!connected || tLoading}>
          <Icon name="refresh" className={`w-4 h-4 ${tLoading ? "animate-spin" : ""}`} />
          Reload Config
        </LiquidButton>
      </div>

      {/* Power switch + target */}
      <LiquidCard className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Analytics Power Switch</h3>
            <p className="text-xs text-zinc-400">
              Saved in <code className="text-zinc-200">info.json → analytics.tracking</code>. Vercel redeploys apply it.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTracking}
            disabled={!connected || !tracking || tSaving}
            aria-pressed={Boolean(tracking?.enabled)}
            className={`relative w-16 h-9 rounded-full border transition ${
              tracking?.enabled ? "bg-emerald-500/30 border-emerald-400/60" : "bg-white/10 border-white/20"
            }`}
          >
            <span
              className={`absolute top-1 w-7 h-7 rounded-full transition-all ${
                tracking?.enabled ? "left-8 bg-emerald-300" : "left-1 bg-zinc-400"
              }`}
            />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Target Owner</label>
            <input className="lg-input font-mono text-xs" value={tracking?.targetOwner || ""} onChange={(e) => tracking && setTracking({ ...tracking, targetOwner: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Target Repo</label>
            <input className="lg-input font-mono text-xs" value={tracking?.targetRepo || ""} onChange={(e) => tracking && setTracking({ ...tracking, targetRepo: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Branch</label>
            <input className="lg-input font-mono text-xs" value={tracking?.branch || ""} onChange={(e) => tracking && setTracking({ ...tracking, branch: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Data Folder</label>
            <input className="lg-input font-mono text-xs" value={tracking?.dataDir || ""} onChange={(e) => tracking && setTracking({ ...tracking, dataDir: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Sample Rate (0–1)</label>
            <input className="lg-input font-mono text-xs" value={tracking?.sampleRate ?? 1} onChange={(e) => tracking && setTracking({ ...tracking, sampleRate: Number(e.target.value) })} />
          </div>
        </div>
        <div className="flex justify-end">
          <LiquidButton variant="primary" onClick={saveTrackingFields} disabled={!connected || tSaving}>
            <Icon name="save" className="w-4 h-4" /> {tSaving ? "Saving..." : "Save Target Settings"}
          </LiquidButton>
        </div>

        {/* Writer token */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3.5 text-xs text-amber-100 leading-relaxed">
            <strong>Security note:</strong> the writer token ships inside your public site bundle so visitor browsers
            can save visits — anyone can read it. Create a <strong>separate fine-grained PAT</strong> (one repo only,{" "}
            <code>Contents: Read and write</code>), ideally pointing at a dedicated analytics-only repo. Rotate it if
            it ever leaks. Never paste your main admin token here.
          </div>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs text-zinc-400 mb-1.5">Public Writer Token (restricted PAT)</label>
              <div className="relative">
                <input type={showWriter ? "text" : "password"} className="lg-input font-mono text-xs pr-16" value={writerInput} onChange={(e) => setWriterInput(e.target.value)} placeholder="github_pat_..." />
                <button type="button" onClick={() => setShowWriter((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 hover:text-white px-2 py-1">
                  {showWriter ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <LiquidButton onClick={saveWriterToken} disabled={!connected || tSaving}>
              <Icon name="save" className="w-4 h-4" /> Save Token
            </LiquidButton>
            <LiquidButton onClick={runWriterTest} disabled={!connected || writerTest.state === "busy"}>
              <Icon name="check" className="w-4 h-4" /> {writerTest.state === "busy" ? "Testing..." : "Test Writer"}
            </LiquidButton>
          </div>
          {writerTest.state !== "idle" && (
            <p className={`text-xs ${writerTest.state === "ok" ? "text-emerald-300" : writerTest.state === "fail" ? "text-red-300" : "text-zinc-400"}`}>
              {writerTest.msg}
            </p>
          )}
        </div>
      </LiquidCard>

      {/* Encrypted vault */}
      <LiquidCard className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Encrypted Login Vault (AES-256-GCM + PBKDF2)</h3>
            <p className="text-xs text-zinc-400">
              Username, repo name, branch &amp; token are stored only as ciphertext in this browser.
            </p>
          </div>
          {fp && (
            <span className="font-mono text-[11px] text-zinc-400" title="SHA-256 hash of the stored ciphertext">
              vault hash: {fp.slice(0, 20)}…
            </span>
          )}
        </div>

        {legacyToken && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-100">
            A plain-text login was found in this browser. Seal it into the encrypted vault below — the plain copy is
            wiped automatically.
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">{vaultOn ? "Old passphrase" : "New vault passphrase (8+ chars)"}</label>
            <input type="password" className="lg-input" value={vp1} onChange={(e) => setVp1(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">{vaultOn ? "New passphrase" : "Confirm passphrase"}</label>
            <input type="password" className="lg-input" value={vp2} onChange={(e) => setVp2(e.target.value)} placeholder="••••••••" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!vaultOn ? (
            <LiquidButton variant="primary" onClick={sealVault} disabled={!connected}>
              <Icon name="lock" className="w-4 h-4" /> Encrypt &amp; Save My Login
            </LiquidButton>
          ) : (
            <LiquidButton variant="primary" onClick={rotatePassphrase}>
              <Icon name="key" className="w-4 h-4" /> Change Passphrase
            </LiquidButton>
          )}
          {vaultOn && (
            <>
              <LiquidButton onClick={() => downloadFile("proboy-vault-backup.json", exportVaultBackup())}>
                <Icon name="download" className="w-4 h-4" /> Export Backup
              </LiquidButton>
              <label className="lg-btn cursor-pointer">
                <Icon name="upload" className="w-4 h-4" /> Import Backup
                <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => { void importBackup(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              <LiquidButton
                onClick={() => {
                  if (window.confirm("Delete the encrypted vault from this browser? You will need the token to reconnect.")) {
                    deleteVault();
                    refreshVaultUi();
                    onToast("info", "Vault deleted from this browser.");
                  }
                }}
              >
                <Icon name="trash" className="w-4 h-4 text-red-400" /> Forget Vault
              </LiquidButton>
            </>
          )}
        </div>
      </LiquidCard>

      {/* Live dashboard */}
      <LiquidCard className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">Visit Intelligence Dashboard</h3>
            <p className="text-xs text-zinc-400">
              Reads per-visit JSON files from <code className="text-zinc-200">{tracking?.dataDir || "analytics/raw"}/</code> on GitHub.
              {filesTotal > 0 && <span> {filesTotal} file(s) found.</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="lg-input !w-auto text-xs" value={sampleSize} onChange={(e) => setSampleSize(Number(e.target.value))}>
              <option value={100}>Latest 100</option>
              <option value={300}>Latest 300</option>
              <option value={800}>Latest 800</option>
            </select>
            <LiquidButton variant="primary" onClick={loadDashboard} disabled={!connected || dashLoading}>
              <Icon name="chart" className="w-4 h-4" /> {dashLoading ? `Reading ${progress.done}/${progress.total}...` : "Load Visits"}
            </LiquidButton>
          </div>
        </div>

        {dashLoading && (
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 5}%` }} />
          </div>
        )}

        {summary && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Pageviews", value: String(summary.totalEvents) },
                { label: "Sessions", value: String(summary.uniqueSessions) },
                { label: "Active Days", value: String(summary.uniqueDays) },
                { label: "Last Visit", value: summary.lastSeen ? new Date(summary.lastSeen).toLocaleDateString() : "—" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-black/30 border border-white/10 p-4">
                  <p className="text-[11px] uppercase tracking-widest text-zinc-400">{s.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-white">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-black/30 border border-white/10 p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400 mb-3">Daily visits (last 30 days)</p>
              <div className="flex items-end gap-1 h-28">
                {summary.perDay.slice(-30).map((d) => (
                  <div key={d.day} title={`${d.day}: ${d.count}`} className="flex-1 rounded-t bg-gradient-to-t from-red-700 to-rose-400 min-w-[3px]" style={{ height: `${Math.max(4, (d.count / maxDay) * 100)}%` }} />
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <TopTable title="Top Pages" rows={summary.topPages} />
              <TopTable title="Top Referrers" rows={summary.topReferrers} />
              <TopTable title="Devices / Browsers" rows={[...summary.devices, ...summary.browsers].slice(0, 8)} />
              <TopTable title="OS / Sources" rows={[...summary.os, ...summary.utmSources].slice(0, 8)} />
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <LiquidButton onClick={rebuildSummary} disabled={!connected || dashLoading}>
                <Icon name="save" className="w-4 h-4" /> Rebuild summary.json
              </LiquidButton>
              <LiquidButton onClick={() => downloadFile(`proboy-visits-${Date.now()}.json`, JSON.stringify(events, null, 2))} disabled={!events.length}>
                <Icon name="download" className="w-4 h-4" /> Export JSON
              </LiquidButton>
              <LiquidButton onClick={() => downloadFile(`proboy-visits-${Date.now()}.csv`, eventsToCsv(events), "text/csv")} disabled={!events.length}>
                <Icon name="download" className="w-4 h-4" /> Export CSV
              </LiquidButton>
              <div className="flex items-center gap-2 ml-auto">
                <input type="date" className="lg-input !w-auto text-xs" value={purgeBefore} onChange={(e) => setPurgeBefore(e.target.value)} />
                <LiquidButton onClick={runPurge} disabled={!connected || purging || !purgeBefore}>
                  <Icon name="trash" className="w-4 h-4 text-red-400" /> {purging ? "Purging..." : "Purge Older"}
                </LiquidButton>
              </div>
            </div>
          </>
        )}
      </LiquidCard>

      {/* This device queue */}
      <LiquidCard className="p-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">This Device Queue ({localCount})</h3>
          <p className="text-xs text-zinc-400">Visits recorded in this browser waiting to upload (offline or local-only mode).</p>
        </div>
        <div className="flex gap-2">
          <LiquidButton onClick={() => { downloadFile(`proboy-local-queue-${Date.now()}.json`, JSON.stringify(getLocalQueue(), null, 2)); }} disabled={!localCount}>
            Export Queue
          </LiquidButton>
          <LiquidButton onClick={() => { clearLocalQueue(); setLocalCount(0); onToast("info", "Local queue cleared."); }} disabled={!localCount}>
            Clear
          </LiquidButton>
        </div>
      </LiquidCard>

      <details className="lg-surface p-5 text-xs text-zinc-300 leading-relaxed">
        <summary className="cursor-pointer font-semibold text-white">Setup guide: restricted writer token (2 minutes)</summary>
        <ol className="mt-3 space-y-2 list-decimal list-inside">
          <li>GitHub → Settings → Developer settings → Personal access tokens → <strong>Fine-grained tokens</strong> → Generate new token.</li>
          <li>Repository access → <strong>Only select repositories</strong> → choose your site repo (or a dedicated analytics-only repo).</li>
          <li>Permissions → Repository → <strong>Contents: Read and write</strong>. Nothing else.</li>
          <li>Set expiry (90 days recommended) and generate. Paste it in the Writer Token field above, Save, then <strong>Test Writer</strong>.</li>
          <li>Turn tracking ON, wait for Vercel to redeploy, then open the site in another browser — the visit appears here after <strong>Load Visits</strong>.</li>
        </ol>
      </details>
    </div>
  );
}
