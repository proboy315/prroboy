import { useMemo, useState } from "react";
import { Btn, Field, emailOk } from "../components/DemoPrimitives";
import Icon from "../components/Icon";

/* ------------------------------------------------------- 2. Pulse SaaS */
const PULSE_RANGES: Record<string, { series: number[]; mrr: string; seats: string; churn: string; latency: string }> = {
  "7d": { series: [12, 19, 15, 26, 22, 31, 28], mrr: "$48,240", seats: "1,284", churn: "1.9%", latency: "178 ms" },
  "30d": { series: [8, 14, 11, 19, 17, 24, 21, 29, 26, 34], mrr: "$51,900", seats: "1,360", churn: "1.7%", latency: "182 ms" },
  "90d": { series: [5, 9, 8, 13, 12, 17, 16, 21, 19, 25, 23, 30], mrr: "$56,420", seats: "1,492", churn: "1.5%", latency: "174 ms" },
  "12m": { series: [4, 6, 8, 10, 12, 15, 18, 21, 24, 28, 32, 38], mrr: "$64,800", seats: "1,740", churn: "1.4%", latency: "169 ms" },
};

const PULSE_ACCOUNTS = [
  { name: "Kestrel Cloud", plan: "Enterprise", mrr: 4200, seats: 84, health: "Healthy" },
  { name: "Veloce Commerce", plan: "Growth", mrr: 1450, seats: 28, health: "Healthy" },
  { name: "Harbor Logistics", plan: "Enterprise", mrr: 3800, seats: 72, health: "Review" },
  { name: "Morrow Studio", plan: "Starter", mrr: 390, seats: 9, health: "Healthy" },
];

