import { useEffect } from "react";
import Icon from "../components/Icon";
import ServiceProofBlock from "../components/ServiceProofs";
import { serviceEvidence } from "../data/serviceEvidence";
import { sendEvent } from "../lib/collector";
import { getService, info, projects, services } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, faqLd, personLd, serviceLd, useSeo } from "../lib/seo";
import { NotFound } from "./Detail";

export function ServicesHub() {
  const trail: [string, string][] = [
    ["Home", "/"],
    ["Services", "/services"],
  ];

  const primaryServices = services.filter((s) => s.tier !== "secondary");
  const secondaryService = services.find((s) => s.tier === "secondary");

  useSeo({
    title: `Development Services | Shahan Ali (PROBOY)`,
    description: `Full-Stack React & Node.js development, Frontend engineering, Shopify Liquid stores, Baileys WhatsApp bots, and Gemini AI automation by Shahan Ali.`,
    path: "/services",
    jsonLd: [
      breadcrumbLd(trail),
      personLd(),
      ...services.map(serviceLd),
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
          Full-Stack, Frontend, Shopify, Bots &amp; AI Services
        </h1>
        <p className="mt-5 text-lg text-zinc-300 leading-relaxed">
          {info.name} ({info.brand}) works from Burewala, Punjab, Pakistan across four primary commercial services —
          React &amp; Node.js Full-Stack Development, Shopify Liquid, WhatsApp Bots, and Gemini AI Automation — backed
          by dedicated Frontend UI Engineering.
        </p>
      </header>

      <section aria-label="Primary commercial services" className="mt-12 grid md:grid-cols-2 gap-6">
        {primaryServices.map((svc) => (
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
                Deliverables &amp; Proof <Icon name="arrow" className="w-4 h-4" />
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

      {secondaryService && (
        <section aria-label="Secondary positioning service" className="mt-8 glass p-7 sm:p-8 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-red-500 text-xs tracking-[0.25em] uppercase font-semibold">
              Secondary Positioning · Dedicated UI Offer
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold">{secondaryService.title}</h2>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{secondaryService.summary}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`/services/${secondaryService.slug}`}
              onClick={onLink}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition"
            >
              Inspect Frontend Proof <Icon name="arrow" className="w-4 h-4" />
            </a>
            <a
              href="/demos/pulse-dashboard"
              onClick={onLink}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm border border-white/20 hover:border-white/50 text-zinc-200 transition"
            >
              Pulse Demo
            </a>
          </div>
        </section>
      )}

      {/* Technical Auditing & Diagnostic Process (Category 24) */}
      <section aria-labelledby="audit-process-heading" className="mt-12 glass p-7 sm:p-9">
        <p className="text-red-500 text-xs tracking-[0.28em] uppercase font-semibold">
          Technical Auditing &amp; Maintenance
        </p>
        <h2 id="audit-process-heading" className="mt-2 text-2xl sm:text-3xl font-bold">
          Diagnostic workflow: Issue → Evidence → Impact → Fix → Retest
        </h2>
        <p className="mt-3 text-sm text-zinc-300 max-w-3xl leading-relaxed">
          Every website audit, bug diagnosis, or performance cleanup follows a verifiable five-stage loop rather than
          guesswork. See how this exact process was executed on{" "}
          <a href="/blog/proboy-technical-seo-performance-audit" onClick={onLink} className="text-red-400 underline">
            this portfolio&apos;s SEO &amp; performance audit
          </a>
          .
        </p>
        <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {[
            ["1. Issue", "Reproduce the bug, 404 resource, bundle bloat, or crawl gap directly."],
            ["2. Evidence", "Capture HTTP status, byte size, build chunk output, or stack trace."],
            ["3. Impact", "Clarify what breaks for users, Core Web Vitals, or search indexing."],
            ["4. Fix", "Apply minimal, clean source changes without breaking unrelated paths."],
            ["5. Retest", "Re-run build, link crawler, and browser checks to verify resolution."],
          ].map(([stepTitle, stepDesc]) => (
            <li key={stepTitle} className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
              <h3 className="font-semibold text-white text-sm">{stepTitle}</h3>
              <p className="mt-1.5 text-zinc-400 leading-relaxed">{stepDesc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="engagement-heading" className="mt-12 glass p-7 sm:p-9">
        <p className="text-red-500 text-xs tracking-[0.28em] uppercase font-semibold">Engagement Workflow</p>
        <h2 id="engagement-heading" className="mt-2 text-2xl sm:text-3xl font-bold">
          How a project moves from brief to deployment
        </h2>
        <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 text-sm">
          {[
            ["01 · Scope & Requirements", "Define features, database schema, API contracts, and hosting target clearly before writing code."],
            ["02 · Modular Build", "Develop clean, typed TypeScript components or Node.js modules with regular source updates."],
            ["03 · Verification & QA", "Test forms, loading/empty/error states, responsive viewports, metadata, and real HTTP responses."],
            ["04 · Deployment & Handoff", "Deploy to Vercel, Netlify, Render, or Shopify with .env.example and clear documentation."],
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
            Inspect real projects
          </a>
          <a
            href="/press"
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium border border-white/25 hover:bg-white hover:text-black transition"
          >
            Press kit &amp; verified facts
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

  useEffect(() => {
    if (svc) void sendEvent("service_view", `/services/${svc.slug}`);
  }, [svc?.slug]);

  useSeo({
    title: svc ? `${svc.title} | Shahan Ali (PROBOY)` : `Service Not Found — ${info.brand}`,
    description: svc?.summary || "Requested service page could not be found.",
    path: `/services/${slug}`,
    noindex: !svc,
    jsonLd: svc
      ? [
          breadcrumbLd(trail),
          serviceLd(svc),
          ...(svc.faqs?.length ? [faqLd(svc.faqs)] : []),
        ]
      : [],
  });

  if (!svc) return <NotFound />;

  const related = projects.filter((p) => svc.relatedProjectSlugs.includes(p.slug));
  const evidence = serviceEvidence[svc.slug];

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
        <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-semibold">
          {svc.tier === "secondary" ? "Secondary Service · Frontend Positioning" : "Commercial Service"} · {info.brand}
        </p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight">{svc.title}</h1>
        <p className="mt-5 text-xl text-zinc-200 leading-relaxed">{svc.summary}</p>
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

      <div className="mt-12 grid lg:grid-cols-[1.55fr_0.85fr] gap-8 items-start">
        <div className="min-w-0 space-y-8">
          {evidence && (
            <section className="border-y border-white/15 py-6" aria-labelledby="service-evidence-title">
              <h2 id="service-evidence-title" className="text-xl font-bold">See the work</h2>
              <p className="mt-2 text-zinc-300 leading-relaxed">{evidence.note}</p>
              <a href={evidence.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300" data-service-proof>
                {evidence.title} <Icon name="arrow" className="w-4 h-4" />
              </a>
            </section>
          )}
          <section className="glass p-7 sm:p-8 space-y-4">
            <h2 className="text-2xl font-bold">Problem Solved &amp; Technical Approach</h2>
            {svc.overview.map((para) => (
              <p key={para} className="text-zinc-300 leading-relaxed">
                {para}
              </p>
            ))}
          </section>

          <div className="grid sm:grid-cols-2 gap-6">
            <section className="glass p-6 sm:p-7">
              <h2 className="text-xl font-bold">What is Included</h2>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                {svc.deliverables.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {svc.outOfScope && svc.outOfScope.length > 0 && (
              <section className="glass p-6 sm:p-7">
                <h2 className="text-xl font-bold">Outside Service Scope</h2>
                <ul className="mt-4 space-y-3 text-sm text-zinc-400">
                  {svc.outOfScope.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <ServiceProofBlock slug={svc.slug} />

          {related.length > 0 && (
            <section className="glass p-7 sm:p-8">
              <h2 className="text-xl font-bold">Related Project Proof</h2>
              <ul className="mt-4 space-y-3">
                {related.map((p) => (
                  <li key={p.slug} className="rounded-xl border border-white/10 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{p.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1">{p.summary}</p>
                    </div>
                    <a
                      href={`/projects/${p.slug}`}
                      onClick={onLink}
                      className="text-sm text-red-400 hover:text-red-300 font-medium shrink-0"
                    >
                      View {p.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {svc.faqs && svc.faqs.length > 0 && (
            <section className="glass p-7 sm:p-8 space-y-5">
              <div>
                <p className="text-red-500 text-xs tracking-[0.25em] uppercase font-semibold">Buyer FAQs</p>
                <h2 className="mt-1.5 text-2xl font-bold">Common Questions</h2>
              </div>
              <div className="divide-y divide-white/10">
                {svc.faqs.map((faq) => (
                  <article key={faq.q} className="py-4 first:pt-0 last:pb-0">
                    <h3 className="font-semibold text-white">{faq.q}</h3>
                    <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{faq.a}</p>
                  </article>
                ))}
              </div>
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
            <h2 className="text-xs uppercase tracking-widest text-zinc-500">Who Should Hire Me</h2>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{svc.idealFor}</p>
            <a
              href={`/contact?service=${svc.slug}`}
              onClick={onLink}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300"
            >
              Start a project inquiry <Icon name="arrow" className="w-4 h-4" />
            </a>
          </div>

          <div className="glass p-6 sm:p-7 text-xs space-y-2.5">
            <h2 className="text-xs uppercase tracking-widest text-zinc-500">Related Links</h2>
            <a href="/projects" onClick={onLink} className="block text-zinc-300 hover:text-red-400">
              → Real Software Projects
            </a>
            <a href="/demos" onClick={onLink} className="block text-zinc-300 hover:text-red-400">
              → 24 Interactive UI Demos
            </a>
            <a href="/blog/proboy-technical-seo-performance-audit" onClick={onLink} className="block text-zinc-300 hover:text-red-400">
              → Technical SEO &amp; Performance Audit
            </a>
            {svc.slug === "full-stack-web-development" && (
              <a href="/services/frontend-development" onClick={onLink} className="block text-zinc-300 hover:text-red-400">
                → Secondary Service: Frontend Engineering
              </a>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
