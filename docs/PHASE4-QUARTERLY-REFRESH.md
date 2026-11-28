# Phase 4 — Quarterly content refresh system (internal working document)

**Owner:** Shahan Ali (PROBOY) · **Cadence:** once per quarter, ~2 hours · **Scope:** blog, project pages, ProBoy-MD
documentation, press kit, mentions register

This keeps published pages true. It is deliberately a small checklist, because a large checklist is the same as no
checklist. Run it in one sitting, keep the notes, and set the next review date.

---

## Before you start

1. Clone or pull the site repository and the ProBoy-MD repository.
2. Record the ProBoy-MD commit you are reviewing against: `git -C ProBoy-MD rev-parse HEAD`.
3. Note today's date. Every `lastReviewed` value you set must be this date — never a backdated or forward-dated value.

---

## 1. Command and API accuracy (the highest-risk area)

- [ ] Re-count the command files: `find commands -name '*.js' | wc -l` and the per-directory counts.
- [ ] Compare with the numbers published in the documentation, the press kit, `llms.txt` and the project page.
- [ ] Update every published count to the reviewed commit, and state the commit hash and review date next to it.
- [ ] Re-check that documented command names, aliases and usage strings still exist in the source.
- [ ] Re-check permission claims against the handler: `ownerOnly`, `modOnly`, `groupOnly`, `privateOnly`, `adminOnly`,
      `botAdminNeeded`, plus stricter in-command checks.
- [ ] Re-check the startup story: does the declared start script point at a file that exists? If the answer changed,
      update the installation, process and deployment chapters in the same pass.
- [ ] Re-check the version declarations in `package.json` and `config.js`; if they still disagree, keep saying so.
- [ ] Re-check external APIs the commands depend on (Baileys upstream, provider endpoints) against their current docs.

## 2. Blog articles

- [ ] For each published article: is the core answer still correct? Especially anything version-specific.
- [ ] Open every external link. Replace dead links with the current canonical URL, or remove the link and the claim it
      supported.
- [ ] Check every internal link still resolves to a live route (not a renamed or deleted page).
- [ ] Merge overlapping articles instead of publishing near-duplicates: if two articles answer the same question, merge
      them into one stronger piece and redirect or update the internal links.
- [ ] Update the "last reviewed" date only for articles you actually re-read in this pass.
- [ ] Check that examples still match the current source. Real code beats plausible code.
- [ ] Confirm the FAQ sections still add value. Delete generic questions that repeat across articles.

## 3. Project pages

- [ ] Does each project page describe what the project does *now*?
- [ ] Are screenshots current? Re-capture if the UI changed. Remove screenshots that show broken states.
- [ ] Are the "features" still implemented? Remove anything that was planned but never built.
- [ ] Does each page still link to its source, demo or documentation where those exist?

## 4. ProBoy-MD documentation centre

- [ ] Confirm every chapter's "source of record" link still points at a file that exists.
- [ ] Re-read the chapters that describe behaviour rather than structure: permissions, sessions, multi-session,
      troubleshooting, deployment.
- [ ] Update the last-reviewed label only on chapters actually checked.
- [ ] Remove or rewrite any chapter that describes behaviour the source no longer supports.

## 5. Press kit, mentions register and profiles

- [ ] Does the press kit still match reality (role wording, location, recognition wording, project facts)?
- [ ] Are the asset statuses accurate — for example if the portrait and certificate images have been restored, change
      "pending file restore" to "published" and remove the fallback note.
- [ ] Mentions register: check every listed external URL is still live. Remove anything that has disappeared, and add
      anything newly published and verified.
- [ ] Profile checklist (`docs/PHASE4-ASSETS.md` §14): confirm display name, bio, location, website and links are still
      consistent on every profile.

## 6. Technical health

- [ ] `npm run build` succeeds with no new warnings.
- [ ] Spot-check the generated HTML for one blog article, one documentation chapter, the press kit and the mentions page:
      one title, one description, one canonical, one JSON-LD block, one H1.
- [ ] Confirm the sitemap contains the current route list and no drafts, no noindex pages and no removed routes.
- [ ] Check that no secret appears in the client bundle or in the published documentation.
- [ ] Re-run the keyboard and screen-reader pass on search, code copy and the documentation navigation.

## 7. Close the round

- [ ] Update `docs/PHASE4-VALIDATION.md` with what changed, what was checked and what could not be verified.
- [ ] Update the AI visibility tracker (`docs/ai-visibility/tracker.csv`) if the round included a measurement.
- [ ] Set the next review date, one quarter out, in this document.
- [ ] Record the outcome of each independent-mention pitch since the last round: accepted, published, rejected.

**Next scheduled review:** ____________________
