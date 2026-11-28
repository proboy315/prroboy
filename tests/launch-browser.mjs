import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createHandler } from "../server/handler.mjs";
import { createStore } from "../server/store.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = (process.env.QA_BASE || "http://127.0.0.1:4173").replace(/\/$/, "");
assert.match(new URL(base).hostname, /^(?:127\.0\.0\.1|localhost)$/i, "Run browser fixtures against the local artifact only");
const svc = JSON.parse(readFileSync("src/data/services.json", "utf8"));
const docs = JSON.parse(readFileSync(".work/launch-http.json", "utf8")).rows;
const priority = new Set(["/", "/about", "/contact", "/services", "/projects", "/proboy-md", "/proboy-md/docs", "/demos", "/demos/luxecart-store", "/demos/voltix-gear", "/demos/apex-motors", "/demos/pulse-dashboard", "/demos/sprintboard-kanban", "/demos/synth-ai-studio", ...svc.map(item => `/services/${item.slug}`)]);
const browser = await chromium.launch();
const checks = [], exceptions = [], images = [], notes = [];
const monitor = (page) => {
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(12000);
  page.on("pageerror", err => exceptions.push({ url: page.url(), message: err.message }));
  page.on("console", m => {
    if (m.type() === "error" && !/failed to load resource|not have a registered handler/i.test(m.text())) {
      exceptions.push({ url: page.url(), message: m.text() });
    }
  });
  page.on("response", r => {
    if (r.status() >= 400 && r.url().startsWith(base + "/assets/")) exceptions.push({ url: r.url(), message: `HTTP ${r.status()}` });
  });
};
const check = async (name, run) => {
  try { await run(); checks.push({ name, pass: true }); }
  catch (error) { checks.push({ name, pass: false, error: error.message }); console.error(name, error.message); }
};
const newContext = (width, height, extra = {}) => browser.newContext({
  viewport: { width, height }, reducedMotion: "reduce", ignoreHTTPSErrors: true, ...extra,
});
const scrollImage = async (image) => {
  await image.scrollIntoViewIfNeeded();
  return image.evaluate(async img => {
    await img.decode();
    return { chosen: new URL(img.currentSrc).pathname, renderedWidth: Math.round(img.getBoundingClientRect().width), widthAttr: img.width ? Number(img.getAttribute("width")) : 0, heightAttr: Number(img.getAttribute("height")), loading: img.loading, priority: img.fetchPriority, naturalWidth: img.naturalWidth };
  });
};
const documentCheck = async (page, route, response) => {
  assert.equal(response.status(), route.path === "/404" ? 404 : 200);
  await page.locator(`#root > [data-proboy-route="${route.path}"]`).waitFor();
  assert.equal(await page.locator("h1").count(), 1);
  assert.ok((await page.locator("h1").textContent()).trim());
  const canonical = page.locator('link[rel="canonical"]');
  const noindexPage = ["/404", "/admin", "/demos/control-room", "/projects/proboy-camlink"].includes(route.path);
  if (noindexPage) assert.equal(await canonical.count(), 0);
  else assert.equal(await canonical.getAttribute("href"), `https://proboy.vercel.app${route.path}`);
  assert.ok(await page.title());
};

