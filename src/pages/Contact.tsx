import ContactForm from "../components/ContactForm";
import Icon from "../components/Icon";
import { Socials } from "../components/Layout";
import { info, site } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, personLd, useSeo } from "../lib/seo";

export default function ContactPage() {
  const trail: [string, string][] = [
    ["Home", "/"],
    ["Contact", "/contact"],
  ];

  useSeo({
    title: `Contact ${info.name} (${info.brand}) — Hire Full-Stack, Bot & Shopify Developer`,
    description: `Contact ${info.name} (${info.brand}) in ${info.location} for Full-Stack Web Development, WhatsApp Bot Automation, Shopify Online Store 2.0, and Gemini AI integrations.`,
    path: "/contact",
    jsonLd: [
      breadcrumbLd(trail),
      personLd(),
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: `Contact ${info.name} (${info.brand})`,
        url: `${site}/contact`,
        mainEntity: { "@id": `${site}/#person` },
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
        <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-semibold">Contact & Inquiries</p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight">
          Start a conversation with {info.name}
        </h1>
        <p className="mt-5 text-lg text-zinc-300 leading-relaxed">
          Have a web application, WhatsApp automation bot, Shopify storefront, or Gemini AI integration in mind? Send
          your project details below or reach out directly via WhatsApp, email, or LinkedIn.
        </p>
      </header>

      <div className="mt-12 grid lg:grid-cols-[1.35fr_0.85fr] gap-8 items-start">
        <section aria-labelledby="contact-form-heading" className="glass p-6 sm:p-9">
          <h2 id="contact-form-heading" className="text-2xl font-bold">
            Project & General Inquiry Form
          </h2>
          <p className="mt-2 mb-6 text-sm text-zinc-400">
            All fields marked with <span className="text-red-400">*</span> are required. Messages are submitted directly
            to Shahan Ali&apos;s contact endpoint.
          </p>
          <ContactForm />
        </section>

        <aside className="space-y-5" aria-label="Direct contact channels">
          <div className="glass p-6 sm:p-7">
            <h2 className="text-lg font-bold">Direct Contact Details</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-zinc-500">Email</dt>
                <dd className="mt-1">
                  <a href={`mailto:${info.email}`} className="text-white hover:text-red-400 break-all font-medium">
                    {info.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Phone & WhatsApp</dt>
                <dd className="mt-1">
                  <a
                    href={info.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-red-400 font-medium"
                  >
                    {info.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Location</dt>
                <dd className="mt-1 text-zinc-200">{info.location}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">LinkedIn</dt>
                <dd className="mt-1">
                  <a
                    href={info.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300 break-all"
                  >
                    pk.linkedin.com/in/shahanali687
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">GitHub</dt>
                <dd className="mt-1">
                  <a
                    href={info.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-400 hover:text-red-300"
                  >
                    github.com/proboy315
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-xs uppercase tracking-widest text-zinc-500 mb-3">Verified Profiles</p>
              <Socials />
            </div>
          </div>

          <div className="glass p-6 sm:p-7">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Icon name="whatsapp" className="w-4 h-4 text-emerald-400" />
              Official WhatsApp Channel
            </h2>
            <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
              Follow release updates for ProBoy-MD, developer utilities, and new builds on the official channel.
            </p>
            <a
              href={info.whatsappChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300"
            >
              Open WhatsApp Channel <Icon name="external" className="w-4 h-4" />
            </a>
          </div>
        </aside>
      </div>
    </article>
  );
}