export function Pulse() {
  const [tab, setTab] = useState("Overview");
  const [range, setRange] = useState<keyof typeof PULSE_RANGES>("30d");
  const [sortAsc, setSortAsc] = useState(false);
  const [toggles, setToggles] = useState({ weekly: true, anomalies: true, digest: false });

  const currentRange = PULSE_RANGES[range];
  const data = currentRange.series;
  const max = Math.max(...data);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 560},${170 - (v / max) * 150}`).join(" ");
  const sortedAccounts = [...PULSE_ACCOUNTS].sort((a, b) => (sortAsc ? a.mrr - b.mrr : b.mrr - a.mrr));

  return (
    <>
      <header className="d-hero">
        <h1>Pulse</h1>
        <p>Subscription analytics workspace — switch date ranges, inspect charts, sort sample accounts, and toggle alerts.</p>
      </header>
      <div className="d-dash">
        <nav className="d-dash-nav" aria-label="Dashboard sections">
          {["Overview", "Revenue", "Accounts", "Settings"].map((t) => (
            <button key={t} type="button" aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)} className={tab === t ? "on" : ""}>
              {t}
            </button>
          ))}
        </nav>
        <div className="d-dash-main">
          <div className="d-dash-top">
            <div className="d-chips" role="group" aria-label="Chart range">
              {(Object.keys(PULSE_RANGES) as (keyof typeof PULSE_RANGES)[]).map((r) => (
                <button key={r} type="button" aria-pressed={range === r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>
                  {r}
                </button>
              ))}
            </div>
            <span className="d-note">Sample metrics · Range {range}</span>
          </div>

          <div className="d-kpis">
            <div><p>Sample MRR</p><strong>{currentRange.mrr}</strong><span>+6.4%</span></div>
            <div><p>Active Seats</p><strong>{currentRange.seats}</strong><span>+3.1%</span></div>
            <div><p>Net Churn</p><strong>{currentRange.churn}</strong><span>−0.3%</span></div>
            <div><p>P95 Latency</p><strong>{currentRange.latency}</strong><span>−11 ms</span></div>
          </div>

          {tab === "Overview" && (
            <div className="d-card">
              <div className="d-card-head">
                <h2>Recurring Revenue Trend (Sample)</h2>
                <span className="d-note">Window: {range}</span>
              </div>
              <svg viewBox="0 0 560 190" className="d-chart" role="img" aria-label={`Sample recurring revenue trend for ${range}`}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="var(--accent)" stopOpacity=".35" />
                    <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((i) => (
                  <line key={i} x1="0" y1={20 + i * 50} x2="560" y2={20 + i * 50} stroke="rgba(255,255,255,.08)" />
                ))}
                <polyline points={`0,170 ${points} 560,170`} fill="url(#pg)" stroke="none" />
                <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
                {data.map((v, i) => (
                  <circle key={i} cx={(i / (data.length - 1)) * 560} cy={170 - (v / max) * 150} r="3.5" fill="#05070d" stroke="var(--accent)" strokeWidth="2" />
                ))}
              </svg>
            </div>
          )}

          {tab === "Revenue" && (
            <div className="d-card">
              <div className="d-card-head"><h2>Revenue Share by Tier (Sample)</h2></div>
              <ul className="d-bars">
                {[["Enterprise", 82], ["Growth", 64], ["Starter", 41], ["Trial", 18]].map(([k, v]) => (
                  <li key={k as string}><span>{k}</span><i style={{ width: `${v}%` }} /><b>{v}%</b></li>
                ))}
              </ul>
            </div>
          )}

          {tab === "Accounts" && (
            <div className="d-card">
              <div className="d-card-head">
                <h2>Sample Customer Accounts</h2>
                <Btn type="button" kind="ghost" onClick={() => setSortAsc((v) => !v)}>
                  Sort MRR {sortAsc ? "↑" : "↓"}
                </Btn>
              </div>
              <div className="d-table-scroll">
                <table className="d-table">
                  <thead>
                    <tr><th>Account</th><th>Plan</th><th>Seats</th><th>Sample MRR</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {sortedAccounts.map((acc) => (
                      <tr key={acc.name}>
                        <td>{acc.name}</td><td>{acc.plan}</td><td>{acc.seats}</td><td>${acc.mrr.toLocaleString()}</td><td>{acc.health}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "Settings" && (
            <div className="d-card">
              <div className="d-card-head"><h2>Alert Preferences</h2></div>
              <ul className="d-toggles">
                {([["weekly", "Weekly summary digest"], ["anomalies", "Latency & churn anomaly alerts"], ["digest", "Daily slack webhook report"]] as const).map(([k, l]) => (
                  <li key={k}>
                    <span>{l}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={toggles[k]}
                      aria-label={l}
                      onClick={() => setToggles({ ...toggles, [k]: !toggles[k] })}
                      className={toggles[k] ? "on" : ""}
                    >
                      <i />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------- 5. Northline Agency */
export function Northline() {
  const [svc, setSvc] = useState(0);
  const [caseCat, setCaseCat] = useState("All");
  const [scope, setScope] = useState<string[]>(["Design System", "Web Engineering"]);
  const [f, setF] = useState({ name: "", email: "", brief: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const servicesList = [
    ["Brand & Design Systems", "Tokens, typography scales, accessible UI kits, and multi-brand component libraries."],
    ["Product Design", "End-to-end UX flows, interactive prototypes, and engineering-ready design specs."],
    ["Full-Stack Web Engineering", "React, TypeScript, and Node.js applications engineered for speed and clarity."],
  ];
  const caseStudies = [
    { name: "Kettle & Co", cat: "Commerce", note: "Specialty coffee subscription storefront & design system" },
    { name: "Route Eight", cat: "SaaS", note: "Fleet dispatch dashboard and live telemetry UI" },
    { name: "Almanac Press", cat: "Editorial", note: "Research collective publishing platform" },
  ];
  const scopePrices: Record<string, number> = {
    "Brand Identity": 3500,
    "Design System": 4500,
    "Web Engineering": 6500,
    "API Integration": 3000,
  };

  const toggleScope = (item: string) =>
    setScope((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  const estBudget = scope.reduce((sum, item) => sum + (scopePrices[item] || 0), 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (f.name.trim().length < 2) v.name = "Enter your name.";
    if (!emailOk(f.email)) v.email = "Enter a valid work email.";
    if (f.brief.trim().length < 15) v.brief = "Share at least 15 characters about your project scope.";
    setErr(v);
    setDone(!Object.keys(v).length);
  };

  return (
    <>
      <header className="d-hero">
        <h1>Northline</h1>
        <p>Digital product &amp; brand studio — explore capabilities, filter case studies, estimate scope, and send a brief.</p>
      </header>

      <section className="d-card">
        <h2>Interactive Project Scope Estimator (Sample)</h2>
        <div className="d-chips" role="group" aria-label="Toggle deliverables">
          {Object.keys(scopePrices).map((item) => (
            <button key={item} type="button" aria-pressed={scope.includes(item)} className={scope.includes(item) ? "on" : ""} onClick={() => toggleScope(item)}>
              {item} (+${scopePrices[item].toLocaleString()})
            </button>
          ))}
        </div>
        <p className="d-modal-price" style={{ marginTop: 14 }}>
          Illustrative Estimate: ${estBudget.toLocaleString()} · {Math.max(2, scope.length * 2)} weeks
        </p>
      </section>

      <div className="d-split">
        <div>
          <section className="d-card">
            <h2>Capabilities</h2>
            <div className="d-acc">
              {servicesList.map(([t, d], i) => (
                <div key={t} className={svc === i ? "open" : ""}>
                  <button type="button" onClick={() => setSvc(svc === i ? -1 : i)} aria-expanded={svc === i}>
                    <span>{t}</span>
                    <Icon name={svc === i ? "close" : "chevron"} className="w-4 h-4" />
                  </button>
                  {svc === i && <p>{d}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="d-card">
            <div className="d-card-head">
              <h2>Sample Case Studies</h2>
              <div className="d-chips">
                {["All", "Commerce", "SaaS", "Editorial"].map((c) => (
                  <button key={c} type="button" aria-pressed={caseCat === c} className={caseCat === c ? "on" : ""} onClick={() => setCaseCat(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <ul className="d-cases" style={{ marginTop: 14 }}>
              {caseStudies.filter((c) => caseCat === "All" || c.cat === caseCat).map((c) => (
                <li key={c.name}>
                  <span className="d-cat">{c.cat}</span>
                  <strong>{c.name}</strong>
                  <span>{c.note}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="d-card" id="nl-enquire">
          <h2>Start a Project Brief</h2>
          <form className="d-form" onSubmit={submit} noValidate>
            <Field id="nl-name" label="Name" error={err.name}>
              <input id="nl-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
            </Field>
            <Field id="nl-email" label="Work Email" error={err.email}>
              <input id="nl-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
            </Field>
            <Field id="nl-brief" label="Project Brief" error={err.brief}>
              <textarea id="nl-brief" rows={4} value={f.brief} onChange={(e) => setF({ ...f, brief: e.target.value })} />
            </Field>
            <Btn type="submit">Submit Demo Brief</Btn>
            {done && (
              <p className="d-success-inline" role="status">
                Sample brief received for {f.name} (${estBudget.toLocaleString()} scope). Nothing left your browser.
              </p>
            )}
          </form>
        </section>
      </div>
    </>
  );
}

/* ------------------------------------------------------- 6. Synth AI */
const SYNTH_TEMPLATES = [
  { label: "WhatsApp Bot Release Note", prompt: "Draft a concise release note for ProBoy-MD v6.0.1 pairing-code improvements." },
  { label: "Shopify Product Copy", prompt: "Write a clear, benefit-driven product description for a minimalist wireless desk charger." },
  { label: "API Error Runbook", prompt: "Outline a 4-step troubleshooting checklist for webhook timeout errors." },
];

export function SynthStudio() {
  const [prompt, setPrompt] = useState(SYNTH_TEMPLATES[0].prompt);
  const [model, setModel] = useState("Gemini Flash (Sample)");
  const [tone, setTone] = useState("Structured");
  const [format, setFormat] = useState("Markdown Checklist");
  const [out, setOut] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const p = prompt.trim();
    if (p.length < 6) {
      setErr("Describe the task in at least 6 characters.");
      return;
    }
    setErr("");
    const subject = p.replace(/\s+/g, " ").slice(0, 110);
    const body =
      tone === "Formal"
        ? `Objective: ${subject}\n\n1. Scope & Inputs: Confirm required parameters and constraints.\n2. Execution (${format}): Produce a verifiable draft with clear acceptance criteria.\n3. Verification: Review edge cases before publishing.`
        : tone === "Concise"
        ? `Task: ${subject}\n• Step 1: Validate inputs\n• Step 2: Generate ${format}\n• Step 3: Verify output`
        : `Structured Plan for "${subject}" (${format}):\n1. Clarify the target audience and technical constraints.\n2. Build a clean, scannable first draft.\n3. Test edge cases and refine wording.`;

    const res = `[Simulated Browser Output · ${model} · ${tone}]\n\n${body}\n\n— Deterministic demo synthesis (no external AI API key called).`;
    setOut(res);
    setHist((h) => [p, ...h.filter((x) => x !== p)].slice(0, 5));
  };

  const copyOut = async () => {
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <header className="d-hero">
        <h1>Synth Studio</h1>
        <p>Structured prompt workbench — load templates, adjust tone and output format, and generate deterministic local samples.</p>
      </header>

      <div className="d-chips" role="group" aria-label="Prompt templates" style={{ marginBottom: 16 }}>
        {SYNTH_TEMPLATES.map((t) => (
          <button key={t.label} type="button" onClick={() => setPrompt(t.prompt)}>
            Preset: {t.label}
          </button>
        ))}
      </div>

      <div className="d-ai">
        <section className="d-card">
          <Field id="sy-prompt" label={`Prompt · ${prompt.length}/500`} error={err}>
            <textarea id="sy-prompt" rows={5} maxLength={500} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </Field>
          <div className="d-grid2">
            <Field id="sy-model" label="Profile">
              <select id="sy-model" value={model} onChange={(e) => setModel(e.target.value)}>
                <option>Gemini Flash (Sample)</option>
                <option>Gemini Pro (Sample)</option>
                <option>Deterministic Rule Engine</option>
              </select>
            </Field>
            <Field id="sy-tone" label="Tone">
              <select id="sy-tone" value={tone} onChange={(e) => setTone(e.target.value)}>
                <option>Structured</option>
                <option>Formal</option>
                <option>Concise</option>
              </select>
            </Field>
          </div>
          <Field id="sy-fmt" label="Output Format">
            <select id="sy-fmt" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option>Markdown Checklist</option>
              <option>Release Summary</option>
              <option>JSON Outline</option>
            </select>
          </Field>
          <div className="d-row">
            <Btn type="button" onClick={generate}>Generate Sample Output</Btn>
            {out && (
              <Btn type="button" kind="ghost" onClick={() => { setOut(""); setPrompt(""); }}>
                Clear
              </Btn>
            )}
          </div>
        </section>

        <section className="d-card d-ai-out" aria-live="polite">
          <div className="d-card-head">
            <h2>Output Preview</h2>
            {out && (
              <Btn type="button" kind="ghost" onClick={() => void copyOut()}>
                {copied ? "Copied" : "Copy Output"}
              </Btn>
            )}
          </div>
          {out ? <pre className="d-pre">{out}</pre> : <p className="d-note">Click &ldquo;Generate Sample Output&rdquo; to preview a deterministic local response.</p>}
          {hist.length > 0 && (
            <div className="d-hist">
              <h3>Recent Prompts</h3>
              <ul>
                {hist.map((h, i) => (
                  <li key={i}><button type="button" onClick={() => setPrompt(h)}>{h}</button></li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

/* ----------------------------------------------------- 7. Forge Docs */
const FORGE_DOCS = [
  {
    id: "install",
    title: "Installation",
    body: "Install the CLI and initialize a project workspace. Node.js 18 or newer is required.",
    snippets: {
      CLI: "npm install @forge/cli\nforge init my-project\ncd my-project && forge dev",
      Node: "import { createForgeApp } from '@forge/sdk';\nconst app = createForgeApp({ region: 'auto' });",
      cURL: "curl -s https://api.example.test/v1/health",
    },
    sampleResponse: '{\n  "status": "ok",\n  "version": "2.4.0",\n  "mode": "sample-docs-response"\n}',
  },
  {
    id: "auth",
    title: "Authentication",
    body: "Store API tokens in environment variables, never in client-side source files.",
    snippets: {
      CLI: "export FORGE_TOKEN=your_env_token\nforge deploy --env production",
      Node: "const client = new ForgeClient({ token: process.env.FORGE_TOKEN });",
      cURL: 'curl -H "Authorization: Bearer $FORGE_TOKEN" https://api.example.test/v1/projects',
    },
    sampleResponse: '{\n  "authenticated": true,\n  "scope": ["read:projects", "write:deploys"]\n}',
  },
  {
    id: "webhooks",
    title: "Webhooks & Events",
    body: "Verify HMAC signatures on incoming webhook payloads before processing state updates.",
    snippets: {
      CLI: "forge webhooks listen --forward localhost:3000/api/hooks",
      Node: "app.on('deploy.succeeded', (event) => console.log(event.id));",
      cURL: 'curl -X POST https://api.example.test/v1/webhooks/test -d \'{"event":"ping"}\'',
    },
    sampleResponse: '{\n  "delivered": true,\n  "event": "deploy.succeeded",\n  "latencyMs": 42\n}',
  },
];

export function ForgeDocs() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(FORGE_DOCS[0].id);
  const [lang, setLang] = useState<"CLI" | "Node" | "cURL">("CLI");
  const [copied, setCopied] = useState(false);
  const [simulated, setSimulated] = useState("");

  const found = useMemo(
    () => FORGE_DOCS.filter((d) => `${d.title} ${d.body} ${Object.values(d.snippets).join(" ")}`.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  const current = FORGE_DOCS.find((d) => d.id === active) || FORGE_DOCS[0];

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <header className="d-hero">
        <h1>Forge Docs</h1>
        <p>Developer documentation portal — search guides, switch CLI/Node/cURL snippets, copy code, and test sample responses.</p>
      </header>
      <div className="d-docs">
        <aside>
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              const f = FORGE_DOCS.find((d) => `${d.title} ${d.body}`.toLowerCase().includes(e.target.value.toLowerCase()));
              if (f) setActive(f.id);
            }}
            placeholder="Search documentation..."
            aria-label="Search documentation"
          />
          <nav aria-label="Documentation sections">
            {found.length === 0 && <p className="d-note">No section matches &ldquo;{q}&rdquo;.</p>}
            {found.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setActive(d.id);
                  setSimulated("");
                }}
                aria-current={active === d.id ? "page" : undefined}
                className={active === d.id ? "on" : ""}
              >
                {d.title}
              </button>
            ))}
          </nav>
        </aside>

        <article>
          <p className="d-cat">Developer Guide</p>
          <h2>{current.title}</h2>
          <p>{current.body}</p>

          <div className="d-code">
            <div className="d-code-head">
              <div className="d-chips">
                {(["CLI", "Node", "cURL"] as const).map((tabLang) => (
                  <button
                    key={tabLang}
                    type="button"
                    aria-pressed={lang === tabLang}
                    className={lang === tabLang ? "on" : ""}
                    onClick={() => setLang(tabLang)}
                  >
                    {tabLang}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => void copy(current.snippets[lang])}>
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre><code>{current.snippets[lang]}</code></pre>
          </div>

          <div className="d-row" style={{ marginTop: 16 }}>
            <Btn type="button" onClick={() => setSimulated(current.sampleResponse)}>
              Simulate Sample Response
            </Btn>
            <Btn
              type="button"
              kind="ghost"
              disabled={FORGE_DOCS[0].id === current.id}
              onClick={() => {
                const i = FORGE_DOCS.findIndex((d) => d.id === current.id);
                setActive(FORGE_DOCS[Math.max(0, i - 1)].id);
                setSimulated("");
              }}
            >
              Previous
            </Btn>
            <Btn
              type="button"
              kind="ghost"
              disabled={FORGE_DOCS.at(-1)!.id === current.id}
              onClick={() => {
                const i = FORGE_DOCS.findIndex((d) => d.id === current.id);
                setActive(FORGE_DOCS[Math.min(FORGE_DOCS.length - 1, i + 1)].id);
                setSimulated("");
              }}
            >
              Next
            </Btn>
          </div>

          {simulated && (
            <div className="d-code" style={{ marginTop: 14 }}>
              <div className="d-code-head"><span>Simulated JSON Response</span></div>
              <pre><code>{simulated}</code></pre>
            </div>
          )}
        </article>
      </div>
    </>
  );
}

/* ----------------------------------------------------- 15. SkillForge LMS */
const COURSES = [
  {
    id: "ts-arch",
    title: "Modular TypeScript & React Architecture",
    track: "Frontend",
    lessons: [
      "1. Designing strict domain types & state boundaries",
      "2. Accessible interactive drawers, dialogs & keyboard focus",
      "3. Code-splitting & zero-bloat bundle budgets",
    ],
    quizQ: "Why should public frontend bundles avoid embedding private API tokens?",
    quizOptions: ["Anyone can inspect client JS in DevTools", "Tokens slow down CSS animations"],
    quizAnswer: 0,
  },
  {
    id: "node-bots",
    title: "Event-Driven Node.js Messaging Bots",
    track: "Backend",
    lessons: [
      "1. Deduplicating incoming socket message packets",
      "2. Modular command routers with permission guards",
      "3. Graceful error handling for external REST APIs",
    ],
    quizQ: "What prevents a bot from replying twice to a retried message event?",
    quizOptions: ["Message ID deduplication tracking", "Increasing font size"],
    quizAnswer: 0,
  },
];

export function SkillForgeLms() {
  const [courseId, setCourseId] = useState(COURSES[0].id);
  const [completed, setCompleted] = useState<string[]>([COURSES[0].lessons[0]]);
  const [enrolled, setEnrolled] = useState<string[]>([COURSES[0].id]);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);

  const course = COURSES.find((c) => c.id === courseId) || COURSES[0];
  const doneCount = course.lessons.filter((l) => completed.includes(l)).length;
  const pct = Math.round((doneCount / course.lessons.length) * 100);

  const toggleLesson = (lesson: string) =>
    setCompleted((prev) => (prev.includes(lesson) ? prev.filter((x) => x !== lesson) : [...prev, lesson]));

  return (
    <>
      <header className="d-hero">
        <h1>SkillForge</h1>
        <p>Developer learning workspace — enroll in sample tracks, check off lessons, and test the checkpoint quiz.</p>
      </header>
      <div className="d-chips" style={{ marginBottom: 16 }}>
        {COURSES.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={courseId === c.id}
            className={courseId === c.id ? "on" : ""}
            onClick={() => {
              setCourseId(c.id);
              setQuizChoice(null);
            }}
          >
            {c.track}: {c.title}
          </button>
        ))}
      </div>

      <div className="d-split">
        <section className="d-card">
          <div className="d-card-head">
            <div>
              <p className="d-cat">{course.track} Track · Sample Course</p>
              <h2>{course.title}</h2>
            </div>
            <Btn
              type="button"
              onClick={() =>
                setEnrolled((prev) => (prev.includes(course.id) ? prev : [...prev, course.id]))
              }
            >
              {enrolled.includes(course.id) ? "Enrolled ✓" : "Enroll (Sample)"}
            </Btn>
          </div>
          <p className="d-count" style={{ marginTop: 10 }}>
            Progress: {doneCount}/{course.lessons.length} lessons ({pct}%)
          </p>
          <ul className="d-homes" style={{ marginTop: 12 }}>
            {course.lessons.map((lesson) => {
              const isDone = completed.includes(lesson);
              return (
                <li key={lesson} className={isDone ? "open" : ""}>
                  <button type="button" className="d-home-head" onClick={() => toggleLesson(lesson)} aria-pressed={isDone}>
                    <span>{lesson}</span>
                    <strong>{isDone ? "Completed ✓" : "Mark Complete"}</strong>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="d-card">
          <p className="d-cat">Checkpoint Quiz</p>
          <h2>Knowledge Check</h2>
          <p style={{ marginTop: 8 }}>{course.quizQ}</p>
          <div className="d-acc" style={{ marginTop: 14 }}>
            {course.quizOptions.map((opt, idx) => (
              <div key={opt} className={quizChoice === idx ? "open" : ""}>
                <button type="button" onClick={() => setQuizChoice(idx)}>
                  <span>{opt}</span>
                </button>
              </div>
            ))}
          </div>
          {quizChoice !== null && (
            <p className="d-success-inline" role="status">
              {quizChoice === course.quizAnswer
                ? "Correct — client-side JS is always public, so secrets must stay on a server."
                : "Not quite — try the other option."}
            </p>
          )}
        </section>
      </div>
    </>
  );
}

/* ----------------------------------------------------- 16. TalentGrid Jobs */
const JOBS = [
  { id: 1, title: "Frontend TypeScript Engineer", company: "Veloce Systems", mode: "Remote", minK: 95, stack: "React · TypeScript · CSS", summary: "Build accessible web applications and design system primitives." },
  { id: 2, title: "Node.js Automation Developer", company: "RelayOps", mode: "Remote", minK: 85, stack: "Node.js · Webhooks · REST", summary: "Architect event-driven messaging workflows and API integrations." },
  { id: 3, title: "Shopify Storefront Engineer", company: "Kova Retail", mode: "Hybrid", minK: 80, stack: "Liquid · Online Store 2.0 · JS", summary: "Develop fast custom Shopify themes and checkout extensions." },
  { id: 4, title: "Full-Stack Product Engineer", company: "Harbor Labs", mode: "Remote", minK: 110, stack: "React · Node.js · PostgreSQL", summary: "Ship end-to-end customer portals from schema to UI." },
];

export function TalentGridJobs() {
  const [mode, setMode] = useState("All");
  const [minSalary, setMinSalary] = useState(70);
  const [saved, setSaved] = useState<number[]>([1]);
  const [selectedJob, setSelectedJob] = useState(JOBS[0]);
  const [applicant, setApplicant] = useState({ name: "", email: "", link: "" });
  const [appliedMsg, setAppliedMsg] = useState("");
  const [applyErr, setApplyErr] = useState("");

  const list = JOBS.filter((j) => (mode === "All" || j.mode === mode) && j.minK >= minSalary);

  const apply = (e: React.FormEvent) => {
    e.preventDefault();
    if (applicant.name.trim().length < 2 || !emailOk(applicant.email)) {
      setApplyErr("Enter your full name and valid email address.");
      setAppliedMsg("");
      return;
    }
    setApplyErr("");
    setAppliedMsg(`Sample application submitted for ${selectedJob.title} at ${selectedJob.company}. No external submission occurred.`);
  };

  return (
    <>
      <header className="d-hero">
        <h1>TalentGrid</h1>
        <p>Engineering job board — filter by remote policy and salary floor, save roles, and test quick-apply.</p>
      </header>
      <div className="d-toolbar">
        <div className="d-chips">
          {["All", "Remote", "Hybrid"].map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} className={mode === m ? "on" : ""} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>
        <Field id="tg-sal" label={`Minimum Salary: $${minSalary}k/yr`}>
          <input id="tg-sal" type="range" min={70} max={110} step={5} value={minSalary} onChange={(e) => setMinSalary(Number(e.target.value))} />
        </Field>
      </div>

      <div className="d-split">
        <ul className="d-homes">
          {list.map((j) => (
            <li key={j.id} className={selectedJob.id === j.id ? "open" : ""}>
              <button type="button" className="d-home-head" onClick={() => setSelectedJob(j)}>
                <div>
                  <p className="d-cat">{j.company} · {j.mode}</p>
                  <h3>{j.title}</h3>
                  <p className="d-note" style={{ marginTop: 4 }}>{j.stack}</p>
                </div>
                <strong>${j.minK}k+</strong>
              </button>
            </li>
          ))}
        </ul>

        <section className="d-card">
          <div className="d-card-head">
            <div>
              <p className="d-cat">{selectedJob.company} · {selectedJob.mode}</p>
              <h2>{selectedJob.title}</h2>
            </div>
            <Btn
              type="button"
              kind="ghost"
              onClick={() =>
                setSaved((prev) =>
                  prev.includes(selectedJob.id) ? prev.filter((x) => x !== selectedJob.id) : [...prev, selectedJob.id]
                )
              }
            >
              {saved.includes(selectedJob.id) ? "Saved ★" : "Save Role"}
            </Btn>
          </div>
          <p className="d-note" style={{ marginTop: 8 }}>{selectedJob.summary}</p>
          <form className="d-form" onSubmit={apply} noValidate>
            <Field id="tg-name" label="Candidate Name">
              <input id="tg-name" value={applicant.name} onChange={(e) => setApplicant({ ...applicant, name: e.target.value })} />
            </Field>
            <Field id="tg-email" label="Email Address">
              <input id="tg-email" type="email" value={applicant.email} onChange={(e) => setApplicant({ ...applicant, email: e.target.value })} />
            </Field>
            <Field id="tg-link" label="GitHub or Portfolio URL">
              <input id="tg-link" value={applicant.link} onChange={(e) => setApplicant({ ...applicant, link: e.target.value })} placeholder="https://github.com/..." />
            </Field>
            {applyErr && <p role="alert" className="d-error">{applyErr}</p>}
            <Btn type="submit">Submit Demo Application</Btn>
            {appliedMsg && <p className="d-success-inline" role="status">{appliedMsg}</p>}
          </form>
        </section>
      </div>
    </>
  );
}

/* ----------------------------------------------------- 17. Meridian Press */
const ESSAYS = [
  {
    id: "e1",
    topic: "Systems",
    title: "Designing Predictable Webhook Pipelines",
    readTime: "4 min read",
    excerpt: "Idempotency keys, exponential backoff, and dead-letter queues keep async integrations reliable.",
    body: "When two services communicate over HTTP webhooks, network retries are inevitable. Assigning a unique delivery ID to every payload and storing processed IDs prevents duplicate side effects while keeping handlers fast.",
  },
  {
    id: "e2",
    topic: "Design",
    title: "Typography & Contrast in Dark Interfaces",
    readTime: "3 min read",
    excerpt: "Why restrained surface contrast and clear font hierarchy outperform heavy neon glows.",
    body: "Readable dark interfaces rely on subtle elevation steps (#07070a to #12131a), crisp hairline borders, and high-contrast body text rather than saturated backgrounds that fatigue the eye.",
  },
  {
    id: "e3",
    topic: "Commerce",
    title: "Reducing Mobile Checkout Friction",
    readTime: "5 min read",
    excerpt: "Inline field validation, clear shipping thresholds, and persistent cart drawers improve completion.",
    body: "Mobile shoppers abandon carts when unexpected shipping costs appear late or validation errors wipe out form inputs. Showing free-shipping thresholds early and preserving input state keeps checkout smooth.",
  },
];

export function MeridianPress() {
  const [topic, setTopic] = useState("All");
  const [activeId, setActiveId] = useState(ESSAYS[0].id);
  const [bookmarks, setBookmarks] = useState<string[]>([ESSAYS[0].id]);
  const [email, setEmail] = useState("");
  const [subMsg, setSubMsg] = useState("");

  const visible = ESSAYS.filter((e) => topic === "All" || e.topic === topic);
  const article = ESSAYS.find((e) => e.id === activeId) || ESSAYS[0];

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOk(email)) {
      setSubMsg("Enter a valid email address.");
      return;
    }
    setSubMsg(`Sample digest subscription confirmed for ${email}.`);
    setEmail("");
  };

  return (
    <>
      <header className="d-hero">
        <h1>Meridian Press</h1>
        <p>Systems &amp; design journal — filter essays, read in-page, bookmark articles, and test newsletter signup.</p>
      </header>
      <div className="d-chips" style={{ marginBottom: 16 }}>
        {["All", "Systems", "Design", "Commerce"].map((t) => (
          <button key={t} type="button" aria-pressed={topic === t} className={topic === t ? "on" : ""} onClick={() => setTopic(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="d-split">
        <ul className="d-homes">
          {visible.map((e) => (
            <li key={e.id} className={article.id === e.id ? "open" : ""}>
              <button type="button" className="d-home-head" onClick={() => setActiveId(e.id)}>
                <div>
                  <p className="d-cat">{e.topic} · {e.readTime}</p>
                  <h3>{e.title}</h3>
                  <p className="d-note" style={{ marginTop: 4 }}>{e.excerpt}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>

        <div>
          <article className="d-card">
            <div className="d-card-head">
              <p className="d-cat">{article.topic} · {article.readTime}</p>
              <Btn
                type="button"
                kind="ghost"
                onClick={() =>
                  setBookmarks((prev) =>
                    prev.includes(article.id) ? prev.filter((x) => x !== article.id) : [...prev, article.id]
                  )
                }
              >
                {bookmarks.includes(article.id) ? "Bookmarked ★" : "Bookmark"}
              </Btn>
            </div>
            <h2 style={{ marginTop: 8 }}>{article.title}</h2>
            <p className="d-note" style={{ marginTop: 10 }}>{article.body}</p>
          </article>

          <section className="d-card">
            <h2>Weekly Digest (Demo)</h2>
            <form className="d-row" onSubmit={subscribe} noValidate>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reader@example.com"
                aria-label="Reader email"
                className="d-promo-input"
              />
              <Btn type="submit">Subscribe</Btn>
            </form>
            {subMsg && <p className="d-success-inline" role="status">{subMsg}</p>}
          </section>
        </div>
      </div>
    </>
  );
}

/* ----------------------------------------------------- 18. StagePass Live */
const EVENTS = [
  { id: 1, title: "PakDev Systems Summit 2026", city: "Lahore", cat: "Conference", date: "14 Dec 2026", general: 45, vip: 120 },
  { id: 2, title: "Full-Stack & AI Builders Workshop", city: "Islamabad", cat: "Workshop", date: "22 Dec 2026", general: 30, vip: 85 },
  { id: 3, title: "Design Systems Live Meetup", city: "Karachi", cat: "Meetup", date: "10 Jan 2027", general: 20, vip: 60 },
];

export function StagePassLive() {
  const [city, setCity] = useState("All");
  const [eventId, setEventId] = useState(1);
  const [tier, setTier] = useState<"general" | "vip">("general");
  const [qty, setQty] = useState(2);
  const [code, setCode] = useState("");
  const [attendee, setAttendee] = useState("");
  const [passMsg, setPassMsg] = useState("");

  const ev = EVENTS.find((e) => e.id === eventId) || EVENTS[0];
  const unit = tier === "general" ? ev.general : ev.vip;
  const rawTotal = unit * qty;
  const discount = code.trim().toUpperCase() === "PROBOY10" ? Math.round(rawTotal * 0.1) : 0;
  const finalTotal = rawTotal - discount;

  const issuePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (attendee.trim().length < 2) {
      setPassMsg("Enter an attendee name to generate a sample pass.");
      return;
    }
    setPassMsg(`Sample Digital Pass #SP-${ev.id}${qty}9 issued to ${attendee} for ${ev.title} (${qty} × ${tier.toUpperCase()}, $${finalTotal}).`);
  };

  return (
    <>
      <header className="d-hero">
        <h1>StagePass</h1>
        <p>Event discovery and ticketing interface — filter cities, select pass tiers, apply promo code PROBOY10, and generate a sample pass.</p>
      </header>
      <div className="d-chips" style={{ marginBottom: 16 }}>
        {["All", "Lahore", "Islamabad", "Karachi"].map((c) => (
          <button key={c} type="button" aria-pressed={city === c} className={city === c ? "on" : ""} onClick={() => setCity(c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="d-split">
        <ul className="d-homes">
          {EVENTS.filter((e) => city === "All" || e.city === city).map((e) => (
            <li key={e.id} className={ev.id === e.id ? "open" : ""}>
              <button type="button" className="d-home-head" onClick={() => setEventId(e.id)}>
                <div>
                  <p className="d-cat">{e.city} · {e.date}</p>
                  <h3>{e.title}</h3>
                </div>
                <strong>From ${e.general}</strong>
              </button>
            </li>
          ))}
        </ul>

        <section className="d-card">
          <p className="d-cat">Sample Ticket Checkout</p>
          <h2>{ev.title}</h2>
          <div className="d-chips" style={{ marginTop: 12 }}>
            <button type="button" aria-pressed={tier === "general"} className={tier === "general" ? "on" : ""} onClick={() => setTier("general")}>
              General (${ev.general})
            </button>
            <button type="button" aria-pressed={tier === "vip"} className={tier === "vip" ? "on" : ""} onClick={() => setTier("vip")}>
              VIP (${ev.vip})
            </button>
          </div>
          <div className="d-grid2" style={{ marginTop: 12 }}>
            <Field id="sp-qty" label="Quantity">
              <select id="sp-qty" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}</option>)}
              </select>
            </Field>
            <Field id="sp-code" label="Promo Code (PROBOY10)">
              <input id="sp-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="PROBOY10" />
            </Field>
          </div>
          <div className="d-total">
            <span>Sample Total</span>
            <strong>${finalTotal}</strong>
          </div>
          <form className="d-form" onSubmit={issuePass} noValidate>
            <Field id="sp-att" label="Attendee Full Name">
              <input id="sp-att" value={attendee} onChange={(e) => setAttendee(e.target.value)} />
            </Field>
            <Btn type="submit">Generate Sample Pass</Btn>
            {passMsg && <p className="d-success-inline" role="status">{passMsg}</p>}
          </form>
        </section>
      </div>
    </>
  );
}

/* ----------------------------------------------------- 19. IronPulse Club */
const CLASSES = [
  { id: 1, day: "Mon", title: "Strength & Conditioning", time: "07:00", coach: "Coach Tariq", spots: 5 },
  { id: 2, day: "Wed", title: "Metabolic HIIT Circuit", time: "18:00", coach: "Coach Sara", spots: 3 },
  { id: 3, day: "Fri", title: "Mobility & Core Recovery", time: "17:30", coach: "Coach Bilal", spots: 8 },
  { id: 4, day: "Sat", title: "Athletic Endurance Run", time: "08:30", coach: "Coach Tariq", spots: 6 },
];

export function IronPulseClub() {
  const [day, setDay] = useState("All");
  const [bookedIds, setBookedIds] = useState<number[]>([]);
  const [trialName, setTrialName] = useState("");
  const [trialMsg, setTrialMsg] = useState("");

  const toggleBook = (id: number) =>
    setBookedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <>
      <header className="d-hero">
        <h1>IronPulse</h1>
        <p>Athletic club &amp; class scheduler — filter weekly sessions, reserve spots, and request a guest trial pass.</p>
      </header>
      <div className="d-chips" style={{ marginBottom: 16 }}>
        {["All", "Mon", "Wed", "Fri", "Sat"].map((d) => (
          <button key={d} type="button" aria-pressed={day === d} className={day === d ? "on" : ""} onClick={() => setDay(d)}>
            {d}
          </button>
        ))}
      </div>
      <div className="d-split">
        <ul className="d-homes">
          {CLASSES.filter((c) => day === "All" || c.day === day).map((c) => {
            const isBooked = bookedIds.includes(c.id);
            return (
              <li key={c.id} className={isBooked ? "open" : ""}>
                <div className="d-home-head">
                  <div>
                    <p className="d-cat">{c.day} · {c.time} · {c.coach}</p>
                    <h3>{c.title}</h3>
                  </div>
                  <Btn type="button" kind={isBooked ? "primary" : "ghost"} onClick={() => toggleBook(c.id)}>
                    {isBooked ? "Reserved ✓" : `Reserve (${c.spots} left)`}
                  </Btn>
                </div>
              </li>
            );
          })}
        </ul>

        <section className="d-card">
          <p className="d-cat">Guest Pass</p>
          <h2>Request 3-Day Sample Trial</h2>
          <form
            className="d-form"
            onSubmit={(e) => {
              e.preventDefault();
              setTrialMsg(
                trialName.trim().length < 2
                  ? "Enter your name first."
                  : `Sample 3-day guest pass issued for ${trialName}.`
              );
            }}
            noValidate
          >
            <Field id="ip-name" label="Full Name">
              <input id="ip-name" value={trialName} onChange={(e) => setTrialName(e.target.value)} />
            </Field>
            <Btn type="submit">Issue Sample Trial Pass</Btn>
            {trialMsg && <p className="d-success-inline" role="status">{trialMsg}</p>}
          </form>
        </section>
      </div>
    </>
  );
}

