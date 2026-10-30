import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "../components/Icon";
import { Img } from "../components/Layout";
import Hero from "../components/Hero";
import { info, projects, showcase, gallery } from "../lib/data";
import { onLink } from "../lib/router";
import { useSeo, personLd } from "../lib/seo";

const Wrap = ({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={`scroll-mt-28 page-container ${className}`}>{children}</section>
);
const Heading = ({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) => (
  <div className="reveal mb-12 max-w-2xl">
    <p className="text-red-500 text-sm tracking-[0.3em] uppercase font-semibold">{eyebrow}</p>
    <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">{title}</h2>
    {text && <p className="mt-4 text-zinc-400 leading-relaxed">{text}</p>}
  </div>
);

function About() {
  return (
    <Wrap id="about" className="pt-32">
      <Heading eyebrow="About Me" title={`Who is ${info.name}?`} text={info.about[0]} />
      <div className="grid md:grid-cols-3 gap-4">
        {info.chapters.map((c) => (
          <article key={c.n} className="reveal glass p-6">
            <p className="text-red-500 text-xs tracking-[0.25em]">CHAPTER {c.n}</p>
            <h3 className="mt-3 text-xl font-semibold">{c.title}</h3>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">{c.text}</p>
          </article>
        ))}
      </div>
      <dl className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        {[["Also known as", info.aliases.join(", ")], ["Education", info.education], ["Based in", info.location], ["Email", info.email]].map(([k, v]) => (
          <div key={k} className="glass p-4"><dt className="text-zinc-500">{k}</dt><dd className="text-white mt-1 break-words">{v}</dd></div>
        ))}
      </dl>
    </Wrap>
  );
}

function Skills() {
  return (
    <Wrap id="skills" className="pt-32">
      <Heading eyebrow="Skills & Technologies" title="The stack I build with" />
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {info.skills.map((s) => (
          <li key={s.label} className="reveal glass card3d p-6 flex flex-col items-center text-center gap-4">
            <span className="w-14 h-14 grid place-items-center rounded-xl bg-red-600/10 text-red-400"><Icon name={s.icon} className="w-7 h-7" /></span>
            <span className="text-sm font-medium">{s.label}</span>
          </li>
        ))}
      </ul>
      <h3 className="mt-16 text-2xl font-bold reveal">Skill areas</h3>
      <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {info.skillGroups.map((g) => (
          <li key={g.title} className="reveal glass p-5">
            <h4 className="font-semibold">{g.title}</h4>
            <ul className="mt-3 flex flex-wrap gap-2">{g.items.map((item) => <li key={item} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300">{item}</li>)}</ul>
          </li>
        ))}
      </ul>
      <h3 id="services" className="scroll-mt-28 mt-24 text-2xl font-bold reveal">Services</h3>
      <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {info.services.map((s) => (
          <li key={s.title} className="reveal glass card3d p-7 flex flex-col">
            <Icon name={s.icon} className="w-8 h-8 text-red-500" />
            <h4 className="mt-5 text-lg font-semibold">{s.title}</h4>
            <p className="text-xs text-zinc-500 mt-1">{s.meta}</p>
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed flex-1">{s.text}</p>
            <a href="/#contact" onClick={onLink} className="mt-5 text-sm text-red-400 inline-flex items-center gap-2">{s.cta} <Icon name="arrow" className="w-4 h-4" /></a>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}

function Filters({ cats, value, set }: { cats: string[]; value: string; set: (s: string) => void }) {
  if (cats.length < 3) return null;
  return (
    <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2 mb-8">
      {cats.map((c) => <button key={c} onClick={() => set(c)} aria-pressed={value === c} className={`px-4 py-2 rounded-full text-sm border transition ${value === c ? "bg-red-600 border-red-600" : "border-white/15 text-zinc-300 hover:border-white/40"}`}>{c}</button>)}
    </div>
  );
}

function Projects() {
  const [cat, setCat] = useState("All");
  const cats = useMemo(() => ["All", ...new Set(projects.map((p) => p.category))], []);
  const list = projects.filter((p) => cat === "All" || p.category === cat);
  const featured = projects.find((p) => p.slug === "proboy-md");
  return (
    <Wrap id="projects" className="pt-32">
      <Heading eyebrow="Projects" title="Real work, built and shipped" text="Production projects created by Shahan Ali. Each links to its own detail page." />
      {featured && (
        <article className="reveal glass overflow-hidden grid lg:grid-cols-2 mb-10">
          <Img src={featured.image} alt={`${featured.title} preview`} label={featured.title} className="w-full aspect-[16/10] lg:aspect-auto lg:h-full" />
          <div className="p-8 sm:p-10">
            <p className="text-red-500 text-xs tracking-[0.3em] uppercase">Featured · {featured.category}</p>
            <h3 className="mt-3 text-3xl font-bold">{featured.title}</h3>
            <p className="mt-4 text-zinc-300 leading-relaxed">{featured.summary}</p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-300">{featured.features.map((f) => <li key={f} className="flex gap-3"><span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{f}</li>)}</ul>
            <ul className="mt-6 flex flex-wrap gap-2">{featured.technologies.map((t) => <li key={t} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">{t}</li>)}</ul>
            <a href="/proboy-md" onClick={onLink} className="mt-8 inline-flex items-center gap-2 text-red-400 hover:text-red-300">Open the {featured.title} documentation <Icon name="arrow" className="w-4 h-4" /></a>
          </div>
        </article>
      )}
      <Filters cats={cats} value={cat} set={setCat} />
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.filter((p) => p !== featured).map((p) => (
          <li key={p.slug} className="reveal glass card3d overflow-hidden">
            <Img src={p.image} alt={`${p.title} preview`} label={p.title} className="w-full aspect-[16/10]" />
            <div className="p-6"><p className="text-xs text-red-400">{p.category}</p><h3 className="mt-2 text-xl font-semibold">{p.title}</h3><p className="mt-2 text-sm text-zinc-400">{p.summary}</p>
              <a href={`/projects/${p.slug}`} onClick={onLink} className="mt-4 inline-flex items-center gap-2 text-sm text-red-400">View {p.title} <Icon name="arrow" className="w-4 h-4" /></a></div>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}

function ShowcaseSection() {
  const [cat, setCat] = useState("All");
  const cats = useMemo(() => ["All", ...new Set(showcase.map((s) => s.category))], []);
  return (
    <Wrap id="showcase" className="pt-32">
      <Heading eyebrow="Showcase" title="Concept demo websites" text="Design and development concepts — not client work. Each concept explores its own visual identity." />
      <Filters cats={cats} value={cat} set={setCat} />
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {showcase.filter((s) => cat === "All" || s.category === cat).map((s) => (
          <li key={s.slug} className="reveal glass card3d overflow-hidden group">
            <a href={`/showcase/${s.slug}`} onClick={onLink} className="block">
              <div className="overflow-hidden"><Img src={s.thumbnail} alt={`${s.title} concept thumbnail`} label={s.title} className="w-full aspect-[4/3] group-hover:scale-[1.04] transition duration-500" /></div>
              <div className="p-5">
                <p className="text-xs text-red-400">{s.category}{s.industry ? ` · ${s.industry}` : ""}</p>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3><p className="mt-1 text-sm text-zinc-400">{s.description}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}

function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const touch = useRef(0);
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((open + 1) % gallery.length);
      if (e.key === "ArrowLeft") setOpen((open - 1 + gallery.length) % gallery.length);
    };
    addEventListener("keydown", k); document.body.style.overflow = "hidden";
    return () => { removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);
  return (
    <Wrap id="gallery" className="pt-32">
      <Heading eyebrow="Gallery" title="Moments & visuals" />
      {gallery.length === 0 ? (
        <p className="reveal glass p-8 text-zinc-400 text-center">The gallery is being curated. New images will appear here soon.</p>
      ) : (
        <ul className="columns-2 md:columns-3 gap-4 [&>li]:mb-4">
          {gallery.map((g, i) => (
            <li key={g.src} className="break-inside-avoid reveal">
              <button onClick={() => setOpen(i)} className="block w-full overflow-hidden rounded-xl border border-white/10 group" aria-label={`Open image: ${g.alt}`}>
                <img src={g.src} alt={g.alt} width={g.width} height={g.height} loading="lazy" className="w-full h-auto group-hover:scale-[1.03] transition duration-500" />
              </button>
              {g.caption && <p className="text-xs text-zinc-500 mt-2">{g.caption}</p>}
            </li>
          ))}
        </ul>
      )}
      {open !== null && gallery[open] && (
        <div role="dialog" aria-modal="true" aria-label="Image viewer" className="fixed inset-0 z-[60] bg-black/95 grid place-items-center p-4"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => { const d = e.changedTouches[0].clientX - touch.current; if (Math.abs(d) > 50) setOpen((open + (d < 0 ? 1 : -1) + gallery.length) % gallery.length); }}>
          <img src={gallery[open].src} alt={gallery[open].alt} className="max-h-[85vh] max-w-full object-contain rounded-lg" />
          <button autoFocus onClick={() => setOpen(null)} aria-label="Close viewer" className="absolute top-5 right-5 p-2"><Icon name="close" className="w-7 h-7" /></button>
          <button onClick={() => setOpen((open - 1 + gallery.length) % gallery.length)} aria-label="Previous image" className="absolute left-3 top-1/2 p-3"><Icon name="left" className="w-7 h-7" /></button>
          <button onClick={() => setOpen((open + 1) % gallery.length)} aria-label="Next image" className="absolute right-3 top-1/2 p-3"><Icon name="right" className="w-7 h-7" /></button>
        </div>
      )}
    </Wrap>
  );
}

function Certificate() {
  const c = info.certificate;
  const [open, setOpen] = useState(false);
  return (
    <Wrap id="certificates" className="pt-32">
      <Heading eyebrow="Certificate" title={c.title} text={c.subtitle} />
      <div className="reveal grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-start">
        <button type="button" onClick={() => setOpen(true)} className="block text-left" aria-label="Open certificate image">
          <img src={c.image} alt={c.subtitle + ", awarded to " + c.awardedTo} className="w-full rounded-2xl border border-white/10 bg-white/5" />
        </button>
        <div>
          <p className="text-zinc-300 leading-relaxed">{c.quote}</p>
          <p className="mt-3 text-sm text-zinc-500">Organisers: {c.organizers}. Date on the certificate: {c.date}.</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {c.facts.map(([k, v]) => <div key={k} className="glass p-3"><dt className="text-zinc-500">{k}</dt><dd className="mt-1">{v}</dd></div>)}
          </dl>
          <a href={c.image} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex text-sm text-red-400">Open certificate image</a>
        </div>
      </div>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Certificate" className="fixed inset-0 z-[60] bg-black/90 grid place-items-center p-4" onClick={() => setOpen(false)}>
          <img src={c.image} alt={c.subtitle + ", awarded to " + c.awardedTo} className="max-h-[90vh] max-w-full object-contain" />
          <button className="absolute top-5 right-5" aria-label="Close" onClick={() => setOpen(false)}><Icon name="close" className="w-7 h-7" /></button>
        </div>
      )}
    </Wrap>
  );
}

function Reviews() {
  return (
    <Wrap id="reviews" className="pt-32">
      <Heading eyebrow="Reviews" title="What clients wrote" text="Four testimonials published on this portfolio. They are quoted as submitted and have not been independently audited." />
      <ul className="grid md:grid-cols-2 gap-5">
        {info.reviews.map((r) => (
          <li key={r.name} className="reveal glass p-6">
            <blockquote><p className="text-zinc-200 leading-relaxed">"{r.text}"</p></blockquote>
            <p className="mt-4 font-semibold">{r.name}</p>
            <p className="text-sm text-zinc-500">{r.role}</p>
            <p className="mt-2 text-xs text-red-400">{r.project} · {r.date}</p>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <Wrap id="qa" className="pt-32">
      <Heading eyebrow="FAQ" title="Straight answers" />
      <div className="max-w-3xl divide-y divide-white/10 border-y border-white/10">
        {info.faq.map((f, i) => (
          <div key={f.q}>
            <h3>
              <button className="w-full text-left py-5 flex justify-between gap-6 font-medium" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                {f.q}<Icon name="chevron" className={`w-5 h-5 shrink-0 transition ${open === i ? "rotate-90" : "-rotate-90"}`} />
              </button>
            </h3>
            {open === i && <p className="pb-5 text-zinc-400 leading-relaxed">{f.a}</p>}
          </div>
        ))}
      </div>
    </Wrap>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  const [blocked, setBlocked] = useState("");
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();
    const text = `Hello Shahan Ali!\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;
    const url = `${info.whatsapp}?text=${encodeURIComponent(text)}`;
    try {
      const prev = JSON.parse(localStorage.getItem("shahan_messages") || "[]");
      localStorage.setItem("shahan_messages", JSON.stringify([...prev, { name, email, message, at: new Date().toISOString() }]));
    } catch { /* storage unavailable */ }
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) setBlocked(url);
    setSent(true);
    e.currentTarget.reset();
  };
  const field = "w-full mt-1 rounded-lg bg-black/40 border border-white/15 px-3 py-2.5 outline-none focus:border-red-500";
  return (
    <Wrap id="contact" className="pt-32">
      <Heading eyebrow="Contact" title="Send a message" text="The form opens WhatsApp with your message. Nothing is sent to a server." />
      <form onSubmit={submit} className="reveal max-w-xl space-y-4">
        <label className="block text-sm text-zinc-400">Name<input required name="name" autoComplete="name" className={field} /></label>
        <label className="block text-sm text-zinc-400">Email<input required type="email" name="email" autoComplete="email" className={field} /></label>
        <label className="block text-sm text-zinc-400">Message<textarea required name="message" rows={6} minLength={10} className={field} /></label>
        <button className="rounded-lg px-6 py-3 bg-red-600 hover:bg-red-500">Send via WhatsApp</button>
        {sent && <p role="status" className="text-sm text-zinc-300">WhatsApp should have opened with your message.{blocked && <> Popup blocked — <a className="text-red-400" href={blocked}>open the message</a>.</>}</p>}
      </form>
      <p className="mt-8 text-sm text-zinc-400 flex flex-wrap gap-x-4 gap-y-1">
        <a className="hover:text-white" href={`mailto:${info.email}`}>{info.email}</a>
        <a className="hover:text-white" href={info.whatsapp}>{info.phone}</a>
        <span>{info.location}</span>
        <a className="hover:text-white" href={info.whatsappChannel}>WhatsApp channel</a>
      </p>
    </Wrap>
  );
}

export default function Home() {
  useSeo({
    title: info.seo.title, description: info.seo.description, path: "/",
    jsonLd: [
      personLd(),
      { "@context": "https://schema.org", "@type": "WebSite", name: `${info.name} — ${info.brand}`, url: info.siteUrl, publisher: { "@id": `${info.siteUrl}/#person` } },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: info.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@context": "https://schema.org", "@type": "ItemList", name: "Projects by Shahan Ali", itemListElement: projects.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.title, description: p.summary, url: `${info.siteUrl}/projects/${p.slug}` })) },
      { "@context": "https://schema.org", "@type": "ItemList", name: "Showcase demos by Shahan Ali", itemListElement: showcase.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title, description: s.description, url: `${info.siteUrl}/showcase/${s.slug}` })) },
      { "@context": "https://schema.org", "@type": "ImageObject", name: info.certificate.title, description: gallery[0]?.alt, contentUrl: info.certificate.image, creator: { "@type": "Person", name: info.name } },
    ],
  });
  return (<><Hero /><About /><Certificate /><Skills /><Projects /><ShowcaseSection /><Reviews /><Gallery /><Faq /><Contact /></>);
}
