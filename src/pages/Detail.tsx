import { useEffect } from "react";
import Icon from "../components/Icon";
import { Img } from "../components/Layout";
import { sendEvent } from "../lib/collector";
import { info, projects } from "../lib/data";
import { botAuditCommit, botRepo } from "../data/botSource";
import { onLink } from "../lib/router";
import { breadcrumbLd, projectLd, useSeo } from "../lib/seo";

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

const RELATED_SERVICE: Record<string, { label: string; href: string }> = {
  "proboy-md": { label: "WhatsApp Bot Development Service", href: "/services/whatsapp-bot-development" },
  "proboy-sim-database": { label: "React & Node.js Full-Stack Service", href: "/services/full-stack-web-development" },
  "proboy-encrypt-decrypt": { label: "Frontend & Web Crypto Engineering", href: "/services/frontend-development" },
  "proboy-js-obfuscator": { label: "Frontend & JS Engineering Service", href: "/services/frontend-development" },
};

export function ProjectPage({ slug }: { slug: string }) {
  const p = projects.find((x) => x.slug === slug);
  const trail: [string, string][] = [
    ["Home", "/"],
    ["Projects", "/projects"],
    [p?.title || "Project", `/projects/${slug}`],
  ];

  useEffect(() => {
    if (p) void sendEvent("project_view", `/projects/${p.slug}`);
  }, [p?.slug]);

  useSeo({
    title: p ? `${p.title} | Shahan Ali (PROBOY)` : `Project not found — ${info.brand}`,
    description: p?.summary || "The requested project page could not be found.",
    path: `/projects/${slug}`,
    noindex: !p,
    jsonLd: p
      ? [
          breadcrumbLd(trail),
          projectLd(p),
        ]
      : [],
  });

  if (!p) return <NotFound />;
  const relatedService = RELATED_SERVICE[p.slug];
  const inquiry = relatedService ? `/contact?service=${relatedService.href.split("/").at(-1)}` : "/contact";

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
            {p.slug === "proboy-md" ? "Command directory and docs" : "Project documentation"}
          </a>
        )}
        {p.demo && p.slug !== "proboy-sim-database" && (
          <a
            href={p.demo}
            target={p.demo.startsWith("http") ? "_blank" : undefined}
            rel={p.demo.startsWith("http") ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 border border-white/30 hover:bg-white hover:text-black font-medium transition"
          >
            {p.slug === "proboy-md" ? "Separate pairing site" : "Open browser utility"} <Icon name="external" className="w-4 h-4" />
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

          {p.slug === "proboy-md" && (
            <section id="gemini-integration" className="mt-10 scroll-mt-8 border-t border-white/15 pt-6" aria-labelledby="gemini-title">
              <h2 id="gemini-title" className="text-xl font-bold">Gemini command: source and limitations</h2>
              <p className="mt-3 text-zinc-300 leading-relaxed">The command checks for a question, calls a configurable proxy, tries an alternate provider if the initial request fails, and handles an empty response. This is a source review of a proxy integration, not a successful live Google API test. Do not send private prompts to unverified services.</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
                <a className="text-red-400 underline" href={`${botRepo}/blob/${botAuditCommit}/commands/ai/Gemini.js`} target="_blank" rel="noopener noreferrer">Pinned Gemini command source</a>
                <a className="text-zinc-200 underline" href="/demos/synth-ai-studio">Try the local prompt demo (simulation)</a>
                <a className="text-red-400 underline" href="/contact?service=ai-integrations-automation" data-proof-contact>Discuss AI automation</a>
              </div>
            </section>
          )}
          <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-sm text-zinc-400 space-y-2">
            <h3 className="font-semibold text-zinc-200">
              {p.slug === "proboy-encrypt-decrypt"
                ? "Security Model & Threat Assumptions"
                : p.slug === "proboy-js-obfuscator"
                ? "Protection Scope & Limitations"
                : "Scope & Operational Notes"}
            </h3>
            <p className="leading-relaxed">
              {p.slug === "proboy-encrypt-decrypt"
                ? "Encryption (AES-256-GCM) and key derivation run locally in your browser via Web Crypto API. Confidentiality relies on device/browser integrity and passphrase strength. Image steganography conceals ciphertext inside PNG pixels and is not authentication on its own. This tool is not a penetration test or security certification."
                : p.slug === "proboy-js-obfuscator"
                ? "JavaScript obfuscation raises casual inspection effort and compresses identifier names, but client-side code can always be debugged in a browser. Obfuscation is never encryption, access control, or a replacement for keeping API keys on a server."
                : p.repo
                ? "Source code is publicly available on GitHub. Features built on Baileys use the unofficial WhatsApp Web multi-device protocol (separate from Meta's official WhatsApp Business Platform), and at checked commit c05d3225 index.js is absent from the repository root."
                : "Hosted as a browser-accessible utility on this domain. External dataset/API lookups depend on upstream endpoint availability."}
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
            <h2 className="text-xs uppercase tracking-widest text-zinc-500">Navigation &amp; Services</h2>
            <div className="mt-4 flex flex-col gap-2.5">
              <a href="/projects" onClick={onLink} className="text-red-400 hover:text-red-300">
                ← All Projects
              </a>
              {RELATED_SERVICE[p.slug] && (
                <a href={RELATED_SERVICE[p.slug].href} onClick={onLink} className="text-zinc-200 hover:text-red-400">
                  {RELATED_SERVICE[p.slug].label} →
                </a>
              )}
              <a href={inquiry} onClick={onLink} className="text-zinc-300 hover:text-white" data-proof-contact>
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

export function ArchivedCamLink() {
  useSeo({
    path: "/projects/proboy-camlink",
    title: "ProBoy CamLink (Archived) | Shahan Ali",
    description: "Archive note for the former ProBoy CamLink device diagnostics project. It is not offered as a public tool or current service proof.",
    noindex: true,
  });
  return (
    <Shell trail={[["Home", "/"], ["Projects", "/projects"], ["ProBoy CamLink", "/projects/proboy-camlink"]]}>
      <p className="text-sm uppercase tracking-widest text-red-400">Project archive</p>
      <h1 className="mt-3 text-4xl font-bold">ProBoy CamLink</h1>
      <p className="mt-5 max-w-2xl text-zinc-300 leading-relaxed">This earlier device diagnostics prototype is archived. It is not a current service example and this page does not request camera access or collect device data.</p>
      <a className="mt-6 inline-block text-red-400 underline" href="/projects">Browse current projects</a>
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
