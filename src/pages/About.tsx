import { useState } from "react";
import Icon from "../components/Icon";
import { Socials } from "../components/Layout";
import { info, projects, site } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, personLd, useSeo } from "../lib/seo";

export default function AboutPage() {
  const [portraitMissing, setPortraitMissing] = useState(false);
  const trail: [string, string][] = [
    ["Home", "/"],
    ["About", "/about"],
  ];

  useSeo({
    title: `About Shahan Ali | Developer in Burewala`,
    description: `Meet Shahan Ali (PROBOY), a developer and ICS student in Burewala. Read about his work, ProBoy-MD, education and contact links.`,
    path: "/about",
    ogType: "profile",
    jsonLd: [
      breadcrumbLd(trail),
      {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        name: `About ${info.name} (${info.brand})`,
        url: `${site}/about`,
        mainEntity: { "@id": `${site}/#person` },
      },
      personLd(),
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

      {/* Header & Portrait Summary */}
      <header className="grid lg:grid-cols-[1.35fr_0.65fr] gap-10 items-center">
        <div>
          <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-semibold">
            Biography &amp; Technical Profile
          </p>
          <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08]">
            {info.name} <span className="text-red-500">({info.brand})</span>
          </h1>
          <p className="mt-4 text-xl text-zinc-200 font-medium">
            Full-Stack Developer, AI &amp; WhatsApp Bot Architect, and Shopify Expert
          </p>
          <p className="mt-4 text-zinc-300 leading-relaxed">
            Shahan Ali — known across developer platforms as <strong>PROBOY</strong>, <strong>ProBoy</strong>,{" "}
            <strong>itx_proboy</strong>, <strong>shahan315</strong>, and <strong>proboy315</strong> — is a software
            developer based in <strong>Burewala, Punjab, Pakistan</strong>. He builds full-stack web applications,
            maintains the open-source <strong>ProBoy-MD</strong> WhatsApp Multi-Device bot, engineers custom Shopify
            Online Store 2.0 storefronts, and integrates Google Gemini AI into practical workflows.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/contact"
              onClick={onLink}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition"
            >
              Work with Shahan Ali <Icon name="arrow" className="w-4 h-4" />
            </a>
            <a
              href="/projects"
              onClick={onLink}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium border border-white/25 hover:bg-white hover:text-black transition"
            >
              Explore Projects
            </a>
          </div>
        </div>

        <figure className="glass p-4 sm:p-5">
          {!portraitMissing && (
            <img
              src={info.profileImage}
              alt={info.portrait.alt}
              width={info.portrait.width}
              height={info.portrait.height}
              onError={() => setPortraitMissing(true)}
              className="w-full aspect-[4/5] object-cover object-top rounded-xl"
            />
          )}
          {portraitMissing && (
          <div
            className="w-full aspect-[4/5] rounded-xl border border-white/10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,0.18),transparent_70%)] grid place-items-center text-center p-6"
          >
            <span>
              <span className="block text-3xl font-extrabold text-red-500">P</span>
              <span className="mt-3 block text-sm text-zinc-400">
                Portrait file is not published in this build. Use the{" "}
                <a href="/press" onClick={onLink} className="text-red-400 hover:text-red-300">
                  press kit
                </a>{" "}
                for the current asset status.
              </span>
            </span>
          </div>
          )}
          <figcaption className="mt-3 text-xs text-zinc-400 leading-relaxed">
            {info.name} ({info.brand}) — Full-Stack Developer &amp; Bot Architect in {info.location}.
          </figcaption>
        </figure>
      </header>

      {/* Quick Identity Facts */}
      <dl className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="glass p-5">
          <dt className="text-zinc-500">Full Name &amp; Brand</dt>
          <dd className="mt-1.5 text-white font-semibold">
            {info.name} ({info.brand})
          </dd>
        </div>
        <div className="glass p-5">
          <dt className="text-zinc-500">Verified Handles</dt>
          <dd className="mt-1.5 text-zinc-200">{info.aliases.join(" · ")}</dd>
        </div>
        <div className="glass p-5">
          <dt className="text-zinc-500">Location</dt>
          <dd className="mt-1.5 text-zinc-200">{info.location}</dd>
        </div>
        <div className="glass p-5">
          <dt className="text-zinc-500">Current Education</dt>
          <dd className="mt-1.5 text-zinc-200">ICS Student, Govt Graduate College Burewala</dd>
        </div>
      </dl>

      {/* Background & Education */}
      <section aria-labelledby="background-heading" className="mt-16 grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <div className="glass p-7 sm:p-9 space-y-4">
          <p className="text-red-500 text-xs tracking-[0.28em] uppercase font-semibold">Background</p>
          <h2 id="background-heading" className="text-2xl sm:text-3xl font-bold">
            From Burewala to Full-Stack &amp; Bot Engineering
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            Growing up in Burewala, District Vehari, Punjab, Pakistan, Shahan Ali started building software by
            dissecting how web interfaces, HTTP APIs, and messaging protocols work under the hood. Rather than treating
            coding as isolated exercises, he focused early on shipping usable utilities and open-source tools that other
            developers and everyday users could inspect, configure, and run.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            That hands-on approach led to the creation of <strong>PROBOY</strong> as an engineering identity and the
            release of <strong>ProBoy-MD</strong>, a Node.js WhatsApp Multi-Device bot built with the Baileys library.
            Over successive iterations, ProBoy-MD expanded into a structured repository of 224 command files spanning
            AI assistants, group moderation, media processing, text effects, and administrative controls.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            Alongside open-source bot development, Shahan works across modern frontend and backend web engineering
            (React, TypeScript, Vite, Tailwind CSS, Node.js, MySQL, and Firestore) and customizes Shopify Online Store
            2.0 storefronts using Liquid.
          </p>
        </div>

        <div className="space-y-6">
          <div className="glass p-7">
            <p className="text-red-500 text-xs tracking-[0.28em] uppercase font-semibold">Current Education</p>
            <h2 className="mt-2 text-xl font-bold">Govt Graduate College Burewala</h2>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
              Shahan Ali is currently enrolled as an <strong>Intermediate in Computer Science (ICS) student</strong> at{" "}
              <strong>Govt Graduate College Burewala</strong> in Burewala, Punjab, Pakistan.
            </p>
            <p className="mt-3 text-xs text-zinc-400">
              Status: Currently studying (ICS program). Balancing formal computer science fundamentals with practical
              software development and client builds.
            </p>
          </div>

          <div className="glass p-7">
            <p className="text-red-500 text-xs tracking-[0.28em] uppercase font-semibold">Recognition</p>
            <h2 className="mt-2 text-xl font-bold">{info.certificate.title}</h2>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
              Awarded a <strong>Certificate of Recognition</strong> for <strong>Google Gemini QuizOff 2026</strong>{" "}
              (dated <strong>{info.certificate.date}</strong>), organised by CampusCrew and hosted on Unstop, a
              large-scale AI competition with 5,25,000+ student participants across 48,500+ institutions and 35+
              countries.
            </p>
          </div>
        </div>
      </section>

      {/* Engineering Approach & Core Capabilities */}
      <section aria-labelledby="approach-heading" className="mt-16">
        <p className="text-red-500 text-xs tracking-[0.28em] uppercase font-semibold">Engineering Approach</p>
        <h2 id="approach-heading" className="mt-2 text-2xl sm:text-3xl font-bold">
          How Shahan Ali Builds Software
        </h2>
        <div className="mt-6 grid md:grid-cols-3 gap-5">
          <div className="glass p-6">
            <h3 className="text-lg font-semibold">1. Modular, Readable Architecture</h3>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Whether structuring 224 command modules in ProBoy-MD or building multi-route React and TypeScript
              applications, code is separated into clear responsibilities so features can be audited and extended
              safely.
            </p>
          </div>
          <div className="glass p-6">
            <h3 className="text-lg font-semibold">2. Performance &amp; Accessibility First</h3>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Interfaces are built with semantic HTML, keyboard navigation, visible focus states, lean asset sizes,
              and clean metadata so both human visitors and search engines can parse every page accurately.
            </p>
          </div>
          <div className="glass p-6">
            <h3 className="text-lg font-semibold">3. Honest Technical Scope</h3>
            <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
              Every project and service clearly documents what is built, which technologies power it, and what external
              dependencies or limitations apply — without inflated metrics or unverified claims.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section aria-labelledby="stack-heading" className="mt-16">
        <p className="text-red-500 text-xs tracking-[0.28em] uppercase font-semibold">Technical Stack</p>
        <h2 id="stack-heading" className="mt-2 text-2xl sm:text-3xl font-bold">
          Languages, Frameworks &amp; Platforms
        </h2>
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {info.skillGroups.map((group) => (
            <div key={group.title} className="glass p-6">
              <h3 className="font-semibold text-white">{group.title}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Selected Real Projects */}
      <section aria-labelledby="selected-projects-heading" className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-red-500 text-xs tracking-[0.28em] uppercase font-semibold">Selected Work</p>
            <h2 id="selected-projects-heading" className="mt-2 text-2xl sm:text-3xl font-bold">
              Real Projects Shipped by {info.name}
            </h2>
          </div>
          <a href="/projects" onClick={onLink} className="text-sm text-red-400 hover:text-red-300 inline-flex items-center gap-1.5">
            View all {projects.length} projects <Icon name="arrow" className="w-4 h-4" />
          </a>
        </div>
        <ul className="mt-6 grid md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <li key={p.slug} className="glass p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs text-red-400 uppercase tracking-wider">{p.category}</p>
                <h3 className="mt-1.5 text-xl font-bold">
                  <a href={`/projects/${p.slug}`} onClick={onLink} className="hover:text-red-400 transition">
                    {p.title}
                  </a>
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{p.summary}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-zinc-500">{p.technologies.slice(0, 3).join(" · ")}</span>
                <a href={`/projects/${p.slug}`} onClick={onLink} className="text-red-400 hover:text-red-300 font-medium">
                  Project details →
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Neutral Factual Disambiguation */}
      <section
        id="disambiguation"
        aria-labelledby="disambiguation-heading"
        className="mt-16 glass p-7 sm:p-9 border-white/15"
      >
        <p className="text-red-500 text-xs tracking-[0.28em] uppercase font-semibold">Identity Clarification</p>
        <h2 id="disambiguation-heading" className="mt-2 text-2xl font-bold">
          Disambiguation: Shahan Ali (PROBOY, Burewala, Pakistan)
        </h2>
        <p className="mt-4 text-zinc-300 leading-relaxed">
          Because several public figures share the name &ldquo;Shahan Ali,&rdquo; this section clarifies the identity of
          the author and developer of this website:
        </p>
        <ul className="mt-4 space-y-2.5 text-sm text-zinc-300 leading-relaxed">
          <li className="flex gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
            <span>
              <strong>This profile:</strong> Shahan Ali (brand <strong>PROBOY</strong>; handles{" "}
              <code>proboy315</code>, <code>shahan315</code>, <code>itx_proboy</code>), a Full-Stack Developer, AI
              &amp; WhatsApp Bot Architect, Shopify Expert, and current ICS student at Govt Graduate College Burewala
              in <strong>Burewala, Punjab, Pakistan</strong>.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
            <span>
              <strong>How to verify this profile:</strong> the GitHub account{" "}
              <a href={info.github} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
                proboy315
              </a>{" "}
              owns the public{" "}
              <a href="https://github.com/proboy315/ProBoy-MD" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300">
                ProBoy-MD
              </a>{" "}
              repository, and the portfolio, blog and documentation published here all reference the same account.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-zinc-500 shrink-0" />
            <span>
              <strong>Scope of this note:</strong> this page describes only the PROBOY developer named above. It makes no
              statement about any other person who shares the name, and it is not an attempt to characterise anyone
              else.
            </span>
          </li>
        </ul>
      </section>

      {/* Verified Official Profiles & Contact */}
      <section aria-labelledby="verified-profiles-heading" className="mt-14 glass p-7 sm:p-9">
        <h2 id="verified-profiles-heading" className="text-xl font-bold">
          Verified Official Profiles &amp; Contact
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Confirm Shahan Ali&apos;s official online presence across GitHub, email, and WhatsApp:
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <a
            href={info.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-white/5 border border-white/15 hover:border-red-500 text-zinc-200 hover:text-white transition"
          >
            <Icon name="github" className="w-4 h-4 text-red-400" /> GitHub (proboy315)
          </a>
          <a
            href={`mailto:${info.email}`}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-white/5 border border-white/15 hover:border-red-500 text-zinc-200 hover:text-white transition"
          >
            <Icon name="mail" className="w-4 h-4 text-red-400" /> {info.email}
          </a>
          <a
            href="/contact"
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium transition"
          >
            Open Contact Form <Icon name="arrow" className="w-4 h-4" />
          </a>
        </div>
        <div className="mt-6">
          <Socials />
        </div>
      </section>
    </article>
  );
}
