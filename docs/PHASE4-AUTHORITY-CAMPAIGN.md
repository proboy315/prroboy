# Phase 4 — Authority and mention campaign (internal working document)

**Owner:** Shahan Ali (PROBOY) · **Prepared:** 2026-11-07 · **Target:** 15 independently published mentions over time

This is a working plan, not a results report. Every row below starts unproven. `PUBLISHED` is only written after a
third party publishes something and the live URL has been opened and checked.

## How mentions are counted

| Bucket | Meaning | Owned by me? | Count now |
|---|---|---|---|
| Owned profiles | Accounts I control (GitHub profile, LinkedIn, Telegram, this site) | Yes | 4 verified |
| Repository / project references | My own repositories and project pages | Yes | 1 public repo (ProBoy-MD) + 5 project pages |
| Community contributions | Answers, comments and PRs written by me in other people's spaces | No | 0 published, 5 planned |
| Editorial / press mentions | Third-party publications writing about the work | No | 0 published, 2 planned |
| Guest articles | Articles hosted on another publisher's domain | No | 0 published, 1 planned |
| Creator / video mentions | Videos or walkthroughs I publish myself | Yes | 0 published, 1 planned |
| **Independently earned total** | **Third-party publications only** | **No** | **0** |

**The number 15 is a campaign target, not a claim.** Nothing has been submitted, accepted or published from this plan yet.

## Status vocabulary

`PROPOSED` → `DRAFTED` → `SUBMITTED` → `ACCEPTED` → `PUBLISHED` (with verified URL) · plus `REJECTED` and `NEEDS FOLLOW-UP`.

---

## Tier 1 — Foundations (owned, zero policy risk, do these first)

### 1. GitHub profile README refresh
- **Platform:** github.com/ProBoy315 (owned profile — **not** an independent mention)
- **Why relevant:** the profile is the strongest single identity anchor that search and AI systems can read for this
  developer; it currently says almost nothing about who he is or what he builds.
- **Type:** owned profile
- **Evidence needed:** the verified facts already in `src/data/press.ts` (name, brand, location, role, ProBoy-MD, portfolio).
- **Next action:** paste the README draft from `docs/PHASE4-ASSETS.md` §2 into the profile README on GitHub.
- **Policy risk:** none.
- **Status:** PROPOSED · **Date:** — · **URL:** (fill after publishing)

### 2. ProBoy-MD README and repository positioning
- **Platform:** github.com/proboy315/ProBoy-MD (owned repository — **not** an independent mention)
- **Why relevant:** the repository is the most linkable asset. Its README currently mixes product claims with
  operational detail, and its declared start script points at a file that is absent at the audited commit.
- **Type:** repository reference
- **Evidence needed:** audited commit `c05d3225`, 224 command files in eight physical directories, MIT licence, pairing flow.
- **Next action:** apply the README restructure in `docs/PHASE4-ASSETS.md` §3; state the known startup caveat honestly.
- **Policy risk:** none.
- **Status:** PROPOSED · **Date:** — · **URL:**

---

## Tier 2 — Third-party publishing with real reader value (independent mentions)

### 3. Dev.to article 1 — command-handler design
- **Platform:** dev.to (third-party publisher — **independent mention** once published)
- **Why relevant:** the article on the site is genuinely useful; Dev.to gives it a third-party domain, an RSS feed and
  real developer readers, and the canonical URL points back to the portfolio.
- **Type:** guest/community article · **Evidence:** the verified article at `/blog/whatsapp-bot-command-handler`.
- **Next action:** publish the brief in `docs/PHASE4-ASSETS.md` §4 with `canonical_url` set to the portfolio article.
- **Policy risk:** Dev.to allows up to four tags and supports canonical attribution. Promotional framing is the main risk —
  the piece must stand as a technical explanation, with the disclosure line in the draft.
- **Status:** PROPOSED · **Date:** — · **URL:**

### 4. Dev.to article 2 — Baileys session safety
- **Platform:** dev.to · **Type:** article · **Evidence:** `/blog/baileys-session-safety` and Baileys upstream docs.
- **Next action:** use brief §5; canonical → portfolio article.
- **Policy risk:** low. Never paste real session strings; use the upstream docs as the primary source.
- **Status:** PROPOSED · **Date:** — · **URL:**

### 5. Dev.to article 3 — prerendering a React content site
- **Platform:** dev.to · **Type:** article · **Evidence:** `/blog/react-seo-rendered-content` and this site's own build.
- **Next action:** use brief §6; canonical → portfolio article. Show the build output, not claims about rankings.
- **Policy risk:** low. Do not imply that structured data produces AI citations.
- **Status:** PROPOSED · **Date:** — · **URL:**

### 6. Stack Overflow answers (ongoing)
- **Platform:** stackoverflow.com · **Type:** community answer — **independent contribution**
- **Why relevant:** answers to Baileys, Node.js and Shopify Liquid questions are the highest-trust technical signal
  available to a developer, and they carry no link-building motive.
- **Evidence needed:** a real question with a real answer. Find them by searching `baileys`, `whatsapp bot node`,
  `liquid filter`, `vercel rewrites`.
