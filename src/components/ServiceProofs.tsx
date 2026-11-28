import { useState } from "react";
import { onLink } from "../lib/router";
import Icon from "./Icon";

/* ---------------- 1. Full-Stack & Backend API Contracts ---------------- */
const API_CONTRACTS = [
  {
    id: "collect",
    method: "POST",
    path: "/api/collect",
    title: "First-Party Privacy Analytics",
    request: `{
  "t": "pv",
  "path": "/services/full-stack-web-development",
  "title": "React & Node.js Full-Stack Development",
  "ref": "https://github.com/ProBoy315",
  "sid": "session_random_16ch",
  "ret": false
}`,
    validation: [
      "Rejects oversized bodies with HTTP 413 and invalid JSON with HTTP 400 when collection is enabled",
      "Enforces same-origin / configured SITE_URL check (HTTP 403 on foreign origins)",
      "Respects DNT / Global Privacy Control and admin master switch (drops silently when OFF)",
      "Strips query strings, raw IP addresses, and User-Agent strings before Redis HINCRBY",
    ],
    response200: "HTTP/1.1 204 No Content\nNo response body. The status alone does not confirm that a visit was recorded.",
    responseErr: "HTTP/1.1 403 Forbidden\nNo response body.",
  },
  {
    id: "contact",
    method: "POST",
    path: "proboy-contact.vercel.app/",
    title: "Contact Relay Validation",
    request: `{
  "from": "SHAHAN",
  "name": "Client Name",
  "email": "client@example.com",
  "number": "+92 300 1234567",
  "subject": "Full-Stack Web App Inquiry",
  "message": "Need a React dashboard with MySQL API."
}`,
    validation: [
      "Per-IP rate limit: max 5 requests per 60 seconds (HTTP 429)",
      "Validates required fields, email syntax, and phone regex (/^[0-9+\\-\\s()]{7,30}$/)",
      "HTML-escapes all interpolated fields before building the Resend email template",
      "Returns HTTP 502 if upstream Resend provider fails instead of faking success",
    ],
    response200: `HTTP/1.1 200 OK
{ "success": true, "id": "re_msg_9f83a..." }`,
    responseErr: `HTTP/1.1 400 Bad Request
{ "success": false, "error": "Missing: number" }`,
  },
  {
    id: "config",
    method: "GET",
    path: "/api/site-config",
    title: "Public Control Center Config",
    request: `GET /api/site-config
Accept: application/json`,
    validation: [
      "Runs sanitizeConfig() on every admin draft before persisting to Upstash Redis",
      "Applies strict allowlists for theme, fonts, radius (0-36px), and safe URL schemes",
      "Strips all private keys, password hashes, and device tokens via publicConfig()",
    ],
    response200: `HTTP/1.1 200 OK
{
  "ui": { "theme": "iridescent", "accent": "#ef1d3e", "radius": 22 },
  "analytics": { "enabled": false, "consentMode": "notice" }
}`,
    responseErr: "Without storage configured: HTTP/1.1 200 OK\nX-Config-Source: default\nThe response contains safe public defaults.",
  },
];

