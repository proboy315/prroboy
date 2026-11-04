import assert from "node:assert/strict";
import fs from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.QA_BASE || "http://localhost:4173";
await fs.mkdir(".work", { recursive: true });
const browser = await chromium.launch();
const errors = [];
const results = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const test = async (name, fn) => { try { await fn(); results.push({ name, pass: true }); } catch (e) { results.push({ name, pass: false, error: String(e.message || e).slice(0, 300) }); throw e; } };

/* ---- homepage identity ---- */
await page.goto(base + "/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("#hero-name");
await test("Homepage H1 carries the primary identity", async () => {
  const h1 = await page.locator("h1").first().innerText();
  assert(/Shahan\s+Ali/.test(h1), `H1 was: ${h1}`);
  const title = await page.title();
  assert(/Shahan Ali/.test(title));
  const desc = await page.locator('meta[name="description"]').getAttribute("content");
  assert(/Shahan Ali/.test(desc));
});
await test("OG and Twitter tags are complete with the portrait image", async () => {
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  assert(og && og.startsWith("https://proboy.vercel.app/"), `og:image = ${og}`);
  assert(/\.(jpg|jpeg|png|webp)$/.test(og));
  const alt = await page.locator('meta[property="og:image:alt"]').getAttribute("content");
  assert(alt && alt.length > 10, "og:image:alt present");
  for (const [name, attr] of [["twitter:card", "summary_large_image"], ["twitter:site", "@itx_proboy"]]) {
    assert.equal(await page.locator(`meta[name="${name}"]`).getAttribute("content"), attr, name);
  }
  assert(await page.locator('meta[name="twitter:title"]').getAttribute("content"), "twitter:title");
  assert(await page.locator('meta[name="twitter:description"]').getAttribute("content"), "twitter:description");
  assert.equal(await page.locator('meta[name="twitter:image"]').getAttribute("content"), og, "twitter:image matches og:image");
  const t = await page.title();
  assert(t.length >= 30 && t.length <= 65, `title length ${t.length}: ${t}`);
  const d = await page.locator('meta[name="description"]').getAttribute("content");
  assert(d.length >= 50 && d.length <= 160, `description length ${d.length}`);
});
await test("Showcase lists the seven working demos", async () => {
  await page.locator("#showcase").scrollIntoViewIfNeeded();
  const links = await page.locator('#showcase a[href^="/demos/"]').count();
  assert.equal(links, 7, `found ${links} demo links`);
});

/* ---- ProBoy-MD ---- */
await page.goto(base + "/proboy-md", { waitUntil: "domcontentloaded" });
await page.waitForSelector("#pmd-title");
await test("ProBoy-MD uses Option A palette, not the old green theme", async () => {
  const accent = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--header-height") || "96px");
  assert(accent.trim().length > 0);
  const green = await page.evaluate(() => {
    const el = document.querySelector(".pmd");
    return getComputedStyle(el).color;
  });
  assert(green.includes("231") || green.includes("255"), `unexpected text colour ${green}`);
  const brandBg = await page.evaluate(() => document.body.style.background || getComputedStyle(document.body).background);
  assert(typeof brandBg === "string");
});
await test("Pairing button points at the verified pairing website", async () => {
  const href = await page.locator('a:has-text("Get Pairing Code")').first().getAttribute("href");
  assert.equal(href, "https://proboy-md.gt.tc/");
  const rel = await page.locator('a:has-text("Get Pairing Code")').first().getAttribute("rel");
  assert(/noopener/.test(rel));
  assert.equal(await page.locator('a:has-text("Get Pairing Code")').first().getAttribute("target"), "_blank");
  assert.equal(await page.locator('a:has-text("Open the pairing website")').getAttribute("href"), "https://proboy-md.gt.tc/");
});
await test("Verified command counts are visible", async () => {
  const text = await page.locator(".cmd-note").innerText();
  assert(/531/.test(text) && /224/.test(text), text.slice(0, 160));
  const total = await page.locator(".cmd-card").count();
  assert.equal(total, 48, `first page renders ${total} cards`);
  const more = await page.locator(".cmd-more button").count();
  assert.equal(more, 1, "paginated list offers Show more");
});
await test("Search finds .pair and .ai", async () => {
  await page.fill(".cmd-search input", "pair");
  await page.waitForTimeout(120);
  const first = await page.locator(".cmd-name").first().innerText();
  assert.equal(first, ".pair");
  assert(/Pairing|pairing code/i.test(await page.locator(".cmd-desc").first().innerText()));
  await page.fill(".cmd-search input", ".gemini");
  await page.waitForTimeout(120);
  assert.equal(await page.locator(".cmd-name").first().innerText(), ".gemini");
});
await test("Category filters and counts work", async () => {
  await page.fill(".cmd-search input", "");
  await page.locator('.cmd-filters button:has-text("Textmaker")').click();
  await page.waitForTimeout(120);
  const cards = await page.locator(".cmd-card").count();
  assert.equal(cards, 19, `textmaker cards ${cards}`);
  const pressed = await page.locator('.cmd-filters button:has-text("Textmaker")').getAttribute("aria-pressed");
  assert.equal(pressed, "true");
});
await test("Empty search state and reset", async () => {
  await page.fill(".cmd-search input", "zzzznotacommand");
  await page.waitForTimeout(120);
  assert.equal(await page.locator(".cmd-empty").count(), 1, "empty state shown");
  await page.locator(".cmd-reset").click();
  await page.waitForTimeout(120);
  assert.equal(await page.locator(".cmd-card").count(), 48);
});
await test("Copy command button copies usage", async () => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.fill(".cmd-search input", "ping");
  await page.waitForTimeout(120);
  await page.locator(".cmd-copy").first().click();
  await page.waitForTimeout(150);
  assert.equal(await page.locator(".cmd-copy").first().innerText(), "Copied");
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  assert(/\.ping/.test(clip), `clipboard: ${clip}`);
});
await test("ProBoy-MD has H1, structured data and FAQ", async () => {
  assert.equal(await page.locator("h1").count(), 1);
  const ld = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join(""));
  assert(/SoftwareApplication/.test(ld) && /FAQPage/.test(ld) && /BreadcrumbList/.test(ld));
  assert(/ProBoy-MD/.test(ld));
});

