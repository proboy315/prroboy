import Icon from "../components/Icon";
import { getService, info, projects, services, site } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, personLd, useSeo } from "../lib/seo";
import { NotFound } from "./Detail";

export function ServicesHub() {
  const trail: [string, string][] = [
    ["Home", "/"],
    ["Services", "/services"],
  ];

  useSeo({
    title: `Development Services | Shahan Ali (PROBOY)`,
    description: `Explore Shahan Ali's web development, WhatsApp bot, Shopify and AI services. See what each service includes and how to get in touch.`,
    path: "/services",
    jsonLd: [
      breadcrumbLd(trail),
      personLd(),
      ...services.map((svc) => ({
        "@context": "https://schema.org",
        "@type": "Service",
        name: svc.title,
        serviceType: svc.title,
        description: svc.summary,
        url: `${site}/services/${svc.slug}`,
        provider: { "@id": `${site}/#person` },
        areaServed: "Worldwide",
      })),
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
        <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-semibold">Services &amp; Capabilities</p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight">
          Engineering services built for real production needs
        </h1>
        <p className="mt-5 text-lg text-zinc-300 leading-relaxed">
          {info.name} ({info.brand}) works with founders, businesses, and online brands across four focused technical
          areas: full-stack web engineering, Node.js WhatsApp bot automation, Shopify Online Store 2.0 storefronts, and
          Google Gemini AI integrations.
        </p>
      </header>

      <section aria-label="Core service areas" className="mt-12 grid md:grid-cols-2 gap-6">
        {services.map((svc) => (
          <article key={svc.slug} className="glass card3d p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <span className="w-12 h-12 rounded-xl bg-red-600/15 text-red-400 grid place-items-center">
                  <Icon name={svc.icon} className="w-6 h-6" />
                </span>
                <span className="text-xs text-zinc-500">{svc.technologies.slice(0, 3).join(" · ")}</span>
              </div>
              <h2 className="mt-5 text-2xl font-bold">
                <a href={`/services/${svc.slug}`} onClick={onLink} className="hover:text-red-400 transition">
                  {svc.title}
                </a>
              </h2>
              <p className="mt-3 text-zinc-300 leading-relaxed">{svc.tagline}</p>
              <ul className="mt-5 space-y-2 text-sm text-zinc-400">
                {svc.deliverables.slice(0, 3).map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-7 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <a
                href={`/services/${svc.slug}`}
                onClick={onLink}
                className="inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300"
              >
                Service details <Icon name="arrow" className="w-4 h-4" />
              </a>
              <a
                href={`/contact?service=${svc.slug}`}
                onClick={onLink}
                className="text-xs px-4 py-2 rounded-full border border-white/20 hover:bg-white hover:text-black transition"
              >
                Request quote
              </a>
            </div>
          </article>
        ))}
      </section>

      <section aria-labelledby="engagement-heading" className="mt-16 glass p-7 sm:p-9">
        <p className="text-red-500 text-xs tracking-[0.28em] uppercase font-semibold">Engagement Workflow</p>
        <h2 id="engagement-heading" className="mt-2 text-2xl sm:text-3xl font-bold">
          How a project moves from brief to deployment
        </h2>
        <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-sm">
          {[
            ["01 · Scope & Requirements", "Define target features, APIs, data models, and hosting environment clearly before writing code."],
            ["02 · Modular Build", "Develop clean, well-structured components or bot handlers with regular progress updates."],
            ["03 · Verification & QA", "Test forms, responsive breakpoints, error handling, edge cases, and real API responses."],
            ["04 · Deployment & Handoff", "Deploy to Vercel, Render, or Shopify with clear documentation so you own and understand your system."],
          ].map(([stepTitle, stepDesc]) => (
            <li key={stepTitle} className="rounded-xl bg-white/[0.02] border border-white/10 p-5">
              <h3 className="font-semibold text-white">{stepTitle}</h3>
              <p className="mt-2 text-zinc-400 leading-relaxed">{stepDesc}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/contact"
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition"
          >
            Discuss your project <Icon name="arrow" className="w-4 h-4" />
          </a>
          <a
            href="/projects"
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium border border-white/25 hover:bg-white hover:text-black transition"
          >
            Inspect past work
          </a>
        </div>
      </section>
    </article>
  );
}

export function ServiceDetailPage({ slug }: { slug: string }) {
  const svc = getService(slug);
  const trail: [string, string][] = [
    ["Home", "/"],
    ["Services", "/services"],
    [svc?.title || "Service", `/services/${slug}`],
  ];

  useSeo({
    title: svc ? `${svc.title} — ${info.name} (${info.brand})` : `Service Not Found — ${info.brand}`,
    description: svc?.summary || "Requested service page could not be found.",
    path: `/services/${slug}`,
    noindex: !svc,
    jsonLd: svc
      ? [
          breadcrumbLd(trail),
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: svc.title,
            serviceType: svc.title,
            description: svc.summary,
            url: `${site}/services/${svc.slug}`,
            provider: { "@id": `${site}/#person` },
            areaServed: "Worldwide",
          },
        ]
      : [],
  });

  if (!svc) return <NotFound />;

  const related = projects.filter((p) => svc.relatedProjectSlugs.includes(p.slug));

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
        <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-semibold">Service · {info.brand}</p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight">{svc.title}</h1>
        <p className="mt-5 text-xl text-zinc-300 leading-relaxed">{svc.tagline}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`/contact?service=${svc.slug}`}
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition"
          >
            Inquire about {svc.shortTitle} <Icon name="arrow" className="w-4 h-4" />
          </a>
          <a
            href="/services"
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium border border-white/25 hover:bg-white hover:text-black transition"
          >
            All Services
          </a>
        </div>
      </header>

      <div className="mt-12 grid lg:grid-cols-[1.5fr_0.9fr] gap-8 items-start">
        <div className="space-y-8">
          <section className="glass p-7 sm:p-8 space-y-4">
            <h2 className="text-2xl font-bold">Overview</h2>
            {svc.overview.map((para) => (
              <p key={para} className="text-zinc-300 leading-relaxed">
                {para}
              </p>
            ))}
          </section>

          <section className="glass p-7 sm:p-8">
            <h2 className="text-2xl font-bold">What is Included</h2>
            <ul className="mt-4 space-y-3 text-zinc-300">
              {svc.deliverables.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {related.length > 0 && (
            <section className="glass p-7 sm:p-8">
              <h2 className="text-xl font-bold">Related Real Work</h2>
              <ul className="mt-4 space-y-3">
                {related.map((p) => (
                  <li key={p.slug} className="rounded-xl border border-white/10 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{p.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1">{p.summary}</p>
                    </div>
                    <a
                      href={p.docs || `/projects/${p.slug}`}
                      onClick={onLink}
                      className="text-sm text-red-400 hover:text-red-300 font-medium shrink-0"
                    >
                      Inspect →
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="glass p-6 sm:p-7">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500">Core Technologies</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {svc.technologies.map((tech) => (
                <li
                  key={tech}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-200"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass p-6 sm:p-7">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500">Best Fit</h2>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{svc.idealFor}</p>
            <a
              href={`/contact?service=${svc.slug}`}
              onClick={onLink}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300"
            >
              Start a project inquiry <Icon name="arrow" className="w-4 h-4" />
            </a>
          </div>
        </aside>
      </div>
    </article>
  );
}