/* ----------------------------------------------------- 20. CarePoint Clinic */
const DOCTORS = [
  { id: 1, dept: "General Practice", name: "Dr. Ayesha Mahmood", slots: ["09:30", "11:00", "15:30"] },
  { id: 2, dept: "Dermatology", name: "Dr. Usman Farooq", slots: ["10:00", "14:00", "16:30"] },
  { id: 3, dept: "Optometry", name: "Dr. Nadia Siddiqui", slots: ["11:30", "15:00", "17:00"] },
];

export function CarePointClinic() {
  const [dept, setDept] = useState("All");
  const [docId, setDocId] = useState(1);
  const [slot, setSlot] = useState("09:30");
  const [patient, setPatient] = useState("");
  const [date, setDate] = useState("2026-11-15");
  const [notice, setNotice] = useState("");

  const doc = DOCTORS.find((d) => d.id === docId) || DOCTORS[0];

  return (
    <>
      <header className="d-hero">
        <h1>CarePoint Clinic</h1>
        <p>Outpatient appointment scheduling UI demo — filter departments, choose a time slot, and confirm a sample booking.</p>
      </header>
      <p className="d-note" style={{ marginBottom: 16 }}>
        Interface demonstration only: this demo does not provide medical advice, diagnosis, or real clinic scheduling.
      </p>
      <div className="d-chips" style={{ marginBottom: 16 }}>
        {["All", "General Practice", "Dermatology", "Optometry"].map((d) => (
          <button key={d} type="button" aria-pressed={dept === d} className={dept === d ? "on" : ""} onClick={() => setDept(d)}>
            {d}
          </button>
        ))}
      </div>

      <div className="d-split">
        <ul className="d-homes">
          {DOCTORS.filter((d) => dept === "All" || d.dept === dept).map((d) => (
            <li key={d.id} className={doc.id === d.id ? "open" : ""}>
              <button
                type="button"
                className="d-home-head"
                onClick={() => {
                  setDocId(d.id);
                  setSlot(d.slots[0]);
                }}
              >
                <div>
                  <p className="d-cat">{d.dept}</p>
                  <h3>{d.name}</h3>
                </div>
                <strong>{d.slots.length} slots</strong>
              </button>
            </li>
          ))}
        </ul>

        <section className="d-card">
          <p className="d-cat">Sample Appointment Slot</p>
          <h2>{doc.name}</h2>
          <div className="d-chips" style={{ marginTop: 12 }}>
            {doc.slots.map((s) => (
              <button key={s} type="button" aria-pressed={slot === s} className={slot === s ? "on" : ""} onClick={() => setSlot(s)}>
                {s}
              </button>
            ))}
          </div>
          <form
            className="d-form"
            onSubmit={(e) => {
              e.preventDefault();
              setNotice(
                patient.trim().length < 2
                  ? "Enter a visitor name to test confirmation."
                  : `Sample appointment slot reserved with ${doc.name} on ${date} at ${slot} for ${patient} (UI demo only).`
              );
            }}
            noValidate
          >
            <Field id="cp-date" label="Preferred Date">
              <input id="cp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field id="cp-name" label="Visitor Name">
              <input id="cp-name" value={patient} onChange={(e) => setPatient(e.target.value)} />
            </Field>
            <Btn type="submit">Confirm Sample Slot</Btn>
            {notice && <p className="d-success-inline" role="status">{notice}</p>}
          </form>
        </section>
      </div>
    </>
  );
}

