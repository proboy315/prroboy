# Launch route matrix

Checked 2026-11-27. Candidate URLs use `http://127.0.0.1:4181` and serve the actual `dist/` build. The Arena column is the existing d9372 preview, not the candidate. The live column is read-only testing of `https://proboy.vercel.app`. Direct and reload columns report Chromium checks on the candidate.

| URL | Expected H1 (candidate HTML) | d9372 HTTP | Live HTTP | Candidate HTTP | Correct body and head | Desktop direct + reload | Mobile direct + reload | Result |
|---|---|---:|---:|---:|---|---|---|---|
| `/` | Shahan Ali (PROBOY) — Full-Stack Developer & Frontend Engineer | 200 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/404` | Page Not Found | Not checked | Not checked | 404 | Yes | Pass | Not sampled | VERIFIED |
| `/about` | Shahan Ali (PROBOY) | 200 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/admin` | Admin Control Panel \| PROBOY | Not checked | Not checked | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/blog` | Engineering notes, with receipts. | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/blog/accessible-interactive-interfaces` | Accessible Interactive Interfaces: Focus, Forms and Motion | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/blog/baileys-session-safety` | Baileys Sessions: Authentication State and Safe Handling | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/blog/documenting-open-source-command-library` | How to Document a Large Open-Source Bot Command Library | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/blog/geo-llmo-ai-visibility-baseline` | GEO & LLMO Baseline: AI Visibility & Disambiguation | 200 | 404 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/blog/presenting-developer-projects` | How to Present Developer Projects Without Inventing Results | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/blog/proboy-md-source-audit` | ProBoy-MD: A Source-First Guide to the Bot and Its Limits | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/blog/proboy-technical-seo-performance-audit` | ProBoy Technical SEO, AEO & Performance Case Study | 200 | 404 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/blog/react-seo-rendered-content` | React SEO: Rendering, Metadata and Crawlable Content | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/blog/structured-data-developer-portfolio` | Portfolio Structured Data Without Fake Authority | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/blog/whatsapp-bot-command-handler` | Designing a WhatsApp Bot Command Handler | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/contact` | Start a conversation with Shahan Ali | 200 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/demos` | 24 working product & interface demos | 200 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/demos/apex-motors` | Apex Motors | 200 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/demos/atelier-noir` | Atelier Noir | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/clientflow-crm` | ClientFlow CRM | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/control-room` | Demo Control Room | Not checked | Not checked | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/ember-kitchen` | Ember Kitchen | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/forge-docs` | Forge Docs | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/freshcart-market` | FreshCart | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/haven-properties` | Haven | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/ironpulse-club` | IronPulse | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/kanso-living` | Kanso Living | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/ledgernote-finance` | LedgerNote | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/lumina-botanicals` | Lumina Botanicals | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/luxecart-store` | LuxeCart | 200 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/demos/medicare-connect` | CarePoint Clinic | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/memberstack-hub` | MemberVault | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/meridian-press` | Meridian Press | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/northline-agency` | Northline | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/pulse-dashboard` | Pulse | 200 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/demos/skillforge-lms` | SkillForge | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/solis-stays` | Solis Stays | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/sprintboard-kanban` | SprintBoard | 200 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/demos/stagepass-live` | StagePass | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/synth-ai-studio` | Synth Studio | 200 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/demos/talentgrid-jobs` | TalentGrid | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/demos/voltix-gear` | Voltix Gear | 200 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/mentions` | Mentions & publications. | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/press` | Press kit and brand facts. | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/privacy` | Privacy & analytics. | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md` | ProBoy-MD | 404 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/proboy-md/docs` | Documentation home | 200 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/proboy-md/docs/admin-commands` | Admin category status | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/ai-commands` | AI commands | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/aliases` | Aliases and command search | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/command-categories` | Categories and count audit | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/command-syntax` | Command syntax and parsing | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/configuration` | Configuration and environment | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/deployment` | Hosting guidance | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/dev-commands` | Developer and owner commands | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/diagnostics` | Logs, health and diagnostics | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/faq-support` | FAQ, contribution and support | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/features` | Capabilities and limitations | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/fun-commands` | Fun commands | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/general-commands` | General commands | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/group-commands` | Group commands | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/installation` | Installation and setup caveat | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/media-commands` | Media commands | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/multi-session` | Multiple sessions | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/overview` | Project overview and use cases | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/pairing` | Pairing and first connection | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/permissions` | Permissions and access control | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/plugins` | Plugin installation and removal | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/process` | Start, stop and restart | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/requirements` | System requirements | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/security` | Security and privacy | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/session-storage` | Session storage and recovery | 200 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/textmaker-commands` | Text-maker commands | 404 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/troubleshooting` | Troubleshooting connection and commands | 404 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/updating` | Updating and compatibility | 404 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/proboy-md/docs/utility-commands` | Utility commands | 404 | 200 | 200 | Yes | Pass | Not sampled | VERIFIED |
| `/projects` | Real projects built by Shahan Ali | 404 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/projects/proboy-camlink` | ProBoy CamLink | Not checked | Not checked | 200 | Yes | Pass | Pass | VERIFIED |
| `/projects/proboy-encrypt-decrypt` | ProBoy Encrypt & Decrypt | 404 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/projects/proboy-js-obfuscator` | ProBoy JS Obfuscator | 404 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/projects/proboy-md` | ProBoy-MD | 404 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/projects/proboy-sim-database` | ProBoy-SiM_Database | 404 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/services` | Full-Stack, Frontend, Shopify, Bots & AI Services | 404 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/services/ai-integrations-automation` | Gemini AI & API Automation | 404 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/services/frontend-development` | Frontend & UI Engineering | 404 | 404 | 200 | Yes | Pass | Pass | VERIFIED |
| `/services/full-stack-web-development` | React & Node.js Full-Stack Development | 404 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/services/shopify-development` | Shopify Liquid & E-commerce Development | 404 | 200 | 200 | Yes | Pass | Pass | VERIFIED |
| `/services/whatsapp-bot-development` | WhatsApp Bot Development | 404 | 200 | 200 | Yes | Pass | Pass | VERIFIED |

The explicit 404 document and unknown URLs are expected to serve status 404. Admin, demo control room and the retired CamLink project serve their own pages and are not indexed. Verified alias examples include `/index.html`, `/services/`, the old Frontend `/index.html` path, and `/projects/camlink`.
