import { demos as baseDemos, type Demo } from "./data";

const STORAGE_KEY = "proboy_demo_control_room_v1";

export function loadWorkspaceDemos(): { items: Demo[]; hasOverrides: boolean } {
  if (typeof window === "undefined") {
    return { items: baseDemos, hasOverrides: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: baseDemos, hasOverrides: false };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { items: parsed as Demo[], hasOverrides: true };
    }
  } catch {
    // ignore corrupt localStorage
  }
  return { items: baseDemos, hasOverrides: false };
}

export function saveWorkspaceDemos(items: Demo[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("proboy-demos-updated"));
  } catch {
    // ignore quota errors
  }
}

export function resetWorkspaceDemos() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("proboy-demos-updated"));
  } catch {
    // ignore
  }
}
