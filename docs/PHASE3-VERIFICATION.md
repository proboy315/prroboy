# Phase 3 verification (2026-11-07)

Baseline: owner-reported analyzer score 94% (not a Google ranking or traffic measure). The project already had prerendered routes, a one-post blog, Phase 2 demos/control room/command playground, Vercel Analytics and optional GA4/Clarity settings. Google verification meta exists; ownership and Bing status were not confirmed. Contact integration is `https://proboy-contact.vercel.app/` and was not changed.

## Source check

ProBoy-MD repository revision: `c05d3225cc21d1d07d2c75bc6be496d48615a4d2`. Checked README, package.json, config.js, handler.js, commandLoader.js and representative command files. 224 `.js` files in eight physical directories: ai 49, dev 28, fun 43, general 26, group 30, media 12, textmaker 19, utility 17. Old `src/data/commands.json` records 224 files, 220 unique primary names, 537 tokens, nine categories, and a menu claiming 531 with 219 listed. Its names/tokens and category totals were **not revalidated** against the new commit. package.json lists version 1.0.0 and `node index.js`; config.js says 3.0.42; index.js is absent. Older snapshot says version 6.0.1. A supported bot startup revision requires maintainer confirmation.

## Measurable actions

The existing Vercel Analytics installation tracks pageviews when enabled. New custom events: `blog_article_view` (slug), `blog_search` (query length only), `blog_category` (category), `docs_search` (query length only), `copy_code`, `docs_to_github` (chapter), `docs_to_playground` (chapter), and `contact_cta` (source page). The same events go to GA4 only when the existing optional tag is configured. No search text, session IDs or numbers are event properties. Clarity remains optional and unchanged; review consent requirements before enabling optional analytics. Search Console performance, Bing data and real traffic were not available, so there are no reported impressions, rankings or AI citations.

## Checks run

- `npx tsc --noEmit` and `npm run build`: passed.
- `tests/phase3.mjs` with temporary local Playwright/Chromium tooling: passed for search, filter, no results, code copy, TOC, docs search, mobile disclosure and overflow. Playwright is not a project dependency; test runner accepts `PLAYWRIGHT_MODULE` when available.
- Parsed all 39 new prerendered pages: one H1/title/description/canonical/JSON-LD per page, parseable JSON-LD, no missing local links. Sitemap contains 30 docs routes and eight article routes; excludes the old blog article, removed Showcase and noindex pages. All checked routes render in server HTML.
- Browser smoke test for `/`, About, Services, Projects, Contact, Demos and ProBoy-MD with slash-suffixed Vite preview URLs: H1 and title present; no page errors. Contact API was not submitted to avoid sending a real message. Phase 2 controls were not rebuilt or fully regression-tested.
- Existing `tests/pages.mjs` fails waiting for `#showcase`, which was removed by owner request. Existing `tests/interactions.mjs` fails because it expects `View My Projects` to set `#projects`, but the current button navigates to `/projects`. These preexisting tests need separate maintenance, not a Phase 2 rebuild.

## Deployment caveats

Vite preview serves nested prerendered HTML at slash-suffixed URLs, but its slashless paths fall back to the root page. New Vercel clean-URL rewrites were added for blog and docs to map slashless canonical paths to their corresponding `/index` resource (without `.html`, per Vercel's `cleanUrls` rules). Validate HTTP body, status, canonical and unknown-route 404 on a Vercel preview deployment before treating production behavior as verified. Builds write `dist/sitemap.xml` automatically from the prerender route list; do not manually run the legacy SEO generator. `robots.txt` and the existing contact endpoint were not changed. The live Vercel deployment, GA4, Clarity, Search Console, Bing and ranking outcomes were not tested in this workspace.