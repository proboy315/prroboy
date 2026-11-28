import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const convert = (args) => execFileSync("convert", args, { stdio: "inherit" });

const tmpDir = path.resolve(".work/asset-tmp");
fs.mkdirSync(tmpDir, { recursive: true });
fs.mkdirSync("public/images", { recursive: true });

if (process.argv.includes("--legacy-cover")) {
  legacySimCover();
  fs.rmSync(tmpDir, { recursive: true, force: true });
  process.exit(0);
}

const portraitSrc = "public/images/shahan-ali-portrait.jpg";
if (!fs.existsSync(portraitSrc)) {
  throw new Error(`Missing source portrait: ${portraitSrc}`);
}

const origPortrait = path.join(tmpDir, "portrait-source.jpg");
fs.copyFileSync(portraitSrc, origPortrait);

// Keep the portrait input unchanged; only generate its derivatives.

for (const w of [480, 800, 1200]) {
  convert([origPortrait, "-strip", "-resize", `${w}x`, "-quality", "62", `public/images/shahan-ali-portrait-${w}.avif`]);
  convert([origPortrait, "-strip", "-resize", `${w}x`, "-quality", "82", `public/images/shahan-ali-portrait-${w}.webp`]);
  if (w < 1200) {
    convert([origPortrait, "-strip", "-resize", `${w}x`, "-sampling-factor", "4:2:0", "-interlace", "Plane", "-quality", "82", `public/images/shahan-ali-portrait-${w}.jpg`]);
  }
}

// 2. Generate Favicon & PWA icon set (square crop framing head & shoulders)
const squareIconMaster = path.join(tmpDir, "icon-master.png");
convert([origPortrait, "-crop", "1160x1160+268+50", "+repage", "-strip", squareIconMaster]);

convert([squareIconMaster, "-resize", "16x16", "public/favicon-16x16.png"]);
convert([squareIconMaster, "-resize", "32x32", "public/favicon-32x32.png"]);
convert([squareIconMaster, "-resize", "48x48", "public/favicon-48x48.png"]);
convert(["public/favicon-16x16.png", "public/favicon-32x32.png", "public/favicon-48x48.png", "public/favicon.ico"]);
convert([squareIconMaster, "-resize", "180x180", "public/apple-touch-icon.png"]);
convert([squareIconMaster, "-resize", "192x192", "public/android-chrome-192x192.png"]);
convert([squareIconMaster, "-resize", "512x512", "public/android-chrome-512x512.png"]);

// 3. Generate real 1200x630 Open Graph share card (public/images/og-shahan-ali.jpg)
const ogRightPortrait = path.join(tmpDir, "og-portrait.png");
const ogLeftFadeMask = path.join(tmpDir, "og-mask.png");
const ogGradBg = path.join(tmpDir, "og-grad-bg.png");
const ogBasePng = path.join(tmpDir, "og-base.png");

convert([origPortrait, "-strip", "-resize", "x630", ogRightPortrait]);
// gradient:white-black rotated 90 deg clockwise -> black on LEFT, white on RIGHT!
convert([
  "(", "-size", "630x190", "gradient:white-black", "-rotate", "90", ")",
  "(", "-size", "210x630", "xc:white", ")",
  "(", "-size", "630x23", "gradient:black-white", "-rotate", "90", ")",
  "+append",
  ogLeftFadeMask,
]);
convert([ogRightPortrait, ogLeftFadeMask, "-alpha", "off", "-compose", "CopyOpacity", "-composite", ogRightPortrait]);

// Step A: Ambient background canvas
convert([
  "-size", "1200x630", "xc:#050507",
  "(", "-size", "740x740", "radial-gradient:#ef1d3e44-#05050700", ")",
  "-gravity", "East", "-geometry", "-40+0", "-compose", "Screen", "-composite",
  "(", "-size", "480x480", "radial-gradient:#ef1d3e24-#05050700", ")",
  "-gravity", "NorthWest", "-geometry", "-80-80", "-compose", "Screen", "-composite",
  ogGradBg,
]);

