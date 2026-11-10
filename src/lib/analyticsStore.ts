/**
 * Admin-side analytics engine.
 * Reads per-visit JSON files from GitHub (analytics/raw/...), aggregates
 * them into dashboard stats, maintains the single rollup file
 * analytics/summary.json, and supports CSV/JSON export + retention purge.
 */

import {
  deleteRepoFile,
  encodeBase64Utf8,
  getRepoFile,
  getRepoTree,
  putRepoFile,
} from "./githubApi";
import type { GitHubConfig } from "./githubApi";
import type { QueuedEvent } from "./tracking";
import type { TrackingSettings } from "./tracking";

export type { TrackingSettings };
export type TrackedEvent = QueuedEvent;

export type TrackingPatch = Partial<TrackingSettings>;

export type TopItem = { name: string; count: number };
export type DayCount = { day: string; count: number };

export type AnalyticsAggregate = {
  totalEvents: number;
  uniqueSessions: number;
  uniqueDays: number;
  firstSeen: string;
  lastSeen: string;
  perDay: DayCount[];
  topPages: TopItem[];
  topReferrers: TopItem[];
  devices: TopItem[];
  browsers: TopItem[];
  os: TopItem[];
  utmSources: TopItem[];
};

export type AnalyticsSummary = AnalyticsAggregate & {
  v: 1;
  kind: "proboy-analytics-summary";
  generatedAt: string;
  dataDir: string;
  sample: { filesFound: number; filesRead: number };
};

const cleanDir = (d: string) => d.replace(/^\/+|\/+$/g, "") || "analytics/raw";

function contentsUrl(owner: string, repo: string, filePath: string): string {
  const encoded = filePath
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encoded}`;
}

/* ------------------------------------------------------------------ */
/* Tracking config (lives in src/data/info.json -> analytics.tracking) */
/* ------------------------------------------------------------------ */

export async function fetchTrackingSettings(
  cfg: GitHubConfig
): Promise<{ tracking: TrackingSettings; sha: string | undefined }> {
  const f = await getRepoFile(cfg, "src/data/info.json");
  const obj = JSON.parse(f.content) as {
    analytics?: { tracking?: Partial<TrackingSettings> };
  };
  return {
    tracking: {
      enabled: false,
      targetOwner: cfg.owner.trim(),
      targetRepo: cfg.repo.trim(),
      branch: cfg.branch,
      dataDir: "analytics/raw",
      writerToken: "",
      sampleRate: 1,
      ...(obj.analytics?.tracking || {}),
    },
    sha: f.sha,
  };
}

export async function saveTrackingSettings(
  cfg: GitHubConfig,
  patch: TrackingPatch,
  message?: string
): Promise<TrackingSettings> {
  const f = await getRepoFile(cfg, "src/data/info.json");
  const obj = JSON.parse(f.content) as {
    analytics?: { tracking?: Partial<TrackingSettings> };
  };
  obj.analytics = obj.analytics || {};
  obj.analytics.tracking = { ...(obj.analytics.tracking || {}), ...patch };
  await putRepoFile(cfg, "src/data/info.json", JSON.stringify(obj, null, 2) + "\n", message || "Update visitor analytics tracking config via Admin", {
    sha: f.sha,
  });
  return obj.analytics.tracking as TrackingSettings;
}

/* ------------------------------------------------------------------ */
/* Writer-token health check (uses the PUBLIC writer token, not admin) */
/* ------------------------------------------------------------------ */

export async function testWriterToken(args: {
  owner: string;
  repo: string;
  branch: string;
  dataDir: string;
  token: string;
}): Promise<void> {
  if (!args.token) throw new Error("Writer token is empty.");
  const path = `${cleanDir(args.dataDir)}/_healthcheck.json`;
  const url = contentsUrl(args.owner.trim(), args.repo.trim(), path);
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${args.token.trim()}`,
  };
  const put = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      message: "analytics: writer healthcheck",
      content: encodeBase64Utf8(JSON.stringify({ ok: true, at: new Date().toISOString() })),
      branch: args.branch,
    }),
  });
  if (!put.ok) {
    throw new Error(
      `Write failed (HTTP ${put.status}). Check token scopes (Contents: Read & write), repo name and branch.`
    );
  }
  try {
    const j = (await put.json()) as { content?: { sha?: string } };
    await fetch(url, {
      method: "DELETE",
      headers,
      body: JSON.stringify({
        message: "analytics: remove healthcheck",
        sha: j.content?.sha,
        branch: args.branch,
      }),
    });
  } catch {
    // healthcheck file left behind is harmless
  }
}

/* ------------------------------------------------------------------ */
/* Reading + aggregating visit files                                   */
/* ------------------------------------------------------------------ */

export type EventFileRef = { path: string; sha: string };

export async function listEventFiles(cfg: GitHubConfig, dataDir: string): Promise<EventFileRef[]> {
  const tree = await getRepoTree(cfg);
  const prefix = `${cleanDir(dataDir)}/`;
  const files = tree
    .filter((t) => t.type === "blob" && t.path.startsWith(prefix) && t.path.endsWith(".json"))
    .filter((t) => !t.path.endsWith("_healthcheck.json"))
    .map((t) => ({ path: t.path, sha: t.sha }));
  files.sort((a, b) => (a.path < b.path ? -1 : 1));
  return files;
}

