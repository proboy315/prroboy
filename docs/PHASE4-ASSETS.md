# Phase 4 — Ready-to-use authority assets (internal working document)

All copy below is fact-checked against `src/data/press.ts` and the audited repository commit `c05d3225`
(2026-11-07). Adjust platform-specific wording before publishing; do not paste one text into every platform.

---

## 1. Bios

The canonical, always-current versions live in `src/data/press.ts` and are published on `/press`, where a visitor can
copy each one. Use those exact strings so every profile stays consistent.

**Short (≈50 words)**
> Shahan Ali (PROBOY) is a full-stack developer from Burewala, Punjab, Pakistan. He builds web applications, the
> open-source ProBoy-MD WhatsApp multi-device bot, Shopify storefronts, and Google Gemini AI integrations.

**Medium (≈100 words)**
> Shahan Ali, known online as PROBOY, is a full-stack developer, AI and WhatsApp bot architect, and Shopify specialist
> based in Burewala, Punjab, Pakistan. He maintains ProBoy-MD, an open-source Node.js bot for WhatsApp multi-device
> automation, and builds React web apps, Shopify Online Store 2.0 themes, and Gemini-powered tools. He also writes
> source-checked engineering articles and maintains a documentation centre for his own project.

**Detailed (≈200 words)**
> Shahan Ali, known online as PROBOY, proboy315, shahan315 and itx_proboy, is a full-stack developer from Burewala,
> Punjab, Pakistan. His work sits where product engineering and applied AI meet: he maintains ProBoy-MD, an open-source
> Node.js WhatsApp multi-device bot built on the Baileys library, and he builds React web applications, Shopify Online
> Store 2.0 storefronts, and Google Gemini integrations for real use cases. He documents his own systems in public,
> including a command reference and a documentation centre that records what the source code actually does rather than
> what a marketing page claims. He studies ICS at Govt Graduate College Burewala, and in July 2026 he received a
> Certificate of Recognition for the Google Gemini QuizOff 2026, organised by CampusCrew and hosted on Unstop. He is open
> to freelance web, bot, Shopify and AI integration work.

---

## 2. GitHub profile README draft

Paste into `github.com/ProBoy315` → profile README. Replace `REPO_URL` with the canonical repository URL.

```markdown
# Shahan Ali (PROBOY)

Full-stack developer · AI & WhatsApp Bot Architect · Shopify Expert
Based in Burewala, Punjab, Pakistan · Working on ProBoy-MD, an open-source WhatsApp multi-device bot in Node.js.

- Portfolio and engineering notes: https://proboy.vercel.app/
- ProBoy-MD (source): https://github.com/proboy315/ProBoy-MD
- Documentation for ProBoy-MD: https://proboy.vercel.app/proboy-md/docs
- Telegram: https://t.me/itx_proboy
- Email: shahanali.dev@gmail.com

## What I work on

- **WhatsApp automation** — ProBoy-MD, a Node.js bot on the Baileys library, with commands grouped by category and
  permission checks enforced in the handler rather than by convention.
- **Web applications** — React + TypeScript front ends, prerendered content routes, and deployment work on Vercel.
- **Shopify** — Online Store 2.0 themes, Liquid templates and storefront performance.
- **AI integrations** — Google Gemini powered features with clear inputs, error states and rate-limit handling.

## Currently

Writing source-checked articles and documentation for ProBoy-MD, and taking on freelance web, bot and Shopify work.

## Recognition

Certificate of Recognition — Google Gemini QuizOff 2026, organised by CampusCrew and hosted on Unstop (19 July 2026).
```

---

## 3. ProBoy-MD repository positioning plan

The repository is the strongest linkable asset, so its README should do three jobs quickly: say what the project is,
show that it is maintained honestly, and make the honest limitations visible before a visitor wastes time.

**Proposed README order**

1. **One-line description** — "A WhatsApp multi-device bot in Node.js (Baileys), with commands as independent modules."
2. **What works today** — command modules, permission tiers, pairing flow, session handling, plugin contract.
3. **Repository snapshot** — the audited counts with the commit hash and the date, phrased as a point-in-time fact:
   `224 JavaScript command files across eight command directories (ai 49, dev 28, fun 43, general 26, group 30,
   media 12, textmaker 19, utility 17) as of commit c05d3225 (7 Nov 2026).`