- **Next action:** follow the playbook in `docs/PHASE4-ASSETS.md` §8. Answer first, link only if the link is the
  primary documentation the question already names, and disclose affiliation whenever the answer mentions the bot.
- **Policy risk:** Stack Overflow's expected behaviour is explicit — overt self-promotion is voted down and flagged, and
  affiliation must be disclosed in any post that mentions your own work. Most of the risk here is procedural.
- **Status:** PROPOSED · **Date:** — · **URL:**

### 7. Reddit contributions — r/webdev (technical help, no links)
- **Platform:** reddit.com/r/webdev · **Type:** community contribution — **independent**
- **Why relevant:** this community is read by working web developers, which is the audience the portfolio's services target.
- **Evidence needed:** a real problem someone else posted (code review, debugging help, architecture advice).
- **Next action:** use draft §9a. Check `reddit.com/r/webdev/about/rules` immediately before posting — the rules list
  currently includes "No self-promotion" and "No commercial promotions/solicitations", so the post must contain no link
  to the portfolio and no mention of the bot.
- **Policy risk:** high if the rules are ignored. The community may remove posts and message moderators; build a comment
  history in the community before posting anything of your own.
- **Status:** PROPOSED · **Date:** — · **URL:**

### 8. Reddit contributions — r/node and r/selfhosted (deployment write-up)
- **Platform:** reddit.com/r/node, reddit.com/r/selfhosted · **Type:** community contribution — **independent**
- **Why relevant:** deployment write-ups about a Node.js bot on a small VPS are exactly what these communities ask about.
- **Evidence needed:** the deployment caveats documented in `/proboy-md/docs/deployment` — including that the audited
  commit does not start with the documented command.
- **Next action:** post the write-up only after a deployment has actually been run and verified. Use draft §9b.
- **Policy risk:** each subreddit sets its own rule; the general guidance Reddit gives moderators is that promotional
  content should stay near 10% of your activity in a community. Check the rules page for each community first.
- **Status:** PROPOSED · **Date:** — · **URL:**

### 9. Hacker News "Show HN" — ProBoy-MD
- **Platform:** news.ycombinator.com · **Type:** community discussion — **independent**
- **Why relevant:** it is the densest developer audience available and it rewards substance over promotion.
- **Evidence needed:** a working repository, a short factual description, and a clear statement of what is not yet
  production-ready.
- **Next action:** post a Show HN describing the architecture honestly, including the missing entry point caveat. Do not
  ask for votes, do not cross-post the same text elsewhere, and reply to every comment.
- **Policy risk:** high variance; promotional framing gets ignored or downvoted. Only post after the startup caveat is
  resolved, otherwise the first comment will be about the missing file.
- **Status:** NEEDS FOLLOW-UP (blocked on a verified runnable revision) · **Date:** — · **URL:**

### 10. Awesome-list pull request adding ProBoy-MD
- **Platform:** a relevant "awesome" list repository (for example an awesome WhatsApp bot or awesome Node.js list) ·
  **Type:** project listing — **independent**
- **Why relevant:** a curated list is a recognised third-party reference and produces a real inbound link.
- **Evidence needed:** the repository must be genuinely useful to the list's audience, with a working README, licence and
  recent commits.
- **Next action:** find two or three lists that actually curate WhatsApp bots or Node.js tooling, read their contribution
  rules, and open a pull request that adds one line in their format.
- **Policy risk:** low if the entry meets the list's format rules. Most lists reject submissions that exist only to add a
  link.
- **Status:** PROPOSED · **Date:** — · **URL:**

### 11. Code review and issue contributions in other projects
- **Platform:** Baileys ecosystem repositories, Shopify Liquid tooling · **Type:** community contribution — **independent**
- **Why relevant:** a visible record of helpful engineering in other people's codebases is one of the strongest
  non-self-promotional signals available.
- **Evidence needed:** a genuine bug report or a reviewed pull request.
- **Next action:** pick one repository you have actually used, reproduce a real issue, and open a minimal reproduction with
  a proposed fix.
- **Policy risk:** low. This is ordinary open-source behaviour.
- **Status:** PROPOSED · **Date:** — · **URL:**

### 12. Community chat answers — Baileys and Node.js groups
- **Platform:** Telegram groups and the Node.js Discord · **Type:** community contribution — **independent**
- **Why relevant:** fast, low-ego help in the exact communities that use this stack. Answers are often indexed by
  search engines later.
- **Evidence needed:** a real question. The Telegram channel already linked on the site is a good starting point.
- **Next action:** answer three questions completely before sharing anything of your own. No link unless it is the
  documentation being discussed.
- **Policy risk:** low, but avoid unsolicited promotion in channels that ban it.
- **Status:** PROPOSED · **Date:** — · **URL:**

---

## Tier 3 — Editorial and press (slower, uncertain, genuinely independent)

### 13. Pakistani technology publication pitch
- **Platform:** ProPakistani, TechJuice and similar Pakistani technology publications · **Type:** editorial — **independent**
- **Why relevant:** a local technology audience is the right audience for a developer from Burewala offering development
  services, and editorial coverage is the strongest durable signal in this plan.
