# PROBOY Visitor Analytics Store

This folder is the append-only store for the portfolio's own visitor analytics.
It is written automatically by the public site (one tiny JSON file per visit)
and read/aggregated by the Admin Panel (`/admin` → Analytics & Vault).

## Layout

- `raw/YYYY-MM-DD/<session>__<timestamp>__<id>.json` — one file per pageview.
  Per-visit files are used (instead of a single shared file) so concurrent
  visitors never overwrite each other.
- `summary.json` — single rollup file rebuilt from the Admin dashboard
  (`Rebuild summary.json`). Totals, top pages, referrers, devices, daily counts.

## How visits get here

1. Admin enables tracking: `/admin` → **Analytics & Vault** → Tracking switch ON.
2. Admin creates a **restricted writer token** (fine-grained PAT, one repo,
   `Contents: Read and write`) and saves it in the tracking settings.
3. Every public pageview calls the GitHub Contents API and creates one file
   under `raw/`. No backend is required.

## Privacy

- Honors `Do-Not-Track`, skips `/admin` and localhost.
- Stores: path, timestamp, referrer, UTM tags, device/browser/OS family,
  screen size, language, timezone. No IPs, no fingerprints, no cookies
  beyond a random session id in the visitor's own browser.
