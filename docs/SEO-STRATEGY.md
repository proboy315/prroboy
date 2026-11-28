# Shahan Ali / PROBOY — SEO, AEO, GEO, LLMO and E-E-A-T Plan

Scope: `https://proboy.vercel.app/`. Primary target query: **Shahan Ali**. Supporting queries: Shahan Ali developer, Shahan Ali full-stack developer, Shahan Ali Shopify expert, Shahan Ali bot architect, Shahan Ali WhatsApp bot developer, shahan315, proboy315, ProBoy-MD creator.

Everything below is implemented in code unless marked *strategy*. No ranking position is guaranteed.

---

## 1. Audit — what was found before this work

| Area | Before | Now |
|---|---|---|
| H1 keyword | Hero H1 existed but page had no explicit keyword guarantee | H1 is `Shahan Ali` (verified by test) |
| Competing page variants | Static `public/projects/`, `public/showcase/`, `public/proboy-md/` folders shadowed the React pages, so each URL could serve two different documents | Single source: every URL serves one React document; shadowing copies removed |
| Command content | 12 hard-coded example commands | 224 commands parsed from the repository, with descriptions, usage and aliases |
| Pairing CTA | Missing / non-authoritative | Official pairing URL `https://proboy-md.gt.tc/` verified in the repository README |
| Showcase | 21 concept cards with no working product | 7 fully interactive demos with real state, forms, search and filters |
| Structured data | Partial | Person, WebSite, ProfilePage, SoftwareApplication, FAQPage, BreadcrumbList, ItemList, EducationalOccupationalCredential, CreativeWork, ImageObject (validated by test) |
| Sitemap | 31 URLs | 38 URLs (adds 7 demo pages) |
| AI-readable content | Homepage only | `llms.txt` with identity, projects, showcase, demos and per-category command counts |
| Canonical on noindex | Set on 404 | Removed on noindex routes |
| Console errors | — | 0 across all test routes |

---

## 2. Competitor benchmark (`Shahan Ali Mohsin`, Wikipedia)

Wikipedia's page ranks because Wikipedia has enormous domain authority plus an article about a *different, encyclopedically notable person*. It is not a benchmark you can copy:

- **Same-name SERP conflict**: you are optimising for the query `Shahan Ali` against a Wikipedia biography of someone else with the same name. Realistic strategy is *not* to outrank Wikipedia on the bare name, but to own the *entity panel / knowledge results and all refinements*: `Shahan Ali developer`, `Shahan Ali Pakistan developer`, `Shahan Ali ProBoy`, `ProBoy-MD`.
- **Do not copy their content**, structure or vocabulary. Nothing on their page is yours to reuse.
- **What is replicable**: a single dominant entity (name) consistently connected to job titles, location, and a body of verifiable work — which is what the Person/SoftwareApplication schema and the About/ProBoy-MD pages now do.

*Strategy:* win the long-tail and branded cluster first, then compound into the bare name as brand searches grow.

---

## 3. Keyword clusters (semantic, not repeated unnaturally)

| Cluster | Terms in play | Where they live |
|---|---|---|
| Identity | Shahan Ali, Shahan Ali (ProBoy), shahan315, proboy315 | H1, title, description, Person schema `alternateName`, footer |
| Role | Full-Stack Developer, Bot Architect, Shopify Expert, AI & Automation Developer | title, `jobTitle`, hero, services |
| Location | Burewala, Punjab, Pakistan | address schema, geo meta, hero contact line |
| Product | ProBoy-MD, WhatsApp Multi-Device bot, Baileys, pairing code | `/proboy-md`, SoftwareApplication schema, llms.txt |
| Capability | Shopify OS 2.0, Liquid, WhatsApp bot development, Gemini AI, JS obfuscation | skills, services, FAQ |
| Proof | 224 verified command files, 531 reported, GitHub repo | command directory, FAQ, `llms.txt` |

Density is kept natural: keyword strings appear once or twice per section in headings and prose, never in hidden or repeated blocks.

---

## 4. AEO — answer engine optimisation (implemented)

- Every section has a single descriptive H2 and direct-answer paragraphs.
- FAQPage blocks exist on `/` (6 questions) and `/proboy-md` (4 questions) with literal questions people ask.
- The ProBoy-MD page states count discrepancies explicitly — answer engines get a verifiable, self-consistent answer instead of a suspicious "531" claim.
- Project, showcase and demo summaries are written as first-sentence answers ("X is a … by Shahan Ali …").

## 5. GEO — generative engine optimisation (implemented + strategy)

