import Icon from "../components/Icon";
import { Img } from "../components/Layout";
import { info, projects, showcase, site } from "../lib/data";
import { onLink } from "../lib/router";
import { useSeo } from "../lib/seo";

const crumbs = (items: [string, string][]) => ({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, ...(site ? { item: site + path } : {}) })),
});

function Shell({ trail, children }: { trail: [string, string][]; children: React.ReactNode }) {
  return (
    <article className="max-w-[1100px] mx-auto px-5 lg:px-10 pt-32 lg:pt-40">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 mb-8">
        <ol className="flex flex-wrap gap-2">{trail.map(([n, p], i) => <li key={p} className="flex gap-2">{i > 0 && <span aria-hidden="true">/</span>}{i < trail.length - 1 ? <a href={p} onClick={onLink} className="hover:text-red-400">{n}</a> : <span aria-current="page" className="text-zinc-300">{n}</span>}</li>)}</ol>
      </nav>
      {children}
    </article>
  );
}

export function ProjectPage({ slug }: { slug: string }) {
  const p = projects.find((x) => x.slug === slug);
  const trail: [string, string][] = [["Home", "/"], ["Projects", "/#projects"], [p?.title || "", `/projects/${slug}`]];
  useSeo({
    title: p ? `${p.title} by ${info.name} (${info.brand}) — ${p.category}` : "Project not found", description: p?.summary || "", path: `/projects/${slug}`, noindex: !p,
    jsonLd: p ? [crumbs(trail), { "@context": "https://schema.org", "@type": "SoftwareApplication", name: p.title, applicationCategory: p.category, description: p.summary, author: { "@type": "Person", name: info.name, alternateName: [info.handle, info.brand] }, ...(p.repo ? { codeRepository: p.repo } : {}) }] : [],
  });
  if (!p) return <NotFound />;
  return (
    <Shell trail={trail}>
      <p className="text-red-500 text-sm tracking-[0.3em] uppercase">{p.category}</p>
      <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold">{p.title}</h1>
      <p className="mt-5 text-xl text-zinc-300 max-w-3xl">{p.summary}</p>
      <p className="mt-3 text-sm text-zinc-500">Created by {p.creator}{p.year && ` · ${p.year}`}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {p.repo && <a href={p.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-red-600 hover:bg-red-500"><Icon name="github" /> Source on GitHub</a>}
        {p.docs && <a href={p.docs} onClick={onLink} className="inline-flex items-center gap-2 rounded-full px-6 py-3 border border-white/30 hover:bg-white hover:text-black">Documentation</a>}
        {p.demo && <a href={p.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3 border border-white/30 hover:bg-white hover:text-black">Open link <Icon name="external" className="w-4 h-4" /></a>}
      </div>
      <Img src={p.image} alt={`${p.title} preview`} label={p.title} className="mt-12 w-full aspect-[16/9] rounded-2xl border border-white/10" />
      <div className="mt-12 grid lg:grid-cols-[2fr_1fr] gap-12">
        <section><h2 className="text-2xl font-bold">What is {p.title}?</h2>{p.description.map((d) => <p key={d} className="mt-4 text-zinc-300 leading-relaxed">{d}</p>)}
          {p.features.length > 0 && <><h2 className="mt-10 text-2xl font-bold">Key capabilities</h2><ul className="mt-4 space-y-3">{p.features.map((f) => <li key={f} className="flex gap-3 text-zinc-300"><span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{f}</li>)}</ul></>}
        </section>
        <aside className="glass p-6 h-fit"><h2 className="text-sm uppercase tracking-widest text-zinc-500">Technologies</h2><ul className="mt-4 flex flex-wrap gap-2">{p.technologies.map((t) => <li key={t} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">{t}</li>)}</ul></aside>
      </div>
      {p.screenshots.length > 0 && <section className="mt-12"><h2 className="text-2xl font-bold">Screenshots</h2><ul className="mt-6 grid sm:grid-cols-2 gap-4">{p.screenshots.map((s, i) => <li key={s}><Img src={s} alt={`${p.title} screenshot ${i + 1}`} className="w-full aspect-video rounded-xl border border-white/10" /></li>)}</ul></section>}
    </Shell>
  );
}

export function ShowcasePage({ slug }: { slug: string }) {
  const s = showcase.find((x) => x.slug === slug);
  const trail: [string, string][] = [["Home", "/"], ["Showcase", "/#showcase"], [s?.title || "", `/showcase/${slug}`]];
  useSeo({ title: s ? `${s.title} — ${s.category} concept by ${info.name}` : "Not found", description: s?.description || "", path: `/showcase/${slug}`, noindex: !s,
    jsonLd: s ? [crumbs(trail), { "@context": "https://schema.org", "@type": "CreativeWork", name: s.title, genre: s.category, description: s.description, creator: { "@type": "Person", name: info.name } }] : [] });
  if (!s) return <NotFound />;
  return (
    <Shell trail={trail}>
      <p className="text-red-500 text-sm tracking-[0.3em] uppercase">{s.category} · Concept demo</p>
      <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold">{s.title}</h1>
      <p className="mt-5 text-xl text-zinc-300 max-w-3xl">{s.longDescription || s.description}</p>
      {s.features.length > 0 && <ul className="mt-6 space-y-2 text-zinc-300">{s.features.map((f) => <li key={f} className="flex gap-3"><span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />{f}</li>)}</ul>}
      <p className="mt-3 text-sm text-zinc-500">A design concept by {info.name} ({info.brand}). Not a client project.</p>
      {s.preview ? <a href={s.preview} className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 bg-red-600 hover:bg-red-500">Open live demo <Icon name="external" className="w-4 h-4" /></a>
        : <p className="mt-8 inline-block glass px-5 py-3 text-sm text-zinc-400">This demo is currently in development.</p>}
      <Img src={s.thumbnail} alt={`${s.title} concept preview`} label={s.title} className="mt-12 w-full aspect-[16/9] rounded-2xl border border-white/10" />
    </Shell>
  );
}

export function NotFound() {
  useSeo({ title: `Page not found — ${info.brand}`, description: "This page does not exist.", path: location.pathname, noindex: true });
  return (
    <section className="min-h-[70vh] grid place-items-center text-center px-5 pt-32">
      <div><p className="text-[clamp(6rem,20vw,12rem)] font-black leading-none bg-gradient-to-b from-red-500 to-red-900 bg-clip-text text-transparent">404</p>
        <h1 className="text-2xl font-bold mt-2">This page took a wrong turn.</h1>
        <a href="/" onClick={onLink} className="mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 bg-red-600 hover:bg-red-500">Back to home</a></div>
    </section>
  );
}
