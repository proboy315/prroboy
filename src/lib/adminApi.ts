// Thin client for the owner-only serverless API (/api/admin/*). Authentication is a server-issued
// HttpOnly cookie; nothing secret is ever stored in localStorage or readable by page scripts.
export type ApiResult<T = any> = { ok: boolean; status: number; data: T; unavailable?: boolean };

export async function api<T = any>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api${path}`, {
      method,
      credentials: "same-origin",
      headers: body === undefined ? { Accept: "application/json" } : { "Content-Type": "application/json", Accept: "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const isJson = (res.headers.get("content-type") || "").includes("json");
    if (!isJson) return { ok: false, status: res.status, data: {} as T, unavailable: true }; // e.g. static host / dev server without functions
    const data = (await res.json()) as T;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: {} as T, unavailable: true };
  }
}

export const errorText = (code?: string) =>
  ({
    invalid_credentials: "Wrong username or password.",
    invalid_code: "That verification code is not valid.",
    too_many_attempts: "Too many failed attempts. Try again in 15 minutes.",
    admin_not_configured: "Owner login is not configured on the server yet (see setup steps below).",
    storage_not_configured: "Private storage is not configured on the server yet.",
    not_configured: "The server is not configured yet.",
    bad_origin: "Request blocked (origin mismatch).",
    unauthorized: "Your session has ended. Please sign in again.",
    confirmation_required: "Confirmation required.",
    no_draft: "There is no saved draft to publish.",
    no_history: "There is no earlier version to restore.",
  } as Record<string, string>)[code || ""] || "Something went wrong. Please try again.";

export function fmtDate(ts?: number | null) {
  return ts ? new Date(ts).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
}
