// Facts below are limited to what the owner supplied or what was verified in public source
// during the Phase 4 audit (2026-11-07). Nothing here is aspirational or inferred.
export const AUDIT_DATE = "2026-11-07";
export const BOT_REPO = "https://github.com/proboy315/ProBoy-MD";
export const BOT_COMMIT = "c05d3225cc21d1d07d2c75bc6be496d48615a4d2";

export const bios = {
  short:
    "Shahan Ali (PROBOY) is a full-stack developer from Burewala, Punjab, Pakistan. He builds web applications, the open-source ProBoy-MD WhatsApp multi-device bot, Shopify storefronts, and Google Gemini AI integrations.",
  medium:
    "Shahan Ali, known online as PROBOY, is a full-stack developer, AI and WhatsApp bot architect, and Shopify specialist based in Burewala, Punjab, Pakistan. He maintains ProBoy-MD, an open-source Node.js bot for WhatsApp multi-device automation, and builds React web apps, Shopify Online Store 2.0 themes, and Gemini-powered tools. He also writes source-checked engineering articles and maintains a documentation centre for his own project.",
  detailed:
    "Shahan Ali, known online as PROBOY, proboy315, shahan315 and itx_proboy, is a full-stack developer from Burewala, Punjab, Pakistan. His work sits where product engineering and applied AI meet: he maintains ProBoy-MD, an open-source Node.js WhatsApp multi-device bot built on the Baileys library, and he builds React web applications, Shopify Online Store 2.0 storefronts, and Google Gemini integrations for real use cases. He documents his own systems in public, including a command reference and a documentation centre that records what the source code actually does rather than what a marketing page claims. He studies ICS at Govt Graduate College Burewala, and in July 2026 he received a Certificate of Recognition for the Google Gemini QuizOff 2026, organised by CampusCrew and hosted on Unstop. He is open to freelance web, bot, Shopify and AI integration work.",
};

export const factSheet = {
  identity: {
    label: "Name",
    value: "Shahan Ali",
    note: "Professional display name. Public brand: PROBOY. Alternate handles: ProBoy, itx_proboy, shahan315, proboy315.",
  },
  location: {
    label: "Location",
    value: "Burewala, Punjab, Pakistan",
    note: "Time zone used by the projects: Asia/Karachi.",
  },
  role: {
    label: "Role",
    value: "Full-Stack Developer, AI & WhatsApp Bot Architect, Shopify Expert",
    note: "Consistent wording used across the portfolio, press kit and project pages.",
  },
  education: {
    label: "Education",
    value: "ICS student, Govt Graduate College Burewala",
    note: "Intermediate in Computer Science.",
  },
  recognition: {
    label: "Recognition",
    value: "Certificate of Recognition — Google Gemini QuizOff 2026",
    note: "Organised by CampusCrew and hosted on Unstop. Awarded to Shahan (Shahan Ali) on 19 July 2026. This is a certificate of recognition for participation, not an employment, partnership, endorsement or award from Google.",
  },
  work: {
    label: "Public work",
    value: "ProBoy-MD and four browser-based tools",
    note: "ProBoy-MD is the open-source bot. The other projects — CamLink, JS Obfuscator, Encrypt & Decrypt and SiM Database — are browser utilities published on the portfolio.",
  },
} as const;

export const projectFacts = {
  "ProBoy-MD": {
    summary:
      "Open-source WhatsApp multi-device bot written in Node.js on top of the Baileys library. Commands are self-contained modules loaded from category folders, and the handler checks owner, sudo, moderator, group-admin and bot-admin permissions before dispatch.",
    repository: BOT_REPO,
    verified: [
      "Repository is public and readable at commit " + BOT_COMMIT + ".",
      "224 JavaScript command files across eight physical command directories: ai 49, dev 28, fun 43, general 26, group 30, media 12, textmaker 19, utility 17.",
      "Command metadata is explicit in source (name, aliases, category, description, usage) and permissions are enforced in the handler, not by folder name.",
      "MIT licence, Node.js project with Baileys as the WhatsApp protocol layer.",
    ],
    caveats: [
      "The repository's declared start script points at index.js, which is absent at the audited commit, so a working one-command start was not verified.",
      "An older snapshot used by this website recorded nine logical categories and 537 invocable tokens. Those figures describe a different snapshot and are not reconciled with the audited commit.",
      "package.json and config.js declare different versions (1.0.0 and 3.0.42). Treat the deployed revision as the source of truth.",
    ],
  },
} as const;

export const pressAssets = [
  {
    id: "og-card",
    label: "Open Graph share card (1200×630 JPEG)",
    path: "/images/og-shahan-ali.jpg",
    status: "published",
    note: "ProBoy brand card (name, role and portrait). Used for social previews on every page.",
  },
  {
    id: "portrait",
    label: "Portrait photograph",
    path: "/images/shahan-ali-portrait.jpg",
    status: "published",
    note: "The original portrait photograph of Shahan Ali, used on the homepage and as the source of the favicon set.",
  },
  {
    id: "certificate",
    label: "QuizOff certificate image",
    path: "/images/quizoff_certificate_1786079838704.png",
    status: "published",
    note: "Image of the certificate. Its exact wording is also reproduced on the About page and in this press kit.",
  },
  {
    id: "favicon",
    label: "Favicon set (ICO, 16/32/48 PNG, 180×180 touch icon, 192/512 PNG)",
    path: "/favicon.ico",
    status: "published",
    note: "Square crop of the official portrait, generated from the original file.",
  },
] as const;

export const contactChannels = [
  { label: "Email", value: "shahanali.dev@gmail.com", href: "mailto:shahanali.dev@gmail.com", note: "Preferred for press and verification requests." },
  { label: "WhatsApp", value: "+92 326 1684315", href: "https://wa.me/923261684315", note: "Available for scoping conversations." },
  { label: "GitHub", value: "github.com/ProBoy315", href: "https://github.com/ProBoy315", note: "Code and public projects." },
] as const;