/* ----------------------------------------------------- 21. ClientFlow CRM */
type Deal = { id: number; company: string; contact: string; stage: "Lead" | "Proposal" | "Negotiation" | "Won"; value: number; note: string };
const INITIAL_DEALS: Deal[] = [
  { id: 1, company: "Atlas Retail Group", contact: "Zainab Raza", stage: "Proposal", value: 8400, note: "Requested custom Shopify Online Store 2.0 theme quote." },
  { id: 2, company: "SwiftDispatch PK", contact: "Kamran Tariq", stage: "Negotiation", value: 5200, note: "Reviewing WhatsApp order notification bot scope." },
  { id: 3, company: "Northstar EdTech", contact: "Elena Brooks", stage: "Lead", value: 11000, note: "Initial discovery call for React student portal." },
  { id: 4, company: "Cedar Logistics", contact: "Omar Farooq", stage: "Won", value: 6800, note: "Delivered REST webhook dashboard." },
];

export function ClientFlowCrm() {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [stageFilter, setStageFilter] = useState("All");
  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState(1);
  const [newNote, setNewNote] = useState("");

  const visible = deals.filter(
    (d) =>
      (stageFilter === "All" || d.stage === stageFilter) &&
      `${d.company} ${d.contact} ${d.note}`.toLowerCase().includes(q.toLowerCase())
  );
  const active = deals.find((d) => d.id === activeId) || deals[0];
  const pipelineTotal = deals.reduce((s, d) => s + d.value, 0);

  const updateStage = (stage: Deal["stage"]) => {
    setDeals((prev) => prev.map((d) => (d.id === active.id ? { ...d, stage } : d)));
  };

  return (
    <>
      <header className="d-hero">
        <h1>ClientFlow CRM</h1>
        <p>B2B pipeline &amp; account manager — filter sample deals, update stages locally, and log account notes.</p>
      </header>
      <div className="d-toolbar">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search accounts or contacts..." aria-label="Search accounts" />
        <div className="d-chips">
          {["All", "Lead", "Proposal", "Negotiation", "Won"].map((st) => (
            <button key={st} type="button" aria-pressed={stageFilter === st} className={stageFilter === st ? "on" : ""} onClick={() => setStageFilter(st)}>
              {st}
            </button>
          ))}
        </div>
        <span className="d-note">Sample Pipeline: ${pipelineTotal.toLocaleString()}</span>
      </div>

      <div className="d-split">
        <ul className="d-homes">
          {visible.map((d) => (
            <li key={d.id} className={active.id === d.id ? "open" : ""}>
              <button type="button" className="d-home-head" onClick={() => setActiveId(d.id)}>
                <div>
                  <p className="d-cat">{d.stage} · {d.contact}</p>
                  <h3>{d.company}</h3>
                </div>
                <strong>${d.value.toLocaleString()}</strong>
              </button>
            </li>
          ))}
        </ul>

        <section className="d-card">
          <p className="d-cat">Account Inspector (Local State)</p>
          <h2>{active.company}</h2>
          <p className="d-note">Primary Contact: {active.contact} · Sample Value: ${active.value.toLocaleString()}</p>
          <div className="d-chips" style={{ marginTop: 12 }}>
            {(["Lead", "Proposal", "Negotiation", "Won"] as Deal["stage"][]).map((st) => (
              <button key={st} type="button" aria-pressed={active.stage === st} className={active.stage === st ? "on" : ""} onClick={() => updateStage(st)}>
                {st}
              </button>
            ))}
          </div>
          <p style={{ marginTop: 14, fontSize: 14 }}>{active.note}</p>
          <form
            className="d-row"
            style={{ marginTop: 14 }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!newNote.trim()) return;
              setDeals((prev) => prev.map((d) => (d.id === active.id ? { ...d, note: newNote.trim() } : d)));
              setNewNote("");
            }}
          >
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Update account note locally..."
              aria-label="Update account note"
              className="d-promo-input"
            />
            <Btn type="submit">Save Note</Btn>
          </form>
        </section>
      </div>
    </>
  );
}

