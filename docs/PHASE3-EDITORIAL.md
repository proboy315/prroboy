# Phase 3 editorial roadmap (internal, not public URLs)

Reviewed 2026-11-07. "Published" means a complete article in `src/data/editorial.ts`. Other topics are deliberately not routed or indexed until checked against current source and primary documentation. Existing `src/data/blog.json` was a legacy article, replaced in the public blog because its command counts and startup assumptions are not reliable for the checked bot commit. Update publication dates only after real review. The owner-reported 94% analyzer score is not a ranking or traffic metric.

| # | Topic | State / research gate |
|---|---|---|
| 1 | What Is a WhatsApp Multi-Device Bot? Architecture, Use Cases, and Limitations | Draft; confirm Baileys API and platform caveats |
| 2 | Building a Command-Based WhatsApp Bot with Node.js: A Practical Architecture Guide | Draft; verify runnable entry point |
| 3 | Understanding Baileys Sessions, Authentication State, and Safe Session Handling | Published as `baileys-session-safety` |
| 4 | Designing a WhatsApp Bot Command Handler: Parsing, Aliases, and Categories | Published as `whatsapp-bot-command-handler` |
| 5 | Managing Multiple WhatsApp Bot Sessions: Design Considerations and Failure Modes | Draft; verify running manager |
| 6 | WhatsApp Bot Permissions: Owner, Admin, Sudo, and Public Command Boundaries | Draft; command-by-command audit required |
| 7 | Deploying a Node.js WhatsApp Bot: Environment, Logs, Restarts, and Reliability | Blocked; missing `index.js` at checked commit |
| 8 | Troubleshooting Common WhatsApp Bot Connection and Pairing Problems | Draft; test working deployment |
| 9 | How to Document a Large Open-Source Bot Command Library | Published as `documenting-open-source-command-library` |
| 10 | ProBoy-MD: Features, Architecture, Repository, and How Developers Can Explore It | Published as `proboy-md-source-audit` |
| 11 | Shopify Online Store 2.0: Sections, Templates, JSON Templates, and Theme Architecture | Draft; research Shopify theme docs |
| 12 | Practical Shopify Liquid: Objects, Filters, Tags, and Reusable Snippets | Draft; validate against Shopify Liquid docs |
| 13 | Building a Better Shopify Product Page: Variants, Media, Trust, and Mobile UX | Draft; validate current theme APIs |
| 14 | Shopify Cart UX: Quantity Controls, Feedback, and Common Implementation Mistakes | Draft; validate cart API |
| 15 | Shopify Store Performance: Images, Scripts, Fonts, and Core Web Vitals Basics | Draft; test before claiming results |
| 16 | Custom Shopify Theme Work: A Safe Development and Testing Workflow | Draft; research CLI and theme versioning |
| 17 | Integrating the Gemini API into a Web Application: A Developer's Checklist | Draft; verify current API/auth docs |
| 18 | Designing AI Features with Clear Inputs, Errors, Limits, and User Feedback | Draft; inspect actual integration |
| 19 | Prompt Engineering for Practical Developer Workflows: A Structured Approach | Draft; collect reproducible examples |
| 20 | Building AI-Assisted Tools Without Pretending a Demo Is a Live AI Service | Draft; verify demo behavior |
| 21 | React SEO: Rendering, Crawlability, Metadata, and Server-Delivered Content | Published as `react-seo-rendered-content` |
| 22 | Technical SEO for a React Portfolio: A Practical Deployment Checklist | Draft; test deployed 404 and redirects |
| 23 | Structured Data for a Developer Portfolio: Person, WebSite, Project, and Article | Published as `structured-data-developer-portfolio` |
| 24 | Building a Fast Portfolio: Images, Fonts, JavaScript, and Real-World Trade-offs | Draft; gather real measurements |
| 25 | Designing Accessible Interactive Interfaces: Keyboard, Focus, Forms, and Motion | Published as `accessible-interactive-interfaces` |
| 26 | Deploying a Front-End Project to Vercel: Routes, Headers, Redirects, and Build Output | Draft; verify live deployment behavior |
| 27 | How to Present Developer Projects So Clients Can Understand the Work | Published as `presenting-developer-projects` |
| 28 | Turning a Real Software Project into Useful Documentation and Case Studies | Draft; gather concrete source examples |
| 29 | A Practical Full-Stack Learning Roadmap for Students Building Real Projects | Draft; owner review of experience |
| 30 | Freelance Web Development in Pakistan: Scoping, Communication, Delivery, and Trust | Draft; owner review of real practice |

## Source audit and blockers

Bot checked at `c05d3225cc21d1d07d2c75bc6be496d48615a4d2` on 2026-11-07. There are 224 `.js` files in eight physical command directories (ai 49, dev 28, fun 43, general 26, group 30, media 12, textmaker 19, utility 17). `package.json` says `1.0.0` and `node index.js`; `config.js` says `3.0.42`; `index.js` is absent. The pre-existing site's `commands.json` snapshot says `6.0.1`, 224 files, 220 unique primary names, 537 invocable tokens, 9 logical categories, with a menu headline of 531 and 219 listed. These cannot be reconciled without further source and deployment evidence. The static command directory and playground were not regenerated in this phase. Obtain a supported entry point and current deployment revision from the owner before presenting a working install.

## Measurement notes

Existing site has Vercel Analytics enabled by default; GA4 and Clarity inject only when configured via environment or info.json. Search Console verification meta exists in index.html; a tag is not confirmation of ownership or measured results. Bing status was not verified. New interactions use Vercel Analytics events only when enabled. Review privacy/consent requirements before enabling optional GA4 or Clarity. No traffic or ranking numbers are implied.