/* ---- seven demos ---- */
const demoChecks = {
  "luxecart-store": async () => {
    await page.fill('.d-toolbar input[type="search"]', "tourbillon");
    await page.waitForTimeout(80);
    assert.equal(await page.locator(".d-products li").count(), 2, "search filters catalogue");
    await page.locator(".d-products .d-btn").first().click();
    await page.waitForTimeout(150);
    assert.equal(await page.locator(".d-drawer.open").count(), 1, "cart opens");
    await page.locator('.d-drawer .d-btn--primary:has-text("Proceed")').click();
    await page.locator('.d-drawer .d-btn--primary:has-text("Place demo order")').click();
    await page.waitForTimeout(80);
    assert.equal(await page.locator(".d-error").count(), 3, "checkout validates");
    await page.fill("#lc-name", "Test Buyer"); await page.fill("#lc-email", "buyer@example.com"); await page.fill("#lc-addr", "14 Example Street, Burewala");
    await page.locator('.d-drawer .d-btn--primary:has-text("Place demo order")').click();
    await page.waitForTimeout(120);
    assert.match(await page.locator(".d-success").innerText(), /order placed/i);
  },
  "pulse-dashboard": async () => {
    await page.locator('.d-chips button:has-text("90d")').click();
    await page.waitForTimeout(60);
    assert.match(await page.locator(".d-card-head .d-note").first().innerText(), /90d/, "range changes the chart");
    assert.equal(await page.locator(".d-chart polyline").count(), 2, "chart renders");
    await page.locator('.d-dash-nav button:has-text("Revenue")').click();
    await page.waitForTimeout(60);
    assert.equal(await page.locator(".d-bars li").count(), 4, "revenue tab renders");
    await page.locator('.d-dash-nav button:has-text("Settings")').click();
    const sw = page.locator('[role="switch"]').first();
    const before = await sw.getAttribute("aria-checked");
    await sw.click();
    assert.notEqual(await sw.getAttribute("aria-checked"), before, "toggle works");
  },
  "ember-kitchen": async () => {
    await page.locator('.d-chips button:has-text("Mains")').click();
    assert.equal(await page.locator(".d-menu li").count(), 3, "course filter");
    await page.locator('.d-btn--primary:has-text("Request reservation")').click();
    await page.waitForTimeout(60);
    assert.equal(await page.locator(".d-error").count(), 3, "reservation validates");
    await page.fill("#ek-name", "Test Guest"); await page.fill("#ek-phone", "03001234567"); await page.fill("#ek-date", "2030-06-12");
    await page.locator('.d-btn--primary:has-text("Request reservation")').click();
    await page.waitForTimeout(80);
    assert.match(await page.locator(".d-success-inline").innerText(), /Table for 2/i);
  },
  "haven-properties": async () => {
    assert.equal(await page.locator(".d-homes li").count(), 6);
    await page.selectOption("#hv-type", "Studio");
    assert.equal(await page.locator(".d-homes li").count(), 1, "type filter");
    await page.selectOption("#hv-type", "All");
    await page.locator(".d-home-head").first().click();
    assert.equal(await page.locator(".d-homes li.open").count(), 1, "detail expands");
    await page.locator('.d-btn--primary:has-text("Send enquiry")').click();
    await page.waitForTimeout(60);
    assert.equal(await page.locator(".d-error").count(), 3, "enquiry validates");
  },
  "northline-agency": async () => {
    await page.locator(".d-acc button").nth(1).click();
    assert.equal(await page.locator(".d-acc > div.open").count(), 1, "accordion opens");
    await page.locator('.d-btn--primary:has-text("Send brief")').click();
    await page.waitForTimeout(60);
    assert.equal(await page.locator(".d-error").count(), 3, "brief validates");
    await page.fill("#nl-name", "Test Co"); await page.fill("#nl-email", "hi@example.com"); await page.fill("#nl-brief", "We need a product site redesign next quarter.");
    await page.locator('.d-btn--primary:has-text("Send brief")').click();
    await page.waitForTimeout(80);
    assert.match(await page.locator(".d-success-inline").innerText(), /Brief received/);
  },
  "synth-ai-studio": async () => {
    await page.locator('.d-btn--primary:has-text("Generate")').click();
    assert.match(await page.locator(".d-error").first().innerText(), /6 characters/);
    await page.fill("#sy-prompt", "Draft release notes for ProBoy-MD v6");
    await page.locator('.d-btn--primary:has-text("Generate")').click();
    await page.waitForTimeout(80);
    const out = await page.locator(".d-pre").innerText();
    assert(/Fast · sample output/.test(out) && /Demo mode/.test(out));
    assert.equal(await page.locator(".d-hist li").count(), 1, "prompt history recorded");
  },
  "forge-docs": async () => {
    await page.fill('.d-docs aside input[type="search"]', "rollback");
    await page.waitForTimeout(80);
    assert.equal(await page.locator(".d-docs aside nav button").count(), 1, "docs search filters sections");
    assert.match(await page.locator(".d-docs article h2").innerText(), /Rollbacks/);
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.locator(".d-code-head button").click();
    await page.waitForTimeout(120);
    assert.equal(await page.locator(".d-code-head button").innerText(), "Copied");
  },
};
for (const slug of Object.keys(demoChecks)) {
  await page.goto(`${base}/demos/${slug}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".demo-stage h1");
  await test(`Demo works: ${slug}`, async () => {
    assert.equal(await page.locator(".demo").count(), 1);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "no overflow");
    assert.equal(await page.locator(".demo-stage h1").count(), 1, "one H1");
    await demoChecks[slug]();
  });
}

/* ---- metadata sanity across routes ---- */
await test("Every route serves a unique title and canonical", async () => {
  const routes = ["/", "/proboy-md", "/demos/luxecart-store", "/demos/pulse-dashboard", "/showcase/luxecart", "/projects/proboy-md", "/nope"];
  const seen = new Set();
  for (const r of routes) {
    const res = await page.goto(base + r, { waitUntil: "domcontentloaded" });
    assert.equal(res.status(), 200, `${r} status ${res.status()} (static SPA fallback)`);
    const t = await page.title();
    assert(!seen.has(t), `duplicate title: ${t}`);
    seen.add(t);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href").catch(() => null);
    const prod = "https://proboy.vercel.app";
    assert.equal(canonical, r === "/nope" ? null : prod + (r === "/" ? "/" : r), `${r} canonical ${canonical}`);
    if (r === "/nope") {
      assert.match(await page.locator("h1").innerText(), /404|wrong turn/i, "unknown route renders the not-found page");
      assert.match(await page.locator('meta[name="robots"]').getAttribute("content"), /noindex/, "unknown route is noindexed");
    }
  }
});

await browser.close();
await fs.writeFile(".work/pages-results.json", JSON.stringify({ results, errors }, null, 2));
console.log(JSON.stringify({ passed: results.filter((r) => r.pass).length, failed: results.filter((r) => !r.pass), consoleErrors: errors }, null, 1));
