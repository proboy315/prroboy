import { CommandDirectory, commandMeta, commandCategories } from "../components/CommandDirectory";
import Icon from "../components/Icon";
import { info, site } from "../lib/data";
import { useSeo } from "../lib/seo";
import { personLd } from "../lib/seo";
import { onLink } from "../lib/router";
import "./proboy-md.css";

const REPO = "https://github.com/proboy315/ProBoy-MD";
const PAIRING = commandMeta.pairingUrl;

const categories: [string, string][] = [
  ["general", "Chat, stickers, group info, uptime and everyday commands."],
  ["ai", "AI chat, image generation, photo editing, transcription-style helpers."],
  ["group", "Moderation: add, kick, promote, welcome, warning and spam controls."],
  ["dev", "Session, channel, broadcast, plugin and owner-only configuration."],
  ["media", "Downloaders for common video, music and image sources."],
  ["fun", "Lightweight entertainment, quotes, images and animation responses."],
  ["utility", "Calculator, weather, short URLs, definitions, pairing and utilities."],
  ["textmaker", "Stylised text and name-image effects."],
  ["admin", "Additional administrative controls declared separately in the source."],
];

const steps: [string, string][] = [
  ["Open the ProBoy-MD page", "Use the Get Pairing Code button above."],
  ["Enter your WhatsApp number", "Include the country code, for example 923001234567, without + or spaces."],
  ["Generate the pairing code", "The pairing service returns a short code and copies it."],
  ["Open WhatsApp on your phone", "Go to Linked devices, then Link a device."],
  ["Choose phone number login", "Select the pairing-code option instead of scanning a QR code."],
  ["Enter the code", "Type the pairing code to connect the bot session."],
];

