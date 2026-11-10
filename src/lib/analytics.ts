// PROBOY local-first visitor analytics.
// Every page view on the public site is recorded in THIS browser
// (no cookies, no fingerprinting — just random IDs). The Admin
// dashboard reads the same store. Optionally forward events to a
// custom endpoint (Settings → Analytics endpoint) for multi-device.

export type VisitEvent = {
  id: string;
  visitorId: string;
  sessionId: string;
  ts: number;
  path: string;
  referrer: string;
  source: string;
  medium: string;
  campaign: string;
  lang: string;
  screen: string;
  device: "mobile" | "tablet" | "desktop";
  ua: string;
};

const EVENTS_KEY = "proboy_visit_events_v2";
const VISITOR_KEY = "proboy_visitor_id_v2";
const SESSION_KEY = "proboy_session_id_v2";
const SESSION_TS_KEY = "proboy_session_ts_v2";
const ENDPOINT_KEY = "proboy_analytics_endpoint_v1";
const MAX_EVENTS = 1200;
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, val: string) {
  try {
    window.localStorage.setItem(key, val);
  } catch {
    // ignore (private mode)
  }
}

function rid(prefix: string): string {
  try {
    const a = new Uint8Array(9);
    window.crypto.getRandomValues(a);
    return (
      prefix +
      Array.from(a)
        .map((n) => n.toString(36).padStart(2, "0"))
        .join("")
        .slice(0, 12) +
      Date.now().toString(36)
    );
  } catch {
    return prefix + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  let id = safeGet(VISITOR_KEY);
  if (!id) {
    id = rid("v_");
    safeSet(VISITOR_KEY, id);
  }
  return id;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let sid = window.sessionStorage.getItem(SESSION_KEY);
    const tsRaw = window.sessionStorage.getItem(SESSION_TS_KEY);
    const last = tsRaw ? Number(tsRaw) : 0;
    if (!sid || Date.now() - last > SESSION_TIMEOUT_MS) {
      sid = rid("s_");
      window.sessionStorage.setItem(SESSION_KEY, sid);
    }
    window.sessionStorage.setItem(SESSION_TS_KEY, String(Date.now()));
    return sid;
  } catch {
    return rid("s_");
  }
}

function detectDevice(): VisitEvent["device"] {
  try {
    const ua = navigator.userAgent || "";
    if (/tablet|ipad/i.test(ua)) return "tablet";
    if (/mobi|android|iphone|ipod/i.test(ua)) return "mobile";
    if (window.innerWidth < 768) return "mobile";
    return "desktop";
  } catch {
    return "desktop";
  }
}

export function getAnalyticsEndpoint(): string {
  if (typeof window === "undefined") return "";
  return safeGet(ENDPOINT_KEY) || "";
}

export function setAnalyticsEndpoint(url: string) {
  safeSet(ENDPOINT_KEY, url.trim());
}

export function readEvents(): VisitEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EVENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as VisitEvent[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: VisitEvent[]) {
  try {
    window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // storage full — keep only the tail
    try {
      window.localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-300)));
    } catch {
      // ignore
    }
  }
}

export function clearEvents() {
  try {
    window.localStorage.removeItem(EVENTS_KEY);
  } catch {
    // ignore
  }
}

export function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  try {
    if (path.startsWith("/admin")) return; // never track the private panel itself
    const url = new URL(window.location.href);
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const ev: VisitEvent = {
      id: rid("e_"),
      visitorId,
      sessionId,
      ts: Date.now(),
      path: path === "/" ? "/" : path.replace(/\/$/, "") || "/",
      referrer: document.referrer || "",
      source: url.searchParams.get("utm_source") || "",
      medium: url.searchParams.get("utm_medium") || "",
      campaign: url.searchParams.get("utm_campaign") || "",
      lang: navigator.language || "",
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      device: detectDevice(),
      ua: (navigator.userAgent || "").slice(0, 160),
    };
    const events = readEvents();
    events.push(ev);
    writeEvents(events);

    // Optional server forward (fire & forget)
    const endpoint = getAnalyticsEndpoint();
    if (endpoint && /^https?:\/\//i.test(endpoint)) {
      const payload = JSON.stringify({ ...ev, site: window.location.host });
      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, payload);
        } else {
          fetch(endpoint, { method: "POST", mode: "no-cors", body: payload }).catch(() => {});
        }
      } catch {
        // ignore
      }
    }
  } catch {
    // analytics must never break the site
  }
}

export type AnalyticsStats = {
  totalViews: number;
  uniqueVisitors: number;
  sessions: number;
  todayViews: number;
  onlineNow: number;
  topPaths: { path: string; views: number }[];
  daily: { label: string; views: number }[];
  referrers: { ref: string; views: number }[];
  devices: { mobile: number; tablet: number; desktop: number };
};

export function getStats(): AnalyticsStats {
  const events = readEvents();
  const now = Date.now();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const visitors = new Set(events.map((e) => e.visitorId));
  const sessions = new Set(events.map((e) => e.sessionId));
  const todayViews = events.filter((e) => e.ts >= dayStart.getTime()).length;
  const onlineNow = new Set(events.filter((e) => now - e.ts < 5 * 60 * 1000).map((e) => e.sessionId)).size;

  const pathMap = new Map<string, number>();
  for (const e of events) pathMap.set(e.path, (pathMap.get(e.path) || 0) + 1);
  const topPaths = [...pathMap.entries()]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  const daily: AnalyticsStats["daily"] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const views = events.filter((e) => e.ts >= d.getTime() && e.ts < next.getTime()).length;
    daily.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      views,
    });
  }

  const refMap = new Map<string, number>();
  for (const e of events) {
    let key = "Direct / typed";
    if (e.source) key = `${e.source}${e.medium ? ` (${e.medium})` : ""}`;
    else if (e.referrer) {
      try {
        key = new URL(e.referrer).hostname.replace(/^www\./, "");
      } catch {
        key = e.referrer.slice(0, 32);
      }
    }
    refMap.set(key, (refMap.get(key) || 0) + 1);
  }
  const referrers = [...refMap.entries()]
    .map(([ref, views]) => ({ ref, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  const devices = { mobile: 0, tablet: 0, desktop: 0 };
  for (const e of events) devices[e.device] = (devices[e.device] || 0) + 1;

  return {
    totalViews: events.length,
    uniqueVisitors: visitors.size,
    sessions: sessions.size,
    todayViews,
    onlineNow,
    topPaths,
    daily,
    referrers,
    devices,
  };
}

export function getRecentActivity(limit = 25): VisitEvent[] {
  return readEvents()
    .slice()
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit);
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}