export async function fetchEvents(
  cfg: GitHubConfig,
  paths: string[],
  onProgress?: (done: number, total: number) => void
): Promise<TrackedEvent[]> {
  const out: TrackedEvent[] = [];
  const queue = [...paths];
  const workers = Array.from({ length: 6 }, async () => {
    while (queue.length > 0) {
      const p = queue.shift() as string;
      try {
        const f = await getRepoFile(cfg, p);
        const ev = JSON.parse(f.content) as TrackedEvent;
        if (ev && typeof ev.ts === "number" && typeof ev.path === "string") out.push(ev);
      } catch {
        // skip unreadable files
      }
      onProgress?.(paths.length - queue.length, paths.length);
    }
  });
  await Promise.all(workers);
  return out.sort((a, b) => a.ts - b.ts);
}

function topify(values: string[], limit = 12): TopItem[] {
  const counts = new Map<string, number>();
  values.forEach((v) => {
    const key = (v || "(unknown)").slice(0, 120) || "(unknown)";
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function referrerHost(ref: string): string {
  if (!ref) return "(direct)";
  try {
    const u = new URL(ref);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "(direct)";
  }
}

export function aggregateEvents(events: TrackedEvent[]): AnalyticsAggregate {
  const sessions = new Set(events.map((e) => e.sid));
  const perDayMap = new Map<string, number>();
  events.forEach((e) => {
    const day = (e.iso || "").slice(0, 10) || "unknown";
    perDayMap.set(day, (perDayMap.get(day) || 0) + 1);
  });
  const perDay = [...perDayMap.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => (a.day < b.day ? -1 : 1));
  return {
    totalEvents: events.length,
    uniqueSessions: sessions.size,
    uniqueDays: perDayMap.size,
    firstSeen: events.length ? events[0].iso : "",
    lastSeen: events.length ? events[events.length - 1].iso : "",
    perDay,
    topPages: topify(events.map((e) => e.path)),
    topReferrers: topify(events.map((e) => referrerHost(e.referrer))),
    devices: topify(events.map((e) => e.device)),
    browsers: topify(events.map((e) => e.browser)),
    os: topify(events.map((e) => e.os)),
    utmSources: topify(events.flatMap((e) => Object.values(e.utm || {}))),
  };
}

export async function rebuildSummaryJson(
  cfg: GitHubConfig,
  dataDir: string,
  sampleLimit: number,
  onProgress?: (done: number, total: number) => void
): Promise<AnalyticsSummary> {
  const files = await listEventFiles(cfg, dataDir);
  const latest = files.slice(-Math.max(1, sampleLimit)).map((f) => f.path);
  const events = await fetchEvents(cfg, latest, onProgress);
  const agg = aggregateEvents(events);
  const summary: AnalyticsSummary = {
    v: 1,
    kind: "proboy-analytics-summary",
    generatedAt: new Date().toISOString(),
    dataDir: cleanDir(dataDir),
    sample: { filesFound: files.length, filesRead: events.length },
    ...agg,
  };
  await putRepoFile(
    cfg,
    "analytics/summary.json",
    JSON.stringify(summary, null, 2) + "\n",
    `analytics: rebuild summary.json (${events.length} visits) via Admin`
  );
  return summary;
}

/* ------------------------------------------------------------------ */
/* Export + retention                                                  */
/* ------------------------------------------------------------------ */

const csvCell = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export function eventsToCsv(events: TrackedEvent[]): string {
  const header = ["iso", "path", "title", "referrer", "utm", "device", "browser", "os", "screen", "lang", "tz", "session"];
  const lines = [header.join(",")];
  events.forEach((e) => {
    lines.push(
      [
        e.iso,
        e.path,
        e.title || "",
        e.referrer || "",
        Object.entries(e.utm || {})
          .map(([k, v]) => `${k}=${v}`)
          .join("|"),
        e.device,
        e.browser,
        e.os,
        e.screen || "",
        e.lang || "",
        e.tz || "",
        e.sid,
      ]
        .map(csvCell)
        .join(",")
    );
  });
  return lines.join("\n");
}

function dayOfFile(path: string): string {
  const seg = path.split("/").find((s) => /^\d{4}-\d{2}-\d{2}$/.test(s));
  return seg || "";
}

export async function purgeOldEvents(
  cfg: GitHubConfig,
  dataDir: string,
  beforeDay: string,
  onProgress?: (done: number, total: number) => void
): Promise<number> {
  const files = await listEventFiles(cfg, dataDir);
  const targets = files.filter((f) => dayOfFile(f.path) && dayOfFile(f.path) < beforeDay).slice(0, 300);
  let removed = 0;
  for (const t of targets) {
    try {
      await deleteRepoFile(cfg, t.path, t.sha, `analytics: purge old visit ${t.path} via Admin`);
      removed++;
    } catch {
      // keep going
    }
    onProgress?.(removed, targets.length);
  }
  return removed;
}
