// Audited against ProBoy-MD commit c05d3225 (2026-11-07). Do not infer runtime behavior from metadata alone.
export type Doc = { slug: string; title: string; group: string; intro: string; sections: { heading: string; text: string; code?: string }[]; related?: string };
export { botRepo, botAuditCommit } from "./botSource";
const d = (slug: string, title: string, group: string, intro: string, sections: Doc["sections"], related?: string): Doc => ({ slug, title, group, intro, sections, related });
export const botDocs: Doc[] = [
  d("documentation-home", "Documentation home", "Start here", "A source-checked guide to ProBoy-MD. Begin with the overview, check requirements, then read the pairing and security guidance before using any command. This site is documentation, not a connected WhatsApp session.", [
    { heading: "Choose a path", text: "New to the project? Read Overview, Requirements, Installation caveat and Pairing in order. Already developing commands? Start with Command syntax, Permissions and the exact source files. The interactive playground is illustrative only." },
    { heading: "What was checked", text: "This guide was reviewed against the repository commit linked below on 2026-11-07. The checked tree contains 224 JavaScript command files in eight physical directories. Older commands.json reports nine logical categories and other counts; see the categories chapter before citing a total." }
  ], "proboy-md-source-audit"),
  d("overview", "Project overview and use cases", "Start here", "ProBoy-MD is a modular Node.js bot using Baileys to handle WhatsApp messages. Its handler dispatches commands from category directories; authenticated users run commands in a linked WhatsApp session, not on this website.", [
    { heading: "Architecture", text: "config.js holds defaults, utils/commandLoader.js discovers command modules, handler.js parses messages and checks access flags, and commands/<category>/*.js contains handlers. A separate pairing site is linked in the README. Inspect a deployment's actual source before treating README features as active." },
    { heading: "Appropriate use", text: "Use commands with consent in chats you control. Group tools require the correct group context and privileges. Media and AI utilities can depend on external services that change independently of this project." }
  ], "proboy-md-source-audit"),
  d("features", "Capabilities and limitations", "Start here", "The repository includes commands for chat utilities, AI integrations, group moderation, media and developer controls. Availability depends on the host, active session, remote APIs and each command's own input checks.", [
    { heading: "What is visible in source", text: "The eight physical command directories at the checked commit are ai, dev, fun, general, group, media, textmaker and utility. handler.js supports owner, sudo, moderator, admin, bot-admin, group and private context gates." },
    { heading: "What this site cannot prove", text: "A source file does not prove that a specific provider API is reachable or a WhatsApp session is connected. The playground is a local demonstration, not a live bot. Use the repository for current executable behavior." }
  ], "proboy-md-source-audit"),
  d("requirements", "System requirements", "Getting started", "The README advertises Node.js 20+ and Baileys 7.0.0-rc.9. Native dependencies and hosting requirements need validation on your target platform before deployment.", [
    { heading: "Before you begin", text: "Use a Node.js-capable host with persistent process and protected storage. package.json also lists sharp, canvas, ffmpeg-static and other packages that may need host-specific installation support. Own the WhatsApp account you link." },
    { heading: "Check the checked revision", text: "The repository's package.json starts node index.js, yet index.js is absent at the checked commit. Installation alone cannot establish a runnable bot. Request a corrected entry point or known-good revision from the maintainer before production setup." }
  ]),
  d("installation", "Installation and setup caveat", "Getting started", "Clone and install from the real repository, but do not assume npm start succeeds at the audited commit: its declared index.js entry point is missing.", [
    { heading: "Safe source inspection", text: "The commands below fetch the code and dependencies; they do not link an account. Review package scripts and the checked commit before starting any process.", code: "git clone https://github.com/proboy315/ProBoy-MD.git\ncd ProBoy-MD\nnpm install\nnode -p \"require('./package.json').scripts.start\"" },
    { heading: "Blocker", text: "At commit c05d3225, package.json says node index.js but the file does not exist. README's PM2 example also references index.js. Do not silently substitute proboy.js. Confirm an upstream fix or a supported deployment revision with the maintainer." }
  ], "proboy-md-source-audit"),
  d("configuration", "Configuration and environment", "Getting started", "config.js declares the default '.' prefix, owner and sudo settings, selfMode, sessionName and sessionID from process.env.SESSION_ID. settings/apis.js contains provider URLs and environment-variable lookups.", [
    { heading: "Keep secrets off the frontend", text: "Use the private environment configuration provided by your bot host. Never place SESSION_ID, provider credentials or pairing output in this Vite site's VITE_ variables, documentation or browser console. Some provider defaults are declared in source; review them before deployment." },
    { heading: "Version mismatch", text: "The checked package.json reports 1.0.0; config.js reports 3.0.42. The website's older commands.json snapshot reports 6.0.1. These are conflicting declarations, not proof of an installed release version." }
  ]),
  d("pairing", "Pairing and first connection", "Getting started", "The README documents a separate pairing-code site and a terminal fallback. This documentation does not request, store or transmit your number or credentials.", [
    { heading: "Pair your own account", text: "The README points to https://proboy-md.gt.tc/ for a phone-number pairing code. On your phone, use WhatsApp's Linked Devices flow to enter it. Verify the pairing site's trustworthiness and privacy handling before entering a number. The site here does not operate that service." },
    { heading: "Legacy session mode", text: "The README also documents SESSION_ID for an existing session string. Treat the string as a credential; do not paste it into an issue, a public command or a browser demo. The bot's missing startup entry point remains a blocker for this checked revision." }
  ], "baileys-session-safety"),
  d("session-storage", "Session storage and recovery", "Getting started", "Authentication state lets a linked device reconnect. Back it up only in encrypted, access-controlled storage; a pairing code or screenshot is not a safe backup.", [
    { heading: "Locate state in your deployment", text: "handler.js scans the configured sessionName directory and a sessions directory for auth files. The README separately describes database/sessions/<phone>/ settings. These paths serve different purposes; verify your running revision before copying or deleting either." },
    { heading: "Recovery", text: "Stop the bot, protect a verified backup and test restoration in a private environment. If a credential is exposed, revoke the linked device in WhatsApp and re-pair. Do not share raw auth files with support." }
  ], "baileys-session-safety"),
  d("process", "Start, stop and restart", "Operations", "Process management is host-specific. The README suggests npm start and PM2, but both reference missing index.js at the audited commit.", [
    { heading: "Resolve the entry point first", text: "Do not run the README's PM2 command unchanged. Confirm the supported entry file and commit with the maintainer. Then configure host restart policy and persistent private session storage; test a clean boot and a graceful stop." },
    { heading: "Restart commands", text: "commands/dev/restart.js exists in source. Check its flags and execution before using it on a live account; a web visitor cannot restart a bot through this documentation." }
  ]),
  d("command-syntax", "Command syntax and parsing", "Commands", "handler.js reads config.prefix ('.' by default), splits the remainder on whitespace and uses the first lowercased token to look up a command. The rest of the words are passed to the command.", [
    { heading: "Illustrative syntax", text: "In a connected WhatsApp chat, .ping is declared by commands/general/ping.js with alias .p and no arguments. .kick @user is declared by commands/group/kick.js but requires a group, a privileged sender, bot admin rights and a mentioned or replied-to member.", code: ".ping\n# In a group with permissions and an actual mention:\n.kick @user" },
    { heading: "Validate arguments", text: "The loader does not globally validate usage strings. Each execute function may require text, URLs, mentions or quoted media. Read the individual file before treating an example as reproducible." }
  ], "whatsapp-bot-command-handler"),
  d("aliases", "Aliases and command search", "Commands", "A module may declare aliases, but a declared alias is not guaranteed to register when it collides with an existing command token.", [
    { heading: "Loader behavior", text: "utils/commandLoader.js sorts directories and files, maps primary names and then aliases. It skips an alias when the token is already registered unless ALLOW_COMMAND_OVERRIDE=true. That environment flag can change dispatch behavior; do not enable it casually." },
    { heading: "Find a name", text: "Use the searchable command directory on /proboy-md to inspect the older extracted snapshot, then open the matching source file for this revision. A website search never executes the command." }
  ], "documenting-open-source-command-library"),
  d("command-categories", "Categories and count audit", "Commands", "The checked source has 224 JavaScript command files across eight physical folders. The older website snapshot reports nine logical categories, including admin, with different per-category distributions.", [
    { heading: "Counts are not interchangeable", text: "Checked tree: ai 49, dev 28, fun 43, general 26, group 30, media 12, textmaker 19, utility 17 (224 files). Older commands.json: 224 files, 220 unique primary names, 537 invocable tokens; its menu reports 531 total and 219 listed. The site snapshot was not re-generated from this commit and does not reconcile with its folder layout." },
    { heading: "Runtime caveat", text: "A physical file count is not a count of loaded commands. Loader registration can be affected by require errors, duplicate primary names and alias collisions. No runtime registration total is asserted here." }
  ], "documenting-open-source-command-library"),
  d("ai-commands", "AI commands", "Command reference", "49 JavaScript files are in commands/ai at the checked commit. These integrations may rely on external providers and should not be described as guaranteed live services.", [
    { heading: "Using the reference", text: "Search the directory for the exact command name, then inspect that file's exported usage and execute body for required text, media or API input. Do not infer a public permission level from its ai folder. Never submit secrets or sensitive messages to an unverified provider." },
    { heading: "Fallback and failure", text: "A command can fail if a provider changes its API, rate-limits requests or rejects a media input. The playground only simulates safe examples; it does not send messages to a bot." }
  ]),
  d("dev-commands", "Developer and owner commands", "Command reference", "28 JavaScript files sit in commands/dev at this commit. They include connect, restart, install, uninstall and settings-related controls; do not treat them as public commands.", [
    { heading: "Example: .connect", text: "commands/dev/connect.js declares aliases ['con'], ownerOnly, and usage for a session ID, status or del <number>. Its execute function additionally checks the primary owner. Status output can contain numbers and templates: never post it publicly." },
    { heading: "Safe inspection", text: "Open each source file to verify flags, arguments and side effects before use. A developer category label does not establish an access policy for every command." }
  ]),
  d("fun-commands", "Fun commands", "Command reference", "43 JavaScript files are in commands/fun. The directory groups entertainment-oriented handlers, not an access level or uptime promise.", [
    { heading: "Check each export", text: "Find name, aliases and usage in the file, then read execute for any remote image source, quoted input or failure path. A description in an older snapshot may no longer match the current source." },
    { heading: "Responsible use", text: "Avoid flooding chats with automated content. Keep tests in a consent-based chat or a local simulation." }
  ]),
  d("general-commands", "General commands", "Command reference", "26 JavaScript files are in commands/general at the checked commit. An example is ping.js, which declares name ping, alias p, usage .ping and a reply-based response-time check.", [
    { heading: "Example: .ping", text: "ping.js sends an initial reply and measures elapsed time around it. That value reflects that exchange, not a guaranteed end-to-end service-level metric. Run it only in a connected WhatsApp chat.", code: ".ping\n# Alias declared in ping.js:\n.p" },
    { heading: "Inspect before reuse", text: "Other general commands may require quoted messages or additional inputs. Refer to their individual files; the folder name alone does not confirm a command's context or safety." }
  ]),
  d("group-commands", "Group commands", "Command reference", "30 JavaScript files are in commands/group. These files deal with group context, but permissions vary by export and may include further runtime checks.", [
    { heading: "Example: .kick", text: "kick.js exports name kick, alias remove, usage .kick @user, groupOnly, adminOnly and botAdminNeeded. It requires a mention or reply and includes self-kick safeguards. Use moderation only with group consent and correct authority." },
    { heading: "Inspect each action", text: "Read execute before using a moderation action. Group-admin sender status and bot-admin status are checked separately by handler.js. No public website visitor can run a live group action here." }
  ], "whatsapp-bot-command-handler"),
  d("media-commands", "Media commands", "Command reference", "12 JavaScript files are in commands/media. Source modules include download-related handlers; external media sites, rights and service availability can change.", [
    { heading: "Verify the input", text: "Read each file's usage and execute to learn whether it accepts a URL, a reply or an attached file. Check upstream terms and copyright before downloading or redistributing media. Do not assume every URL or media type works." },
    { heading: "Resource limits", text: "Large files can use disk, memory and bandwidth. Test size limits on your own host and avoid sharing private content without consent." }
  ]),
  d("textmaker-commands", "Text-maker commands", "Command reference", "19 JavaScript files are in commands/textmaker. Effects can depend on remote rendering providers, so results are not guaranteed by the existence of a source file.", [
    { heading: "Find the syntax", text: "Inspect the exact exported usage and the handler's input parsing. A text effect may have provider-specific length limits or errors. Use non-sensitive sample text when testing." },
    { heading: "No live execution", text: "The portfolio lists commands and safe illustrative controls only. Running the real command requires your own connected bot instance." }
  ]),
  d("utility-commands", "Utility commands", "Command reference", "17 JavaScript files are in commands/utility at the checked commit. Utilities can include pairing and general helpers; each file's flags and dependencies must be checked separately.", [
    { heading: "Check current source", text: "An older index may list a different count. Inspect exported names and usage in the repository rather than guessing tokens from file names. Commands with network calls require a reachable service." },
    { heading: "Protect inputs", text: "Do not feed credentials, private URLs or personal data into an unknown utility or a public demo. This documentation stores no session or command submissions." }
  ]),
  d("admin-commands", "Admin category status", "Command reference", "There is no commands/admin directory in the checked repository tree. The older website commands.json contains an admin logical category with three entries; do not treat it as a verified physical category at this commit.", [
    { heading: "Where to look", text: "Owner and administrative behavior exists in commands/dev and commands/group and in handler.js flags. Identify each actual command by file and exported name, rather than assuming that the old admin category matches the new tree." },
    { heading: "Safe default", text: "Never run an administrative or destructive command based on a snapshot label. Review the current command source and your own role before using a connected bot." }
  ]),
  d("permissions", "Permissions and access control", "Security", "handler.js distinguishes owner, sudo, moderator, group admin, bot admin, group-only and private-only checks. Some commands impose stricter conditions inside execute.", [
    { heading: "Handler gates", text: "ownerOnly is allowed for a privileged sender (owner or sudo at this layer); modOnly checks moderator or privileged sender; adminOnly checks group admin or privileged sender. groupOnly and privateOnly enforce chat context. botAdminNeeded checks the bot's own group-admin status." },
    { heading: "Do not rely on flags alone", text: "connect.js separately requires the primary owner despite declaring ownerOnly. kick.js also validates a mention or reply. The owner should review each command before sharing access; do not expose session data or elevate users to bypass checks." }
  ], "whatsapp-bot-command-handler"),
  d("multi-session", "Multiple sessions", "Operations", "The README documents multiple session strings and a primary-owner .connect command. A running manager is required, and account management should never be exposed in a browser demo.", [
    { heading: "Source constraints", text: "connect.js declares .connect <session_id>, .connect status and .connect del <number>. It checks the primary owner and requires globalThis.ProBoySessionManager. The status subcommand may reveal connected numbers and remote templates; keep output private." },
    { heading: "Failure handling", text: "If the manager is absent, the command asks for a restart. Do not delete an auth directory without verified backups and clear ownership. Confirm an upstream runnable version before attempting multi-session hosting." }
  ]),
  d("plugins", "Plugin installation and removal", "Operations", "The checked tree has commands/dev/install.js and uninstall.js, and the README describes file-based command modules. These actions may change executable code.", [
    { heading: "Audit first", text: "Only install code you trust from a reviewed source. Check each command's flags and execute path before running install/uninstall on a connected bot. A remote plugin can access process credentials if executed in Node.js." },
    { heading: "Development contract", text: "The README points to PROMPT.MD for the plugin contract and example files. The loader discovers .js files in category directories. Test a plugin in an isolated instance and keep a backup; this documentation does not provide one-click installation." }
  ]),
  d("troubleshooting", "Troubleshooting connection and commands", "Operations", "Separate install, authentication, connection, dispatch and provider failures. A missing entry point cannot be fixed by re-pairing a phone.", [
    { heading: "Triage by layer", text: "If npm start reports missing index.js at the checked commit, stop and request a supported revision. If linking fails on a runnable deployment, check pairing site availability, device linking and protected auth state without sharing a code. If a command is ignored, check the prefix and whether the loader registered it." },
    { heading: "Permission errors", text: "Check whether the chat is a group, whether the sender has the required role and whether the bot itself is group admin. For provider failures, inspect the individual command and provider configuration. Redact phone numbers and tokens before filing an issue." }
  ]),
  d("diagnostics", "Logs, health and diagnostics", "Operations", "handler.js logs dispatch information and the repository includes commands/dev/health.js. Neither proves a public uptime dashboard or a live service status.", [
    { heading: "Read logs safely", text: "Use your host's private log viewer. Distinguish startup failures from message-handler errors and provider errors; avoid logging complete messages, pairing output or session credentials. Rotate and limit access to logs." },
    { heading: "Check the running revision", text: "Record the deployment commit, Node version and whether commandLoader.js reported module load errors. A static command count cannot show which modules successfully loaded in production." }
  ]),
  d("security", "Security and privacy", "Security", "A linked WhatsApp session and provider keys are sensitive. Do not publish them in Vite variables, public docs, screenshots or logs; do not automate unsolicited messaging.", [
    { heading: "Secrets and consent", text: "Keep SESSION_ID and API credentials in the bot host's private environment. Restrict process and backup access. Review anti-delete, broadcast and logging behavior against participants' expectations, applicable law and platform terms before enabling them." },
    { heading: "Incident response", text: "If credentials leak, revoke linked devices, rotate provider keys, remove exposed artifacts and inspect logs. A public website visitor never needs access to your bot state. The command playground is a simulation only." }
  ], "baileys-session-safety"),
  d("deployment", "Hosting guidance", "Operations", "The README recommends a Node-capable host and a process manager. Persistent, private authentication storage is essential; this static Vite portfolio is not a bot host.", [
    { heading: "Deployment checklist", text: "Confirm a supported bot commit and entry point, install dependencies on the target architecture, set private configuration, arrange durable restricted storage, then test pairing and a harmless command. Monitor restarts and backup recovery." },
    { heading: "Known blocker", text: "The audited commit has no index.js although npm start and the README's PM2 example reference it. Do not publish this as a verified working one-command deployment until upstream corrects or confirms the executable path." }
  ]),
  d("updating", "Updating and compatibility", "Operations", "The README and metadata disagree about the version. Pin a known-good commit for deployment and review changes before updating command modules or Baileys.", [
    { heading: "Record what you run", text: "At the checked commit, package.json is 1.0.0, config.js is 3.0.42 and the site's older snapshot is 6.0.1. None is independently validated as the installed release. Note your deployed commit and Node version in private operations records." },
    { heading: "Upgrade safely", text: "Back up protected state, inspect dependency and loader changes, test permissions and pairing in a separate instance, then deploy with rollback available. Follow Baileys upstream compatibility guidance for prerelease changes." }
  ]),
  d("faq-support", "FAQ, contribution and support", "Community", "Start with the source and its README, then ask a narrowly scoped question with a redacted error and commit ID. Never include session data or phone numbers in a public issue.", [
    { heading: "Common questions", text: "Can I run a command here? No, this is a documentation and simulation site. Why do command counts differ? The older snapshot and checked repository count different things and do not agree on categories. Does npm start work at this commit? The declared index.js file is missing; confirm a fixed upstream revision." },
    { heading: "Contribute responsibly", text: "Open the repository's issues and source before proposing changes. Include the relevant file, reproduction steps, environment and a safe test case. Do not attach session backups, personal message content or private API credentials." }
  ]),
];
export const getBotDoc = (slug: string) => botDocs.find((x) => x.slug === slug);