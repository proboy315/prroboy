import { useMemo, useRef, useState } from "react";
import ContactForm from "../components/ContactForm";
import Hero from "../components/Hero";
import Icon from "../components/Icon";
import { Img } from "../components/Layout";
import { demos, gallery, info, projects, services, site } from "../lib/data";
import { onLink } from "../lib/router";
import { personLd, useSeo, websiteLd } from "../lib/seo";

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
        eyebrow="About Shahan Ali"
        title={`Who is ${info.name} (${info.brand})?`}
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
          ["Also known as", info.aliases.join(", ")],
          ["Current education", info.education],
          ["Based in", info.location],
          ["Direct email", info.email],
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
          Read Full Profile &amp; Identity Disambiguation <Icon name="arrow" className="w-4 h-4" />
        </a>
        <a
          href={info.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm text-zinc-300 hover:text-white border border-white/10 hover:border-white/30 transition"
        >
          <Icon name="linkedin" className="w-4 h-4 text-red-400" /> LinkedIn Profile
        </a>
      </div>
    </Wrap>
  );
}

function ServicesAndSkillsSection() {
  return (
    <Wrap id="services" className="pt-32">
      <Heading
        eyebrow="Core Services"
        title="Full-stack web, WhatsApp bots, Shopify & Gemini AI"
        text="Focused engineering services delivered from Burewala, Pakistan for clients worldwide."
      />

      <ul className="grid sm:grid-cols-2 gap-6">
        {services.map((s) => (
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

      <div className="mt-8">
        <a
          href="/services"
          onClick={onLink}
          className="inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300"
        >
          Compare all services &amp; engagement process <Icon name="arrow" className="w-4 h-4" />
        </a>
      </div>

      <div id="skills" className="scroll-mt-28 mt-24">
        <h3 className="text-2xl sm:text-3xl font-bold reveal">Core Technologies &amp; Stack</h3>
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
          <p className="text-red-500 text-sm tracking-[0.3em] uppercase font-semibold">Projects</p>
          <h2 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight">Real software built &amp; shipped</h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            For example: the open-source ProBoy-MD bot, browser security tools, and lookup utilities — all built by Shahan Ali ({info.brand}).
          </p>
        </div>
        <a
          href="/projects"
          onClick={onLink}
          className="inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300"
        >
          Open full project index <Icon name="arrow" className="w-4 h-4" />
        </a>
      </div>

      {featured && (
        <article className="reveal glass overflow-hidden grid lg:grid-cols-2 mb-10">
          <Img
            src={featured.image}
            alt={`${featured.title} preview`}
            label={featured.title}
            className="w-full aspect-[16/10] lg:aspect-auto lg:h-full"
          />
          <div className="p-8 sm:p-10">
            <p className="text-red-500 text-xs tracking-[0.3em] uppercase">Flagship Project · {featured.category}</p>
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
                href="/proboy-md"
                onClick={onLink}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition"
              >
                Explore {featured.title} Commands <Icon name="arrow" className="w-4 h-4" />
              </a>
              <a
                href={`/projects/${featured.slug}`}
                onClick={onLink}
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm border border-white/20 hover:bg-white hover:text-black transition"
              >
                Project Overview
              </a>
            </div>
          </div>
        </article>
      )}

      <Filters cats={cats} value={cat} set={setCat} />

      <ul className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {list
          .filter((p) => p !== featured)
          .map((p) => (
            <li key={p.slug} className="reveal glass card3d overflow-hidden">
              <Img src={p.image} alt={`${p.title} preview`} label={p.title} className="w-full aspect-[16/9]" />
              <div className="p-6">
                <p className="text-xs text-red-400 uppercase tracking-wider">{p.category}</p>
                <h3 className="mt-2 text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{p.summary}</p>
                <a
                  href={`/projects/${p.slug}`}
                  onClick={onLink}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300"
                >
                  View {p.title} <Icon name="arrow" className="w-4 h-4" />
                </a>
              </div>
            </li>
          ))}
      </ul>
    </Wrap>
  );
}

function InteractiveDemosSection() {
  return (
    <Wrap id="demos" className="pt-32">
      <Heading
        eyebrow="Interactive Demos"
        title="Working browser UI demonstrations"
        text="Seven interactive interface demonstrations built by Shahan Ali (PROBOY) — featuring live filtering, carts, charts, validated forms, and documentation layouts. Sample data only; not client deployments."
      />
      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {demos.map((d) => (
          <li
            key={d.slug}
            className="reveal group rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: `linear-gradient(160deg, ${d.accent}22, rgba(255,255,255,.02))` }}
          >
            <a href={`/demos/${d.slug}`} onClick={onLink} className="block p-5 h-full hover:-translate-y-0.5 transition">
              <span
                className="inline-block text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
                style={{ color: d.accent, borderColor: `${d.accent}66` }}
              >
                {d.category}
              </span>
              <h3 className="mt-3 text-lg font-semibold group-hover:text-red-400 transition">{d.name}</h3>
              <p className="text-[13px] text-zinc-400 mt-1 leading-relaxed">{d.summary}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm text-red-400">
                Open demo <span aria-hidden="true">↗</span>
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
  return (
    <Wrap id="certificates" className="pt-32">
      <Heading eyebrow="Credential & Recognition" title={c.title} text={c.subtitle} />
      <div className="reveal grid lg:grid-cols-[1.1fr_.9fr] gap-8 items-start">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block text-left"
          aria-label="Open certificate image"
        >
          <img
            src={c.image}
            alt={`${c.subtitle}, awarded to ${c.awardedTo}`}
            width={1600}
            height={1131}
            loading="lazy"
            className="w-full rounded-2xl border border-white/10 bg-white/5"
          />
        </button>
        <div>
          <p className="text-zinc-300 leading-relaxed">{c.quote}</p>
          <p className="mt-3 text-sm text-zinc-500">
            Organisers: {c.organizers}. Certificate date: {c.date}.
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {c.facts.map(([k, v]) => (
              <div key={k} className="glass p-3">
                <dt className="text-zinc-500">{k}</dt>
                <dd className="mt-1">{v}</dd>
              </div>
            ))}
          </dl>
          <a
            href={c.image}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex text-sm text-red-400 hover:text-red-300"
          >
            View full-resolution certificate
          </a>
        </div>
      </div>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Certificate"
          className="fixed inset-0 z-[60] bg-black/90 grid place-items-center p-4"
          onClick={() => setOpen(false)}
        >
          <img
            src={c.image}
            alt={`${c.subtitle}, awarded to ${c.awardedTo}`}
            className="max-h-[90vh] max-w-full object-contain"
          />
          <button className="absolute top-5 right-5" aria-label="Close" onClick={() => setOpen(false)}>
            <Icon name="close" className="w-7 h-7" />
          </button>
        </div>
      )}
    </Wrap>
  );
}

function ReviewsSection() {
  return (
    <Wrap id="reviews" className="pt-32">
      <Heading
        eyebrow="Client Notes"
        title="Feedback from collaborations"
        text="Testimonials submitted directly to this portfolio."
      />
      <ul className="grid md:grid-cols-2 gap-5">
        {info.reviews.map((r) => (
          <li key={r.name} className="reveal glass p-6">
            <blockquote>
              <p className="text-zinc-200 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
            </blockquote>
            <p className="mt-4 font-semibold">{r.name}</p>
            <p className="text-sm text-zinc-500">{r.role}</p>
            <p className="mt-2 text-xs text-red-400">
              {r.project} · {r.date}
            </p>
          </li>
        ))}
      </ul>
    </Wrap>
  );
}

function FaqSection() {
  const [open, setOpen] = useState(0);
  const blockRef = useRef<HTMLDivElement>(null);
  return (
    <Wrap id="qa" className="pt-32">
      <Heading
        eyebrow="FAQ & Disambiguation"
        title="Frequently asked questions"
        text="Short answers about Shahan Ali (PROBOY), his services, ProBoy-MD, and identity disambiguation."
      />
      <div ref={blockRef} className="max-w-3xl divide-y divide-white/10 border-y border-white/10">
        {info.faq.map((f, i) => (
          <div key={f.q}>
            <h3>
              <button
                type="button"
                className="w-full text-left py-5 flex justify-between gap-6 font-medium"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                {f.q}
                <Icon name="chevron" className={`w-5 h-5 shrink-0 transition ${open === i ? "rotate-90" : "-rotate-90"}`} />
              </button>
            </h3>
            {open === i && <p className="pb-5 text-zinc-400 leading-relaxed">{f.a}</p>}
          </div>
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
        text="Submit your details below. If you prefer, you can also reach out via WhatsApp, email, or LinkedIn."
      />
      <div className="reveal grid lg:grid-cols-[1.35fr_0.85fr] gap-8 items-start">
        <div className="glass p-6 sm:p-8">
          <ContactForm compact />
        </div>

        <aside className="glass p-6 sm:p-7 space-y-4 text-sm">
          <h3 className="text-lg font-bold text-white">Direct Channels</h3>
          <p className="text-zinc-400 leading-relaxed">
            Available for full-stack web apps, custom WhatsApp bots, Shopify Online Store 2.0 builds, and Gemini AI
            integrations.
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
              <dt className="text-zinc-500">LinkedIn &amp; GitHub</dt>
              <dd className="mt-1 flex flex-wrap gap-3">
                <a href={info.linkedin} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
                  LinkedIn
                </a>
                <a href={info.github} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
                  GitHub
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
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "ProBoy-MD",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Node.js",
        description: projects[0]?.summary,
        author: { "@id": `${site}/#person` },
        codeRepository: "https://github.com/proboy315/ProBoy-MD",
        url: `${site}/proboy-md`,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: info.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
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
      <ReviewsSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
