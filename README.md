# Shahan Ali / PROBOY Portfolio

## Privacy guard and preserved data

`npm run build` now **preserves** flagged visitor/session/verification files automatically. Before Vite runs, it moves
these paths out of `public/` into `preserved-data/` without altering their bytes:

- `public/sessions/**`
- `public/connections.json`
- `public/otp.json`
- `public/bot/ids.json`
- `public/bot/*/sessions.json`

Nothing is deleted, and no file contents are read or printed. `preserved-data/` is outside `public/` and outside the
deployed `dist/` output. Both `scripts/build.mjs` and the Vite privacy plugin perform this check, so a direct
`vite build` is also protected. The build fails if a file cannot be moved or if `dist/` still contains a flagged path.

`scripts/private-paths.mjs` is the single path-only guard. `scripts/prune-private-public.mjs` is now an optional
compatibility command that preserves bytes rather than deleting them; the normal build needs no manual step:

```sh
node scripts/prune-private-public.mjs            # dry run, lists paths and destinations
node scripts/prune-private-public.mjs --apply    # preserve now (build does this automatically)
node scripts/prune-private-public.mjs --check    # confirm public/ is clean
```

Do not copy these paths back into `public/`, `dist/`, a static host or a public remote. If any session or OTP material
was live, revoke/rotate it and purge it from Git history and host caches as well.


React, TypeScript, Vite and Tailwind portfolio. Public pages are prerendered; the optional Node.js serverless API powers site controls and aggregate analytics with private storage.

## Commands
- `npm ci`, `npm run dev`, and `npm run build` (production-style `dist/`).
- `npm run preview -- --port 4180` serves the built files over HTTP with clean URLs and a real 404. Vite's development server is not a release check.
- `npm run build -- --preview` adds `noindex, nofollow` to generated documents and omits the sitemap. Vercel and Netlify also use this behavior for nonproduction builds. The canonical origin remains `https://proboy.vercel.app`.

## Content (src/data/)
| File | Purpose |
|---|---|
| `info.json` | Name, brand, titles, bio, contact, socials (empty `url` = hidden), stats, services, skills, nav, SEO, `siteUrl`, `resume`, `contactForm.endpoint`, `analytics`, `introAnimation` |
| `projects.json` | `{ slug, title, featured, category, summary, description[], features[], technologies[], image, screenshots[], repo, demo, creator, year }` → `/projects/<slug>` |
| `showcase.json` | `{ slug, title, category, description, technologies[], thumbnail, preview, status: "planned"\|"live" }` → `/showcase/<slug>` (only `live` items are indexed) |
| `images.json` | `[{ src, alt, caption, category, order, width, height }]` → Gallery + lightbox |
| `editorial.ts` | Published, source-checked blog articles; unpublished roadmap lives in `docs/PHASE3-EDITORIAL.md` |
| `botDocs.ts` | 30 ProBoy-MD documentation chapters audited against a pinned repository commit |

Items missing a title/src are skipped; duplicate slugs are logged and skipped; missing images get a branded fallback.

## Intro animation
Put `progress-0.png` … `progress-299.png` and `audio.mp3` in `public/intro-animation/`.
Config: `info.json → introAnimation` (`directory`, `frameCount`, `fps`, `policy`: `session` | `once` | `always` | `never`, `maxWaitMs`).
Frames are requested by numeric index. Playback follows the audio clock when the browser allows audio, otherwise a timer. Esc / "Skip intro" exits. If frame 0 is missing, the intro is skipped automatically.

## Deploy + Google
Do not promote this candidate until the release gate in `docs/LAUNCH-VERIFICATION.md` passes on the authorized host. Use Vercel's Vite preset or the supplied Netlify configuration, build with `npm run build`, and publish `dist/`, not `public/`. Confirm a protected staging deployment first. After an approved production release, verify the canonical domain and its actual sitemap and social card before submitting a sitemap to search engines.

## Contact form
Visitors can choose between submitting via the external `proboy-contact` API relay (`https://proboy-contact.vercel.app/`, which requires email and phone), composing an Email Only draft (`mailto:` with phone optional), or launching WhatsApp Direct (with email optional).

## Hero portrait
The published PROBOY portrait is already present. The homepage uses responsive AVIF/WebP with a JPEG fallback, matching preload and reserved dimensions.

Use **Select portrait** or drop an image onto the hero to preview the supplied photo. It stays in this browser through IndexedDB; it is not uploaded and does not appear for other visitors. The hero uses the original image, with only a CSS edge fade and soft shadow. There is no photo card, rounded border or oval crop.

To publish the exact photo, save the original file locally and run:

```sh
node scripts/set-portrait.mjs path/to/your-original-photo.jpg
npm run build
```

The importer requires ImageMagick `identify`, preserves the original bytes under a fingerprinted filename, and records the image dimensions. The share card is separate. A configured portrait takes precedence over local previews; a replacement filename never selects the prior portrait's derivatives.

On mobile the artwork precedes the availability label, greeting and heading. The detailed setup and limitations are in `docs/PORTRAIT.md`.

## Header and sidebar
The header, hero and rail use `--header-height` from `src/index.css`. The rail starts below the fixed header and ends above the viewport bottom. Its links scroll internally on short displays while the collapse control stays visible. Tooltips sit outside the scrolling container.

Below 1100px, the mobile drawer replaces the desktop navigation and sidebar. Its list scrolls independently; the close control and contact action stay visible. Focus returns to the opener on Escape. The rest of the page is inert while it is open.

