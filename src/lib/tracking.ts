/**
 * PROBOY public visitor tracker.
 * Runs on every public pageview. When tracking is enabled in
 * info.json -> analytics.tracking, each visit is queued locally and
 * flushed to GitHub as a tiny per-visit JSON file:
 *
 *   analytics/raw/YYYY-MM-DD/<session>__<timestamp>__<id>.json
 *
 * Per-visit files (instead of one shared file) mean concurrent visitors
 * never overwrite each other. The Admin "Analytics & Vault" tab aggregates
 * them later into analytics/summary.json + charts.
 *
 * Privacy: honors Do-Not-Track, never collects IPs or fingerprints,
 * skips /admin and localhost.
 */

import { encodeBase64Utf8 } from "./githubApi";
import { info } from "./data";

export type TrackingSettings = {
  enabled: boolean;
  targetOwner: string;
  targetRepo: string;
  branch: string;
  dataDir: string;
  writerToken: string;
  sampleRate: number;
};

export type QueuedEvent = {
  v: 1;
  qid: string;
  sid: string;
  ts: number;
  iso: string;
  path: string;
  title: string;
  referrer: string;
  utm: Record<string, string>;
  device: string;
  browser: string;
  os: string;
  screen: string;
  lang: string;
  tz: string;
};

const QUEUE_KEY = "proboy_analytics_queue_v1";
const SID_KEY = "proboy_analytics_sid_v1";
const WRITER_BAD_KEY = "proboy_analytics_writer_bad_v1";
const MAX_QUEUE = 200;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export function getTrackingSettings(): TrackingSettings | null {
  try {
    const t = (info as unknown as { analytics?: { tracking?: Partial<TrackingSettings> } }).analytics
      ?.tracking;
    if (!t || t.enabled !== true) return null;
    if (!t.targetOwner || !t.targetRepo) return null;
    if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return null;
    return {
      enabled: true,
      targetOwner: String(t.targetOwner),
      targetRepo: String(t.targetRepo),
      branch: String(t.branch || "main"),
      dataDir: String(t.dataDir || "analytics/raw").replace(/^\/+|\/+$/g, ""),
      writerToken: String(t.writerToken || ""),
      sampleRate: Math.min(1, Math.max(0, Number(t.sampleRate ?? 1) || 0)),
    };
  } catch {
    return null;
  }
}

function safeUuid(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function loadQueue(): QueuedEvent[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveQueue(q: QueuedEvent[]) {
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-MAX_QUEUE)));
  } catch {
    // storage full / private mode — drop silently
  }
}

export function getLocalQueue(): QueuedEvent[] {
  if (typeof window === "undefined") return [];
  return loadQueue();
}

export function clearLocalQueue() {
  try {
    window.localStorage.removeItem(QUEUE_KEY);
  } catch {
    // ignore
  }
}

function getSessionId(): string {
  try {
    const now = Date.now();
    const raw = window.localStorage.getItem(SID_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { sid: string; last: number };
      if (parsed?.sid && now - (parsed.last || 0) < SESSION_TIMEOUT_MS) {
        window.localStorage.setItem(SID_KEY, JSON.stringify({ ...parsed, last: now }));
        return parsed.sid;
      }
    }
    const sid = safeUuid();
    window.localStorage.setItem(SID_KEY, JSON.stringify({ sid, started: now, last: now }));
    return sid;
  } catch {
    return `mem-${safeUuid()}`;
  }
}

function deviceInfo(): { device: string; browser: string; os: string } {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const mobile = /Android|iPhone|iPod|Mobile/i.test(ua);
  const tablet = /iPad|Tablet/i.test(ua) && !/Mobile/i.test(ua);
  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\//i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";
  let os = "Other";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  return { device: tablet ? "Tablet" : mobile ? "Mobile" : "Desktop", browser, os };
}

function collectUtm(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const params = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "ref"].forEach((k) => {
      const v = params.get(k);
      if (v) out[k] = v.slice(0, 80);
    });
  } catch {
    // ignore
  }
  return out;
}

function contentsUrl(owner: string, repo: string, filePath: string): string {
  const encoded = filePath
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encoded}`;
}

let flushing = false;
let hideListenerAttached = false;

async function flushQueue(s: TrackingSettings) {
  if (flushing || typeof window === "undefined") return;
  if (!s.writerToken) return; // local-only mode: queue stays for manual export
  try {
    if (window.sessionStorage.getItem(WRITER_BAD_KEY)) return;
  } catch {
    // ignore
  }
  flushing = true;
  try {
    const queue = loadQueue();
    if (!queue.length) return;
    const d = new Date();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    for (const ev of queue.slice(0, 25)) {
      const filePath = `${s.dataDir}/${day}/${ev.sid}__${String(ev.ts).padStart(13, "0")}__${ev.qid}.json`;
      try {
        const res = await fetch(contentsUrl(s.targetOwner, s.targetRepo, filePath), {
          method: "PUT",
          mode: "cors",
          keepalive: true,
          headers: {
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${s.writerToken}`,
          },
          body: JSON.stringify({
            message: `analytics: visit ${day} ${ev.path}`,
            content: encodeBase64Utf8(JSON.stringify(ev)),
            branch: s.branch,
          }),
        });
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          try {
            window.sessionStorage.setItem(WRITER_BAD_KEY, "1");
          } catch {
            // ignore
          }
          break;
        }
        if (res.ok || res.status === 422) {
          saveQueue(loadQueue().filter((q) => q.qid !== ev.qid));
        } else {
          break;
        }
      } catch {
        break;
      }
    }
  } finally {
    flushing = false;
  }
}

/**
 * Call on every SPA route change (and first load). Records one visit event
 * per pageview and schedules a background flush to GitHub.
 */
export function trackRouteChange(path: string) {
  if (typeof window === "undefined") return;
  try {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return;
  } catch {
    return;
  }
  if (path === "/admin" || path.startsWith("/admin/")) return;

  const s = getTrackingSettings();
  if (!s) return;
  if (s.sampleRate < 1 && Math.random() > s.sampleRate) return;

  try {
    const dev = deviceInfo();
    const now = Date.now();
    const ev: QueuedEvent = {
      v: 1,
      qid: safeUuid(),
      sid: getSessionId(),
      ts: now,
      iso: new Date(now).toISOString(),
      path: path === "/" ? "/" : path.replace(/\/$/, ""),
      title: String(document.title || "").slice(0, 140),
      referrer: String(document.referrer || "").slice(0, 300),
      utm: collectUtm(),
      device: dev.device,
      browser: dev.browser,
      os: dev.os,
      screen:
        typeof window.screen !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "",
      lang: String(navigator.language || ""),
      tz: (() => {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        } catch {
          return "";
        }
      })(),
    };
    const q = loadQueue();
    q.push(ev);
    saveQueue(q);
    void flushQueue(s);

    if (!hideListenerAttached) {
      hideListenerAttached = true;
      const retry = () => {
        const live = getTrackingSettings();
        if (live) void flushQueue(live);
      };
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") retry();
      });
      window.addEventListener("pagehide", retry);
    }
  } catch {
    // analytics must never break the site
  }
}