try {
  const desktop = await newContext(1440, 900);
  const master = await desktop.newPage(); monitor(master);
  const mobile = await newContext(390, 844);
  const phone = await mobile.newPage(); monitor(phone);
  for (const route of docs) {
    await check(`desktop direct+reload ${route.path}`, async () => {
      await documentCheck(master, route, await master.goto(base + route.path));
      await documentCheck(master, route, await master.reload());
    });
    if (priority.has(route.path) || route.path.startsWith("/projects/")) await check(`mobile direct+reload ${route.path}`, async () => {
      await documentCheck(phone, route, await phone.goto(base + route.path));
      await documentCheck(phone, route, await phone.reload());
      assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "horizontal document overflow");
    });
  }

  for (const [name, page] of [["desktop", master], ["mobile", phone]]) {
    await check(`${name} responsive hero, four covers and certificate`, async () => {
      await page.goto(base + "/");
      const hero = await scrollImage(page.locator(".hero-portrait"));
      assert.equal(hero.loading, "eager"); assert.equal(hero.priority, "high");
      assert.equal(hero.chosen, `/images/shahan-ali-portrait-${name === "mobile" ? 480 : 800}.avif`);
      assert.equal(await page.locator('link[rel="preload"][as="image"]').count(), 1);
      const pictureRequests = await page.evaluate(() => performance.getEntriesByType("resource").filter(e => e.name.includes("shahan-ali-portrait-")).length);
      assert.equal(pictureRequests, 1, "duplicate hero downloads");
      const selectors = ["proboy-md-cover", "proboy-js-obfuscator", "proboy-encrypt-decrypt", "proboy-sim-database", "quizoff-certificate"];
      images.push({ device: name, ...hero });
      for (const stem of selectors) {
        const result = await scrollImage(page.locator(`main img[src*="${stem}"]`).first());
        assert.equal(result.loading, "lazy");
        assert.match(result.chosen, /\/(?:[^/]+)-(?:640|1000)\.avif$/);
        assert.ok(result.widthAttr && result.heightAttr);
        images.push({ device: name, ...result });
      }
    });
  }

  await check("High-density mobile hero selects a high-density candidate", async () => {
    const context = await newContext(390, 844, { deviceScaleFactor: 3, isMobile: true });
    try {
      const page = await context.newPage(); monitor(page);
      await page.goto(base + "/");
      const hero = await scrollImage(page.locator(".hero-portrait"));
      // Chromium may select 800w or 1200w at DPR 3 after srcset density negotiation.
      assert.match(hero.chosen, /\/images\/shahan-ali-portrait-(?:800|1200)\.avif$/);
      assert.ok(hero.renderedWidth > 0 && hero.naturalWidth > 0);
      images.push({ device: "mobile DPR 3", ...hero });
    } finally { await context.close(); }
  });

  await check("Mobile drawer keyboard and certificate modal", async () => {
    await phone.goto(base + "/");
    const open = phone.getByRole("button", { name: "Open navigation" });
    await open.click();
    await phone.getByRole("dialog", { name: "Navigation" }).waitFor();
    await phone.keyboard.press("Escape");
    await phone.waitForFunction(() => document.activeElement?.getAttribute("aria-label") === "Open navigation");
    const cert = phone.getByRole("button", { name: "Open full certificate preview" });
    await cert.click();
    await phone.locator("dialog[open]").waitFor();
    await phone.keyboard.press("Escape");
    await phone.locator("dialog[open]").waitFor({ state: "hidden" });
  });

  for (const item of svc) await check(`Service to proof to inquiry: ${item.slug}`, async () => {
    await master.goto(`${base}/services/${item.slug}`);
    const proof = master.locator("[data-service-proof]");
    const path = await proof.getAttribute("href");
    assert.ok(path);
    await proof.click();
    await master.waitForURL(base + path);
    const cta = master.locator(`[data-proof-contact][href="/contact?service=${item.slug}"]`);
    await cta.click();
    await master.waitForURL(`${base}/contact?service=${item.slug}`);
    await master.waitForFunction(value => document.querySelector("#cf-subject")?.value === value, `Inquiry: ${item.title}`);
    assert.match(await master.locator('aside a[href^="mailto:"]').first().getAttribute("href"), /^mailto:/);
    assert.match(await master.locator('aside a[href^="https://wa.me/"]').first().getAttribute("href"), /^https:\/\/wa\.me\//);
    const tab = await desktop.newPage();
    try { assert.equal((await tab.goto(base + path)).status(), 200); assert.equal(await tab.locator("h1").count(), 1); }
    finally { await tab.close(); }
  });

  await check("Contact validation, phone-free draft, relay success and failure (fixture only)", async () => {
    let mode = "fail";
    const requests = [];
    await master.route("https://proboy-contact.vercel.app/**", async route => {
      if (route.request().method() !== "POST") return route.fulfill({ status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST" } });
      requests.push(route.request().postDataJSON());
      return route.fulfill({ status: mode === "fail" ? 503 : 200, headers: { "Access-Control-Allow-Origin": "*" }, json: { success: mode === "pass" } });
    });
    await master.addInitScript(() => { window.open = (url) => { window.__testDraftUrl = url; return null; }; });
    await master.goto(`${base}/contact?service=shopify-development`);
    const form = master.getByRole("form", { name: "Contact Shahan Ali" });
    await form.getByRole("button", { name: "Send via Contact API" }).click();
    await master.waitForFunction(() => document.activeElement?.id === "cf-name");
    assert.equal(requests.length, 0);
    await master.fill("#cf-name", "Local Browser Test");
    await master.fill("#cf-email", "qa@example.test");
    await master.fill("#cf-message", "Synthetic inquiry handled only by the browser test fixture.");
    await form.getByRole("button", { name: /Email Only/ }).click();
    assert.equal(await master.locator("#cf-number").getAttribute("required"), null);
    await form.getByRole("button", { name: "Compose Email Inquiry" }).click();
    await form.getByText("Inquiry ready").waitFor();
    assert.equal(requests.length, 0);
    await form.getByRole("button", { name: /WhatsApp Direct/ }).click();
    await master.fill("#cf-email", "");
    await form.getByRole("button", { name: "Open Pre-Filled WhatsApp" }).click();
    await form.getByText("Inquiry ready").waitFor();
    const draft = new URL(await master.evaluate(() => window.__testDraftUrl));
    assert.equal(draft.hostname, "wa.me");
    assert.match(draft.searchParams.get("text"), /Synthetic inquiry/);
    assert.doesNotMatch(draft.searchParams.get("text"), /Email:|Phone \/ WhatsApp:/);
    await form.getByRole("button", { name: /Contact API Form/ }).click();
    await master.fill("#cf-email", "qa@example.test");
    await master.fill("#cf-number", "+1 202 555 0100");
    await form.getByRole("button", { name: "Send via Contact API" }).click();
    await form.getByText(/relay did not accept/).waitFor();
    assert.match(await master.locator("#cf-message").inputValue(), /Synthetic/);
    mode = "pass";
    await form.getByRole("button", { name: "Send via Contact API" }).click();
    await form.getByText("Inquiry accepted").waitFor();
    assert.equal(requests.length, 2);
    assert.equal(requests[0].email, "qa@example.test");
    assert.equal(await master.locator("#cf-message").inputValue(), "");
  });

  await check("Heavy demo and playground code loads on demand", async () => {
    const requestPaths = [];
    const onRequest = r => requestPaths.push(r.url());
    master.on("request", onRequest);
    try {
      await master.goto(base + "/");
      assert.ok(!requestPaths.some(url => /\/assets\/(?:Demos|Admin|ProBoyMd|ProBoyPlayground)/.test(url)));
      await master.goto(base + "/proboy-md#playground");
      assert.ok(!requestPaths.some(url => /\/assets\/ProBoyPlayground/.test(url)));
      await master.getByRole("button", { name: "Load command playground" }).click();
      await master.locator(".pg-chat").waitFor();
      assert.ok(requestPaths.some(url => /\/assets\/ProBoyPlayground/.test(url)));
      await master.goto(base + "/demos/pulse-dashboard");
      await master.getByRole("button", { name: "90d", exact: true }).click();
      await master.locator('button[aria-pressed="true"]').filter({ hasText: "90d" }).waitFor();
      await master.goto(base + "/demos/luxecart-store");
      await master.getByRole("button", { name: "Next product angle" }).click();
      await master.locator(".d-viewer-hud").getByText(/Crown Profile/).waitFor();
    } finally { master.off("request", onRequest); }
  });

  await check("Persisted demo workspace hydrates without replacing server markup", async () => {
    const [demo] = JSON.parse(readFileSync("src/data/demos.json", "utf8")).demos;
    await master.goto(base + "/demos");
    await master.evaluate(d => localStorage.setItem("proboy_demo_control_room_v1", JSON.stringify([{ ...d, name: "Local fixture" }])), demo);
    await master.reload();
    await master.getByRole("heading", { name: "Local fixture" }).waitFor();
    await master.getByRole("button", { name: "Reset to default sample data" }).click();
    await master.getByRole("heading", { name: demo.name, exact: true }).waitFor();
  });

  await check("No-JavaScript root content and genuine 404", async () => {
    const context = await newContext(390, 844, { javaScriptEnabled: false });
    const p = await context.newPage();
    try {
      assert.equal((await p.goto(base + "/")).status(), 200);
      assert.match(await p.locator("h1").textContent(), /Shahan Ali/);
      assert.ok(await p.locator("#qa article p").first().isVisible());
      assert.equal((await p.goto(base + "/services/nonexistent-qa-url")).status(), 404);
      assert.match(await p.locator("h1").textContent(), /page not found/i);
    } finally { await context.close(); }
  });

  await check("Browser analytics reaches an in-memory collector only with consent", async () => {
    const origin = "https://proboy.vercel.app";
    const store = createStore({ PROBOY_ALLOW_MEMORY_STORE: "1" });
    await store.set("cfg:published", JSON.stringify({ config: { analytics: { enabled: true, consentMode: "optin", trackEvents: true } } }));
    const handle = createHandler({ env: { SESSION_SECRET: randomBytes(32).toString("hex") }, store });
    const received = [];
    const context = await newContext(1280, 900, { userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" });
    try {
      // Intercept every request: the apparent production origin never contacts any live host.
      await context.route("**/*", async route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin !== origin) return route.abort();
        if (url.pathname === "/api/site-config" || url.pathname === "/api/collect") {
          const raw = request.postData();
          if (raw) received.push(JSON.parse(raw));
          const response = await handle(new Request(url, { method: request.method(), headers: await request.allHeaders(), body: raw ?? undefined }));
          return route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
        }
        if (url.pathname.startsWith("/_vercel/")) return route.fulfill({ status: 204 });
        const local = await route.fetch({ url: base + url.pathname + url.search });
        return route.fulfill({ response: local });
      });
      const page = await context.newPage();
      await page.goto(origin + "/privacy");
      await page.getByText("Allow analytics", { exact: true }).waitFor();
      assert.equal(received.length, 0);
      await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
      const waitForCollect = (type) => page.waitForResponse(res => res.status() === 204 && res.url() === origin + "/api/collect" && res.request().postDataJSON()?.t === type, { timeout: 8000 });
      await Promise.all([waitForCollect("pv"), waitForCollect("ev"), page.goto(`${origin}/services/shopify-development`)]);
      assert.ok(received.some(event => event.t === "pv" && event.path === "/services/shopify-development"));
      assert.ok(received.some(event => event.name === "service_view"));
      assert.ok(received.every(event => Object.keys(event).every(key => ["t", "path", "title", "ref", "sid", "ret", "name"].includes(key))));
      const days = await store.smembers("an:days");
      const state = await store.hgetall(`an:d:${days[0]}`);
      assert.equal(state["e|service_view"], 1);
      assert.equal(state["p|/services/shopify-development"], 1);
    } finally { await context.close(); }
  });
  notes.push("No inquiry or WhatsApp message was sent; the relay used browser interception.");
} finally {
  await browser.close();
  writeFileSync(".work/launch-browser.json", JSON.stringify({ checks, exceptions, images, notes }, null, 2));
  for (const item of exceptions.slice(0, 10)) console.error("Browser error", item);
  console.log(`${checks.filter(item => item.pass).length}/${checks.length} browser checks, ${exceptions.length} critical error(s).`);
  process.exitCode = Number(checks.some(item => !item.pass) || !!exceptions.length);
}