## Intro animation
Put `progress-0.png` … `progress-299.png` and `audio.mp3` in `public/intro-animation/`.
Config: `info.json → introAnimation`. The current policy is `session` (`always`, `once` or `never` also work). A build without the first frame does not load the intro module. Deep links and reduced-motion visitors skip it.
It buffers the first frames, then starts on its own — there is no start button, only a small Skip. Frames are requested by numeric index and the canvas uses `object-contain`, so nothing is cropped.
Browsers block sound until a visitor interacts with the page, so if autoplay with audio is refused the animation still plays and a small speaker button appears to turn sound on. Visitors who ask for reduced motion skip the intro.

## Verification
The hero and navigation were tested in Chromium at eleven desktop, tablet, phone and short-height viewport sizes. Reproducible scripts are in `tests/`; verified behavior and remaining limitations are recorded in `docs/VERIFICATION.md`. The exact supplied portrait and real intro soundtrack still need their source files.

## ProBoy-MD command directory
`src/data/commands.json` is generated from the **repository source** (every `commands/<category>/*.js` exposes `name`, `aliases`, `category`, `description`, `usage`). It carries a `meta` block that records both figures:

- menu reported: **531** (menu generated 4 Nov 2026, 219 entries documented)
- repository verified: **224 command files** (220 unique names) across 9 categories

Both are shown on the page; commands are never invented. The directory supports relevance-ranked search, category filters with counts, usage copy buttons, aliases, pagination and an empty state.

**Pairing CTA:** `https://proboy-md.gt.tc/` — taken from the repository README (`proboy.md` pairing section). The bot's API default is `PROBOY_PAIR_BASE_URL || https://proboy-pair.onrender.com` in `settings/apis.js`.

## Working showcase demos
The 24 interactive samples at `/demos/<slug>` include LuxeCart, Pulse, SprintBoard, Synth Studio and Forge Docs. Data is in `src/data/demos.json`; the route loads the matching demo group on demand. These are browser demonstrations, not client work or real transactions.

## Routing / SEO
Every known app route has a route-specific static HTML file. Vercel uses `cleanUrls`; Netlify consumes the build's exact `_redirects` mappings. Neither host uses a catch-all rewrite to the homepage. Unknown pages serve `404.html` with status 404. The legacy generator is not part of the release process.

## Tests
```sh
npm run build
npm run preview -- --port 4180
# Run in another terminal:
QA_BASE=http://127.0.0.1:4180 node tests/launch-http.mjs
QA_BASE=http://127.0.0.1:4180 PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/launch-browser.mjs
npm run test:server
```
Install Chromium for Playwright before running the browser suite. Results live in `.work/launch-*.json`. These release tests supersede the older preview smoke scripts.

## OG / Twitter share tags
The 1200 × 630 JPEG is `public/images/og-shahan-ali.jpg`. Built Open Graph and Twitter tags use its absolute canonical URL. A local image check does not tell you that the production URL works or what a social channel cached.

## Portrait picker behaviour
When `profileImage` points to a real file in `public/`, the hero renders it and the "Select portrait", "Change photo" and "Publish this image" controls disappear automatically — a published portrait always wins over any browser-only preview.

---

## ProBoy platform upgrade (Control Center, first-party analytics, hosting)

**Project root:** the app runs from the repository root (`npm install` → `npm run dev` / `npm run build` → `dist/`).

### Design system
`src/styles/proboy-ui.css` is loaded on every page. It defines tokens (`--pb-accent`, `--pb-radius`, `--pb-motion`, …), the iridescent ring component (`<RingIcon>` in `src/components/SiteShell.tsx`), glass-pill navigation, 3D tilt cards (`src/lib/effects.ts`), scroll-driven reveals and parallax (CSS `animation-timeline`, transform/opacity only). Nothing loops forever; `prefers-reduced-motion` and the admin "Animations" switch turn everything static.

### Serverless API (`/api/*`)
Platform-neutral core in `server/` (standard `Request → Response`), with thin wrappers: `api/[...path].mjs` (Vercel) and `netlify/functions/api.mjs` (Netlify). Storage is Upstash Redis over REST (TLS in transit, encrypted at rest by the provider; sensitive records additionally AES-256-GCM encrypted by the app).

| Variable | Purpose |
|---|---|
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL/TOKEN`) | private storage |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` | owner login (hash from `npm run admin:setup`) |
| `ADMIN_TOTP_SECRET` | authenticator-app verification + "remember this device" |
| `SESSION_SECRET` (≥32 chars), `DATA_ENCRYPTION_KEY` (optional) | signing / encryption keys |
| `SITE_URL` | origin allowed to send analytics |

Set them in the host dashboard only, never in `public/` or with a `VITE_` prefix. `npm run build` enables split, fingerprinted assets. Keep visitor exports and bot session configuration outside the web root and out of Git.

### Admin → Control Center
`/admin` → **Site Controls** (appearance, motion, sections, announcement, maintenance; draft → preview → publish → restore previous), **Analytics** (master ON/OFF, reports, export, delete), **Security** (trusted devices, scoped bot API keys, audit log). These tabs use a separate server session (HttpOnly cookie). Content/SEO/project editing continues through the existing GitHub-backed tabs.

### Checks
`npm run test:server` (API/auth/analytics with in-memory storage); `npm run build && node scripts/audit-site.mjs` (static crawl and `docs/SEO-AUDIT.md`).
