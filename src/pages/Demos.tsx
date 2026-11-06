import { useMemo, useState, type ReactNode } from "react";
import Icon from "../components/Icon";
import { demos, getDemo } from "../lib/data";
import { onLink } from "../lib/router";
import { useSeo } from "../lib/seo";
import { NotFound } from "./Detail";
import "./demos.css";

/* ---------------------------------------------------------------- shell */
function DemoShell({ slug, children }: { slug: string; children: ReactNode }) {
  const d = getDemo(slug);
  if (!d) return <NotFound />;
  return (
    <div className="demo" style={{ "--accent": d.accent, "--ink": d.ink } as React.CSSProperties} data-demo={d.slug}>
      <div className="demo-bar">
        <div className="demo-bar-inner">
          <span className="demo-logo"><span className="demo-dot" />{d.name}</span>
          <span className="demo-kind">Working demo · {d.kind}</span>
          <a href="/projects#demos" onClick={onLink} className="demo-back">Back to portfolio <Icon name="arrow" className="w-4 h-4" /></a>
        </div>
      </div>
      <main className="demo-stage">{children}</main>
      <footer className="demo-foot">
        <p><strong>{d.name}</strong> — {d.category} concept demonstration by Shahan Ali (ProBoy). Sample data only; not a client deployment.</p>
        <a href="/projects#demos" onClick={onLink}>All demos</a>
      </footer>
    </div>
  );
}

