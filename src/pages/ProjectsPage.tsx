import { useMemo, useState } from "react";
import Icon from "../components/Icon";
import { Img } from "../components/Layout";
import { demos, info, projects, site } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, personLd, useSeo } from "../lib/seo";

export default function ProjectsPage() {
  const [cat, setCat] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(projects.map((p) => p.category))], []);
  const filtered = projects.filter((p) => cat === "All" || p.category === cat);
  const trail: [string, string][] = [
    ["Home", "/"],
    ["Projects", "/projects"],
  ];

  useSeo({
    title: `Projects by ${info.name} (${info.brand}) — Bots, Web Apps & Security Tools`,
    description: `Production software projects and interactive demos built by ${info.name} (${info.brand}), including ProBoy-MD, ProBoy CamLink, ProBoy JS Obfuscator, ProBoy Encrypt & Decrypt, and ProBoy-SiM_Database.`,
    path: "/projects",
    jsonLd: [
      breadcrumbLd(trail),
      personLd(),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: `Projects by ${info.name} (${info.brand})`,
        url: `${site}/projects`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: projects.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.title,
            description: p.summary,
            url: `${site}/projects/${p.slug}`,
          })),
        },
      },
    ],
  });

  return (
    <article className="max-w-[1160px] mx-auto px-5 lg:px-10 pt-32 lg:pt-40 pb-12">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 mb-8">
        <ol className="flex flex-wrap gap-2">
          {trail.map(([name, path], i) => (
            <li key={path} className="flex gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i < trail.length - 1 ? (
                <a href={path} onClick={onLink} className="hover:text-red-400">
                  {name}
                </a>
              ) : (
                <span aria-current="page" className="text-zinc-300">
                  {name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="max-w-3xl">
        <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-semibold">Portfolio &amp; Engineering</p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight">
          Real projects built by {info.name}
        </h1>
        <p className="mt-5 text-lg text-zinc-300 leading-relaxed">
          Each project below represents a real build created by {info.name} ({info.brand}) — spanning multi-device
          WhatsApp bot engineering, browser security utilities, diagnostic tools, and database portals.
        </p>
      </header>

      {/* Category Filter */}
      {categories.length > 2 && (
        <div role="group" aria-label="Filter projects by category" className="mt-10 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                cat === c ? "bg-red-600 border-red-600 text-white" : "border-white/15 text-zinc-300 hover:border-white/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Real Projects Grid */}
      <ul className="mt-8 grid md:grid-cols-2 gap-6">
        {filtered.map((p) => (
          <li key={p.slug} className="glass card3d overflow-hidden flex flex-col">
            <Img src={p.image} alt={`${p.title} preview`} label={p.title} className="w-full aspect-[16/9]" />
            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-red-400 font-semibold uppercase tracking-wider">{p.category}</span>
                  {p.year && <span className="text-zinc-500">{p.year}</span>}
                </div>
                <h2 className="mt-2 text-2xl font-bold">
                  <a href={`/projects/${p.slug}`} onClick={onLink} className="hover:text-red-400 transition">
                    {p.title}
                  </a>
                </h2>
                <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{p.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {p.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 text-sm">
                <a
                  href={`/projects/${p.slug}`}
                  onClick={onLink}
                  className="inline-flex items-center gap-1.5 font-semibold text-red-400 hover:text-red-300"
                >
                  Project details <Icon name="arrow" className="w-4 h-4" />
                </a>
                {p.docs && (
                  <a href={p.docs} onClick={onLink} className="text-zinc-300 hover:text-white">
                    Command docs
                  </a>
                )}
                {p.repo && (
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white"
                  >
                    <Icon name="github" className="w-4 h-4" /> GitHub
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Interactive Browser Demos (Preserved from Demos area) */}
      <section id="demos" aria-labelledby="demos-heading" className="mt-20 pt-14 border-t border-white/10">
        <div className="max-w-3xl">
          <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-semibold">Interactive Demos</p>
          <h2 id="demos-heading" className="mt-2 text-3xl font-bold">
            Working browser interface demonstrations
          </h2>
          <p className="mt-3 text-zinc-400 leading-relaxed">
            Seven self-contained interactive UI demonstrations built by {info.name} ({info.brand}) — featuring live
            search, carts, charts, validated forms, and documentation layouts. Sample data only; not client
            deployments.
          </p>
        </div>

        <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {demos.map((d) => (
            <li
              key={d.slug}
              className="group rounded-2xl border border-white/10 overflow-hidden"
              style={{ background: `linear-gradient(160deg, ${d.accent}20, rgba(255,255,255,.02))` }}
            >
              <a href={`/demos/${d.slug}`} onClick={onLink} className="block p-5 h-full hover:-translate-y-0.5 transition">
                <span
                  className="inline-block text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
                  style={{ color: d.accent, borderColor: `${d.accent}66` }}
                >
                  {d.category}
                </span>
                <h3 className="mt-3 text-lg font-semibold group-hover:text-red-400 transition">{d.name}</h3>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{d.summary}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
                  Launch interactive demo <Icon name="arrow" className="w-3.5 h-3.5" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
