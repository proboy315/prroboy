import { useState, type ComponentType } from "react";
import { CommandDirectory, commandMeta, commandCategories } from "../components/CommandDirectory";
import Icon from "../components/Icon";
import { info, site } from "../lib/data";
import { botLd, faqLd, personLd, useSeo } from "../lib/seo";
import { botFaq, pinnedBotCategories } from "../data/botSource";
import { onLink } from "../lib/router";
import "./proboy-md.css";

const REPO = "https://github.com/ProBoy315/ProBoy-MD";
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

function DeferredPlayground() {
  const [Playground, setPlayground] = useState<ComponentType>();
  const [state, setState] = useState<"idle" | "loading" | "failed">("idle");

  const load = async () => {
    setState("loading");
    try {
      const { default: Component } = await import("../components/ProBoyPlayground");
      setPlayground(() => Component);
    } catch {
      setState("failed");
    }
  };

  return (
    <section id="playground" aria-label="Command Playground">
      {Playground ? <Playground /> : (
        <div className="pmd-head">
          <h2>Command Playground</h2>
          <p className="pmd-lead mt-4">Try selected commands in your browser. The playground does not link to a WhatsApp account or run owner actions.</p>
          <button className="pmd-btn ghost mt-5" type="button" onClick={() => void load()} disabled={state === "loading"}>
            {state === "loading" ? "Loading playground..." : state === "failed" ? "Retry loading playground" : "Load command playground"}
          </button>
          {state === "failed" && <p role="alert" className="mt-3">The interactive module could not load. The <a href="#commands">command reference</a> is still available below.</p>}
        </div>
      )}
    </section>
  );
}

export default function ProBoyMd() {
  const url = `${site}/proboy-md`;
  useSeo({
    title: "ProBoy-MD Commands & Pairing | Shahan Ali",
    description: `Explore ProBoy-MD, Shahan Ali's open-source WhatsApp bot. Search ${commandMeta.repositoryCommandFiles} command files and find pairing and source links.`,
    path: "/proboy-md",
    jsonLd: [
      personLd(),
      botLd(),
      faqLd(botFaq),
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
          <p className="pmd-kicker"><span /> WhatsApp Multi-Device bot · source and command guide</p>
          <h1 id="pmd-title">ProBoy-MD</h1>
          <p className="pmd-byline">by <a href="/about" onClick={onLink}>Shahan Ali</a> <span>(PROBOY)</span></p>
          <p className="pmd-lead">
            ProBoy-MD is the WhatsApp Multi-Device bot created and maintained by {info.name} (PROBOY). It runs on
            Node.js with the Baileys library. The pinned repository contains {commandMeta.repositoryCommandFiles} command files
            across {pinnedBotCategories.length} physical folders; the older directory snapshot below uses {commandCategories.length} logical
            categories. The configured command prefix is {commandMeta.prefix}.
          </p>
          <div className="pmd-actions">
            <a className="pmd-btn primary" href="#playground" onClick={onLink}>
              <Icon name="terminal" className="w-4 h-4" /> Try Command Playground
            </a>
            <a className="pmd-btn ghost" href={PAIRING} target="_blank" rel="noopener noreferrer nofollow">
              <Icon name="whatsapp" className="w-4 h-4" /> Get Pairing Code <Icon name="external" className="w-4 h-4" />
            </a>
            <a className="pmd-btn ghost" href={REPO} target="_blank" rel="noopener noreferrer">
              <Icon name="github" className="w-4 h-4" /> View source on GitHub
            </a>
            <a className="pmd-btn ghost" href="/proboy-md/docs" onClick={onLink}>Read developer documentation</a>
            <a className="pmd-btn ghost" href="/services/whatsapp-bot-development" onClick={onLink}>Bot development service</a>
            <a className="pmd-btn ghost" href="/press" onClick={onLink}>Press kit &amp; verified facts</a>
          </div>
          <p className="pmd-lead">Source &amp; platform note: ProBoy-MD uses the unofficial <code>@whiskeysockets/baileys</code> library (separate from Meta&apos;s official WhatsApp Business Platform), and this directory reflects an older snapshot while the checked commit has 8 physical command folders and a missing declared <code>index.js</code> startup file. <a href="/proboy-md/docs/command-categories" onClick={onLink}>Read the count and version audit</a> before deploying.</p>
          <dl className="pmd-stats">
            <div><dt>Command prefix</dt><dd>{commandMeta.prefix}</dd></div>
            <div><dt>Older menu reported</dt><dd>{commandMeta.reportedMenuTotal}</dd></div>
            <div><dt>Verified source files</dt><dd>{commandMeta.repositoryCommandFiles}</dd></div>
            <div><dt>Pinned physical folders</dt><dd>{pinnedBotCategories.length}</dd></div>
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

        <DeferredPlayground />

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
              const found = pinnedBotCategories.find((c) => c.id === id);
              return (
                <li key={id} className="reveal">
                  <h3><span>{id}</span><em>{found ? found.count : "Snapshot only"}</em></h3>
                  <p>{found ? text : "An older snapshot lists this logical category. The pinned repository has no commands/admin folder; inspect the dev and group command sources instead."}</p>
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
              <pre><code>{"proboy.js\nhandler.js\ncommands/\n  <category>/\ndatabase.js\nsettings/\nutils/"}</code></pre>
              <p>At the checked commit, <code>index.js</code> is missing even though the package start script refers to it. See the <a href="/proboy-md/docs/installation" onClick={onLink}>installation caveat</a>. <code>proboy.js</code> is an obfuscated wrapper;
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
                ["GitHub profile", "https://github.com/ProBoy315", "github", true],
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
            {botFaq.map(({ q, a }) => (
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
