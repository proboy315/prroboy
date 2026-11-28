# Private-data build blocker — automatic preservation

Checked against GitHub commit `8bedbd96d2e637fc6e386fd49765e7b29dbf5f18` and this workspace on 2026-11-27.

## What was wrong

`scripts/build.mjs` aborted if `public/` contained legacy visitor/session/verification exports. The guard was correct,
but it only failed the build and told the owner to delete the files. The files are now preserved automatically instead.

## Exact blocked paths in commit 8bedbd9 (15)

- `public/connections.json`
- `public/otp.json`
- `public/sessions/index.json`
- `public/bot/ids.json`
- `public/bot/ahmad-trader-md/sessions.json`
- `public/bot/fahdii-md/sessions.json`
- `public/bot/fm-abdullah-md/sessions.json`
- `public/bot/muhammadzahid/sessions.json`
- `public/bot/proboy/sessions.json`
- `public/bot/rahman-md/sessions.json`
- `public/bot/rehman/sessions.json`
- `public/bot/saqib-md/sessions.json`
- `public/bot/saqib/sessions.json`
- `public/bot/team-zero-trace-intelligence/sessions.json`
- `public/bot/vehari-boy93/sessions.json`

No contents were opened for this report. No application source under `src/`, `server/`, `shared/`, `api/` or `scripts/`
reads them. The launch test expects their old public URLs to return HTTP 404.

## Are they generated during build/setup?

No generator was found. The files are legacy committed exports, not build artifacts. If an external bot writer recreates
them under `public/`, the build now relocates them automatically before publishing.

## Automatic build behaviour

Both entry points run the same path-only guard before Vite can copy `public/` into `dist/`:

1. `scripts/build.mjs` (the `npm run build` vehicle used by Vercel).
2. `privacyGuardPlugin()` in `vite.config.ts` (protects a direct `vite build`).

For every flagged path, `preserveBlockedPublicData()` in `scripts/private-paths.mjs`:

- validates the path stays inside `public/` (rejects traversal),
- creates the same relative path under `preserved-data/`, outside `public/` and `dist/`,
- moves the file with `rename`, preserving bytes and inode; a cross-device fallback copies first and removes the source
  only after verifying the copied byte count,
- refuses to overwrite an existing preserved file; a second copy gets a `.preserved-<timestamp>` suffix,
- removes only empty parent directories, never non-empty ones,
- confirms no flagged path remains in `public/`, and
- returns path and byte-count records only. It never returns file contents.

The build then checks `dist/` again after bundling. `preserved-data/` is excluded in `.vercelignore`; the Vercel output
directory remains `dist`. Nothing is deleted.

## Optional diagnostic command

The old `scripts/prune-private-public.mjs` command now preserves files instead of deleting them. It is not required:

```sh
node scripts/prune-private-public.mjs            # dry run, lists paths and destinations
node scripts/prune-private-public.mjs --apply    # preserve now; build does this automatically
node scripts/prune-private-public.mjs --check    # exit 1 if public/ still has flags
npm run build
```

## Verification

- Current workspace: `npx tsc --noEmit` exit 0; `npm run build` exit 0; `publicBlockedPaths=[]`; `distBlockedPaths=[]`.
- A direct `npx vite build` also ran the Vite privacy plugin and left `distBlockedPaths=[]`.
- `tests/privacy-preserve.mjs`: a synthetic fixture set is moved, all bytes compare equal, `public/` becomes empty, and no
  fixture is lost.
- Temporary clone of the actual failing commit `8bedbd9` with this pipeline installed: **15 blocked files moved,
  15/15 SHA-256 hashes matched after the move, 0 blocked paths remained in public/, 0 in dist/, `npm run build` exit 0,
  88 route documents produced.** The temporary clone was deleted.
- `tests/launch-http.mjs` expects `/connections.json`, `/otp.json` and `/sessions/index.json` to return 404; the checks pass.

## What remains blocked

No commit, push or Vercel preview was performed because this workspace has no Git repository, GitHub token, Vercel token,
Vercel CLI or project link. The live alias remains an older deployment. See `docs/LAUNCH-STATUS.md`.

If any preserved session or OTP material was ever live, revoke/rotate it and purge it from Git history and host caches.
Moving the file protects the deployed site; it does not invalidate a credential that has already been exposed.
