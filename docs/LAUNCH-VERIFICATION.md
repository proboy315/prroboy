# PROBOY launch verification

**NO-GO: production replacement is not approved.** Checked 2026-11-27 UTC. The candidate was built from the second Arena preview ending in `d9372`. The first preview was inspected for comparison only. No production deployment, push, promotion, or live contact submission was performed.

## Release status

| Area | Status | Evidence |
|---|---|---|
| Development base | VERIFIED | The saved pre-change build reproduces the d9372 app's 877,366-byte inline JavaScript payload and responsive assets. |
| Route-specific static documents | VERIFIED | 88/88 document checks, 84 sitemap canonicals, 71 distinct legacy HTML paths and 65 referenced assets over strict HTTP from `dist/`. See [the complete route matrix](LAUNCH-ROUTES.md). |
| Browser direct loading and reload | VERIFIED | 88 desktop and 24 mobile route cases, plus responsive, interaction and inquiry checks. 126/126 total; zero critical browser errors in those checks. |
| Unknown routes and aliases | VERIFIED | Invalid service, project, blog, documentation and demo URLs return 404. Known legacy aliases redirect to their intended pages. |
| Hosting configuration | DONE | Vercel uses `cleanUrls`; Netlify uses exact generated `_redirects`. No homepage wildcard rewrite. Vercel rule transformation passed using `@vercel/routing-utils`; Netlify TOML parsed successfully. Provider CDN behavior for the candidate has not been exercised. |
| Preview isolation | VERIFIED | `npm run build -- --preview` passed the 88-document HTTP gate with `noindex, nofollow`, production canonicals and no hosted or advertised sitemap. Arena's outer wrapper is outside the project build. |
| Candidate social card and metadata | VERIFIED | Local JPEG 1200 x 630, 94,176 bytes, HTTP 200. OG and Twitter URLs and dimensions match on the generated pages. |
| Live production launch gate | BLOCKED | The current host still returns 404 for the required social JPEG and three candidate routes. The candidate has not been verified on an authorized Vercel or Netlify staging deployment. |
| Inquiry and delivery | VERIFIED | Five proof-to-contact journeys, direct email and WhatsApp destinations, subject prefill, client validation, and relay rejection and acceptance using intercepted synthetic requests. |
| Live inbox delivery and social-platform unfurl | BLOCKED | No approved test recipient, staging access, or successful production social image response. A relay response or local image decode does not prove delivery or an unfurl. |
| Analytics | VERIFIED | Browser sent consenting page/service events into the real handler with an in-memory store and no live host traffic. Server suite 34/34. Raw browser forwarding retired; private aggregate reporting retained. Live storage and admin credentials were not exercised. |
| Legacy data protection | DONE | Visitor/session/verification files quarantined out of the workspace web root. Build refuses their presence under `public/`. The local routes reject requests for removed exports. |
| Existing production exposure | BLOCKED | Three checked legacy data URLs still returned HTTP 200 on production (HEAD only). The owner must revoke or rotate affected material, remove served copies, review other deployment URLs and repository history, and purge caches as appropriate. |
| Performance | VERIFIED | Three Lighthouse mobile runs per local artifact; medians below. No claim about live performance or field Core Web Vitals. |
| Search Console, deployed AI mentions and field INP | BLOCKED | No access or new controlled evidence. No rankings, recommendations or traffic gains were claimed. |
| Creating more city or service routes | NOT APPLICABLE | Existing Burewala identity and five service details are sufficient. No city doorway pages or further duplicate services were added. |

## Read-only host evidence

| Target | Sitemap HTTP checks | Root document | Social image |
|---|---|---|---|
| First Arena preview | 68 of 85 URLs were 200; 17 were 404 | Arena wrapper; no portfolio H1/canonical in the wrapper | JPEG 200, 75,184 bytes |
| Second Arena preview `d9372` | 68 of 84 URLs were 200; 16 were 404 | Arena wrapper at `/`; actual portfolio at `/index.html` | JPEG 200, 94,176 bytes on that preview only |
| `https://proboy.vercel.app` | 81 of its 81 published URLs were 200 with matching canonical and a non-error H1 | Actual portfolio HTML 200, not an Arena wrapper; older positioning, canonical `https://proboy.vercel.app/`, description and JSON-LD present | `/images/og-shahan-ali.jpg` 404 with normal, Twitterbot and Facebook crawler user-agent checks. Root, About and Contact reference that production URL in both metadata fields. |