4. **Known limitations** — publish the startup caveat honestly until it is fixed:
   - The `start` script points at `index.js`, which is absent at the audited commit. Ask for a supported entry point or
     a fixed revision before deploying.
   - `package.json` and `config.js` declare different versions (1.0.0 and 3.0.42).
   - An older menu snapshot reported 531 commands with 219 listed; that snapshot is not the same as the source tree.
5. **Quick start** — clone, install, and then a "verify before you run" block that checks the entry point exists:
   ```bash
   git clone https://github.com/proboy315/ProBoy-MD.git
   cd ProBoy-MD
   npm install
   node -p "require('./package.json').scripts.start"
   ls index.js   # must exist before `npm start` will work
   ```
6. **Pairing** — describe the pairing-code flow and the terminal fallback, and state clearly that session strings are
   credentials that must never be committed or shared.
7. **Command contract** — a minimal `module.exports` example showing `name`, `aliases`, `category`, `description`,
   `usage`, and the permission flags the handler honours (`ownerOnly`, `modOnly`, `groupOnly`, `privateOnly`,
   `adminOnly`, `botAdminNeeded`).
8. **Documentation link** — point to https://proboy.vercel.app/proboy-md/docs as the extended guide.
9. **Contributing** — how to add a command, the review expectations, and the rule that a new command must document its
   own inputs and permissions.
10. **License** — keep MIT visible and correct.

**Why this order:** visitors and AI systems both extract the first and last meaningful sections most reliably. Leading
with a limitation you discovered yourself is more credible than a feature list, and it is exactly the signal that
distinguishes this repository from a promotional one.

---

## 4. Dev.to brief A — command handler design

**Working title:** *Designing a WhatsApp bot command handler that stays safe as it grows*
**Tags:** `node`, `whatsapp`, `architecture`, `tutorial` (four is the maximum — check that each tag exists and fits)
**Canonical URL:** `https://proboy.vercel.app/blog/whatsapp-bot-command-handler`

**Outline**

1. **The failure mode you are designing against** — one switch statement, 200 commands, no way to test it.
2. **The pipeline** — normalise → prefix check → tokenise → resolve (name or alias) → validate context → validate
   permission → execute → respond.
3. **Parsing that does not fight you** — splitting on whitespace, keeping the rest of the message intact, letting each
   command validate its own arguments.
4. **Permission flags and what they do not cover** — `ownerOnly`, `modOnly`, `groupOnly`, `privateOnly`, `adminOnly`,
   `botAdminNeeded`; plus the rule that a command can enforce stricter checks inside `execute` (the multi-session
   controller checks the primary owner even though it declares `ownerOnly`).
5. **Alias collisions are real** — a loader that skips an alias when the token already exists; first-loaded-wins unless
   override is explicitly enabled.
6. **Error messages that help the user** — a missing mention, a missing permission, a bot without admin rights: each
   needs its own message, not a generic failure.
7. **Testing the unhappy paths** — unknown command, missing argument, wrong chat type, wrong role, missing bot rights.
8. **Disclosure** — "This is my own project; the examples come from its source."

**Practical section to include (real, from the audited source):**

```js
// A command module is self-contained: metadata + one execute function.
module.exports = {
  name: 'kick',
  aliases: ['remove'],
  category: 'group',
  description: 'Kick mentioned/replied members from the group',
  usage: '.kick @user',
  groupOnly: true,
  adminOnly: true,
  botAdminNeeded: true,
  async execute(sock, msg, args, extra) {
    // resolve the target, refuse to act on the bot itself, then reply
  },
};
```

**FAQ to include (only these three)**
- *Do I need a WhatsApp account to try this?* No — the pattern applies to any chat system with a prefix, a registry and
  role checks.
- *Why not just use the WhatsApp Business API?* It is a different product with its own constraints; the unofficial
  multi-device route is useful for personal automation and needs the same care around permissions.
- *How do you avoid alias collisions?* The loader skips an alias when the token is taken, and the loader's behaviour is
  something to check in source before relying on an alias.

