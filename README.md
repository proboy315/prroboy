# Shahan Ali / PROBOY Portfolio

Static React + Vite + Tailwind site. No backend, no database. Deploys to Vercel as-is.

## Commands
- `npm install` / `npm run dev` / `npm run build` (output: `dist/`)
- `npm run build` automatically prerenders public routes and writes a sitemap from the same route list. No separate SEO generator is needed for deployment. The older `scripts/gen-seo.mjs` is retained only for historical context; do not run it for Phase 3 content.

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
1. Push to GitHub → import in Vercel (framework: Vite). `vercel.json` rewrites routes to `index.html`.
2. Add your domain in Vercel, set `siteUrl` in `info.json`, then redeploy; `npm run build` generates the route HTML and sitemap automatically.
3. Google Search Console → add the domain property → verify via DNS → submit `/sitemap.xml`.
Indexing and ranking are decided by Google and are not guaranteed.

## Contact form
The form opens WhatsApp with the supplied message. It does not claim to deliver to a backend. The email, phone and channel links remain available; no external form account is required.

## Hero portrait
The supplied maroon portrait was visible in chat, but its image file was not accessible in the project. No different portrait is substituted. `profileImage` in `src/data/info.json` is intentionally empty until the exact file is supplied.

Use **Select portrait** or drop an image onto the hero to preview the supplied photo. It stays in this browser through IndexedDB; it is not uploaded and does not appear for other visitors. The hero uses the original image, with only a CSS edge fade and soft shadow. There is no photo card, rounded border or oval crop.

To publish the exact photo, save the original file locally and run:

```sh
node scripts/set-portrait.mjs path/to/your-original-photo.jpg
npm run build
```

The importer copies the original bytes unchanged into `public/images/shahan-ali-portrait.jpg` (or `.png` / `.webp`) and updates the JSON and share-image path. Only **one image source** is used; stale WebP files cannot override a new JPEG. A configured published photo takes precedence over saved local previews on page load.

On mobile the artwork precedes the availability label, greeting and heading. The detailed setup and limitations are in `docs/PORTRAIT.md`.

## Header and sidebar
The header, hero and rail use `--header-height` from `src/index.css`. The rail starts below the fixed header and ends above the viewport bottom. Its links scroll internally on short displays while the collapse control stays visible. Tooltips sit outside the scrolling container.

Below 1100px, the mobile drawer replaces the desktop navigation and sidebar. Its list scrolls independently; the close control and contact action stay visible. Focus returns to the opener on Escape. The rest of the page is inert while it is open.

## Intro animation
Put `progress-0.png` … `progress-299.png` and `audio.mp3` in `public/intro-animation/`.
Config: `info.json → introAnimation`. `policy` is `always`, so it plays on every page load including refresh (`session`, `once` or `never` also work).
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
Seven interactive demos live at `/demos/<slug>` (data: `src/data/demos.json`, components: `src/pages/Demos.tsx`, styles: `src/pages/demos.css`): LuxeCart, Pulse, Ember Kitchen, Haven, Northline, Synth Studio, Forge Docs. Each has its own accent palette and genuinely functional controls (search, filters, cart, validated forms, toggles, copy, generation). They are demonstrations, not client work.

## Routing / SEO
The Vite build prerenders known routes with page-specific metadata and writes `dist/sitemap.xml` automatically. The legacy generator is not part of deployment. The removed Showcase's old static folder copies were deleted; projects and demos remain. Blog and documentation routes are served from prerendered HTML with clean-URL rewrites on Vercel.

`vercel.json` rewrites everything except real assets to `index.html`.

## Tests
```sh
npm run build
npx vite preview --port 4180
QA_BASE=http://127.0.0.1:4180 PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/pages.mjs
node tests/layout.mjs      # 11 viewports, sidebar, drawer, portrait
node tests/interactions.mjs # nav, header auto-hide, intro frames 0-299
```
Results live in `.work/*-results.json`.

## OG / Twitter share tags
`og:image` follows the hero portrait, in this order:

1. `seo.ogImage` in `info.json` (explicit override), else
2. the published portrait (`profileImage`) once the file exists in the project, else
3. `public/og-image.jpg` (brand fallback card).

`og:image:alt`, `og:locale`, `twitter:card` (summary_large_image), `twitter:site`, `twitter:title`, `twitter:description` and `twitter:image` are emitted on every page, both in the static `index.html` and at runtime (`src/lib/seo.ts`).

## Portrait picker behaviour
When `profileImage` points to a real file in `public/`, the hero renders it and the "Select portrait", "Change photo" and "Publish this image" controls disappear automatically — a published portrait always wins over any browser-only preview.