The current production build does not contain `/services/frontend-development`, `/blog/proboy-technical-seo-performance-audit`, or `/blog/geo-llmo-ai-visibility-baseline`; all returned 404. These are not entries in its older sitemap. A made-up production route returned a genuine 404. This is not evidence that the newer sitemap or candidate is deployed.

Fresh d9372 misses included `/services`, all five service details, `/projects`, its four active details, `/proboy-md`, and four documentation pages (`textmaker-commands`, `utility-commands`, `troubleshooting`, `updating`). The complete matrix records the response for each known app route, including the archived CamLink detail. A 200 response to the Arena wrapper itself is not counted as correct portfolio content.

## Comparable performance

Baseline: saved, unmodified d9372 build. Candidate: `npm run build`. Both served from the same strict local HTTP server implementation using gzip. Byte counts here are decimal bytes. Lighthouse 12.8.2 used the same headless Chromium, mobile simulation and default throttling; each side has three runs, with the median shown. Lighthouse transfer includes resource headers; the direct gzip document measure is body only.

| Measure | Baseline | Candidate |
|---|---:|---:|
| Homepage HTML decoded | 1,182,689 B | 100,648 B |
| Homepage HTML transferred (gzip body) | 304,979 B | 18,574 B |
| Executable inline JS, excluding JSON-LD | 877,366 B | 0 B |
| Homepage JS file (decoded / gzip) | Inlined above | 332,048 / 105,448 B |
| Homepage CSS (decoded / gzip external) | 205,007 B inline | 84,661 / 17,659 B |
| Successful resource transfer in Lighthouse | 477,720 B | 326,483 B |
| All measured resource transfer in Lighthouse | 1,718,670 B | 326,483 B |
| Mobile Lighthouse performance | 69 | 94 |
| Lab LCP | 5.93 s | 2.59 s |
| Lab CLS | 0 | 0 |
| Lab total blocking time | 0 ms | 143.5 ms |
| Field LCP, INP and CLS | Unavailable | Unavailable |

Baseline total transfer varied because the unopened intro and missing favicon requested 404 resources; the separate successful-resource measure excludes those failure bodies. Javascript now loads in external fingerprinted chunks. The local lab does not demonstrate a production score or that every performance metric improved.

## Images

Chrome selected 480w on a 390 px DPR 1 viewport, 800w at 1440 px DPR 1, and 1200w at 390 px DPR 3. The hero used one responsive preload and one portrait request; it is eager/high priority. All four project covers and the certificate are lazy, with dimensions reserved. AVIF, WebP and JPEG fallback URLs were included in the HTTP gate. The certificate full-resolution PNG is still available on demand. These are candidate findings, not production image adoption.

| Asset paths (under `/images/`) | Physical AVIF dimensions | Mobile / desktop selected (DPR 1) |
|---|---|---|
| `shahan-ali-portrait-{480,800,1200}.avif` | 480x715 / 800x1192 / 1200x1789 | 480w, 29,602 B / 800w, 54,403 B |
| `proboy-md-cover-{640,1000}.avif` | 640x360 / 1000x563 | 640w, 14,024 B on both |
| `proboy-encrypt-decrypt-{640,1000}.avif` | 640x360 / 1000x563 | 640w, 11,815 B on both |
| `proboy-js-obfuscator-{640,1000}.avif` | 640x360 / 1000x563 | 640w, 7,324 B on both |
| `proboy-sim-database-{640,1000}.avif` | 640x360 / 1000x563 | 640w, 5,486 B on both; artwork now says archive |
| `quizoff-certificate-{640,1000}.avif` | 640x452 / 1000x707 | 640w, 27,462 B / 1000w, 46,697 B |
| `og-shahan-ali.jpg` | 1200x630 JPEG | 94,176 B, verified in the local artifact; production 404 |

## Tested inquiry paths

