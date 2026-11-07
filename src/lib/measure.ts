import { track as vercelTrack } from "@vercel/analytics";
import { info } from "./data";

// No query text, phone numbers or session data is sent as event properties.
export function track(name: string, properties?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  if (info.analytics?.vercelAnalytics !== false) vercelTrack(name, properties);
  const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (gtag) gtag("event", name, properties);
}