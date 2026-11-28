import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

const base = process.env.QA_BASE || "http://127.0.0.1:4173";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
const errors = [];
page.on("pageerror", error => errors.push(error.message));
try {
  // Vite preview serves nested index.html at slash-suffixed paths; Vercel maps clean URLs.
  await page.goto(base + "/blog/", { waitUntil: "networkidle" });
  assert.match(await page.locator("h1").innerText(), /Engineering notes/);
  await page.getByLabel("Search articles").fill("Baileys");
  assert((await page.locator(".reading-list article").count()) >= 1);
  await page.getByLabel("Search articles").fill("no-matching-article-zz");
  assert(await page.getByText("No articles found").isVisible());
  await page.getByRole("button", { name: "Reset search" }).click();
  await page.getByRole("button", { name: "Project Practice" }).click();
  assert.equal(await page.locator(".reading-list article").count(), 1);
  await page.goto(base + "/blog/whatsapp-bot-command-handler/", { waitUntil: "networkidle" });
  assert.equal(await page.locator("h1").count(), 1);
  await page.getByRole("button", { name: "Copy example code" }).first().click();
  await page.getByText("Copied", { exact: true }).first().waitFor({ timeout: 3000 });
  await page.locator(".reading-toc a").first().click();
  assert.match(new URL(page.url()).hash, /parse-before-you-dispatch/);
  await page.goto(base + "/proboy-md/docs/", { waitUntil: "networkidle" });
  await page.getByLabel("Search documentation").fill("index.js");
  assert((await page.locator(".reading-doc-search-results a").count()) >= 1);
  await page.locator(".reading-doc-search-results a").first().click();
  assert(page.url().includes("/proboy-md/docs/"));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(base + "/proboy-md/docs/installation/", { waitUntil: "networkidle" });
  assert(await page.getByText("Browse documentation chapters").isVisible());
  await page.locator(".reading-mobile-nav summary").click();
  assert(await page.locator(".reading-mobile-nav a[href='/proboy-md/docs/pairing']").isVisible());
  const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  assert.equal(wide, false, "No horizontal overflow on mobile docs");
  assert.deepEqual(errors, []);
  console.log("Phase 3 browser interactions: PASS");
} finally { await browser.close(); }