export default function ProBoyMd() {
  const url = `${site}/proboy-md`;
  useSeo({
    title: "ProBoy-MD Commands & WhatsApp Pairing — Shahan Ali (ProBoy)",
    description: `ProBoy-MD is the WhatsApp Multi-Device bot by Shahan Ali (ProBoy), version ${commandMeta.version}, prefix ${commandMeta.prefix}. Search ${commandMeta.repositoryCommandFiles} verified commands, browse categories and get a WhatsApp pairing code.`,
    path: "/proboy-md",
    jsonLd: [
      personLd(),
      {
        "@context": "https://schema.org", "@type": "SoftwareApplication", "@id": `${url}#software`,
        name: "ProBoy-MD", alternateName: ["ProBoy MD", "ProBoy315 WhatsApp Bot"], version: commandMeta.version,
        applicationCategory: "DeveloperApplication", operatingSystem: "Node.js",
        description: `ProBoy-MD is a Node.js WhatsApp Multi-Device bot by Shahan Ali (ProBoy) with AI, group, media, utility, text-maker and developer commands, prefix ${commandMeta.prefix}.`,
        codeRepository: REPO, url, softwareVersion: commandMeta.version,
        author: { "@id": site ? `${site}/#person` : undefined, name: info.name, alternateName: info.aliases },
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@context": "https://schema.org", "@type": "FAQPage", "@id": `${url}#faq`,
        mainEntity: [
          ["What is ProBoy-MD?", `ProBoy-MD is a Node.js WhatsApp Multi-Device bot developed by Shahan Ali (ProBoy). Version ${commandMeta.version} uses the prefix ${commandMeta.prefix} and covers AI, group, media, utility, text-maker and developer commands.`],
          ["How many commands does ProBoy-MD have?", `The bot menu generated on 4 November 2026 reported ${commandMeta.reportedMenuTotal} commands. Parsing the current repository gives ${commandMeta.repositoryCommandFiles} command files (${commandMeta.uniquePrimaryNames} unique names). The difference is documented rather than invented.`],
          ["How do I connect ProBoy-MD to WhatsApp?", `Open ${PAIRING}, enter your phone number with its country code, generate a pairing code, then enter it in WhatsApp under Linked devices. The pairing flow is handled by that site, never by this portfolio.`],
          ["Who created ProBoy-MD?", `${info.name} (online as ProBoy, ProBoy315 and shahan315) created ProBoy-MD. Source: ${REPO}.`],
        ].map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
      {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site}/` },
          { "@type": "ListItem", position: 2, name: "ProBoy-MD", item: url },
        ],
      },
    ],
  });

  return (
    <div className="pmd">
      <section className="pmd-hero" aria-labelledby="pmd-title">
        <div className="pmd-glow" aria-hidden="true" />
        <div className="pmd-hero-inner">
          <p className="pmd-kicker"><span /> WhatsApp Multi-Device bot · version {commandMeta.version}</p>
          <h1 id="pmd-title">ProBoy-MD</h1>
          <p className="pmd-byline">by <a href="/">Shahan Ali</a> <span>(ProBoy)</span></p>
          <p className="pmd-lead">
            ProBoy-MD is the WhatsApp Multi-Device bot created and maintained by {info.name} (ProBoy). It runs on
            Node.js with the Baileys library and drives {commandMeta.repositoryCommandFiles} command files through
            a {commandMeta.prefix} prefix across {commandCategories.length} categories: AI helpers, group moderation,
            media utilities, text effects and developer tooling.
          </p>
          <div className="pmd-actions">
            <a className="pmd-btn primary" href={PAIRING} target="_blank" rel="noopener noreferrer nofollow">
              <Icon name="whatsapp" className="w-4 h-4" /> Get Pairing Code <Icon name="external" className="w-4 h-4" />
            </a>
            <a className="pmd-btn ghost" href={REPO} target="_blank" rel="noopener noreferrer">
              <Icon name="github" className="w-4 h-4" /> View source on GitHub
            </a>
            <a className="pmd-btn ghost" href="/#projects" onClick={onLink}>Portfolio projects</a>
          </div>
          <dl className="pmd-stats">
            <div><dt>Command prefix</dt><dd>{commandMeta.prefix}</dd></div>
            <div><dt>Menu reported</dt><dd>{commandMeta.reportedMenuTotal}</dd></div>
            <div><dt>Verified in source</dt><dd>{commandMeta.repositoryCommandFiles}</dd></div>
            <div><dt>Categories</dt><dd>{commandCategories.length}</dd></div>
          </dl>
        </div>
      </section>

      <div className="pmd-wrap">
        <section id="pairing" className="pmd-pair" aria-labelledby="pair-title">
          <div className="pmd-pair-copy">
            <p className="pmd-kicker">WhatsApp connection</p>
            <h2 id="pair-title">Connect your WhatsApp</h2>
            <p>
              ProBoy-MD connects with a pairing code instead of a QR scan. The flow runs on the official pairing
              site at <a href={PAIRING} target="_blank" rel="noopener noreferrer nofollow">{PAIRING.replace("https://", "")}</a>,
              which is configured in the repository. This portfolio does not collect your phone number, password,
              session string or any pairing credential.
            </p>
            <div className="pmd-pair-cta">
              <a className="pmd-btn primary lg" href={PAIRING} target="_blank" rel="noopener noreferrer nofollow">
                <Icon name="whatsapp" className="w-5 h-5" /> Open the pairing website <Icon name="external" className="w-4 h-4" />
              </a>
              <small>Opens a new tab · enter your own number with the country code</small>
            </div>
          </div>
          <ol className="pmd-steps">
            {steps.map(([title, text], i) => (
              <li key={title}>
                <span className="pmd-step-no">{String(i + 1).padStart(2, "0")}</span>
                <div><h3>{title}</h3><p>{text}</p></div>
              </li>
            ))}
          </ol>
          <aside className="pmd-safety">
            <Icon name="shield" className="w-4 h-4" />
            <p><strong>Safety.</strong> Never share a WhatsApp password, OTP or recovery code with anyone, including
            bot admins. A pairing code is entered only inside WhatsApp under <em>Linked devices</em>. If a site asks
            for more than a phone number, do not continue.</p>
          </aside>
        </section>

        <CommandDirectory />

        <section id="capabilities" className="pmd-cats" aria-labelledby="cats-title">
          <div className="pmd-head reveal">
            <p className="pmd-kicker">Capability areas</p>
            <h2 id="cats-title">What each category does</h2>
            <p className="pmd-lead">
              Categories and counts come from the repository itself. Command availability depends on the version you
              run and on any external APIs it calls.
            </p>
          </div>
          <ul className="pmd-cat-grid">
            {categories.map(([id, text]) => {
              const found = commandMeta.categoryStats?.find?.((c: { id: string }) => c.id === id);
              return (
                <li key={id} className="reveal">
                  <h3><span>{id}</span><em>{found ? found.count : ""}</em></h3>
                  <p>{text}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="architecture" className="pmd-arch" aria-labelledby="arch-title">
          <div className="pmd-head reveal">
            <p className="pmd-kicker">Architecture</p>
            <h2 id="arch-title">How a message becomes a reply</h2>
          </div>
          <div className="pmd-arch-grid">
            <ol className="pmd-flow reveal">
              {[
                ["Connect", "Baileys opens a WhatsApp Multi-Device session for the configured account."],
                ["Receive", "The main process receives the message event and applies deduplication guards."],
                ["Resolve", "The handler checks the prefix, command name or alias, and permission level."],
                ["Execute", "The matching command file runs, then replies through the session."],
              ].map(([t, d], i) => (
                <li key={t}><span>{String(i + 1).padStart(2, "0")}</span><div><strong>{t}</strong><p>{d}</p></div></li>
              ))}
            </ol>
            <div className="pmd-tree reveal">
              <h3>Reported project structure</h3>
              <pre><code>{"index.js\nproboy.js\nhandler.js\ncommands/\n  <category>/\ndatabase.js\nsettings/\nutils/"}</code></pre>
              <p>Confirmed against the current repository layout. <code>proboy.js</code> is an obfuscated wrapper;
              per-command files under <code>commands/</code> expose <code>name</code>, <code>aliases</code>,
              <code>category</code>, <code>description</code> and <code>usage</code>, which is how this directory was built.</p>
            </div>
          </div>
        </section>

        <section id="owner" className="pmd-owner" aria-labelledby="owner-title">
          <div className="reveal">
            <p className="pmd-kicker">Creator and maintainer</p>
            <h2 id="owner-title">Who built ProBoy-MD?</h2>
            <p className="pmd-lead">
              {info.name} — online as {info.aliases.join(", ")} — is a {info.role} from {info.location} and the creator
              of the PROBOY brand. He also maintains this portfolio at <a href={site}>{site.replace("https://", "")}</a>.
            </p>
            <ul className="pmd-links">
              {[
                ["Portfolio", "/", "home", false],
                ["GitHub profile", "https://github.com/proboy315", "github", true],
                ["ProBoy-MD repository", REPO, "github", true],
                ["Pairing website", PAIRING, "whatsapp", true],
              ].map(([labelText, href, icon, ext]) => (
                <li key={labelText as string}>
                  <a href={href as string} onClick={ext ? undefined : onLink} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined}>
                    <Icon name={icon as string} className="w-4 h-4" /> {labelText as string}
                    {ext && <Icon name="external" className="w-3.5 h-3.5 pmd-link-arrow" />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="faq" className="pmd-faq" aria-labelledby="faq-title">
          <div className="pmd-head reveal">
            <p className="pmd-kicker">FAQ</p>
            <h2 id="faq-title">ProBoy-MD questions</h2>
          </div>
          <div className="pmd-faq-grid">
            {[
              ["What is ProBoy-MD built with?", "Node.js and the Baileys library for WhatsApp Multi-Device connectivity, using JavaScript with CommonJS-style command files."],
              [`How many commands are there?`, `The supplied menu reports ${commandMeta.reportedMenuTotal} and documents ${commandMeta.reportedListed}. The repository currently contains ${commandMeta.repositoryCommandFiles} command files with ${commandMeta.uniquePrimaryNames} unique names. Both figures are shown so the difference stays visible.`],
              ["Does every command always work?", "No. Commands may depend on external APIs, keys, permissions and the version you run. Verify against the repository you deploy."],
              ["Where do I enter a pairing code?", "Only inside WhatsApp, under Linked devices. The code is generated by the pairing website, not by this portfolio."],
              ["Is this a QR-scan connection?", "No. ProBoy-MD's documented connection flow uses a pairing code rather than scanning a QR code."],
              ["Who created the bot?", `${info.name} (ProBoy / ProBoy315), a developer from ${info.location}.`],
            ].map(([q, a]) => (
              <article key={q} className="reveal">
                <h3>{q}</h3>
                <p>{a}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
