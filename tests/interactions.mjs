import assert from "node:assert/strict";
import fs from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch();
await fs.mkdir(".work", { recursive: true });
const base = process.env.QA_BASE || "http://localhost:4173";
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
await page.goto(base, { waitUntil: "networkidle" });

await page.getByRole("link", { name: "View My Projects", exact: true }).click();
assert.equal(new URL(page.url()).hash, "#projects");
await page.waitForTimeout(150);
assert.equal(await page.locator(".rail-link.is-active").getAttribute("aria-label"), "Projects");
await page.locator(".header-inner > a").first().focus();
await page.locator(".header-inner > a").first().click();
await page.waitForTimeout(150);
assert.equal(await page.evaluate(() => scrollY), 0, "Logo returns to the top even on the same page");

await page.locator(".hero-availability").click();
await page.evaluate(() => scrollTo(0, 1350));
await page.waitForTimeout(100);
assert(await page.locator(".site-header").evaluate((header) => header.classList.contains("is-hidden")));
await page.evaluate(() => scrollTo(0, 1150));
await page.waitForTimeout(100);
assert.equal(await page.locator(".site-header").evaluate((header) => header.classList.contains("is-hidden")), false);

await page.locator('input[type="file"]').setInputFiles({ name: "not-an-image.txt", mimeType: "text/plain", buffer: Buffer.from("not an image") });
await page.getByRole("alert").waitFor();
assert.match(await page.getByRole("alert").innerText(), /JPG, PNG/);

const requests = [];
page.on("request", (request) => { if (/profile(-640)?\.(jpg|webp)|\/hero\.jpg|\/img\.png/.test(request.url())) requests.push(request.url()); });
for (const route of ["/proboy-md", "/projects/proboy-md", "/showcase/luxecart", "/not-a-real-page"]) {
  await page.goto(base + route, { waitUntil: "networkidle" });
  assert(await page.locator("h1").count() >= 1);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
}
assert.equal(requests.length, 0);
assert.equal(pageErrors.length, 0);
const frame = Buffer.from(await page.evaluate(() => {
  const canvas = document.createElement("canvas"); canvas.width = 2; canvas.height = 2;
  const g = canvas.getContext("2d"); g.fillStyle = "#e21745"; g.fillRect(0,0,2,2);
  return canvas.toDataURL("image/png").split(",")[1];
}), "base64");
await context.close();

// All playback assets are intercepted test fixtures and are never written into public/.
const introContext = await browser.newContext({ viewport: { width: 1000, height: 700 } });
const introPage = await introContext.newPage();
await introPage.addInitScript(() => {
  window.__drawnFrames = [];
  const original = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (image, ...args) {
    const match = image?.src?.match(/progress-(\d+)\.png/);
    if (match) window.__drawnFrames.push(Number(match[1]));
    return original.apply(this, [image, ...args]);
  };
});
const requested = new Set();
await introPage.route("**/intro-animation/progress-*.png", async (route) => {
  requested.add(Number(route.request().url().match(/progress-(\d+)/)[1]));
  await route.fulfill({ contentType: "image/png", body: frame });
});
await introPage.route("**/intro-animation/audio.mp3", (route) => route.fulfill({ status: 404, body: "Test: audio unavailable" }));
await introPage.goto(base, { waitUntil: "domcontentloaded" });
await introPage.locator('[aria-label="Intro animation"]').waitFor();
assert.equal(await introPage.getByRole("button", { name: /enter experience|view experience/i }).count(), 0);
await introPage.locator('[aria-label="Intro animation"]').waitFor({ state: "detached", timeout: 16000 });
const drawn = await introPage.evaluate(() => window.__drawnFrames);
assert.equal(drawn[0], 0);
assert.equal(drawn.at(-1), 299);
assert(drawn.every((value, index) => index === 0 || value >= drawn[index - 1]), "Frames draw in numeric order");
assert.equal(requested.size, 300);
await introPage.reload({ waitUntil: "domcontentloaded" });
await introPage.locator('[aria-label="Intro animation"]').waitFor();
await introPage.getByRole("button", { name: "Skip", exact: true }).click();
await introPage.locator('[aria-label="Intro animation"]').waitFor({ state: "detached" });
await introPage.waitForTimeout(700);
assert.equal(await introPage.locator('[aria-label="Intro animation"]').count(), 0, "Skip does not restart playback");
await introContext.close();

const missing = await browser.newContext();
const missingPage = await missing.newPage();
await missingPage.goto(base, { waitUntil: "domcontentloaded" });
await missingPage.waitForSelector("#hero-name", { state: "attached" });
await missingPage.locator('[aria-label="Intro animation"]').waitFor({ state: "detached", timeout: 10000 });
assert(await missingPage.locator("#hero-name").isVisible());
await missing.close();
await browser.close();
const report = { navigation: "passed", headerAutoHide: "passed", invalidImage: "rejected", routes: "passed", runtimeErrors: pageErrors,
  intro: { automatic: true, firstFrame: drawn[0], lastFrame: drawn.at(-1), requested: requested.size, replayOnRefresh: true, skip: "passed", missingFrames: "graceful fallback", assets: "synthetic test fixtures, not the user's animation" } };
await fs.writeFile(".work/interaction-results.json", JSON.stringify(report, null, 2));
console.log("PASS: navigation; header auto-hide; image validation; routes; intro autoplay 0-299; refresh; skip; missing assets.");