import Icon from "../components/Icon";
import { Img } from "../components/Layout";
import { info, projects, site } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, useSeo } from "../lib/seo";

function Shell({ trail, children }: { trail: [string, string][]; children: React.ReactNode }) {
  return (
    <article className="max-w-[1100px] mx-auto px-5 lg:px-10 pt-32 lg:pt-40 pb-12">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 mb-8">
        <ol className="flex flex-wrap gap-2">
          {trail.map(([n, p], i) => (
            <li key={p} className="flex gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i < trail.length - 1 ? (
                <a href={p} onClick={onLink} className="hover:text-red-400">
                  {n}
                </a>
              ) : (
                <span aria-current="page" className="text-zinc-300">
                  {n}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      {children}
    </article>
  );
}

export function ProjectPage({ slug }: { slug: string }) {
  const p = projects.find((x) => x.slug === slug);
  const trail: [string, string][] = [
    ["Home", "/"],
    ["Projects", "/projects"],
    [p?.title || "Project", `/projects/${slug}`],
  ];

  useSeo({
    title: p ? `${p.title} | Shahan Ali (PROBOY)` : `Project not found — ${info.brand}`,
    description: p?.summary || "The requested project page could not be found.",
    path: `/projects/${slug}`,
    noindex: !p,
    jsonLd: p
      ? [
          breadcrumbLd(trail),
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: p.title,
            applicationCategory: p.category,
            description: p.summary,
            url: `${site}/projects/${p.slug}`,
            author: {
              "@id": site ? `${site}/#person` : undefined,
              "@type": "Person",
              name: info.name,
              alternateName: info.aliases,
            },
            ...(p.repo ? { codeRepository: p.repo } : {}),
          },
        ]
      : [],
  });

  if (!p) return <NotFound />;

  return (
    <Shell trail={trail}>
      <p className="text-red-500 text-sm tracking-[0.3em] uppercase">{p.category}</p>
      <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold">{p.title}</h1>
      <p className="mt-5 text-xl text-zinc-300 max-w-3xl leading-relaxed">{p.summary}</p>
      <p className="mt-3 text-sm text-zinc-400">
        Role: Creator &amp; Lead Developer ({p.creator} / {info.brand}){p.year && ` · ${p.year}`}
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {p.repo && (
          <a
            href={p.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-red-600 hover:bg-red-500 font-medium transition"
          >
            <Icon name="github" /> Source on GitHub
          </a>
        )}
        {p.docs && (
          <a
            href={p.docs}
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 border border-white/30 hover:bg-white hover:text-black font-medium transition"
          >
            Command Directory &amp; Docs
          </a>
        )}
        {p.demo && (
          <a
            href={p.demo}
            target={p.demo.startsWith("http") ? "_blank" : undefined}
            rel={p.demo.startsWith("http") ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 border border-white/30 hover:bg-white hover:text-black font-medium transition"
          >
            Open Live Tool <Icon name="external" className="w-4 h-4" />
          </a>
        )}
      </div>

      <Img
        src={p.image}
        alt={`${p.title} preview`}
        label={p.title}
        className="mt-12 w-full aspect-[16/9] rounded-2xl border border-white/10"
      />

      <div className="mt-12 grid lg:grid-cols-[2fr_1fr] gap-12">
        <section>
          <h2 className="text-2xl font-bold">Purpose &amp; Overview</h2>
          {p.description.map((d) => (
            <p key={d} className="mt-4 text-zinc-300 leading-relaxed">
              {d}
            </p>
          ))}

          {p.features.length > 0 && (
            <>
              <h2 className="mt-10 text-2xl font-bold">Key Capabilities</h2>
              <ul className="mt-4 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3 text-zinc-300">
                    <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm text-zinc-400">
            <h3 className="font-semibold text-zinc-200">Scope &amp; Operational Notes</h3>
            <p className="mt-1.5 leading-relaxed">
              {p.repo
                ? "Source code is publicly available on GitHub. Features that rely on third-party APIs or external services depend on valid user-supplied configuration and upstream service availability."
                : "Hosted as an interactive web utility on this domain. Use responsibly and in compliance with applicable platform terms and privacy laws."}
            </p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass p-6">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500">Technologies</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {p.technologies.map((t) => (
                <li key={t} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-200">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass p-6 text-sm">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500">Navigation</h2>
            <div className="mt-4 flex flex-col gap-2.5">
              <a href="/projects" onClick={onLink} className="text-red-400 hover:text-red-300">
                ← All Projects
              </a>
              <a href="/contact" onClick={onLink} className="text-zinc-300 hover:text-white">
                Request a similar build →
              </a>
            </div>
          </div>
        </aside>
      </div>

      {p.screenshots.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold">Screenshots</h2>
          <ul className="mt-6 grid sm:grid-cols-2 gap-4">
            {p.screenshots.map((s, i) => (
              <li key={s}>
                <Img
                  src={s}
                  alt={`${p.title} screenshot ${i + 1}`}
                  className="w-full aspect-video rounded-xl border border-white/10"
                />
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  );
}

export function NotFound({ path }: { path?: string }) {
  const currentPath = path || (typeof window !== "undefined" ? window.location.pathname : "/404");
  useSeo({
    title: `404 — Page Not Found | ${info.brand}`,
    description: "The requested page does not exist on Shahan Ali (PROBOY) Portfolio.",
    path: currentPath,
    noindex: true,
  });

  return (
    <section className="min-h-[70vh] grid place-items-center text-center px-5 pt-32 pb-16">
      <div className="max-w-lg">
        <p className="text-[clamp(5.5rem,18vw,10rem)] font-black leading-none bg-gradient-to-b from-red-500 to-red-900 bg-clip-text text-transparent">
          404
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold mt-2">Page Not Found</h1>
        <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
          The URL you requested does not match an active page on {info.name} ({info.brand}). Explore the main sections
          below:
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="/"
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-red-600 hover:bg-red-500 text-sm font-semibold transition"
          >
            Back to Home
          </a>
          <a
            href="/projects"
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 border border-white/25 hover:bg-white hover:text-black text-sm font-medium transition"
          >
            View Projects
          </a>
          <a
            href="/contact"
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 border border-white/25 hover:bg-white hover:text-black text-sm font-medium transition"
          >
            Contact
          </a>
        </div>
      </div>
    </section>
  );
}
