# Shahan Ali / PROBOY Portfolio

Static React + Vite + Tailwind site. No backend, no database. Deploys to Vercel as-is.

## Commands
- `npm install` / `npm run dev` / `npm run build` (output: `dist/`)
- `node scripts/gen-seo.mjs` — sitemap, robots.txt, llms.txt, crawlable HTML for each project, showcase and `/proboy-md`, plus JSON-LD in `index.html`. Run this after editing `src/data`, then build.

## Content (src/data/)
| File | Purpose |
|---|---|
| `info.json` | Name, brand, titles, bio, contact, socials (empty `url` = hidden), stats, services, skills, nav, SEO, `siteUrl`, `resume`, `contactForm.endpoint`, `analytics`, `introAnimation` |
| `projects.json` | `{ slug, title, featured, category, summary, description[], features[], technologies[], image, screenshots[], repo, demo, creator, year }` → `/projects/<slug>` |
| `showcase.json` | `{ slug, title, category, description, technologies[], thumbnail, preview, status: "planned"\|"live" }` → `/showcase/<slug>` (only `live` items are indexed) |
| `images.json` | `[{ src, alt, caption, category, order, width, height }]` → Gallery + lightbox |

Items missing a title/src are skipped; duplicate slugs are logged and skipped; missing images get a branded fallback.

## Intro animation
Put `progress-0.png` … `progress-299.png` and `audio.mp3` in `public/intro-animation/`.
Config: `info.json → introAnimation` (`directory`, `frameCount`, `fps`, `policy`: `session` | `once` | `always` | `never`, `maxWaitMs`).
Frames are requested by numeric index. Playback follows the audio clock when the browser allows audio, otherwise a timer. Esc / "Skip intro" exits. If frame 0 is missing, the intro is skipped automatically.

## Deploy + Google
1. Push to GitHub → import in Vercel (framework: Vite). `vercel.json` rewrites routes to `index.html`.
2. Add your domain in Vercel, set `siteUrl` in `info.json`, run `node scripts/gen-seo.mjs`, redeploy.
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
node scripts/gen-seo.mjs
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