Entity graph: **Shahan Ali** → `alternateName` [ProBoy, itx_proboy, shahan315, proboy315] → `sameAs` GitHub/Instagram/Telegram/Facebook → `creator of` ProBoy-MD → `creator of` each showcase and demo.

*Strategy:* the same identity string ("Shahan Ali (ProBoy)") should appear on GitHub profile, README badges, articles and directory listings — consistency is what lets generators merge your entities.

## 6. LLMO — large language model optimisation (implemented)

- `llms.txt` with identity, location, contact, projects, showcase, demos, per-category command counts and the pairing URL.
- Semantic HTML landmarks (`header`, `nav`, `main`, `section`, `aside`, `footer`), one H1 per page, descriptive link text.
- The SPA ships a rich `<noscript>` block containing projects, showcase, demos and ProBoy-MD command totals, so non-JS agents still get the content.

## 7. E-E-A-T (implemented; no fabrication)

- **Experience/Expertise**: real repository-parsed command data, real project descriptions, real architecture notes.
- **Authoritativeness**: `author`/`creator` on every SoftwareApplication and CreativeWork points to the Person node; GitHub repository URLs are the real repo.
- **Trust**: public contact details, no invented clients, no invented awards, no invented metrics; count discrepancies disclosed; the previously unverified testimonial-style reviews were **not** presented as verified fact.
- *Strategy*: publish build notes and article posts, link them from the GitHub profile README.

## 8. Structured data inventory

Person, WebSite, ProfilePage, SoftwareApplication (ProBoy-MD v6.0.1), FAQPage (×2), BreadcrumbList, ItemList (projects, showcase), EducationalOccupationalCredential (QuizOff 2026), CreativeWork (per demo/showcase), ImageObject (gallery).

Validation done in-test by parsing every JSON-LD block. *Recommended:* run each URL through the Rich Results Test and Schema Validator before launch.

---

## 9. 90-day plan

### Days 1–15 — technical baseline
1. Deploy; verify `https://proboy.vercel.app` serves one document per URL (no shadowing).
2. Search Console + Bing; submit `/sitemap.xml`; confirm all 38 URLs in Coverage.
3. Fix any non-indexable/soft-404 reports.
4. Confirm Core Web Vitals on 4G mobile (page ≈ 472 kB total, 0 render-blocking third parties besides Inter).

### Days 16–45 — content and cluster
5. Publish `ProBoy-MD v6.0.1: command architecture` article on the site (AEO depth + internal link).
6. Publish a Shopify OS 2.0 Liquid article and an article on the 7 demos.
7. Keep each article linked from the relevant page (contextual internal links).
8. Add alt text discipline to every new image; keep image files descriptively named.

### Days 46–75 — authority
9. GitHub profile README → portfolio link + pinned ProBoy-MD.
10. Listing on dev directories (dev.to, Hashnode cross-post, DEV Community, Product Hunt-style listings for ProBoy-MD).
11. Contribute real answers on Stack Overflow/Reddit where relevant — only genuine value, no spam.
12. Repost articles to Medium/Substack with canonical back to `proboy.vercel.app`.

### Days 76–90 — measurement and iteration
13. Track: branded impressions, `Shahan Ali developer`, `ProBoy-MD`, `WhatsApp bot Shahan`.
14. Query report → add sections that answer unmet queries.
15. Monitor technical health weekly; re-run the three test suites before each deploy.

### Never
No purchased links, no fake reviews, no PBNs, no keyword stuffing, no AI-generated "fake client stories".

**Honest expectation:** on `Shahan Ali`, Wikipedia is extremely hard to displace short-term. First-page chances are realistically much higher for `Shahan Ali developer`, `ProBoy-MD`, `Shahan Ali WhatsApp bot` and `Shahan Ali Shopify`, where the entity is unambiguous and you own all the ranking content. The bare-name term improves as branded entities and links compound.

---

## 10. Search Console setup

1. Verify domain property (`proboy.vercel.app`) via DNS TXT record.
2. Submit `https://proboy.vercel.app/sitemap.xml`.
3. URL Inspection → request indexing for `/`, `/proboy-md`, and two or three demos initially (not all at once).
4. Bing Webmaster Tools → import from Search Console.

---

## 11. Input still needed from you

1. **Portrait image** — the exact supplied photo file (only a local browser preview exists today).
2. **Intro assets** — `progress-0.png…progress-299.png` + `audio.mp3`.
3. **CV/resume** file, if you want the Download CV button.
4. **Testimonials** — current review names/roles are not verifiable; confirm or remove before public launch.
5. **Stat numbers** (e.g. "531+ bot commands") — confirm which figure you want displayed as marketing.
6. Confirm `siteUrl` stays `proboy.vercel.app` if you move to a custom domain.
