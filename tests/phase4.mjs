import assert from "node:assert/strict";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

const base = process.env.QA_BASE || "http://127.0.0.1:4173";
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
const page = await context.newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => m.type() === "error" && !m.text().includes("favicon") && !m.text().includes("Failed to load resource") && errors.push(m.text()));

/* press kit */
await page.goto(base + "/press/", { waitUntil: "networkidle" });
assert.match(await page.locator("h1").innerText(), /Press kit/);
assert.equal(await page.locator("h1").count(), 1);
assert((await page.locator(".press-bio").count()) === 3, "three bios");
assert((await page.locator(".press-fact").count()) >= 5, "fact sheet rows");
await page.getByRole("button", { name: /Short bio — copy to clipboard/ }).click();
await page.getByText("Copied", { exact: true }).first().waitFor({ timeout: 3000 });
assert.match(await page.locator('link[rel="canonical"]').getAttribute("href"), /\/press$/);
assert((await page.locator('script[type="application/ld+json"]').count()) === 1, "one JSON-LD block");
assert((await page.locator("main a[href='/mentions']").count()) > 0, "press links to mentions");

/* mentions register */
await page.goto(base + "/mentions/", { waitUntil: "networkidle" });
assert.match(await page.locator("h1").innerText(), /Mentions/);
assert.equal(await page.locator("h1").count(), 1);
assert(await page.getByText("No independently published mentions yet").isVisible());
assert((await page.locator(".press-profiles li").count()) >= 4, "owned profiles listed");
assert((await page.locator('script[type="application/ld+json"]').count()) === 1);
const body = await page.locator("body").innerText();
assert(!/award-winning|best developer|#1 ranking|world[- ]famous|top[- ]rated/i.test(body), "no inflated claims");
assert(body.includes("featured in"), "explains the featured-in problem instead of claiming it");

/* missing asset degradation */
await page.goto(base + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const brokenImages = await page.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src));
assert.deepEqual(brokenImages, [], `broken images on homepage: ${brokenImages.join(", ")}`);

await page.goto(base + "/about/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const brokenAbout = await page.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src));
assert.deepEqual(brokenAbout, [], `broken images on about: ${brokenAbout.join(", ")}`);

/* footer links */
await page.goto(base + "/blog/", { waitUntil: "networkidle" });
const footer = await page.locator("footer").innerText();
assert(footer.includes("Press kit"), "footer press link");
assert(footer.includes("Mentions"), "footer mentions link");

/* mobile layout */
await page.setViewportSize({ width: 375, height: 812 });
for (const route of ["/press/", "/mentions/"]) {
  await page.goto(base + route, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  assert.equal(overflow, false, `horizontal overflow on ${route}`);
}

/* keyboard: skip link and copy button reachable */
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(base + "/press/", { waitUntil: "networkidle" });
await page.keyboard.press("Tab");
const firstFocus = await page.evaluate(() => document.activeElement?.textContent?.trim());
assert(firstFocus === "Skip to content", `first tab stop was: ${firstFocus}`);

assert.deepEqual(errors, []);
console.log("Phase 4 browser interactions: PASS");
await browser.close();