// Step B: Clean text & UI primitives without -geometry interference
convert([
  ogGradBg,
  "-gravity", "NorthWest",
  "-fill", "none", "-stroke", "#ffffff22", "-strokewidth", "2",
  "-draw", "roundrectangle 24,24 1176,606 24,24",
  // Brand PROBOY mark + text
  "-stroke", "none", "-fill", "#e11d2e",
  "-draw", "polygon 82,76 112,76 107,85 87,85",
  "-draw", "polygon 78,88 103,88 99,96 85,96 79,109 71,109",
  "-font", "DejaVu-Sans-Bold", "-pointsize", "26", "-fill", "#ffffff",
  "-draw", "text 128,77 'PROBOY'",
  // Positioning pill
  "-fill", "#ef1d3e22", "-stroke", "#ef1d3e88", "-strokewidth", "1.5",
  "-draw", "roundrectangle 72,144 494,184 20,20",
  "-stroke", "none", "-fill", "#ef1d3e",
  "-draw", "circle 94,164 94,159",
  "-font", "DejaVu-Sans-Bold", "-pointsize", "13.5", "-fill", "#fecdd3",
  "-draw", "text 112,156 'FULL-STACK & FRONTEND DEVELOPER'",
  // Hero Name
  "-font", "DejaVu-Sans-Bold", "-pointsize", "72", "-fill", "#ffffff",
  "-draw", "text 72,216 'Shahan Ali'",
  "-fill", "#ef1d3e",
  "-draw", "roundrectangle 74,306 172,312 3,3",
  // Core Commercial Stack
  "-font", "DejaVu-Sans", "-pointsize", "22", "-fill", "#e4e4e7",
  "-draw", "text 72,340 'React & Node.js  ·  Shopify Liquid'",
  "-draw", "text 72,376 'WhatsApp Bots (ProBoy-MD)  ·  Gemini AI'",
  // Proof Pills
  "-fill", "#ffffff12", "-stroke", "#ffffff28", "-strokewidth", "1",
  "-draw", "roundrectangle 72,442 260,482 10,10",
  "-draw", "roundrectangle 274,442 456,482 10,10",
  "-draw", "roundrectangle 470,442 656,482 10,10",
  "-stroke", "none", "-font", "DejaVu-Sans-Mono", "-pointsize", "14", "-fill", "#e4e4e7",
  "-draw", "text 88,454 '224 Bot Commands'",
  "-draw", "text 292,454 '24 Live UI Demos'",
  "-draw", "text 488,454 'QuizOff 2026 Cert'",
  // Location & URL
  "-font", "DejaVu-Sans", "-pointsize", "17", "-fill", "#a1a1aa",
  "-draw", "text 72,534 'Burewala, Punjab, Pakistan   ·   proboy.vercel.app'",
  ogBasePng,
]);

convert([
  ogBasePng,
  ogRightPortrait,
  "-gravity", "East", "-geometry", "+26+0", "-compose", "Over", "-composite",
  "-strip", "-sampling-factor", "4:2:0", "-interlace", "Plane", "-quality", "88",
  "public/images/og-shahan-ali.jpg",
]);

// 4. Optimize Project Covers into 1280x720 (16:9) cards
function buildFramedProjectCover(artPath, outBase, badge, title, subtitle, accentHex) {
  const artSmall = path.join(tmpDir, `${path.basename(outBase)}-art.png`);
  const bgGrad = path.join(tmpDir, `${path.basename(outBase)}-grad.png`);
  const bgPng = path.join(tmpDir, `${path.basename(outBase)}-bg.png`);
  const full1280 = path.join(tmpDir, `${path.basename(outBase)}-full.png`);

  convert([artPath, "-strip", "-resize", "490x490", artSmall]);
  convert([
    "-size", "1280x720", "xc:#07070a",
    "(", "-size", "680x680", `radial-gradient:${accentHex}3b-#07070a00`, ")",
    "-gravity", "East", "-geometry", "+40+0", "-compose", "Screen", "-composite",
    bgGrad,
  ]);
  convert([
    bgGrad,
    "-gravity", "NorthWest",
    "-fill", "#ffffff0f", "-stroke", "#ffffff28", "-strokewidth", "1.5",
    "-draw", "roundrectangle 64,196 500,238 21,21",
    "-stroke", "none", "-font", "DejaVu-Sans-Mono-Bold", "-pointsize", "15", "-fill", "#fda4af",
    "-draw", `text 86,209 '${badge}'`,
    "-font", "DejaVu-Sans-Bold", "-pointsize", "56", "-fill", "#ffffff",
    "-draw", `text 64,264 '${title}'`,
    "-fill", accentHex, "-draw", "roundrectangle 64,344 160,350 3,3",
    "-font", "DejaVu-Sans", "-pointsize", "21", "-fill", "#e4e4e7",
    "-draw", `text 64,378 '${subtitle}'`,
    "-font", "DejaVu-Sans-Mono", "-pointsize", "18", "-fill", "#a1a1aa",
    "-draw", "text 64,430 'Shahan Ali (PROBOY)  ·  proboy.vercel.app'",
    bgPng,
  ]);
  convert([bgPng, artSmall, "-gravity", "East", "-geometry", "+74+0", "-compose", "Over", "-composite", full1280]);

  for (const w of [640, 1000]) {
    convert([full1280, "-strip", "-resize", `${w}x`, "-quality", "64", `${outBase}-${w}.avif`]);
    convert([full1280, "-strip", "-resize", `${w}x`, "-quality", "84", `${outBase}-${w}.webp`]);
    convert([full1280, "-strip", "-resize", `${w}x`, "-sampling-factor", "4:2:0", "-interlace", "Plane", "-quality", "85", `${outBase}-${w}.jpg`]);
  }
}