/* ----------------------------------------------------- 22. SprintBoard Kanban */
type KanbanCol = "Backlog" | "In Progress" | "Review" | "Done";
type KanbanTask = { id: number; title: string; priority: "High" | "Medium" | "Low"; col: KanbanCol };

const INITIAL_TASKS: KanbanTask[] = [
  { id: 1, title: "Audit mobile drawer keyboard focus trap", priority: "High", col: "Done" },
  { id: 2, title: "Add safe arithmetic evaluator to playground", priority: "High", col: "In Progress" },
  { id: 3, title: "Verify sitemap canonical URLs", priority: "Medium", col: "Review" },
  { id: 4, title: "Optimize social preview JPEG weight", priority: "Low", col: "Backlog" },
];

const KANBAN_COLS: KanbanCol[] = ["Backlog", "In Progress", "Review", "Done"];

export function SprintBoardKanban() {
  const [tasks, setTasks] = useState<KanbanTask[]>(INITIAL_TASKS);
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<KanbanTask["priority"]>("Medium");

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return;
    setTasks((prev) => [{ id: Date.now(), title: title.trim(), priority, col: "Backlog" }, ...prev]);
    setTitle("");
  };

  const moveTask = (id: number, dir: -1 | 1) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = KANBAN_COLS.indexOf(t.col);
        const nextIdx = Math.max(0, Math.min(KANBAN_COLS.length - 1, idx + dir));
        return { ...t, col: KANBAN_COLS[nextIdx] };
      })
    );
  };

  return (
    <>
      <header className="d-hero">
        <h1>SprintBoard</h1>
        <p>Interactive Kanban workspace — create sample cards, filter by priority, move tasks across columns, or reset.</p>
      </header>

      <div className="d-toolbar">
        <form onSubmit={addTask} className="d-row" style={{ flex: "1 1 340px" }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New sample task title..."
            aria-label="New sample task title"
            className="d-promo-input"
          />
          <select aria-label="Task priority" value={priority} onChange={(e) => setPriority(e.target.value as KanbanTask["priority"])} className="d-sort-select">
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <Btn type="submit">+ Add Card</Btn>
        </form>

        <div className="d-chips">
          {["All", "High", "Medium", "Low"].map((p) => (
            <button key={p} type="button" aria-pressed={priorityFilter === p} className={priorityFilter === p ? "on" : ""} onClick={() => setPriorityFilter(p)}>
              {p}
            </button>
          ))}
        </div>

        <Btn type="button" kind="ghost" onClick={() => setTasks(INITIAL_TASKS)}>
          Reset Board
        </Btn>
      </div>

      <div className="d-kanban">
        {KANBAN_COLS.map((col) => {
          const colTasks = tasks.filter((t) => t.col === col && (priorityFilter === "All" || t.priority === priorityFilter));
          return (
            <section key={col} className="d-kanban-col" aria-label={col}>
              <div className="d-card-head">
                <h2>{col}</h2>
                <span className="d-badge">{colTasks.length}</span>
              </div>
              <ul className="d-kanban-list">
                {colTasks.map((t) => (
                  <li key={t.id} className="d-kanban-card">
                    <span className="d-cat">{t.priority} Priority</span>
                    <p>{t.title}</p>
                    <div className="d-row" style={{ marginTop: 10 }}>
                      <Btn type="button" kind="ghost" disabled={col === "Backlog"} onClick={() => moveTask(t.id, -1)} aria-label="Move left">
                        ←
                      </Btn>
                      <Btn type="button" kind="ghost" disabled={col === "Done"} onClick={() => moveTask(t.id, 1)} aria-label="Move right">
                        →
                      </Btn>
                      <Btn type="button" kind="ghost" onClick={() => setTasks((prev) => prev.filter((x) => x.id !== t.id))} aria-label="Remove card">
                        ×
                      </Btn>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

/* ----------------------------------------------------- 23. MemberVault */
export function MemberVault() {
  const [annual, setAnnual] = useState(true);
  const [activePlan, setActivePlan] = useState("Pro Builder");

  const plans = [
    { name: "Starter", mo: 12, yr: 9, perks: ["5 active workspaces", "Community forum access", "Weekly release notes"] },
    { name: "Pro Builder", mo: 29, yr: 22, perks: ["Unlimited workspaces", "Priority API webhooks", "Custom domain support"] },
    { name: "Team Studio", mo: 79, yr: 59, perks: ["10 team seats", "Role-based access logs", "Dedicated onboarding"] },
  ];

  return (
    <>
      <header className="d-hero">
        <h1>MemberVault</h1>
        <p>Subscription &amp; membership portal — toggle annual billing, switch simulated plans, and review sample billing history.</p>
      </header>
      <div className="d-chips" style={{ marginBottom: 18 }}>
        <button type="button" aria-pressed={!annual} className={!annual ? "on" : ""} onClick={() => setAnnual(false)}>
          Monthly Billing
        </button>
        <button type="button" aria-pressed={annual} className={annual ? "on" : ""} onClick={() => setAnnual(true)}>
          Annual Billing (Save ~25%)
        </button>
      </div>

      <div className="d-products">
        {plans.map((p) => {
          const isCurrent = activePlan === p.name;
          return (
            <div key={p.name} className="d-card" style={{ borderColor: isCurrent ? "var(--accent)" : undefined }}>
              <p className="d-cat">{isCurrent ? "Active Sample Plan" : "Available Tier"}</p>
              <h2>{p.name}</h2>
              <p className="d-modal-price">${annual ? p.yr : p.mo} / mo</p>
              <ul className="d-home-body" style={{ border: 0, padding: 0, marginTop: 12 }}>
                {p.perks.map((perk) => <li key={perk}>{perk}</li>)}
              </ul>
              <Btn type="button" kind={isCurrent ? "ghost" : "primary"} style={{ marginTop: 16, width: "100%" }} onClick={() => setActivePlan(p.name)}>
                {isCurrent ? "Current Plan ✓" : `Switch to ${p.name}`}
              </Btn>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ----------------------------------------------------- 24. LedgerNote Finance */
type Invoice = { id: string; client: string; status: "Paid" | "Pending" | "Overdue"; items: { desc: string; qty: number; rate: number }[] };
const INITIAL_INVOICES: Invoice[] = [
  { id: "INV-204", client: "UrbanAura Retail", status: "Paid", items: [{ desc: "Shopify Online Store 2.0 Custom Section", qty: 1, rate: 1450 }] },
  { id: "INV-205", client: "Logistics Express", status: "Pending", items: [{ desc: "Node.js WhatsApp Alert Bot", qty: 1, rate: 1200 }] },
  { id: "INV-206", client: "NextGen SaaS", status: "Overdue", items: [{ desc: "React Dashboard Components", qty: 2, rate: 650 }] },
];

export function LedgerNoteFinance() {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeId, setActiveId] = useState("INV-204");
  const [clientName, setClientName] = useState("");
  const [lineDesc, setLineDesc] = useState("");
  const [lineRate, setLineRate] = useState("850");

  const active = invoices.find((inv) => inv.id === activeId) || invoices[0];
  const calcTotal = (inv: Invoice) => inv.items.reduce((s, i) => s + i.qty * i.rate, 0);

  const createInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (clientName.trim().length < 2 || lineDesc.trim().length < 2) return;
    const rate = Math.max(1, Number(lineRate) || 100);
    const created: Invoice = {
      id: `INV-${207 + invoices.length}`,
      client: clientName.trim(),
      status: "Pending",
      items: [{ desc: lineDesc.trim(), qty: 1, rate }],
    };
    setInvoices((prev) => [created, ...prev]);
    setActiveId(created.id);
    setClientName("");
    setLineDesc("");
  };

  return (
    <>
      <header className="d-hero">
        <h1>LedgerNote</h1>
        <p>Small-business invoicing workspace (fictional sample data) — filter invoices, create line items, and preview printable totals.</p>
      </header>
      <div className="d-chips" style={{ marginBottom: 16 }}>
        {["All", "Paid", "Pending", "Overdue"].map((st) => (
          <button key={st} type="button" aria-pressed={statusFilter === st} className={statusFilter === st ? "on" : ""} onClick={() => setStatusFilter(st)}>
            {st}
          </button>
        ))}
      </div>

      <div className="d-split">
        <div>
          <ul className="d-homes">
            {invoices.filter((i) => statusFilter === "All" || i.status === statusFilter).map((inv) => (
              <li key={inv.id} className={active.id === inv.id ? "open" : ""}>
                <button type="button" className="d-home-head" onClick={() => setActiveId(inv.id)}>
                  <div>
                    <p className="d-cat">{inv.id} · {inv.status}</p>
                    <h3>{inv.client}</h3>
                  </div>
                  <strong>${calcTotal(inv).toLocaleString()}</strong>
                </button>
              </li>
            ))}
          </ul>

          <section className="d-card">
            <h2>Create Sample Invoice</h2>
            <form className="d-form" onSubmit={createInvoice} noValidate>
              <Field id="ln-client" label="Client Name">
                <input id="ln-client" value={clientName} onChange={(e) => setClientName(e.target.value)} />
              </Field>
              <div className="d-grid2">
                <Field id="ln-desc" label="Line Item Description">
                  <input id="ln-desc" value={lineDesc} onChange={(e) => setLineDesc(e.target.value)} />
                </Field>
                <Field id="ln-rate" label="Amount (USD)">
                  <input id="ln-rate" type="number" min={1} value={lineRate} onChange={(e) => setLineRate(e.target.value)} />
                </Field>
              </div>
              <Btn type="submit">Add Sample Invoice</Btn>
            </form>
          </section>
        </div>

        <section className="d-card">
          <div className="d-card-head">
            <div>
              <p className="d-cat">Printable Sample Invoice · {active.status}</p>
              <h2>{active.id} — {active.client}</h2>
            </div>
            <Btn type="button" kind="ghost" onClick={() => typeof window !== "undefined" && window.print()}>
              Print View
            </Btn>
          </div>
          <div className="d-table-scroll" style={{ marginTop: 14 }}>
            <table className="d-table">
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {active.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.desc}</td><td>{it.qty}</td><td>${it.rate.toLocaleString()}</td><td>${(it.qty * it.rate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-total">
            <span>Sample Invoice Total</span>
            <strong>${calcTotal(active).toLocaleString()}</strong>
          </div>
        </section>
      </div>
    </>
  );
}