const Btn = ({ children, kind = "primary", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { kind?: "primary" | "ghost" }) => (
  <button className={`d-btn d-btn--${kind}`} {...rest}>{children}</button>
);
const Field = ({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) => (
  <label className="d-field" htmlFor={id}>
    <span>{label}</span>{children}
    {error && <em className="d-error" role="alert">{error}</em>}
  </label>
);
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* --------------------------------------------------------- 1. LuxeCart */
type Product = { id: number; name: string; cat: string; price: number; note: string; ref: string };
const catalog: Product[] = [
  { id: 1, name: "Tourbillon Noir", cat: "Tourbillon", price: 12400, ref: "LC-011", note: "Skeleton dial, 42h reserve" },
  { id: 2, name: "Chronograph Meridian", cat: "Chronograph", price: 4380, ref: "LC-024", note: "Column wheel, ceramic bezel" },
  { id: 3, name: "Perpetual Ash", cat: "Dress", price: 6950, ref: "LC-037", note: "Moonphase complication" },
  { id: 4, name: "Diver Abyss 300", cat: "Sport", price: 3120, ref: "LC-042", note: "300m, ceramic insert" },
  { id: 5, name: "Skeleton Vitrine", cat: "Tourbillon", price: 9800, ref: "LC-058", note: "Open-worked movement" },
  { id: 6, name: "Classic Breguet", cat: "Dress", price: 2740, ref: "LC-063", note: "Guilloché dial" },
  { id: 7, name: "GMT Voyager", cat: "Sport", price: 3890, ref: "LC-077", note: "Dual timezone, 24h bezel" },
  { id: 8, name: "Panda Reserve", cat: "Chronograph", price: 5460, ref: "LC-088", note: "Reverse panda dial" },
];
function LuxeCart() {
  const [q, setQ] = useState(""); const [cat, setCat] = useState("All");
  const [cart, setCart] = useState<{ id: number; qty: number }[]>([]);
  const [open, setOpen] = useState(false); const [step, setStep] = useState<"cart" | "pay" | "done">("cart");
  const [form, setForm] = useState({ name: "", email: "", address: "" }); const [errs, setErrs] = useState<Record<string, string>>({});
  const cats = ["All", ...new Set(catalog.map((p) => p.cat))];
  const items = catalog.filter((p) => (cat === "All" || p.cat === cat) && (p.name + p.cat + p.note).toLowerCase().includes(q.toLowerCase()));
  const add = (id: number) => { setCart((c) => c.some((x) => x.id === id) ? c.map((x) => x.id === id ? { ...x, qty: x.qty + 1 } : x) : [...c, { id, qty: 1 }]); setOpen(true); };
  const setQty = (id: number, qty: number) => setCart((c) => qty <= 0 ? c.filter((x) => x.id !== id) : c.map((x) => x.id === id ? { ...x, qty } : x));
  const lines = cart.map((x) => ({ ...x, p: catalog.find((p) => p.id === x.id)! }));
  const total = lines.reduce((n, l) => n + l.p.price * l.qty, 0);
  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (form.name.trim().length < 2) err.name = "Enter your full name.";
    if (!emailOk(form.email)) err.email = "Enter a valid email address.";
    if (form.address.trim().length < 8) err.address = "Enter a complete delivery address.";
    setErrs(err);
    if (!Object.keys(err).length) { setStep("done"); setCart([]); }
  };
  return (
    <>
      <header className="d-hero"><h1>LuxeCart</h1><p>Private sale of Swiss timepieces — catalogue, cart and checkout, all running in this page.</p></header>
      <div className="d-toolbar">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the catalogue..." aria-label="Search products" />
        <div className="d-chips" role="group" aria-label="Filter by collection">
          {cats.map((c) => <button key={c} aria-pressed={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <Btn className="d-cart-toggle" onClick={() => { setOpen(true); setStep("cart"); }}>Cart ({lines.reduce((n, l) => n + l.qty, 0)})</Btn>
      </div>
      <p className="d-count" role="status">{items.length} piece{items.length === 1 ? "" : "s"}</p>
      {items.length === 0 ? <div className="d-empty"><p>No piece matches “{q}”.</p><Btn kind="ghost" onClick={() => { setQ(""); setCat("All"); }}>Clear filters</Btn></div> : (
        <ul className="d-products">{items.map((p) => (
          <li key={p.id}><div className="d-swatch" aria-hidden="true"><span>{p.ref}</span></div>
            <p className="d-cat">{p.cat}</p><h3>{p.name}</h3><p className="d-note">{p.note}</p>
            <div className="d-row"><strong>${p.price.toLocaleString()}</strong><Btn onClick={() => add(p.id)}>Add to cart</Btn></div></li>
        ))}</ul>
      )}
      <div className={`d-drawer ${open ? "open" : ""}`} aria-hidden={!open} role="dialog" aria-label="Shopping cart">
        <div className="d-drawer-head"><h2>{step === "cart" ? "Your bag" : step === "pay" ? "Checkout" : "Confirmed"}</h2><Btn kind="ghost" onClick={() => setOpen(false)} aria-label="Close cart">Close</Btn></div>
        {step === "cart" && (lines.length === 0 ? <p className="d-note">Your bag is empty.</p> : (
          <ul className="d-cart-list">{lines.map((l) => <li key={l.id}>
            <div><strong>{l.p.name}</strong><span>${l.p.price.toLocaleString()}</span></div>
            <div className="d-qty"><Btn kind="ghost" onClick={() => setQty(l.id, l.qty - 1)} aria-label={`Decrease ${l.p.name}`}>−</Btn><span>{l.qty}</span><Btn kind="ghost" onClick={() => setQty(l.id, l.qty + 1)} aria-label={`Increase ${l.p.name}`}>+</Btn></div>
          </li>)}</ul>
        ))}
        {step !== "done" && lines.length > 0 && <>
          <div className="d-total"><span>Total</span><strong>${total.toLocaleString()}</strong></div>
          {step === "cart" && <Btn onClick={() => { setStep("pay"); setErrs({}); }}>Proceed to checkout</Btn>}
        </>}
        {step === "pay" && <form onSubmit={pay} noValidate className="d-form">
          <Field id="lc-name" label="Full name" error={errs.name}><input id="lc-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></Field>
          <Field id="lc-email" label="Email" error={errs.email}><input id="lc-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></Field>
          <Field id="lc-addr" label="Delivery address" error={errs.address}><textarea id="lc-addr" rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
          <Btn type="submit">Place demo order</Btn>
          <Btn kind="ghost" type="button" onClick={() => setStep("cart")}>Back to bag</Btn>
          <p className="d-note">Demonstration only — no order is submitted anywhere.</p>
        </form>}
        {step === "done" && <div className="d-success"><p className="d-badge">Order placed</p><p>Demo order for {form.name} confirmed at {form.email}. Nothing was sent or charged.</p><Btn kind="ghost" onClick={() => { setOpen(false); setStep("cart"); setForm({ name: "", email: "", address: "" }); }}>Keep browsing</Btn></div>}
      </div>
      {open && <div className="d-scrim" onClick={() => setOpen(false)} />}
    </>
  );
}

/* ------------------------------------------------------- 2. Pulse SaaS */
const ranges: Record<string, number[]> = {
  "7d": [12, 19, 15, 26, 22, 31, 28], "30d": [8, 14, 11, 19, 17, 24, 21, 29, 26, 34], "90d": [5, 9, 8, 13, 12, 17, 16, 21, 19, 25, 23, 30],
};
function Pulse() {
  const [tab, setTab] = useState("Overview"); const [range, setRange] = useState<keyof typeof ranges>("30d");
  const [toggles, setToggles] = useState({ weekly: true, anomalies: true, digest: false });
  const data = ranges[range];
  const max = Math.max(...data);
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 560},${170 - (v / max) * 150}`).join(" ");
  const kpis = [["MRR", "$48,240", "+6.4%"], ["Active seats", "1,284", "+3.1%"], ["Churn", "1.9%", "−0.4%"], ["P95 latency", "182 ms", "−11 ms"]];
  return (
    <>
      <header className="d-hero"><h1>Pulse</h1><p>Subscription analytics — metrics, charts, navigation and settings in a single workspace.</p></header>
      <div className="d-dash">
        <nav className="d-dash-nav" aria-label="Dashboard sections">
          {["Overview", "Revenue", "Users", "Settings"].map((t) => <button key={t} aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)} className={tab === t ? "on" : ""}>{t}</button>)}
        </nav>
        <div className="d-dash-main">
          <div className="d-dash-top">
            <div className="d-chips" role="group" aria-label="Chart range">
              {(Object.keys(ranges) as (keyof typeof ranges)[]).map((r) => <button key={r} aria-pressed={range === r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r}</button>)}
            </div>
            <span className="d-note">Last updated just now</span>
          </div>
          <div className="d-kpis">{kpis.map(([k, v, d]) => <div key={k}><p>{k}</p><strong>{v}</strong><span>{d}</span></div>)}</div>
          {tab === "Overview" && <div className="d-card">
            <div className="d-card-head"><h2>Recurring revenue</h2><span className="d-note">range {range}</span></div>
            <svg viewBox="0 0 560 190" className="d-chart" role="img" aria-label={`Recurring revenue trend for ${range}, rising from ${data[0]} to ${data[data.length - 1]} thousand dollars`}>
              <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--accent)" stopOpacity=".35" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
              {[0, 1, 2, 3].map((i) => <line key={i} x1="0" y1={20 + i * 50} x2="560" y2={20 + i * 50} stroke="rgba(255,255,255,.08)" />)}
              <polyline points={`0,170 ${points} 560,170`} fill="url(#pg)" stroke="none" />
              <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
              {data.map((v, i) => <circle key={i} cx={(i / (data.length - 1)) * 560} cy={170 - (v / max) * 150} r="3.5" fill="#05070d" stroke="var(--accent)" strokeWidth="2" />)}
            </svg>
          </div>}
          {tab === "Revenue" && <div className="d-card"><div className="d-card-head"><h2>Revenue by plan</h2></div>
            <ul className="d-bars">{[["Enterprise", 82], ["Growth", 64], ["Starter", 41], ["Trial", 18]].map(([k, v]) => <li key={k as string}><span>{k}</span><i style={{ width: `${v}%` }} /><b>{v}%</b></li>)}</ul></div>}
          {tab === "Users" && <div className="d-card"><div className="d-card-head"><h2>Cohort retention</h2></div>
            <div className="d-heatmap" role="img" aria-label="Retention heatmap showing highest retention in week one and a gradual decline">{Array.from({ length: 40 }, (_, i) => <span key={i} style={{ opacity: Math.max(0.12, 1 - Math.floor(i / 8) * 0.2 - (i % 8) * 0.04) }} />)}</div></div>}
          {tab === "Settings" && <div className="d-card"><div className="d-card-head"><h2>Workspace settings</h2></div>
            <ul className="d-toggles">{([["weekly", "Weekly summary email"], ["anomalies", "Anomaly alerts"], ["digest", "Daily digest"]] as const).map(([k, l]) => <li key={k}><span>{l}</span><button role="switch" aria-checked={toggles[k]} onClick={() => setToggles({ ...toggles, [k]: !toggles[k] })} className={toggles[k] ? "on" : ""}><i /></button></li>)}</ul></div>}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------- 3. Ember Kitchen */
const menu = [
  { c: "Starters", n: "Charred Octopus", p: 14, d: "Smoked paprika, potato confit, lemon" },
  { c: "Starters", n: "Beetroot Tartare", p: 11, d: "Hazelnut, aged balsamic, rye crisp" },
  { c: "Mains", n: "48h Short Rib", p: 27, d: "Bone marrow butter, burnt onion" },
  { c: "Mains", n: "Wild Mushroom Risotto", p: 21, d: "Carnaroli, parmesan, truffle oil" },
  { c: "Mains", n: "Sea Bass", p: 26, d: "Fennel, saffron broth, samphire" },
  { c: "Desserts", n: "Salted Caramel Plate", p: 9, d: "Tonka bean, cocoa nib" },
  { c: "Desserts", n: "Citrus Panna Cotta", p: 8, d: "Bergamot, olive oil, pistachio" },
];
function EmberKitchen() {
  const [c, setC] = useState("All"); const [f, setF] = useState({ name: "", phone: "", date: "", time: "", guests: "2" });
  const [err, setErr] = useState<Record<string, string>>({}); const [ok, setOk] = useState("");
  const courses = ["All", ...new Set(menu.map((m) => m.c))];
  const items = menu.filter((m) => c === "All" || m.c === c);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (f.name.trim().length < 2) v.name = "Please enter your name.";
    if (!/^[0-9+\s-]{7,}$/.test(f.phone)) v.phone = "Enter a contact number.";
    if (!f.date) v.date = "Choose a date.";
    else if (new Date(f.date) < new Date(new Date().toDateString())) v.date = "Choose an upcoming date.";
    setErr(v);
    setOk(Object.keys(v).length ? "" : `Table for ${f.guests} on ${f.date} at ${f.time || "your preferred time"} — request recorded for this demo.`);
    if (!Object.keys(v).length) setF({ name: "", phone: "", date: "", time: "", guests: "2" });
  };
  return (
    <>
      <header className="d-hero"><h1>Ember Kitchen</h1><p>Open-fire cooking, Tuesday to Sunday. Reserve a table below — the form validates and confirms in this page.</p></header>
      <div className="d-split">
        <section>
          <div className="d-chips" role="group" aria-label="Filter menu by course">{courses.map((x) => <button key={x} aria-pressed={c === x} className={c === x ? "on" : ""} onClick={() => setC(x)}>{x}</button>)}</div>
          <ul className="d-menu">{items.map((m) => <li key={m.n}><div><h3>{m.n}</h3><p>{m.d}</p></div><span>${m.p}</span></li>)}</ul>
        </section>
        <section className="d-card" id="reserve">
          <h2>Reserve a table</h2>
          <form className="d-form" onSubmit={submit} noValidate>
            <Field id="ek-name" label="Name" error={err.name}><input id="ek-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>
            <Field id="ek-phone" label="Phone" error={err.phone}><input id="ek-phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} autoComplete="tel" /></Field>
            <div className="d-grid2">
              <Field id="ek-date" label="Date" error={err.date}><input id="ek-date" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
              <Field id="ek-time" label="Time"><select id="ek-time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })}><option value="">Any</option><option>18:00</option><option>19:00</option><option>20:30</option></select></Field>
            </div>
            <Field id="ek-guests" label="Guests"><select id="ek-guests" value={f.guests} onChange={(e) => setF({ ...f, guests: e.target.value })}>{[1, 2, 3, 4, 5, 6, 8].map((n) => <option key={n}>{n}</option>)}</select></Field>
            <Btn type="submit">Request reservation</Btn>
            {ok && <p className="d-success-inline" role="status">{ok}</p>}
          </form>
        </section>
      </div>
    </>
  );
}

/* ---------------------------------------------------- 4. Haven homes */
type Listing = { id: number; t: string; type: string; beds: number; price: number; city: string; area: number; note: string };
const homes: Listing[] = [
  { id: 1, t: "Terrace on Oak Street", type: "House", beds: 4, price: 745000, city: "Burewala", area: 285, note: "Corner plot, servant quarter, solar ready" },
  { id: 2, t: "Cedar Court Flat", type: "Apartment", beds: 2, price: 312000, city: "Lahore", area: 118, note: "South-facing balcony, gated parking" },
  { id: 3, t: "Riverline Duplex", type: "Apartment", beds: 3, price: 468000, city: "Multan", area: 176, note: "Canal view, deck, lift access" },
  { id: 4, t: "Orchard Farmhouse", type: "House", beds: 5, price: 980000, city: "Burewala", area: 640, note: "4 acre orchard, bore well, barn" },
  { id: 5, t: "Studio on MG Road", type: "Studio", beds: 1, price: 168000, city: "Faisalabad", area: 62, note: "Furnished, walk to transit" },
  { id: 6, t: "Maple Townhouse", type: "Townhouse", beds: 3, price: 395000, city: "Lahore", area: 154, note: "Community park, two parking bays" },
];
function Haven() {
  const [type, setType] = useState("All"); const [beds, setBeds] = useState(0); const [max, setMax] = useState(1000000);
  const [open, setOpen] = useState<number | null>(null); const [q, setQ] = useState({ name: "", email: "", msg: "" });
  const [err, setErr] = useState<Record<string, string>>({}); const [sent, setSent] = useState(false);
  const types = ["All", ...new Set(homes.map((h) => h.type))];
  const list = homes.filter((h) => (type === "All" || h.type === type) && h.beds >= beds && h.price <= max);
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (q.name.trim().length < 2) v.name = "Enter your name.";
    if (!emailOk(q.email)) v.email = "Enter a valid email.";
    if (q.msg.trim().length < 10) v.msg = "Tell the agent a little more (10+ characters).";
    setErr(v); setSent(!Object.keys(v).length);
  };
  return (
    <>
      <header className="d-hero"><h1>Haven</h1><p>Search verified listings, open a property for detail, then send an enquiry to the agent.</p></header>
      <div className="d-toolbar">
        <Field id="hv-type" label="Type"><select id="hv-type" value={type} onChange={(e) => setType(e.target.value)}>{types.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field id="hv-beds" label="Bedrooms"><select id="hv-beds" value={beds} onChange={(e) => setBeds(Number(e.target.value))}><option value={0}>Any</option>{[1, 2, 3, 4, 5].map((n) => <option key={n}>{n}+</option>)}</select></Field>
        <Field id="hv-max" label={`Up to $${max.toLocaleString()}`}><input id="hv-max" type="range" min={150000} max={1000000} step={10000} value={max} onChange={(e) => setMax(Number(e.target.value))} /></Field>
      </div>
      <p className="d-count" role="status">{list.length} propert{list.length === 1 ? "y" : "ies"}</p>
      {list.length === 0 ? <div className="d-empty"><p>No property matches those filters.</p><Btn kind="ghost" onClick={() => { setType("All"); setBeds(0); setMax(1000000); }}>Reset filters</Btn></div> : (
        <ul className="d-homes">{list.map((h) => (
          <li key={h.id} className={open === h.id ? "open" : ""}>
            <button className="d-home-head" onClick={() => setOpen(open === h.id ? null : h.id)} aria-expanded={open === h.id}>
              <div><p className="d-cat">{h.type} · {h.city}</p><h3>{h.t}</h3></div>
              <strong>${h.price.toLocaleString()}</strong>
            </button>
            {open === h.id && <div className="d-home-body">
              <ul><li>{h.beds} bedrooms</li><li>{h.area} sq yd</li><li>{h.note}</li></ul>
              <a href="#hv-enquire" className="d-link">Ask the agent about this property</a>
            </div>}
          </li>
        ))}</ul>
      )}
      <section className="d-card" id="hv-enquire">
        <h2>Agent enquiry</h2>
        <form className="d-form" onSubmit={send} noValidate>
          <Field id="hv-name" label="Your name" error={err.name}><input id="hv-name" value={q.name} onChange={(e) => setQ({ ...q, name: e.target.value })} autoComplete="name" /></Field>
          <Field id="hv-email" label="Email" error={err.email}><input id="hv-email" type="email" value={q.email} onChange={(e) => setQ({ ...q, email: e.target.value })} autoComplete="email" /></Field>
          <Field id="hv-msg" label="Message" error={err.msg}><textarea id="hv-msg" rows={4} value={q.msg} onChange={(e) => setQ({ ...q, msg: e.target.value })} /></Field>
          <Btn type="submit">{sent ? "Send enquiry" : "Send enquiry"}</Btn>
          {sent && <p className="d-success-inline" role="status">Enquiry captured for this demo — an agent would receive it at {q.email}.</p>}
        </form>
      </section>
    </>
  );
}

/* -------------------------------------------------- 5. Northline agency */
function Northline() {
  const [svc, setSvc] = useState(0);
  const [f, setF] = useState({ name: "", email: "", brief: "" }); const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const services = [
    ["Brand systems", "Identity, motion rules and design systems that survive real product work."],
    ["Product design", "End-to-end interface design: research, flows, prototypes and handoff."],
    ["Web engineering", "React, TypeScript and headless CMS builds with performance budgets."],
    ["Design ops", "Token pipelines, component libraries and documentation teams actually use."],
  ];
  const projects = [["Kettle & Co", "Speciality coffee — identity and packaging"], ["Route Eight", "Freight dashboard redesign"], ["Almanac", "Editorial platform for a research collective"]];
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v: Record<string, string> = {};
    if (f.name.trim().length < 2) v.name = "Enter your name.";
    if (!emailOk(f.email)) v.email = "Enter a valid work email.";
    if (f.brief.trim().length < 15) v.brief = "A short brief helps (15+ characters).";
    setErr(v); setDone(!Object.keys(v).length);
  };
  return (
    <>
      <header className="d-hero"><h1>Northline</h1><p>A small studio for brand systems, product design and web engineering.</p></header>
      <section className="d-card"><h2>Services</h2>
        <div className="d-acc">{services.map(([t, d], i) => (
          <div key={t} className={svc === i ? "open" : ""}>
            <button onClick={() => setSvc(svc === i ? -1 : i)} aria-expanded={svc === i}><span>{t}</span><Icon name={svc === i ? "close" : "chevron"} className="w-4 h-4" /></button>
            {svc === i && <p>{d}</p>}
          </div>
        ))}</div>
      </section>
      <section className="d-card"><h2>Selected work</h2><ul className="d-cases">{projects.map(([n, d]) => <li key={n}><strong>{n}</strong><span>{d}</span></li>)}</ul></section>
      <section className="d-card"><h2>The team</h2><ul className="d-team">{[["SA", "Shahan Ali", "Design engineering"], ["RA", "R. Ahmed", "Brand direction"], ["MK", "M. Khan", "Product design"]].map(([i, n, r]) => (
        <li key={n}><span aria-hidden="true">{i}</span><div><strong>{n}</strong><em>{r}</em></div></li>
      ))}</ul></section>
      <section className="d-card" id="nl-enquire"><h2>Start a project</h2>
        <form className="d-form" onSubmit={submit} noValidate>
          <Field id="nl-name" label="Name" error={err.name}><input id="nl-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>
          <Field id="nl-email" label="Work email" error={err.email}><input id="nl-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></Field>
          <Field id="nl-brief" label="Project brief" error={err.brief}><textarea id="nl-brief" rows={4} value={f.brief} onChange={(e) => setF({ ...f, brief: e.target.value })} /></Field>
          <Btn type="submit">Send brief</Btn>
          {done && <p className="d-success-inline" role="status">Brief received for this demonstration — nothing left your browser.</p>}
        </form>
      </section>
    </>
  );
}

/* ------------------------------------------------------- 6. Synth AI */
function SynthStudio() {
  const [prompt, setPrompt] = useState(""); const [model, setModel] = useState("Fast");
  const [tone, setTone] = useState("Neutral"); const [out, setOut] = useState(""); const [hist, setHist] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const generate = () => {
    const p = prompt.trim();
    if (p.length < 6) { setErr("Describe the task in at least 6 characters."); return; }
    setErr("");
    const subject = p.replace(/\s+/g, " ").slice(0, 90);
    const body = tone === "Formal"
      ? `Requested task: ${subject}. Proposed approach — clarify inputs, break the work into verifiable steps, and produce an auditable draft before refinement.`
      : tone === "Friendly"
        ? `Here's how I'd take on “${subject}”: start small, check it works, then polish. I'll flag anything unclear as we go.`
        : `Plan for “${subject}”: 1) confirm scope and constraints, 2) produce a first pass, 3) review results, 4) iterate.`;
    const res = `[${model} · sample output]\n${body}\n\nDemo mode: this response is generated locally from your prompt and settings; no data was sent to a server.`;
    setOut(res); setHist((h) => [p, ...h].slice(0, 5));
  };
  return (
    <>
      <header className="d-hero"><h1>Synth Studio</h1><p>An AI tool interface with prompt input, model and tone controls, and a deterministic sample generator.</p></header>
      <div className="d-ai">
        <section className="d-card">
          <Field id="sy-prompt" label={`Prompt · ${prompt.length}/500`} error={err}>
            <textarea id="sy-prompt" rows={5} maxLength={500} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Draft a release note for a WhatsApp bot update..." />
          </Field>
          <div className="d-grid2">
            <Field id="sy-model" label="Model"><select id="sy-model" value={model} onChange={(e) => setModel(e.target.value)}><option>Fast</option><option>Balanced</option><option>Precise</option></select></Field>
            <Field id="sy-tone" label="Tone"><select id="sy-tone" value={tone} onChange={(e) => setTone(e.target.value)}><option>Neutral</option><option>Formal</option><option>Friendly</option></select></Field>
          </div>
          <div className="d-row"><Btn onClick={generate}>Generate</Btn>{out && <Btn kind="ghost" onClick={() => { setOut(""); setPrompt(""); }}>Clear</Btn>}</div>
        </section>
        <section className="d-card d-ai-out" aria-live="polite">
          <h2>Output</h2>
          {out ? <pre className="d-pre">{out}</pre> : <p className="d-note">Generated text appears here. Nothing is sent anywhere.</p>}
          {hist.length > 0 && <div className="d-hist"><h3>Recent prompts</h3><ul>{hist.map((h, i) => <li key={i}><button onClick={() => setPrompt(h)}>{h}</button></li>)}</ul></div>}
        </section>
      </div>
    </>
  );
}

/* ----------------------------------------------------- 7. Forge docs */
const docs = [
  { id: "install", title: "Installation", body: "Install the CLI and initialise a project. Node 18 or newer is required.", code: "npm install @forge/cli\nforge init my-project\ncd my-project && forge dev" },
  { id: "auth", title: "Authentication", body: "Create a project token and export it before running deploy commands. Tokens are read from the environment, never from source files.", code: "export FORGE_TOKEN=pk_live_••••\nforge deploy --env production" },
  { id: "config", title: "Configuration", body: "The config file describes your build, output directory and environment values. Values are merged in order: defaults, environment, file.", code: "export default {\n  outDir: \"dist\",\n  env: { region: \"auto\" },\n  spa: true,\n};" },
  { id: "deploy", title: "Deployments", body: "Deploys are atomic: a new build uploads first, then traffic switches. Failed builds leave the previous release untouched.", code: "forge build\nforge deploy\nforge releases list" },
  { id: "rollback", title: "Rollbacks", body: "Roll back to any release in history. Rollbacks are instant and do not trigger a rebuild.", code: "forge rollback <release-id>" },
];
function ForgeDocs() {
  const [q, setQ] = useState(""); const [active, setActive] = useState(docs[0].id); const [copied, setCopied] = useState("");
  const found = useMemo(() => docs.filter((d) => (d.title + d.body + d.code).toLowerCase().includes(q.toLowerCase())), [q]);
  const current = docs.find((d) => d.id === active) || docs[0];
  const copy = async (id: string, code: string) => {
    try { await navigator.clipboard.writeText(code); setCopied(id); setTimeout(() => setCopied(""), 1500); } catch { setCopied(""); }
  };
  return (
    <>
      <header className="d-hero"><h1>Forge Docs</h1><p>Documentation layout with sidebar navigation, in-page search and copyable examples.</p></header>
      <div className="d-docs">
        <aside>
          <input type="search" value={q} onChange={(e) => { setQ(e.target.value); const f = docs.find((d) => (d.title + d.body).toLowerCase().includes(e.target.value.toLowerCase())); if (f) setActive(f.id); }} placeholder="Search docs..." aria-label="Search documentation" />
          <nav aria-label="Documentation sections">
            {found.length === 0 && <p className="d-note">No section matches “{q}”.</p>}
            {found.map((d) => <button key={d.id} onClick={() => setActive(d.id)} aria-current={active === d.id ? "page" : undefined} className={active === d.id ? "on" : ""}>{d.title}</button>)}
          </nav>
        </aside>
        <article>
          <p className="d-cat">Guide</p>
          <h2>{current.title}</h2>
          <p>{current.body}</p>
          <div className="d-code">
            <div className="d-code-head"><span>{current.id}.sh</span><button onClick={() => copy(current.id, current.code)}>{copied === current.id ? "Copied" : "Copy"}</button></div>
            <pre><code>{current.code}</code></pre>
          </div>
          <div className="d-docs-nav">
            <Btn kind="ghost" disabled={docs[0].id === current.id} onClick={() => { const i = docs.findIndex((d) => d.id === current.id); setActive(docs[Math.max(0, i - 1)].id); }}>Previous</Btn>
            <Btn kind="ghost" disabled={docs.at(-1)!.id === current.id} onClick={() => { const i = docs.findIndex((d) => d.id === current.id); setActive(docs[Math.min(docs.length - 1, i + 1)].id); }}>Next</Btn>
          </div>
        </article>
      </div>
    </>
  );
}

/* ----------------------------------------------------------- registry */
const registry: Record<string, (props: { slug: string }) => React.ReactNode> = {
  "luxecart-store": LuxeCart,
  "pulse-dashboard": Pulse,
  "ember-kitchen": EmberKitchen,
  "haven-properties": Haven,
  "northline-agency": Northline,
  "synth-ai-studio": SynthStudio,
  "forge-docs": ForgeDocs,
};

export default function Demos({ slug }: { slug: string }) {
  const d = getDemo(slug);
  useSeo({
    title: d ? `${d.name} — ${d.kind} demo by Shahan Ali (ProBoy)` : "Demo not found — PROBOY",
    description: d ? `${d.name} is an interactive ${d.category.toLowerCase()} demo by Shahan Ali (ProBoy). ${d.summary}` : "",
    path: `/demos/${slug}`, noindex: !d,
    jsonLd: d ? [{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: d.name, applicationCategory: d.category, description: d.summary, creator: { "@type": "Person", name: "Shahan Ali", alternateName: ["ProBoy", "ProBoy315"] } }] : [],
  });
  const Page = registry[slug];
  if (!d || !Page) return <NotFound />;
  return <DemoShell slug={slug}><Page slug={slug} /></DemoShell>;
}

export { demos };