buildFramedProjectCover("public/botimg.png", "public/images/proboy-md-cover", "WHATSAPP BOT · NODE.JS + BAILEYS", "ProBoy-MD", "224 modular command files across 8 categories", "#ef1d3e");
buildFramedProjectCover("public/images/encrypt&decrypt.png", "public/images/proboy-encrypt-decrypt", "WEB CRYPTO · AES-256-GCM + LSB", "Encrypt & Decrypt", "Client-side encryption & steganography", "#38bdf8");

function buildGraphicCover(outBase, badge, title, subtitle, lines, accentHex) {
  const gradPath = path.join(tmpDir, `${path.basename(outBase)}-grad.png`);
  const pngPath = path.join(tmpDir, `${path.basename(outBase)}.png`);
  const textCmds = [];
  lines.forEach((ln, idx) => {
    textCmds.push("-font", "DejaVu-Sans-Mono", "-pointsize", "17", "-fill", idx === 0 ? "#fda4af" : "#d4d4d8");
    textCmds.push("-draw", `text 684,${240 + idx * 42} '${ln}'`);
  });
  convert([
    "-size", "1280x720", "xc:#07070a",
    "(", "-size", "680x680", `radial-gradient:${accentHex}3b-#07070a00`, ")",
    "-gravity", "East", "-geometry", "+40+0", "-compose", "Screen", "-composite",
    gradPath,
  ]);
  convert([
    gradPath,
    "-gravity", "NorthWest",
    "-fill", "#ffffff0f", "-stroke", "#ffffff28", "-strokewidth", "1.5",
    "-draw", "roundrectangle 64,196 500,238 21,21",
    "-stroke", "none", "-font", "DejaVu-Sans-Mono-Bold", "-pointsize", "15", "-fill", "#fda4af",
    "-draw", `text 86,209 '${badge}'`,
    "-font", "DejaVu-Sans-Bold", "-pointsize", "52", "-fill", "#ffffff",
    "-draw", `text 64,264 '${title}'`,
    "-fill", accentHex, "-draw", "roundrectangle 64,340 160,346 3,3",
    "-font", "DejaVu-Sans", "-pointsize", "21", "-fill", "#e4e4e7",
    "-draw", `text 64,378 '${subtitle}'`,
    "-font", "DejaVu-Sans-Mono", "-pointsize", "17", "-fill", "#a1a1aa",
    "-draw", "text 64,430 'Shahan Ali (PROBOY)  ·  proboy.vercel.app'",
    "-fill", "#0d0e14", "-stroke", "#ffffff28", "-strokewidth", "1.5",
    "-draw", "roundrectangle 644,160 1212,560 22,22",
    "-stroke", "none",
    "-fill", "#ef4444", "-draw", "circle 684,196 684,189",
    "-fill", "#f59e0b", "-draw", "circle 708,196 708,189",
    "-fill", "#10b981", "-draw", "circle 732,196 732,189",
    ...textCmds,
    pngPath,
  ]);
  for (const w of [640, 1000]) {
    convert([pngPath, "-strip", "-resize", `${w}x`, "-quality", "64", `${outBase}-${w}.avif`]);
    convert([pngPath, "-strip", "-resize", `${w}x`, "-quality", "84", `${outBase}-${w}.webp`]);
    convert([pngPath, "-strip", "-resize", `${w}x`, "-sampling-factor", "4:2:0", "-interlace", "Plane", "-quality", "85", `${outBase}-${w}.jpg`]);
  }
}

buildGraphicCover(
  "public/images/proboy-js-obfuscator",
  "DEVELOPER TOOL · CLIENT-SIDE JS",
  "JS Obfuscator",
  "Browser-only identifier mangling & transform",
  [
    "// Local transform (zero upload)",
    "const _0x4a = mangleIdentifiers(src);",
    "const _0x9f = encodeStrings(_0x4a);",
    "// Note: Obfuscation != encryption",
    "// Keeps secrets strictly server-side",
    "exportBundle({ compact: true });",
  ],
  "#f59e0b"
);

function legacySimCover() {
  buildGraphicCover(
    "public/images/proboy-sim-database", "PROJECT ARCHIVE", "SiM Database UI", "Earlier browser interface concept",
    ["ARCHIVED NOTES", "No live lookup or database proof.", "See the portfolio architecture", "for documented full-stack work."],
    "#10b981"
  );
}
legacySimCover();

// 5. Optimize QuizOff Certificate variants
const certSrc = "public/images/quizoff_certificate_1786079838704.png";
for (const w of [640, 1000]) {
  convert([certSrc, "-strip", "-resize", `${w}x`, "-quality", "65", `public/images/quizoff-certificate-${w}.avif`]);
  convert([certSrc, "-strip", "-resize", `${w}x`, "-quality", "85", `public/images/quizoff-certificate-${w}.webp`]);
  convert([certSrc, "-strip", "-resize", `${w}x`, "-sampling-factor", "4:2:0", "-interlace", "Plane", "-quality", "85", `public/images/quizoff-certificate-${w}.jpg`]);
}

fs.rmSync(tmpDir, { recursive: true, force: true });
console.log("Generated OG card, favicons, and responsive AVIF/WebP/JPG assets.");