function FullStackProof() {
  const [apiId, setApiId] = useState(API_CONTRACTS[0].id);
  const [showError, setShowError] = useState(false);
  const current = API_CONTRACTS.find((c) => c.id === apiId) || API_CONTRACTS[0];

  return (
    <div className="space-y-8">
      <section className="glass p-7 sm:p-8 space-y-5">
        <div>
          <p className="text-red-500 text-xs tracking-[0.25em] uppercase font-semibold">
            Architecture Case Study · Real Codebase Proof
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            ProBoy Control Center, Serverless API &amp; Contact Pipeline
          </h2>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
            Built directly inside this codebase (<code>server/handler.mjs</code>, <code>server/store.mjs</code>,{" "}
            <code>shared/siteConfig.mjs</code>) alongside{" "}
            <a
              href="https://github.com/proboy315/ProBoy-CONTACT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 underline"
            >
              ProBoy-CONTACT
            </a>{" "}
            and the <a href="/projects#portfolio-architecture" onClick={onLink} className="text-red-400 underline">portfolio architecture case study</a>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <h3 className="font-semibold text-white">1. Data Model &amp; Security Layer</h3>
            <ul className="mt-3 space-y-2 text-zinc-300 text-xs leading-relaxed">
              <li>• <code>cfg:published</code> / <code>cfg:draft</code> / <code>cfg:history</code> (versioned JSON snapshots)</li>
              <li>• <code>sess:&lt;sha256(token)&gt;</code> (12h TTL HttpOnly Secure SameSite=Strict session)</li>
              <li>• <code>devices</code> &amp; <code>apikeys</code> (AES-256-GCM encrypted records, scrypt + TOTP verified)</li>
              <li>• <code>an:d:&lt;YYYY-MM-DD&gt;</code> (daily aggregate counters; temporary rotated hashes support estimated uniques)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-5">
            <h3 className="font-semibold text-white">2. Scope &amp; Handover Package</h3>
            <ul className="mt-3 space-y-2 text-zinc-300 text-xs leading-relaxed">
              <li>• Platform-neutral core (<code>Request → Response</code>) with Vercel and Netlify adapters</li>
              <li>• Verified by 34 automated server integration tests (<code>npm run test:server</code>)</li>
              <li>• Handover includes <code>.env.example</code>, setup CLI (<code>npm run admin:setup</code>), and schema docs</li>
              <li>• Never exposes Upstash, Resend, or session secrets in client <code>VITE_*</code> bundles</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="glass p-7 sm:p-8 space-y-5">
        <div>
          <p className="text-red-500 text-xs tracking-[0.25em] uppercase font-semibold">
            Backend Development &amp; API Engineering
          </p>
          <h2 className="mt-2 text-2xl font-bold">Safe Sample API Contracts &amp; Validation</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Inspect request schemas, input validation boundaries, and error responses from production endpoints.
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Select API contract">
          {API_CONTRACTS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={apiId === c.id}
              onClick={() => {
                setApiId(c.id);
                setShowError(false);
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-mono border transition ${
                apiId === c.id
                  ? "bg-red-600 border-red-600 text-white"
                  : "border-white/15 bg-white/[0.03] text-zinc-300 hover:border-white/40"
              }`}
            >
              {c.method} {c.path}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-white">{current.title}</h3>
            <button
              type="button"
              onClick={() => setShowError((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-full border border-white/20 text-zinc-200 hover:border-red-400"
            >
              {showError ? "Show nominal response" : "Show alternate response"}
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1.5">Sample Request</p>
              <pre className="rounded-lg bg-[#050508] border border-white/10 p-3.5 text-xs text-zinc-200 overflow-x-auto">
                <code>{current.request}</code>
              </pre>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-1.5">
                {showError ? "Alternate response" : "Nominal response"}
              </p>
              <pre className="rounded-lg bg-[#050508] border border-white/10 p-3.5 text-xs text-emerald-300 overflow-x-auto">
                <code>{showError ? current.responseErr : current.response200}</code>
              </pre>
            </div>
          </div>
          <ul className="space-y-1.5 text-xs text-zinc-300">
            {current.validation.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span className="text-red-400">✓</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="glass p-7 sm:p-8 space-y-4">
        <p className="text-red-500 text-xs tracking-[0.25em] uppercase font-semibold">Database Engineering</p>
        <h2 className="text-2xl font-bold">Choosing the Right Database Layer</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-xs text-zinc-300 leading-relaxed">
          <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-white">MySQL (Relational SQL)</h3>
            <p className="mt-1.5">
              Useful for related tables, joins, order ledgers and indexed lookups. No public MySQL implementation is shown here.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-white">Upstash Redis REST</h3>
            <p className="mt-1.5">
              Best for serverless TTL sessions, rate limits, encrypted JSON config, and aggregate analytics counters
              (running in <code>server/store.mjs</code>).
            </p>
          </div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-white">Firebase / Firestore</h3>
            <p className="mt-1.5">
              Best for real-time collaborative feeds, document-shaped user profiles, and offline-tolerant web apps.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 p-4 bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-white">Scoped JSON Persistence</h3>
            <p className="mt-1.5">
              Lightweight per-session configuration files (used in ProBoy-MD <code>database/sessions/&lt;phone&gt;/</code>{" "}
              for isolated bot numbers).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- 2. Frontend Proof (Pulse + SprintBoard + States) ---------------- */
function FrontendProof() {
  const [uiState, setUiState] = useState<"ready" | "loading" | "empty" | "error">("ready");
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");
  const [keyboardAction, setKeyboardAction] = useState("Press Tab, Enter, or Escape on controls below.");

  return (
    <div className="space-y-8">
      <section className="glass p-7 sm:p-8 space-y-5">
        <div>
          <p className="text-red-500 text-xs tracking-[0.25em] uppercase font-semibold">
            Secondary Positioning · Interactive UI Proof
          </p>
          <h2 className="mt-2 text-2xl font-bold">
            Complete UI State Handling: Loading, Empty, Error &amp; Keyboard UX
          </h2>
          <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
            Production React interfaces should never break when an API is slow, search returns zero results, or a
            network call fails. Toggle live component states and desktop/mobile layouts below.
          </p>
        </div>

        <div className="grid items-start gap-6 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <figure>
            <img src="/images/pulse-desktop.webp" alt="Desktop Pulse demo showing date-range controls and a sample revenue trend" width={1100} height={841} loading="lazy" decoding="async" className="w-full rounded-lg" />
            <figcaption className="mt-2 text-xs text-zinc-400">Pulse on desktop, captured from the working demo. Metrics are sample data.</figcaption>
          </figure>
          <figure>
            <img src="/images/sprintboard-mobile.webp" alt="Mobile SprintBoard showing task input, priority filters and column controls" width={346} height={800} loading="lazy" decoding="async" className="w-full rounded-lg" />
            <figcaption className="mt-2 text-xs text-zinc-400">SprintBoard at a 390 px viewport. Tasks are examples, not customer data.</figcaption>
          </figure>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Simulate UI component state">
            {(
              [
                ["ready", "Loaded Data"],
                ["loading", "Loading State"],
                ["empty", "Empty State"],
                ["error", "Error + Retry"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={uiState === id}
                onClick={() => setUiState(id)}
                className={`px-3.5 py-2 rounded-full text-xs font-medium border transition ${
                  uiState === id
                    ? "bg-red-600 border-red-600 text-white"
                    : "border-white/15 bg-white/[0.03] text-zinc-300 hover:border-white/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-2" role="group" aria-label="Preview responsive layout width">
            {(["desktop", "mobile"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={viewportMode === m}
                onClick={() => setViewportMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                  viewportMode === m
                    ? "border-red-500 bg-red-600/20 text-white"
                    : "border-white/15 text-zinc-400 hover:text-white"
                }`}
              >
                {m === "desktop" ? "Desktop Layout" : "Mobile (390px)"}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`mx-auto rounded-2xl border border-white/15 bg-[#090a10] p-5 transition-all ${
            viewportMode === "mobile" ? "max-w-[360px]" : "w-full"
          }`}
        >
          <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-white/10 text-xs text-zinc-400">
            <span>Workspace Preview ({viewportMode})</span>
            <span>State: {uiState.toUpperCase()}</span>
          </div>

          {uiState === "loading" && (
            <div aria-busy="true" aria-label="Loading workspace cards" className="space-y-3">
              <div className={`grid gap-3 ${viewportMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 rounded-xl bg-white/[0.06] animate-pulse border border-white/10" />
                ))}
              </div>
              <p className="text-xs text-zinc-400">Skeletons reserve space while loading. Measure layout shift in the actual page before claiming a score.</p>
            </div>
          )}

          {uiState === "empty" && (
            <div role="status" className="rounded-xl border border-dashed border-white/20 p-6 text-center space-y-3">
              <p className="text-sm font-medium text-white">No workspace items match your filter</p>
              <p className="text-xs text-zinc-400">Clear filters or create a sample task to restore items.</p>
              <button
                type="button"
                onClick={() => setUiState("ready")}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-red-600 text-white"
              >
                Reset Filter
              </button>
            </div>
          )}

          {uiState === "error" && (
            <div role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 space-y-3">
              <p className="text-sm font-semibold text-red-200">Request timed out (HTTP 504)</p>
              <p className="text-xs text-zinc-300">
                Explicit error boundary preserves user input and provides an immediate keyboard-focusable retry path.
              </p>
              <button
                type="button"
                onClick={() => setUiState("ready")}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-black"
              >
                Retry Request
              </button>
            </div>
          )}

          {uiState === "ready" && (
            <div className={`grid gap-3 ${viewportMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
              {[
                ["Pulse SaaS Analytics", "/demos/pulse-dashboard", "SVG charts, range switching, table sorting & alert toggles"],
                ["SprintBoard Kanban", "/demos/sprintboard-kanban", "4-column task movement, priority filters & local state reset"],
                ["LuxeCart 360° Studio", "/demos/luxecart-store", "Drag-to-rotate angles, swatch pickers, cart drawer & checkout"],
              ].map(([name, href, desc]) => (
                <a
                  key={name}
                  href={href}
                  onClick={onLink}
                  onFocus={() => setKeyboardAction(`Focused ${name} via keyboard Tab navigation`)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-red-500 transition block"
                >
                  <strong className="text-sm text-white block">{name}</strong>
                  <span className="text-xs text-zinc-400 mt-1 block">{desc}</span>
                  <span className="text-xs text-red-400 mt-2 inline-block">Open live demo →</span>
                </a>
              ))}
            </div>
          )}

          <p className="mt-4 text-[11px] text-zinc-500 font-mono" role="status">
            Keyboard test readout: {keyboardAction}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs text-zinc-300">
          <div className="rounded-xl border border-white/10 p-4 bg-black/30">
            <h3 className="text-sm font-semibold text-white">Walkthrough: Pulse SaaS Dashboard</h3>
            <p className="mt-1.5 text-zinc-400 leading-relaxed">
              Multi-tab SaaS console (<code>Overview</code>, <code>Revenue</code>, <code>Accounts</code>,{" "}
              <code>Settings</code>) with dynamic 7d/30d/90d/12m SVG polyline recalculation, sortable account table,
              and <code>role="switch"</code> toggles.{" "}
              <a href="/demos/pulse-dashboard" onClick={onLink} className="text-red-400 underline">
                Test Pulse live →
              </a>
            </p>
          </div>
          <div className="rounded-xl border border-white/10 p-4 bg-black/30">
            <h3 className="text-sm font-semibold text-white">Walkthrough: SprintBoard Kanban</h3>
            <p className="mt-1.5 text-zinc-400 leading-relaxed">
              4-column Kanban board with priority filter chips, task creation form, left/right column transitions,
              zero-match state handling, and instant board reset.{" "}
              <a href="/demos/sprintboard-kanban" onClick={onLink} className="text-red-400 underline">
                Test SprintBoard live →
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- 3. Shopify Liquid Online Store 2.0 Walkthrough ---------------- */
const LIQUID_SNIPPETS = {
  section: `{%- comment -%} sections/featured-product-card.liquid (OS 2.0) {%- endcomment -%}
<section class="pb-product" data-section-id="{{ section.id }}">
  <div class="pb-product__media">
    {{ product.featured_image | image_url: width: 960 | image_tag:
       loading: 'eager', widths: '480,720,960', alt: product.title }}
  </div>
  <div class="pb-product__info">
    <h2>{{ product.title | escape }}</h2>
    <p class="pb-price">{{ product.selected_or_first_available_variant.price | money }}</p>
    {% form 'product', product %}
      <select name="id" aria-label="Select variant">
        {% for variant in product.variants %}
          <option value="{{ variant.id }}" {% unless variant.available %}disabled{% endunless %}>
            {{ variant.title }} - {{ variant.price | money }}
          </option>
        {% endfor %}
      </select>
      <button type="submit" name="add">{{ section.settings.cta_label | escape }}</button>
    {% endform %}
  </div>
</section>

{% schema %}
{
  "name": "Featured Product Card",
  "settings": [
    { "type": "text", "id": "cta_label", "label": "Add Button Label", "default": "Add to Bag" }
  ],
  "presets": [{ "name": "Featured Product Card" }]
}
{% endschema %}`,
  ajaxCart: `// Shopify AJAX Cart API — slide-out drawer add & state refresh
async function addVariantToCart(variantId, quantity = 1) {
  const res = await fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ items: [{ id: Number(variantId), quantity }] }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.description || 'Could not add item to cart');
  }
  const added = await res.json();
  const cartState = await fetch('/cart.js').then((r) => r.json());
  return { added, itemCount: cartState.item_count, totalPrice: cartState.total_price };
}`,
};

function ShopifyProof() {
  const [tab, setTab] = useState<"section" | "ajaxCart">("section");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-5 text-sm text-amber-100 leading-relaxed">
        <strong className="text-amber-300">Transparency &amp; Proof Status:</strong> No live paid client Shopify store
        URL is currently published on this portfolio as production evidence. Below is a clean Online Store 2.0 Liquid
        implementation pattern, and our interactive storefront demos (
        <a href="/demos/luxecart-store" onClick={onLink} className="underline text-white">
          LuxeCart
        </a>
        ,{" "}
        <a href="/demos/voltix-gear" onClick={onLink} className="underline text-white">
          Voltix Gear
        </a>
        ,{" "}
        <a href="/demos/atelier-noir" onClick={onLink} className="underline text-white">
          Atelier Noir
        </a>
        ) are clearly labeled React browser UI demonstrations using sample data.
      </div>

      <section className="glass p-7 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-red-500 text-xs tracking-[0.25em] uppercase font-semibold">
              Online Store 2.0 · Liquid &amp; AJAX Cart API
            </p>
            <h2 className="mt-1.5 text-2xl font-bold">Shopify Implementation Reference</h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={tab === "section"}
              onClick={() => setTab("section")}
              className={`px-3.5 py-1.5 rounded-full text-xs border transition ${
                tab === "section" ? "bg-red-600 border-red-600 text-white" : "border-white/15 text-zinc-300"
              }`}
            >
              OS 2.0 Liquid Section
            </button>
            <button
              type="button"
              aria-pressed={tab === "ajaxCart"}
              onClick={() => setTab("ajaxCart")}
              className={`px-3.5 py-1.5 rounded-full text-xs border transition ${
                tab === "ajaxCart" ? "bg-red-600 border-red-600 text-white" : "border-white/15 text-zinc-300"
              }`}
            >
              AJAX Cart API
            </button>
          </div>
        </div>
        <pre className="rounded-xl bg-[#050508] border border-white/10 p-4 text-xs text-zinc-200 overflow-x-auto leading-relaxed">
          <code>{LIQUID_SNIPPETS[tab]}</code>
        </pre>
      </section>
    </div>
  );
}

/* ---------------- 4. WhatsApp Bot (Baileys vs Official Business API) ---------------- */
function WhatsappProof() {
  return (
    <section className="glass p-7 sm:p-8 space-y-5">
      <div>
        <p className="text-red-500 text-xs tracking-[0.25em] uppercase font-semibold">
          Platform Distinction &amp; Verified Proof
        </p>
        <h2 className="mt-2 text-2xl font-bold">Baileys Multi-Device vs. Official WhatsApp Business Platform</h2>
        <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
          ProBoy-MD is built on <code>@whiskeysockets/baileys</code> (unofficial WhatsApp Web Multi-Device WebSocket
          protocol). It is NOT built on Meta&apos;s official WhatsApp Business Cloud API, and no official Business
          Platform certification is claimed.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/15 text-zinc-400">
              <th className="py-2.5 pr-4">Aspect</th>
              <th className="py-2.5 pr-4 text-white">Baileys Multi-Device (ProBoy-MD Evidence)</th>
              <th className="py-2.5">Official WhatsApp Business Platform (Meta)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-zinc-300">
            <tr>
              <td className="py-2.5 pr-4 text-zinc-400">Connection</td>
              <td className="py-2.5 pr-4">Pairing code / Linked Devices WebSocket</td>
              <td className="py-2.5">Meta Graph API + Webhook verification</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-zinc-400">Hosting &amp; Cost</td>
              <td className="py-2.5 pr-4">Node.js host / VPS (no per-message Meta fee)</td>
              <td className="py-2.5">Meta pricing and template rules apply; check current platform terms</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 text-zinc-400">ToS / Compliance</td>
              <td className="py-2.5 pr-4">Unofficial protocol — account ban risk if abused</td>
              <td className="py-2.5">Officially supported for commercial messaging</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-3 text-sm pt-2">
        <a href="/proboy-md" onClick={onLink} className="text-red-400 underline">
          Explore 224 ProBoy-MD commands &amp; Playground
        </a>
        <a href="/proboy-md/docs" onClick={onLink} className="text-zinc-200 underline">
          30-chapter technical docs
        </a>
        <a href="/blog/proboy-md-source-audit" onClick={onLink} className="text-zinc-200 underline">
          Source audit &amp; setup caveats
        </a>
      </div>
    </section>
  );
}

/* ---------------- 5. Gemini AI & Workflow Automation ---------------- */
function AiAutomationProof() {
  const [sampleJson, setSampleJson] = useState(
    '{"intent": "project_quote", "service": "full-stack-web-development", "priority": "normal"}'
  );

  let validationStatus: { ok: boolean; detail: string };
  try {
    const parsed = JSON.parse(sampleJson) as Record<string, unknown>;
    if (typeof parsed.intent !== "string" || typeof parsed.service !== "string") {
      validationStatus = { ok: false, detail: "Schema error: 'intent' and 'service' strings are required." };
    } else {
      validationStatus = {
        ok: true,
        detail: `Validated structured response -> route to '${parsed.service}' (intent: ${parsed.intent}).`,
      };
    }
  } catch {
    validationStatus = { ok: false, detail: "Malformed JSON payload caught safely — fallback handler triggered." };
  }

  return (
    <div className="space-y-6">
      <section className="glass p-7 sm:p-8 space-y-4">
        <p className="text-red-500 text-xs tracking-[0.25em] uppercase font-semibold">
          Business Workflow Automation
        </p>
        <h2 className="text-2xl font-bold">Pipeline Pattern: Input → Validation → Storage → Notification</h2>
        <ol className="grid sm:grid-cols-4 gap-3 text-xs">
          {[
            ["01 · Input", "Form, webhook, or WhatsApp command payload enters server endpoint."],
            ["02 · Validation", "Type check, size limit, origin/HMAC check, and per-IP rate limit (429)."],
            ["03 · Storage / Retry", "Persist state or retry transient 5xx timeouts with bounded backoff."],
            ["04 · Notification", "Dispatch Resend email, WhatsApp alert, or structured JSON reply."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-xl border border-white/10 bg-black/30 p-4">
              <strong className="text-white block">{t}</strong>
              <span className="mt-1.5 text-zinc-400 block leading-relaxed">{d}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="glass p-7 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-red-500 text-xs tracking-[0.25em] uppercase font-semibold">
              Google Gemini Response Guardrails
            </p>
            <h2 className="mt-1.5 text-2xl font-bold">Structured AI Output Validation Tester</h2>
          </div>
          <a href="/demos/synth-ai-studio" onClick={onLink} className="text-xs text-red-400 underline inline-flex items-center gap-1">
            Open Synth Studio Demo <Icon name="arrow" className="w-3.5 h-3.5" />
          </a>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          This local sample validates output without calling Gemini. A direct integration would keep the API key server-side.
          The <a href="/projects/proboy-md#gemini-integration" onClick={onLink} className="text-red-400 underline">ProBoy-MD command</a> uses a proxy and fallback provider, not a direct Google API call.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setSampleJson('{"intent": "project_quote", "service": "full-stack-web-development", "priority": "normal"}')
            }
            className="px-3 py-1.5 rounded-full text-xs border border-white/20 text-zinc-200 hover:border-white/40"
          >
            Load Valid Payload
          </button>
          <button
            type="button"
            onClick={() => setSampleJson('{"intent": 123, "missingService": true}')}
            className="px-3 py-1.5 rounded-full text-xs border border-white/20 text-zinc-200 hover:border-white/40"
          >
            Simulate Missing Field
          </button>
          <button
            type="button"
            onClick={() => setSampleJson("{broken json from upstream model")}
            className="px-3 py-1.5 rounded-full text-xs border border-white/20 text-zinc-200 hover:border-white/40"
          >
            Simulate Malformed Output
          </button>
        </div>
        <textarea
          rows={3}
          aria-label="Simulated structured AI JSON payload"
          value={sampleJson}
          onChange={(e) => setSampleJson(e.target.value)}
          className="w-full rounded-xl bg-[#050508] border border-white/15 p-3 font-mono text-xs text-zinc-200 outline-none focus:border-red-500"
        />
        <p
          role="status"
          className={`rounded-xl p-3 text-xs border ${
            validationStatus.ok
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          {validationStatus.detail}
        </p>
      </section>
    </div>
  );
}

export default function ServiceProofBlock({ slug }: { slug: string }) {
  if (slug === "full-stack-web-development") return <FullStackProof />;
  if (slug === "frontend-development") return <FrontendProof />;
  if (slug === "shopify-development") return <ShopifyProof />;
  if (slug === "whatsapp-bot-development") return <WhatsappProof />;
  if (slug === "ai-integrations-automation") return <AiAutomationProof />;
  return null;
}