| Service | Evidence destination | Inquiry result |
|---|---|---|
| Full-Stack | `/projects#portfolio-architecture` | VERIFIED: scoped full-stack subject |
| Frontend | `/demos/pulse-dashboard` | VERIFIED: scoped frontend subject; sample data only |
| Shopify | `/demos/luxecart-store` | VERIFIED: scoped Shopify subject; React sample, not a Shopify deployment |
| WhatsApp | `/projects/proboy-md` | VERIFIED: scoped bot subject; unofficial Baileys source and docs, no account linked |
| Gemini and automation | `/projects/proboy-md#gemini-integration` | VERIFIED: scoped AI subject; pinned proxy source and labeled simulation, no provider call |

Each evidence URL also opened in a new tab. The relay returned JSON on a read-only HEAD check. Simulated relay 503 and 200 responses verified error recovery and acceptance wording; no actual lead was sent. Email and WhatsApp drafts still need the visitor to send them in their chosen app.

## Expertise evidence boundaries

The four commercial pages and the separate frontend offer remain in place. Existing project, demo and editorial routes carry supporting topics rather than adding 24 service pages.

| Category | Location and evidence | Boundary |
|---|---|---|
| 01 Full-stack / SaaS / MVP | `/projects#portfolio-architecture`, full-stack service | Portfolio and API source, not an external SaaS client case study |
| 02 Frontend | Frontend service, Pulse and SprintBoard | Real demo screenshots, local state/keyboard verification |
| 03 Backend | Full-stack service, `server/handler.mjs` | Public config and tested server contracts |
| 04 WhatsApp bots | `/projects/proboy-md` and `/proboy-md/docs` | Pinned Baileys source; missing upstream start entry remains documented |
| 05 Shopify | Shopify service, LuxeCart, Liquid reference | No live development store or client proof |
| 06 SEO | Technical SEO case study and crawler audit | Metadata and discovery checks, no ranking data |
| 07 AEO | Homepage and service FAQs | Present in initial HTML, no featured-snippet claim |
| 08 GEO | GEO baseline and `/mentions` | Existing generic search observations, no new measured AI recommendation |
| 09 Local SEO | About, Contact and Person metadata | Burewala identity; no Business Profile or extra location created |
| 10 LLMO | Citable docs, `robots.txt`, current public index | No training or placement guarantee; private previews isolated |
| 11 AI integrations | Gemini source note, Synth Studio | Proxy code and mock validation only; direct live API proof blocked |
| 12 Automation | AI service, ProBoy-CONTACT source | Workflow pattern, no verified workflow delivery |
| 13 Databases | Full-stack case study and storage adapter | Redis and JSON evidence; MySQL/Firestore comparisons are not deployment proof |
| 14 APIs | Full-stack service contract examples | Checked against local source, not published confidential payloads |
| 15 Security and privacy | Browser encryption project and `/privacy` | Threat-model notes, no security certification |
| 16 JavaScript tools | Obfuscator project | Obfuscation is not encryption or access control |
| 17 UI/UX | Frontend service and mobile checks | Keyboard and reduced motion samples, not a full WCAG audit |
| 18 Interactive apps | `/demos`, LuxeCart, Voltix, Apex, Pulse and SprintBoard | Sample data, no live transaction |
| 19 Linux | ProBoy-MD requirements and deployment docs | Development/deployment guidance, no consulting or security credentials |
| 20 Hosting | Vercel / Netlify config and static gate | No new or verified provider deployment of the candidate |
| 21 Git and open source | Pinned ProBoy-MD docs and portfolio source | Read-only source links, no upstream change |
| 22 Performance | This report and technical case study | Local lab medians, not CrUX |
| 23 Analytics | `/privacy`, `/admin`, tests | In-memory delivery and opt-in verified, live storage not tested |
| 24 Technical audit | Services process and launch audit evidence | Measured local fixes, not claimed external client results |

## Changed files

