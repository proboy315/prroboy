# Launch status — 2026-11-27

**Decision: NO-GO for production replacement.** The source build is being repaired locally, but a release cannot be verified because this workspace has no Git history, no GitHub token, no Vercel token/project link and no deployment access. Nothing was pushed or deployed.

## Preview references

Only the suffixes `963e3e` and `2945f5` were supplied. Guessed hosts such as `https://963e3e.arena.site/` and `https://2945f5.arena.site/` return HTTP 400 (“There isn't a site hosted at this URL”), so those previews could not be inspected or used as a deployment target. No claim is made that this workspace is byte-identical to `963e3e`. The lighter external JS/CSS architecture from `2945f5` is already present in this workspace through the split-asset build and Vite manifest.

## Live production (read-only checks, 2026-11-27)

| Check | Result |
|---|---|
| `https://proboy.vercel.app/` | 200; title still “Shahan Ali \| Full-Stack Developer & Bot Architect”; asset `/assets/index-Zp4NBysK.js` |
| Remote commit `8bedbd9` source title | “Shahan Ali (PROBOY) \| Full-Stack & Frontend Developer” |
| `/services/frontend-development` | **404** |
| `/images/og-shahan-ali.jpg` | **404** (HTML content type) |
| `/sitemap.xml` | 200; **80** URLs; frontend service absent |
| `/proboy-md` | 200 |
| `/projects` | 200 |
| Unknown URL | 404 |

The production alias is **not serving commit 8bedbd9's intended title** (or this workspace's build), so production-alias confirmation fails. It is an older deployment. The failed preview build is consistent with production remaining on the previous successful deployment.

## Local production-style build

- `npm run build` (Vercel's build command) passes: `Prepared 88 route-specific HTML documents (production-style)`.
- 88 prerendered route documents; 84 sitemap entries.
- `tests/launch-http.mjs`: 88/88 route documents, 84 canonicals, 71 legacy HTML responses, 65 assets, 0 failures.
- `tests/launch-browser.mjs`: 126/126 browser checks, 0 critical errors.
- `npx tsc --noEmit`: exit 0.
- `npm run test:server`: 34/34 passed.
- Correct 404 for unknown URLs; no wildcard fallback.
- External fingerprinted JS/CSS; no inline application script beyond the intentional JSON-LD.
- OG card is a real 1200×630 JPEG; favicon set is present.
- No blocked visitor/session paths in `public/` or `dist/`; generated JSON scan found 0 non-empty sensitive values.
- Documented 24-category and five-service coverage remains in place.

### Validated automatic preservation of the failing remote build

A temporary clone of `8bedbd9` received this build pipeline. Its 15 flagged files were automatically moved to
`preserved-data/`, **15/15 SHA-256 hashes matched**, `public/` and `dist/` contained 0 blocked paths, and `npm run build`
exited **0** with 88 route documents. The temporary clone was deleted. Nothing was manually deleted or moved by the
owner, and no file contents were printed. This validates the code fix; the workspace has no push access, so it is not a
deployment.

## Release blockers

1. **No repository write access in this environment.** The workspace is not a Git repository; no credential helper,
   GitHub token, SSH key, `gh` CLI, Vercel CLI, `VERCEL_TOKEN` or `.vercel` project link exists. A commit, push and
   Vercel preview cannot be performed here.
2. **The remote commit lacks the required public assets** (`og-shahan-ali.jpg`, favicon PNGs). This workspace has them;
   they must be included when the repository changes are committed.
3. **Production remains an older deployment.** OG image and frontend service remain broken there.
4. **Live form delivery, social unfurl, Search Console/CrUX and AI citations** are not verified; no approved test
   recipient, social preview access or analytics credentials were supplied.

## Status

| Area | Status |
|---|---|
| Blocked-path identification | DONE |
| Automatic relocation to preserved-data/ (no deletion) | VERIFIED |
| Privacy guard fail-closed and path-only logging | VERIFIED |
| Local production-style build | VERIFIED |
| Local preview-style build (noindex) | VERIFIED |
| Generated output free of blocked paths | VERIFIED |
| Remote-clone build with real flagged files | VERIFIED (15/15 byte-identical, exit 0) |
| Commit/push remediation | BLOCKED (no repo write access) |
| Vercel preview build | BLOCKED (no Vercel access) |
| Production alias confirmation | BLOCKED; live alias verified to be an older build |
| Live frontend route / OG / sitemap | BLOCKED; currently failing in production |