**Disclosure line to place at the top:**
> I maintain ProBoy-MD, the open-source bot this post describes, so the examples come from its current source.

---

## 5. Dev.to brief B — Baileys session safety

**Working title:** *What a WhatsApp bot session actually is, and why it should never leave your server*
**Tags:** `node`, `security`, `tutorial`, `baileys` (verify the tag exists)
**Canonical URL:** `https://proboy.vercel.app/blog/baileys-session-safety`

**Outline**

1. **Short answer** — a session holds the authentication state and Signal key material for a linked device. Treat it as
   a credential, not a setting.
2. **What is inside** — credentials plus key storage; upstream guidance notes key updates must be persisted, not just the
   initial credentials.
3. **How a user links a device** — pairing code flow, and what the pairing site does and does not do for you.
4. **Where sessions must never go** — not in Git, not in `VITE_` environment variables, not in a browser bundle, not in a
   log line, not in a screenshot.
5. **Backups that are actually safe** — encrypted, access-controlled, tested in a private environment; a pairing code is
   not a backup.
6. **Recovery** — stop the process, restore verified state, re-link if needed, and revoke unwanted linked devices in
   WhatsApp if state might have leaked.
7. **Incident checklist** — revoke, rotate provider keys, remove exposed artefacts, inspect logs.
8. **Sources** — Baileys upstream auth documentation.

**Example to include:** upstream's note that a production auth adapter must persist key updates, plus a short snippet
showing the `creds.update` → `saveCreds` pattern.

**FAQ:** *Is the pairing code a password?* No, it is short-lived, but a pairing code plus your number still identifies
your account, so treat it as sensitive. *Can I store the session in a config file?* Only in a private, permission-restricted
location that is never served to the frontend.

---

## 6. Dev.to brief C — prerendering a React content site

**Working title:** *Serving real HTML from a Vite + React site without a server*
**Tags:** `react`, `vite`, `seo`, `webdev`
**Canonical URL:** `https://proboy.vercel.app/blog/react-seo-rendered-content`

**Outline**

1. **Short answer** — client rendering works for Google, but it adds a rendering step and is not identical across
   crawlers; shipping the HTML in the response is faster for readers and crawlers alike.
2. **How the site does it** — a list of known routes, `renderToString` per route at build time, and one HTML file per
   route with page-specific metadata.
3. **Metadata that matches the page** — one title, one description, one canonical, one JSON-LD block per URL, written
   from the same route list that generates the sitemap.
4. **The route list is the contract** — adding a page to the data file is enough for it to be prerendered, linked and
   listed; no second generator to remember.
5. **Hydration hygiene** — anything that differs between server and client (dates, randomness, window checks) causes a
   hydration mismatch; keep those out of the first render.
6. **Clean URLs** — trailing-slash and clean-URL behaviour differs between preview servers and CDNs; test the deployed
   response, not the local one.
7. **What this does not do** — prerendering is not a ranking guarantee, and structured data does not create citations.

**Snippet to include:** the route-metadata shape and the sitemap write that happens in the same build.

**FAQ:** *Is server-side rendering required for SEO?* No. *Does JSON-LD get me AI citations?* No — it describes content
accurately; nothing more. *How do I check it?* `curl` the built page and look for the body text and metadata before
JavaScript runs.

---

## 7. Product Hunt launch description — DRAFT ONLY, DO NOT PUBLISH YET

Product Hunt expects a live product that a stranger can use, and its rules prohibit asking for upvotes. The portfolio and
the repository are not that, so this stays a draft until a hosted, launch-ready product exists.

**Name:** ProBoy-MD
**Tagline (≤60 characters):** `Open-source WhatsApp multi-device bot for Node.js`
**Description (≤500 characters):**
> ProBoy-MD is an open-source WhatsApp multi-device bot written in Node.js on top of the Baileys library. Every command
> is a self-contained module with explicit permissions, so you can read exactly what a command does before enabling it.
> Pair with a code instead of scanning a QR, run multiple sessions, and read the documentation before you deploy.

