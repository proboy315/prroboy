import { useEffect, useMemo, useRef, useState } from "react";
import ContactForm from "../components/ContactForm";
import Hero from "../components/Hero";
import Icon from "../components/Icon";
import { Img } from "../components/Layout";
import { demos, gallery, info, projects, services, site } from "../lib/data";
import { onLink } from "../lib/router";
import { botLd, faqLd, personLd, useSeo, websiteLd } from "../lib/seo";

const Wrap = ({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={`scroll-mt-28 page-container ${className}`}>
    {children}
  </section>
);

const Heading = ({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) => (
  <div className="reveal mb-12 max-w-2xl">
    <p className="text-red-500 text-sm tracking-[0.3em] uppercase font-semibold">{eyebrow}</p>
    <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">{title}</h2>
    {text && <p className="mt-4 text-zinc-400 leading-relaxed">{text}</p>}
  </div>
);

function AboutSection() {
  return (
    <Wrap id="about" className="pt-32">
      <Heading
        eyebrow="Positioning & Identity"
        title={`${info.name} (${info.brand}) — Full-Stack Developer`}
        text={info.about[0]}
      />
      <p className="reveal -mt-6 mb-10 max-w-3xl text-zinc-300 leading-relaxed">{info.about[1]}</p>

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
        {[
          ["Primary / Secondary Role", "Full-Stack Developer / Frontend Engineer"],
          ["Current Education", info.education],
          ["Based in", info.location],
          ["Verified GitHub", "github.com/ProBoy315"],
        ].map(([k, v]) => (
          <div key={k} className="glass p-4">
            <dt className="text-zinc-500">{k}</dt>
            <dd className="text-white mt-1 break-words">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap gap-4">
        <a
          href="/about"
          onClick={onLink}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-white/5 border border-white/15 hover:border-red-500 text-white transition"
        >
          Full Biography &amp; Verification <Icon name="arrow" className="w-4 h-4" />
        </a>
        <a
          href="/press"
          onClick={onLink}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium border border-white/15 hover:border-white/40 text-zinc-300 hover:text-white transition"
        >
          Press Kit &amp; Brand Facts
        </a>
      </div>
    </Wrap>
  );
}

function ServicesAndSkillsSection() {
  const primaryServices = services.filter((s) => s.tier !== "secondary");
  const frontendService = services.find((s) => s.slug === "frontend-development");

  return (
    <Wrap id="services" className="pt-32">
      <Heading
        eyebrow="Commercial Services"
        title="Four core engineering offers"
        text="Full-stack web applications, Shopify Liquid customization, modular WhatsApp bots, and server-side Gemini AI automation — plus specialized React & TypeScript frontend engineering."
      />

      <ul className="grid sm:grid-cols-2 gap-6">
        {primaryServices.map((s) => (
          <li key={s.slug} className="reveal glass card3d p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="w-12 h-12 rounded-xl bg-red-600/15 text-red-400 grid place-items-center">
                  <Icon name={s.icon} className="w-6 h-6" />
                </span>
                <span className="text-xs text-zinc-500">{s.technologies.slice(0, 3).join(" · ")}</span>
              </div>
              <h3 className="mt-5 text-2xl font-bold">
                <a href={`/services/${s.slug}`} onClick={onLink} className="hover:text-red-400 transition">
                  {s.title}
                </a>
              </h3>
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{s.tagline}</p>
              <ul className="mt-4 space-y-2 text-xs text-zinc-400">
                {s.deliverables.slice(0, 2).map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <a
                href={`/services/${s.slug}`}
                onClick={onLink}
                className="text-sm font-semibold text-red-400 hover:text-red-300 inline-flex items-center gap-1.5"
              >
                Explore {s.shortTitle} <Icon name="arrow" className="w-4 h-4" />
              </a>
              <a
                href={`/contact?service=${s.slug}`}
                onClick={onLink}
                className="text-xs px-3.5 py-1.5 rounded-full border border-white/15 hover:bg-white hover:text-black transition"
              >
                Inquire
              </a>
            </div>
          </li>
        ))}
      </ul>

      {frontendService && (
        <aside className="reveal mt-6 glass p-6 sm:p-7 flex flex-wrap items-center justify-between gap-5 border-white/15">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-red-400 font-semibold">Secondary Positioning</p>
            <h3 className="mt-1.5 text-xl sm:text-2xl font-bold text-white">{frontendService.title}</h3>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{frontendService.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`/services/${frontendService.slug}`}
              onClick={onLink}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-white/5 border border-white/20 hover:border-red-500 text-white transition"
            >
              View Frontend Proof <Icon name="arrow" className="w-4 h-4" />
            </a>
            <a
              href="/services"
              onClick={onLink}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-red-400 hover:text-red-300"
            >
              All Services &amp; Process →
            </a>
          </div>
        </aside>
      )}

      <div id="skills" className="scroll-mt-28 mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4 reveal">
          <h3 className="text-2xl sm:text-3xl font-bold">Core Technical Stack &amp; Expertise</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <a href="/blog/proboy-technical-seo-performance-audit" onClick={onLink} className="text-red-400 hover:text-red-300">
              SEO &amp; Performance Audit →
            </a>
            <a href="/blog/geo-llmo-ai-visibility-baseline" onClick={onLink} className="text-zinc-300 hover:text-white">
              GEO / AI Visibility Baseline →
            </a>
          </div>
        </div>
        <ul className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {info.skills.map((s) => (
            <li key={s.label} className="reveal glass card3d p-6 flex flex-col items-center text-center gap-4">
              <span className="w-14 h-14 grid place-items-center rounded-xl bg-red-600/10 text-red-400">
                <Icon name={s.icon} className="w-7 h-7" />
              </span>
              <span className="text-sm font-medium">{s.label}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {info.skillGroups.map((g) => (
            <li key={g.title} className="reveal glass p-5">
              <h4 className="font-semibold">{g.title}</h4>
              <ul className="mt-3 flex flex-wrap gap-2">
                {g.items.map((item) => (
                  <li
                    key={item}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </Wrap>
  );
}

function Filters({ cats, value, set }: { cats: string[]; value: string; set: (s: string) => void }) {
  if (cats.length < 3) return null;
  return (
    <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2 mb-8">
      {cats.map((c) => (
        <button
          key={c}
          onClick={() => set(c)}
          aria-pressed={value === c}
          className={`px-4 py-2 rounded-full text-sm border transition ${
            value === c ? "bg-red-600 border-red-600 text-white" : "border-white/15 text-zinc-300 hover:border-white/40"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function ProjectsSection() {
  const [cat, setCat] = useState("All");
  const cats = useMemo(() => ["All", ...new Set(projects.map((p) => p.category))], []);
  const list = projects.filter((p) => cat === "All" || p.category === cat);
  const featured = projects.find((p) => p.slug === "proboy-md");

  return (
    <Wrap id="projects" className="pt-32">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
        <div className="reveal max-w-2xl">
          <p className="text-red-500 text-sm tracking-[0.3em] uppercase font-semibold">Real Software Proof</p>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">Real projects you can inspect</h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Source-verifiable projects and browser utilities built by {info.name} ({info.brand}). Open any project for
            architecture, technical boundaries, and live or source links.
          </p>
        </div>
        <a
          href="/projects"
          onClick={onLink}
          className="inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300"
        >
          See all {projects.length} projects <Icon name="arrow" className="w-4 h-4" />
        </a>
      </div>

      {featured && (
        <article className="reveal glass overflow-hidden grid lg:grid-cols-2 mb-10">
          <Img
            src={featured.image}
            alt={`${featured.title} preview`}
            label={featured.title}
            width={1000}
            height={563}
            sizes="(max-width: 1024px) 94vw, 640px"
            className="w-full aspect-[16/9] lg:aspect-auto lg:h-full"
          />
          <div className="p-8 sm:p-10">
            <p className="text-red-500 text-xs tracking-[0.3em] uppercase">Flagship Open-Source Project · {featured.category}</p>
            <h3 className="mt-3 text-3xl font-bold">{featured.title}</h3>
            <p className="mt-4 text-zinc-300 leading-relaxed">{featured.summary}</p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-300">
              {featured.features.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <ul className="mt-6 flex flex-wrap gap-2">
              {featured.technologies.map((t) => (
                <li key={t} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/proboy-md#playground"
                onClick={onLink}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition"
              >
                Try {featured.title} Playground <Icon name="arrow" className="w-4 h-4" />
              </a>
              <a
                href={`/projects/${featured.slug}`}
                onClick={onLink}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm border border-white/20 hover:bg-white hover:text-black transition"
              >
                Project Case Study
              </a>
              <a
                href="/proboy-md/docs"
                onClick={onLink}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm border border-white/15 text-zinc-300 hover:text-white transition"
              >
                30-Chapter Docs
              </a>
            </div>
          </div>
        </article>
      )}

      <Filters cats={cats} value={cat} set={setCat} />

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {list
          .filter((p) => p !== featured)
          .map((p) => (
            <li key={p.slug} className="reveal glass card3d overflow-hidden flex flex-col justify-between">
              <div>
                <Img
                  src={p.image}
                  alt={`${p.title} preview`}
                  label={p.title}
                  width={1000}
                  height={563}
                  sizes="(max-width: 768px) 94vw, 420px"
                  className="w-full aspect-[16/9]"
                />
                <div className="p-6">
                  <p className="text-xs text-red-400 uppercase tracking-wider">{p.category}</p>
                  <h3 className="mt-2 text-xl font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{p.summary}</p>
                </div>
              </div>
              <div className="px-6 pb-6">
                <a
                  href={`/projects/${p.slug}`}
                  onClick={onLink}
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300"
                >
                  Inspect {p.title} <Icon name="arrow" className="w-4 h-4" />
                </a>
              </div>
            </li>
          ))}
      </ul>
    </Wrap>
  );
}

function InteractiveDemosSection() {
  const featuredDemos = demos.filter((d) => d.featured).slice(0, 8);
  return (
    <Wrap id="demos" className="pt-32">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
        <div className="reveal max-w-2xl">
          <p className="text-red-500 text-sm tracking-[0.3em] uppercase font-semibold">Interactive Demos (Sample Data)</p>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">
            {demos.length} browser UI demonstrations
          </h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Test search, filters, carts, 360° product viewers, charts, Kanban boards (SprintBoard), and SaaS analytics
            (Pulse). Every demo runs on clearly labeled fictional sample data — not client production deployments.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="/demos"
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition"
          >
            Explore All {demos.length} Demos <Icon name="arrow" className="w-4 h-4" />
          </a>
          <a
            href="/demos/control-room"
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm border border-white/20 hover:bg-white hover:text-black transition"
          >
            Demo Control Room
          </a>
        </div>
      </div>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {featuredDemos.map((d) => (
          <li
            key={d.slug}
            className="reveal group rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: `linear-gradient(160deg, ${d.accent}22, rgba(255,255,255,.02))` }}
          >
            <a href={`/demos/${d.slug}`} onClick={onLink} className="block p-5 h-full hover:-translate-y-0.5 transition">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="inline-block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
                  style={{ color: d.accent, borderColor: `${d.accent}66` }}
                >
                  {d.category}
                </span>
                {d.has360Viewer && (
                  <span className="text-[10px] uppercase tracking-wider text-zinc-300">360° Viewer</span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-semibold group-hover:text-red-400 transition">{d.name}</h3>
              <p className="text-[13px] text-zinc-400 mt-1 leading-relaxed">{d.summary}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm text-red-400">
                Launch sample demo <span aria-hidden="true">↗</span>
                <span className="sr-only"> {d.name}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}

function CertificateSection() {
  const c = info.certificate;
  const [open, setOpen] = useState(false);
  const [imageMissing, setImageMissing] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);
  return (
    <Wrap id="certificates" className="pt-32">
      <Heading eyebrow="Verified Recognition" title={c.title} text={c.subtitle} />
      <div className="reveal grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-start">
        <button
          type="button"
          onClick={() => { if (!imageMissing) setOpen(true); }}
          className="block text-left w-full"
          aria-label="Open full certificate preview"
        >
          {!imageMissing && (
            <picture className="block w-full">
              <source
                type="image/avif"
                srcSet="/images/quizoff-certificate-640.avif 640w, /images/quizoff-certificate-1000.avif 1000w"
                sizes="(max-width: 1023px) 94vw, 720px"
              />
              <source
                type="image/webp"
                srcSet="/images/quizoff-certificate-640.webp 640w, /images/quizoff-certificate-1000.webp 1000w"
                sizes="(max-width: 1023px) 94vw, 720px"
              />
              <img
                src={c.previewImage || c.image}
                srcSet="/images/quizoff-certificate-640.jpg 640w, /images/quizoff-certificate-1000.jpg 1000w"
                sizes="(max-width: 1023px) 94vw, 720px"
                alt={`${c.subtitle}, awarded to ${c.awardedTo}`}
                width={2000}
                height={1414}
                loading="lazy"
                decoding="async"
                onError={() => setImageMissing(true)}
                className="w-full h-auto rounded-2xl border border-white/10 bg-white/5"
              />
            </picture>
          )}
          {imageMissing && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-zinc-400">
              <p className="text-white">Certificate image preview unavailable.</p>
              <p className="mt-2">
                {c.title} — {c.subtitle}. Awarded to {c.awardedTo}, organised by {c.organizers}, dated {c.date}.
              </p>
            </div>
          )}
        </button>
        <div>
          <p className="text-zinc-300 leading-relaxed">{c.quote}</p>
          <p className="mt-3 text-sm text-zinc-500">
            Organisers: {c.organizers}. Certificate date: {c.date}. (Participation recognition — not an endorsement or employment by Google.)
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {c.facts.map(([k, v]) => (
              <div key={k} className="glass p-3">
                <dt className="text-zinc-500">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
          {!imageMissing && (
            <a
              href={c.image}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex text-sm text-red-400 hover:text-red-300"
            >
              View original full-resolution certificate (PNG) →
            </a>
          )}
        </div>
      </div>
      {open && !imageMissing && (
        <dialog
          ref={dialog}
          aria-label="Certificate"
          className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-black/90 open:grid place-items-center p-4 text-white"
          onClose={() => setOpen(false)}
          onClick={(event) => { if (event.currentTarget === event.target) event.currentTarget.close(); }}
        >
          <img
            src={c.image}
            alt={`${c.subtitle}, awarded to ${c.awardedTo}`}
            width={2000}
            height={1414}
            className="max-h-[90vh] max-w-full object-contain"
          />
          <button className="absolute top-5 right-5" autoFocus aria-label="Close certificate" onClick={() => dialog.current?.close()}>
            <Icon name="close" className="w-7 h-7" />
          </button>
        </dialog>
      )}
    </Wrap>
  );
}

function FaqSection() {
  // AEO Requirement: All important answers must be rendered visibly in initial SSR HTML
  // rather than gated behind JavaScript click state.
  return (
    <Wrap id="qa" className="pt-32">
      <Heading
        eyebrow="AEO · Direct Answers & Disambiguation"
        title="Frequently asked questions"
        text="Clear, source-backed answers about Shahan Ali (PROBOY), services, ProBoy-MD, and identity disambiguation."
      />
      <div className="grid md:grid-cols-2 gap-5">
        {info.faq.map((f) => (
          <article key={f.q} className="reveal glass p-6 sm:p-7">
            <h3 className="text-lg font-semibold text-white leading-snug">{f.q}</h3>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{f.a}</p>
          </article>
        ))}
      </div>
    </Wrap>
  );
}

function ContactSection() {
  return (
    <Wrap id="contact" className="pt-32">
      <Heading
        eyebrow="Contact"
        title="Start a project or send an inquiry"
        text="Choose the inquiry method you prefer: API relay form, email without phone, or direct WhatsApp chat."
      />
      <div className="reveal grid lg:grid-cols-[1.35fr_0.85fr] gap-8 items-start">
        <div className="glass p-6 sm:p-8">
          <ContactForm compact />
        </div>

        <aside className="glass p-6 sm:p-7 space-y-4 text-sm">
          <h3 className="text-lg font-bold text-white">Direct Channels</h3>
          <p className="text-zinc-400 leading-relaxed">
            Available for Full-Stack React &amp; Node.js apps, Frontend engineering, Shopify Liquid stores, Baileys WhatsApp bots, and Gemini AI automation.
          </p>
          <dl className="space-y-3 pt-2">
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="mt-0.5">
                <a className="text-white hover:text-red-400 break-all" href={`mailto:${info.email}`}>
                  {info.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Phone / WhatsApp</dt>
              <dd className="mt-0.5">
                <a className="text-white hover:text-red-400" href={info.whatsapp} target="_blank" rel="noopener noreferrer">
                  {info.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Location</dt>
              <dd className="mt-0.5 text-zinc-200">{info.location}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Verification &amp; Links</dt>
              <dd className="mt-1 flex flex-wrap gap-3">
                <a href={info.github} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
                  GitHub
                </a>
                <a href="/mentions" onClick={onLink} className="text-zinc-300 hover:text-white">
                  Mentions
                </a>
                <a href="/contact" onClick={onLink} className="text-zinc-300 hover:text-white">
                  Full Contact Page →
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </Wrap>
  );
}

export default function Home() {
  useSeo({
    title: info.seo.title,
    description: info.seo.description,
    path: "/",
    ogType: "profile",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: info.seo.title,
        url: `${site}/`,
        mainEntity: { "@id": `${site}/#person` },
      },
      personLd(),
      websiteLd(),
      botLd(),
      faqLd(info.faq),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Real Projects by Shahan Ali (PROBOY)",
        itemListElement: projects.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          description: p.summary,
          url: `${site}/projects/${p.slug}`,
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "ImageObject",
        name: info.certificate.title,
        description: gallery[0]?.alt,
        contentUrl: site ? new URL(info.certificate.image, site + "/").href : info.certificate.image,
        creator: { "@id": `${site}/#person` },
      },
    ],
  });

  return (
    <>
      <Hero />
      <AboutSection />
      <ServicesAndSkillsSection />
      <ProjectsSection />
      <InteractiveDemosSection />
      <CertificateSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