- **Evidence needed:** a concrete story angle that is not a personal advertisement — for example "What Pakistani students
  can learn from building a WhatsApp bot in open source", anchored on the real repository.
- **Next action:** use the pitch email in `docs/PHASE4-ASSETS.md` §10, addressed to the publication's general or
  technology desk. Send individually, follow up once after 7–10 days, accept a no.
- **Policy risk:** the main risk is sounding promotional. Editors in these publications receive many pitches; the
  workaround is to lead with the technical story and offer the source repository as evidence. No coverage can be promised.
- **Status:** PROPOSED · **Date:** — · **URL:**

### 14. Guest post pitch
- **Platform:** a developer publication that accepts guest articles · **Type:** guest article — **independent**
- **Why relevant:** guest articles host on someone else's domain, so the mention counts as third-party publication.
- **Evidence needed:** an outline that matches the publication's readers, and original content rather than a rehash of
  the portfolio article.
- **Next action:** use the pitch in `docs/PHASE4-ASSETS.md` §11. Pitch two or three publications; write for one that
  replies.
- **Policy risk:** many blogs accept guest posts that are thin or promotional and publish nothing. Ask for editorial
  feedback before submitting.
- **Status:** PROPOSED · **Date:** — · **URL:**

### 15. YouTube technical walkthrough (owned channel — creator mention)
- **Platform:** YouTube · **Type:** video — **owned, not independent press**
- **Why relevant:** a screen-recorded walkthrough of the real architecture is the format most likely to be useful to
  developers, and it is fully under the owner's control.
- **Evidence needed:** a working bot or the portfolio demos, and permission to show any phone numbers (use a test
  number only).
- **Next action:** follow the plan in `docs/PHASE4-ASSETS.md` §12.
- **Policy risk:** low. Avoid showing session files, phone numbers or API keys in the recording.
- **Status:** PROPOSED · **Date:** — · **URL:**

---

## Deferred — evaluated and deliberately not recommended yet

### Wikidata item
- **Decision:** **not eligible at present.** Wikidata and Wikipedia require significant coverage in reliable independent
  secondary sources; a personal portfolio, a LinkedIn profile and self-published pages do not qualify, and a promotional
  item would be removed. Revisit only if independent, reliable publications about the work exist — at that point a
  neutral item can be drafted with proper references. No item should be created before then.
- **Status:** DEFERRED · **Date:** — · **URL:**

### Product Hunt launch
- **Decision:** **blocked on product readiness.** Product Hunt's own rules expect a live, publicly reachable product with
  a real visitor benefit. The portfolio is a personal site and ProBoy-MD is a repository, not a hosted product that
  strangers can use. A launch would need a genuinely launch-ready product (for example a hosted pairing flow or a public
  service). Until that exists, this is a drafting exercise only — the draft in `docs/PHASE4-ASSETS.md` §7 must not be
  published as if it were a launch.
- **Status:** PROPOSED (draft only, do not publish) · **Date:** — · **URL:**

---

## Execution order

1. **Week 1:** #1, #2 (owned foundations) and #13, #14 pitches. Nothing is submitted in week 1 that could look like a
   campaign.
2. **Week 2:** #3 — one Dev.to article, written properly and published with canonical attribution.
3. **Week 3:** #6, #7, #12 — begin answering other people's questions. No self-links in the first month.
4. **Week 4:** #4, #5 — second and third Dev.to articles; #10 pull request.
5. **Week 5–6:** #8, #11, #9 — deployment write-up, open-source contributions, and the Show HN post once the startup
   caveat is resolved.
6. **Week 7+:** #15 video, repeat the loop, and record every outcome in the table below.

### Tracking table

| # | Opportunity | Type | Owned? | Status | Date | URL |
|---|---|---|---|---|---|---|
| 1 | GitHub profile README | Owned profile | Owned | PROPOSED | — | |
| 2 | ProBoy-MD README | Repo reference | Owned | PROPOSED | — | |
| 3 | Dev.to — command handler | Article | Independent | PROPOSED | — | |
| 4 | Dev.to — Baileys sessions | Article | Independent | PROPOSED | — | |
| 5 | Dev.to — React prerendering | Article | Independent | PROPOSED | — | |
| 6 | Stack Overflow answers | Community | Independent | PROPOSED | — | |
| 7 | Reddit r/webdev | Community | Independent | PROPOSED | — | |
| 8 | Reddit r/node, r/selfhosted | Community | Independent | PROPOSED | — | |
| 9 | Hacker News Show HN | Community | Independent | NEEDS FOLLOW-UP | — | |
| 10 | Awesome-list pull request | Project listing | Independent | PROPOSED | — | |
| 11 | OSS code review / issues | Community | Independent | PROPOSED | — | |
| 12 | Chat community answers | Community | Independent | PROPOSED | — | |
| 13 | Pakistani tech press | Editorial | Independent | PROPOSED | — | |
| 14 | Guest post | Guest article | Independent | PROPOSED | — | |
| 15 | YouTube walkthrough | Video | Owned | PROPOSED | — | |

**Independently published mentions so far: 0.** Move a row to PUBLISHED only after a URL is opened and confirmed.