**Maker first comment (draft):**
> I built ProBoy-MD because I wanted a WhatsApp bot I could actually audit. Most bots hide their command logic in one
> huge file; here every command is a module with a name, aliases, usage and permission flags, and the handler enforces
> owner, admin and group rules before anything runs.
>
> It runs on Node.js with the Baileys library, connects with a pairing code instead of a QR scan, and supports multiple
> sessions. The documentation is written against a pinned commit, and it documents the limitations honestly — including
> that the current revision needs a fixed startup entry point before it is production-ready.
>
> I would value feedback from people who have run WhatsApp bots: which commands are missing, and which permission rules
> should exist that I have not thought of. I am not asking for upvotes — I am asking what would make this genuinely
> useful in your stack.

**Asset checklist when it becomes eligible:** 240×240 thumbnail, at least two 1270×760 gallery images, a 45–60 second
demo video, three launch tags, launch at 12:01am Pacific on a Tuesday, and reply to comments for the first hours.

---

## 8. Stack Overflow contribution playbook

**What the platform expects (per its help centre):** be honest, answer the question completely, avoid overt
self-promotion, and **disclose your affiliation** whenever you mention your own project or link to it. A link that is
merely "your site" is treated as spam; a link to the primary documentation the question already names is fine.

**Finding questions worth answering**

- Search for real problems: `baileys auth state not saving`, `whatsapp bot session invalid`, `liquid filter json`,
  `vercel rewrite clean urls 404`, `vite prerender multiple routes`.
- Filter by unanswered or poorly answered questions (`is:q` plus `answers:0` or low answer votes).
- Only answer where you can add something specific: a code path, an error message, a version caveat, a reproduction.
- Never create a question in order to answer it with your own link. That pattern is treated as spam.

**Writing the answer**

1. Answer the question in the first paragraph. No preamble.
2. Show the code and explain the reasoning.
3. State version caveats explicitly ("Baileys 7.0.0-rc.x behaves differently from 6.x here").
4. Add the disclosure sentence if your project is relevant: *"I maintain ProBoy-MD, the bot this question is about, so
   the behaviour below is from its current source."*
5. Link only to primary documentation that the answer depends on. Do not add a portfolio link.
6. Edit the answer later if something is wrong. Reputation follows the edit history, and the edit history is public.

**What not to do:** paste the same answer in several questions, answer questions that only exist to mention the bot,
add "check out my website" lines, or use a new account with no history to post about your own project.

---

## 9. Reddit contribution drafts

Rules change. Open `reddit.com/r/<name>/about/rules` immediately before posting; if the rules prohibit promotion, the
post must contain no link to the portfolio and no mention of the bot. Reddit's general guidance to moderators is that
self-promotional content should stay close to 10% of a user's activity in a community.

### 9a. r/webdev — technical review (no links)

> **Title:** Review wanted: a bot command loader where every command declares its own permissions
>
> I maintain a WhatsApp bot where each command is a module exporting `name`, `aliases`, `category`, `description`,
> `usage` and flags like `groupOnly`, `adminOnly` and `botAdminNeeded`. The handler checks the flags before calling
> `execute`, and each command can still enforce stricter rules internally.
>
> What I am unsure about is the alias handling. The loader skips an alias when the token is already registered, so
> behaviour depends on directory order — first loaded wins — which feels fragile. I would especially welcome input on:
>
> 1. Should alias collisions be an error at load time rather than a silent skip?
> 2. Is a declarative permission model enough, or should the handler also support per-chat capability checks?
> 3. What would you log when a command is refused, so it is debuggable without capturing message content?
>
> Happy to share the loader code if it is useful. I am asking for design feedback rather than promotion, so I have not
> included links.

### 9b. r/selfhosted or r/node — deployment write-up (link only if the community allows it)

> **Title:** Notes from running a Node.js WhatsApp bot on a small VPS (including the parts that bit me)
>
> I run a Node.js WhatsApp bot with the Baileys library on a small VPS. Two things cost me more time than the code:
>
> - **The session files are the real state.** The bot is useless without them, so they need durable storage, restricted
>   permissions and encrypted backups. A pairing code is not a backup.
> - **The documented start command did not match the repository.** The `start` script pointed at an `index.js` that was
>   not in the tree, so the process refused to start. My advice for anyone self-hosting a bot from a repository: check
>   that the entry file actually exists before you set up systemd or pm2, and pin a known-good commit instead of tracking
>   `main`.
>
> Process management is boring but matters: a restart policy, logs to a private file, and a health check that checks the
> socket is connected rather than just that the process is alive.
>
> If there are rules here about linking, tell me and I will add the repository to a comment instead.

