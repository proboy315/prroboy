import fs from "node:fs/promises";
import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true });
const base = process.env.QA_BASE || "http://localhost:4173";
await fs.mkdir(".work/screenshots", { recursive: true });
const report = [];
const errors = [];

for (const [width, height] of [[1536,1024],[1440,900],[1280,720],[1280,560],[1280,420],[1100,650],[1024,768],[820,1100],[844,390],[390,844],[320,680]]) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const bounds = await page.evaluate(() => {
    const rect = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const { top, bottom, left, right, height } = element.getBoundingClientRect();
      return { top, bottom, left, right, height, display: getComputedStyle(element).display };
    };
    return {
      overflow: document.documentElement.scrollWidth > innerWidth,
      header: rect(".site-header"), rail: rect(".rail-shell"), home: rect(".rail-links a:first-child"),
      toggle: rect(".rail-toggle"), visual: rect(".hero-visual"), copy: rect(".hero-content"),
      railVisible: getComputedStyle(document.querySelector(".section-rail")).display !== "none",
      oldImage: [...document.images].some((image) => /profile(-640)?\.(jpg|webp)|\/hero\.jpg|\/img\.png/.test(image.currentSrc)),
    };
  });
  assert.equal(bounds.overflow, false, `${width} overflow`);
  assert.equal(bounds.oldImage, false, "No old avatar or generated substitute should be requested");
  if (width >= 1100) {
    assert(bounds.railVisible, "Desktop rail visible");
    assert(bounds.home.top >= bounds.header.bottom + 10, "Home stays below header");
    assert(bounds.toggle.bottom <= height - 14, "Collapse control stays within viewport");
    await page.getByRole("button", { name: "Expand sidebar", exact: true }).click();
    await page.getByRole("link", { name: "Home", exact: true }).filter({ has: page.locator(".rail-label") }).focus();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".rail-toggle").getAttribute("aria-expanded"), "false");
    if (height <= 560) {
      await page.locator(".rail-links a").last().focus();
      assert(await page.locator(".rail-links").evaluate((element) => element.scrollTop > 0), "Short viewport rail scrolls to last link");
      await page.locator(".rail-links a").first().focus();
      assert(await page.locator(".rail-links").evaluate((element) => element.scrollTop < 8), "Home is fully visible again");
    }
  } else {
    assert(bounds.visual.bottom <= bounds.copy.top, "Mobile portrait is before all introduction text");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.waitForTimeout(100);
    assert(await page.evaluate(() => document.activeElement?.closest("#drawer") !== null), "Drawer captures focus");
    await page.locator(".drawer-links a").last().focus();
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("button", { name: "Open navigation" }).getAttribute("aria-expanded"), "false");
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "Open navigation");
  }
  await page.evaluate(() => document.activeElement?.blur());
  await page.mouse.move(width - 5, height - 5);
  await page.screenshot({ path: `.work/screenshots/layout-${width}-${height}.png` });
  report.push({ width, height, ...bounds });
  await context.close();
}

// Generate a labeled test fixture, not a substitute personal photograph.
const context = await browser.newContext({ viewport: { width: 1536, height: 1024 }, reducedMotion: "reduce" });
const page = await context.newPage();
await page.goto(base, { waitUntil: "networkidle" });
const fixture = await page.evaluate(() => {
  const canvas = document.createElement("canvas"); canvas.width = 848; canvas.height = 1272;
  const g = canvas.getContext("2d");
  g.fillStyle = "#08080b"; g.fillRect(0,0,848,1272);
  const light = g.createRadialGradient(440,680,80,440,680,660);
  light.addColorStop(0,"#b51836"); light.addColorStop(1,"#09080c");
  g.fillStyle = light; g.fillRect(0,0,848,1272);
  g.strokeStyle = "#ed4563"; g.lineWidth = 4; g.strokeRect(35,35,778,1202);
  g.fillStyle = "white"; g.font = "28px sans-serif"; g.textAlign = "center";
  g.fillText("QA PORTRAIT FIXTURE",424,270); g.fillText("Not the supplied photograph",424,320);
  return canvas.toDataURL("image/png").split(",")[1];
});
await fs.writeFile(".work/portrait-fixture.png", Buffer.from(fixture,"base64"));
await page.locator('input[type="file"]').setInputFiles(".work/portrait-fixture.png");
await page.waitForSelector(".hero-portrait");
await page.waitForFunction(() => document.querySelector(".hero-portrait")?.naturalWidth > 0);
const imageResult = await page.locator(".hero-portrait").evaluate((image) => ({
  source: image.currentSrc, width: image.naturalWidth, height: image.naturalHeight,
  border: getComputedStyle(image).borderWidth, radius: getComputedStyle(image).borderRadius,
  objectFit: getComputedStyle(image).objectFit, ratio: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
}));
assert(imageResult.source.startsWith("blob:"));
assert.equal(imageResult.border, "0px");
assert.equal(imageResult.radius, "0px");
assert.equal(imageResult.objectFit, "contain");
assert(Math.abs(imageResult.ratio - imageResult.width / imageResult.height) < .005, "Mask follows the intrinsic image, not a letterbox");
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector(".hero-portrait");
assert.equal(await page.locator(".hero-portrait").evaluate((image) => image.naturalWidth), 848, "Selected local image survives refresh");
await page.screenshot({ path: ".work/screenshots/portrait-fixture-desktop.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({ path: ".work/screenshots/portrait-fixture-mobile.png" });
await context.close();
await browser.close();
assert.equal(errors.length, 0, errors.join("\n"));
await fs.writeFile(".work/layout-results.json", JSON.stringify({ report, imageResult, errors }, null, 2));
console.log(`PASS: ${report.length} viewports; header clearance; rail scrolling; drawer focus; photo selection and refresh; no old image source; no runtime errors.`);