| File or explicit group | What changed |
|---|---|
| `package.json`, `scripts/build.mjs`, `scripts/serve-build.mjs` | npm script targets, split artifact finalization, preview isolation, exact static routing and local HTTP checking. No dependency upgrades. |
| `vercel.json`, `netlify.toml` | Native clean paths or exact generated rewrites; legacy alias, cache and indexing rules. |
| `index.html`, `metadata.json`, `public/metadata.json` | Local font loading and accurate portfolio metadata. |
| `src/entry-server.tsx`, `src/App.tsx`, `src/main.tsx`, `src/routes/routeMap.tsx`, `src/lib/router.ts`, `src/lib/seo.ts` | Inventory, route markers, native cross-document links, deterministic hydration, canonical metadata and archive page. |
| `src/index.css`, `src/styles/proboy-ui.css`, `src/assets/inter-latin.woff2`, `src/assets/Inter-OFL.txt` | Scoped Tailwind input, visible markup without JS and licensed local Inter font. |
| `src/components/Hero.tsx`, `src/components/Layout.tsx`, `src/pages/Home.tsx`, `src/pages/About.tsx` | Accurate responsive sizing, correct thumbnail reservation, image dialog and consistent visible positioning. |
| `scripts/optimize-assets.mjs`, `scripts/set-portrait.mjs`, `src/components/admin/AdminSeoTab.tsx` | Non-destructive derivative generation, unique replacement file names and dimensions. |
| `src/pages/DemosDirectory.tsx`, `src/components/DemoControlRoom.tsx`, `src/lib/demoWorkspace.ts`, `src/pages/ProBoyMd.tsx`, `src/components/ProBoyPlayground.tsx` | Browser-storage hydration and deferred playground/control-room code. |
| `src/data/serviceEvidence.ts`, `src/data/services.json`, `src/data/projects.json`, `src/pages/Services.tsx`, `src/pages/ProjectsPage.tsx`, `src/pages/Detail.tsx`, `src/components/ServiceProofs.tsx`, `src/components/DemoPrimitives.tsx` | Linked commercial proof, source limits, evidence screenshots, archive and scoped inquiries. |
| `src/data/botSource.ts`, `src/data/botDocs.ts`, `src/data/editorial.ts` | Shared pinned source links and case-study text separating local results from production. |
| `src/components/ContactForm.tsx`, `src/lib/collector.ts`, `src/lib/measure.ts`, `src/pages/Admin.tsx` | Validation and relay behavior; origin- and consent-aware analytics; retired raw forwarding UI. |
| `public/favicon.ico`, `public/images/pulse-desktop.webp`, `public/images/sprintboard-mobile.webp` | Restored favicon and real Chromium screenshots. |
| `public/images/proboy-sim-database-{640,1000}.{avif,jpg,webp}` | Six resized archive covers with truthful labeling. |
| `public/dashboard/index.html`, `public/projects/proboy-camlink/index.html` | Safe legacy dashboard notice; old CamLink static file superseded by the archived direct app route. |
| Removed from `public/`: `connections.json`, `otp.json`, `sessions/index.json`, `bot/ids.json`, and 11 `bot/*/sessions.json` exports | Quarantined locally outside the workspace. No values included in the report or new artifact. |
| `tests/launch-http.mjs`, `tests/launch-browser.mjs`, `scripts/audit-site.mjs` | Repeatable HTTP, metadata, resource, runtime, QA fixture and crawl checks. |
| `README.md`, `docs/PORTRAIT.md`, `docs/SEO-AUDIT.md`, `docs/LAUNCH-ROUTES.md`, `docs/LAUNCH-VERIFICATION.md` | Release procedure, current evidence and limitations. |

## Gate to reopen

1. Obtain authorized staging access and approved test destinations. Keep sign-in credentials and bot state on the server. Do not reuse the quarantined exports.
2. Address the existing public data exposure. Revoke or rotate affected credentials or sessions, remove public copies and confirm remote 404/403 for the old sensitive files.
3. Verify all generated routes and true 404s on the candidate's actual host. Confirm production canonical origin, current sitemap body, cache headers, and a 1200x630 JPEG response to the exact production share URL. Verify a real unfurl and contact inbox delivery with owner permission before signing off.

Local production-style build, static crawl, route tests, browser tests, typecheck and server tests passed. No approval to replace the current portfolio is implied by these results.