### 9c. r/node — question-first contribution

Rather than a promotion, ask a precise question and mention your own work only if it is directly relevant:

> I am refactoring the permission layer of a Node.js WhatsApp bot. Each command module declares flags such as
> `groupOnly` and `adminOnly`, and the handler resolves them before `execute` runs. I am considering moving to a
> capability model (`can("moderate")`) because the flag list keeps growing.
>
> Has anyone shipped a capability-style layer in a Node project? What broke — caching, group metadata fetches, or test
> doubles?

**Posting order:** spend the first week commenting helpfully in the community with no links at all. Then post.

---

## 10. Editorial pitch — Pakistani technology publications

Send individually to the technology or features desk. Use the publication's published contact address; never invent a
journalist's name or address. Keep it under 200 words.

> **Subject:** Story pitch: what an open-source WhatsApp bot teaches about shipping real software from Pakistan
>
> Hello,
>
> I am Shahan Ali, a developer from Burewala. I maintain ProBoy-MD, an open-source WhatsApp multi-device bot written in
> Node.js, and I document it publicly, including its limitations.
>
> I am not looking for a profile piece about me. The story I would pitch is a technical one: how a single maintainer
> designed a command system that stays readable past 200 commands, and what the honest cost of supporting an unofficial
> protocol looks like. I can provide the repository, the documentation, and specific code paths to explain.
>
> Two angles I could write:
>
> 1. "Modular command systems: what 224 command files taught me about testing and permissions" — with real code.
> 2. "Documenting a project honestly, including the parts that do not work yet" — the documentation site is the example.
>
> If it fits your calendar, I can send a draft within a week. If it does not fit, a short reply saying so is genuinely
> useful, and I will not follow up more than once.
>
> Shahan Ali (PROBOY)
> Portfolio: https://proboy.vercel.app/
> Repository: https://github.com/proboy315/ProBoy-MD
> Email: shahanali.dev@gmail.com

---

## 11. Guest-post pitch

> **Subject:** Guest post proposal: designing permission-safe command handlers for chat bots
>
> Hello,
>
> I would like to propose a technical guest post for your readers.
>
> **Working title:** *Permission-safe command handlers: a pattern for chat bots that anyone can extend*
>
> The post would cover how to structure a bot so that every command is an independently reviewable module, how to
> express chat-context and role permissions as data rather than convention, and how to test the refusals, which is where
> most of the real bugs live. It would include working JavaScript examples, an honest section on what the pattern does
> not solve (session security, third-party API reliability), and a pointer to the open-source project the examples come
> from.
>
> The article would be original to your site rather than a copy of anything already published, and I can revise to match
> your style guide and length.
>
> Is this a fit for your editorial calendar? If so, I will send a draft outline and then the full piece.
>
> Shahan Ali (PROBOY) — https://proboy.vercel.app/

---

## 12. YouTube technical walkthrough plan

**Title options**
- *ProBoy-MD: how 224 command files stay readable in one WhatsApp bot*
- *Inside a Baileys WhatsApp bot: permissions, sessions and the file that broke the start script*

**Description (draft)**
> A walkthrough of the architecture behind ProBoy-MD, an open-source WhatsApp multi-device bot written in Node.js on the
> Baileys library. I show the command loader, the permission checks in the handler, how a session is stored and backed up,
> and the deployment caveats I hit — including a start script that pointed at a file that was not in the repository.
>
> Everything shown comes from the current source at https://github.com/proboy315/ProBoy-MD. Written notes and the full
> documentation: https://proboy.vercel.app/proboy-md/docs
>
> 00:00 The problem with one big switch statement
> 04:10 How a message becomes a command
> 11:35 Permission flags, and what they do not cover
> 19:20 Alias collisions and loader order
> 26:05 Where sessions live, and how to back them up
> 32:40 The missing entry point (a real deployment failure)
> 38:10 What I would fix first

**Demonstration sequence**
1. Open `utils/commandLoader.js` and show the directory scan and the alias-collision skip.
2. Open `handler.js` and trace one message: prefix check → token → flags → `execute`.
3. Show `commands/group/kick.js` and `commands/dev/connect.js` side by side to demonstrate that folder name is not a
   permission level.
4. Show the session directory layout and a redacted backup file — never a live session.
5. Show `package.json` and the absent `index.js` on screen; explain what the error looks like.
6. Close with the documentation site so viewers can verify each claim themselves.

**Spoken script (opening, ~40 seconds)**
> "This is a WhatsApp bot with two hundred and twenty-something commands, so the interesting question is not what it
> does — it is how you keep something that size readable. I'm going to walk through the loader, the permission checks and
> the one deployment mistake that stopped the bot from starting at all, because that part is the part most tutorials skip."

**Recording rules:** use a test phone number only; never show session files, API keys, owner numbers or pairing codes;
blur any identifier; keep the pace slow enough to follow while reading code.

---

## 13. Brand fact sheet (for reuse in any pitch)

| Field | Value |
|---|---|
| Name | Shahan Ali |
| Brand | PROBOY (also ProBoy, itx_proboy, shahan315, proboy315) |
| Location | Burewala, Punjab, Pakistan (projects use Asia/Karachi) |
| Role | Full-Stack Developer, AI & WhatsApp Bot Architect, Shopify Expert |
| Education | ICS student, Govt Graduate College Burewala |
| Main project | ProBoy-MD — open-source Node.js WhatsApp multi-device bot (Baileys) |
| Repository | https://github.com/proboy315/ProBoy-MD |
| Audited counts | 224 JavaScript command files across 8 physical directories at commit `c05d3225` (2026-11-07) |
| Known caveats | Start script points at an absent `index.js`; package.json (1.0.0) and config.js (3.0.42) disagree; an older snapshot claimed 9 categories / 537 tokens / 531 menu commands |
| Recognition | Certificate of Recognition — Google Gemini QuizOff 2026, organised by CampusCrew and hosted on Unstop, 19 July 2026 (participation recognition, not a Google award) |
| Portfolio | https://proboy.vercel.app/ |
| Contact | shahanali.dev@gmail.com · +92 326 1684315 |
| Disambiguation | "This Shahan Ali is the PROBOY developer in Burewala, Punjab, Pakistan, owner of the ProBoy-MD repository. This refers only to that person and makes no claim about anyone else sharing the name." |

---

## 14. Public profile verification checklist

Run this on every profile you own or create. It is the same list for GitHub, LinkedIn, Dev.to, Reddit, Telegram, YouTube
and anything else.

| Check | Rule | Current state (2026-11-07) |
|---|---|---|
| Display name | "Shahan Ali" as the real name; PROBOY as the brand/handle | GitHub shows the handle `proboy315` — keep it, do not rename |
| Avatar | Same brand mark everywhere; no third-party logos, no impersonated org avatars | Portfolio favicon set published; profile avatars not checked from this workspace |
| Bio | Short bio from §1 verbatim; no inflated titles | Needs updating on Dev.to, Reddit, YouTube (not yet created) |
| Location | "Burewala, Punjab, Pakistan" — same wording everywhere | Portfolio, llms.txt and press kit consistent |
| Website | https://proboy.vercel.app/ (exact URL with trailing slash) | Consistent |
| GitHub | https://github.com/ProBoy315 — reachable (HTTP 200 confirmed) | Verified |
| LinkedIn | No verified profile URL supplied — omitted from the site | Removed 2026-11-07: the previously listed URL was unrelated to Shahan Ali; do not re-add without a user-supplied verified URL |
| Telegram | https://t.me/itx_proboy — reachable (HTTP 200 confirmed) | Verified, and used in the Person `sameAs` set |
| Repo link | https://github.com/proboy315/ProBoy-MD — reachable (HTTP 200 confirmed) | Verified |
| Spelling | "Shahan Ali", "PROBOY", "ProBoy-MD", "Burewala" — identical everywhere | Consistent |
| No inflated claims | No "Google award", "partner", "CEO", "expert" titles beyond the agreed role line | Verified on the site |
| Cross-links | Profile → portfolio → projects → docs → back to profile | Portfolio and docs now link back to the press kit and mentions pages |
