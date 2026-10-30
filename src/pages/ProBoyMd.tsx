import { useMemo, useState } from "react";
import { info, site } from "../lib/data";
import { useSeo } from "../lib/seo";
import "./proboy-md.css";

const commands = [
  ["ai", ".ai", "AI-related command family. Exact syntax depends on the loaded command file.", "Source category reported"],
  ["gpt ai", ".gpt", "A GPT-related command name reported in the supplied inventory. A name collision was also reported.", "Potential name collision"],
  ["group admin", ".invite", "Group invite or link command reported in the audit. Check current group permissions.", "Check group permissions"],
  ["info privacy", ".info", "Information lookup flagged in the audit as privacy-sensitive. Review before any public deployment.", "Review before deployment"],
  ["camera privacy", ".camera", "Camera or short-link feature flagged for privacy and consent review. Do not deploy without that review.", "Do not deploy without review"],
  ["npm developer", ".npm", "Package utility reported in the audit. Owner checks and shell safety should be reviewed. Not a public install guide.", "Owner-only claim needs testing"],
  ["systeminfo", ".systeminfo", "Server information command reported in the source audit. Limit what it exposes.", "Limit server details"],
  ["textmaker", "Textmaker commands", "A category of text-effect and text-styling tools.", "Category summary"],
  ["media", "Media commands", "Media tools that may depend on external services. Respect copyright and service terms.", "Category summary"],
  ["fun", "Fun commands", "Entertainment and general utility commands.", "Category summary"],
  ["owner sudo", "Owner tools", "Restricted operations depend on the bot's permission logic. Review access controls.", "Review access controls"],
  ["help menu", "Help / menu", "Use the deployed bot menu or the repository to confirm current syntax. It changes by version.", "Version-dependent"],
];

export default function ProBoyMd() {
  const [q, setQ] = useState("");
  const shown = useMemo(() => commands.filter((c) => !q || (c[0] + c[1] + c[2]).toLowerCase().includes(q.toLowerCase())), [q]);
  const url = `${site}/proboy-md`;
  useSeo({
    title: "ProBoy-MD by Shahan Ali (ProBoy) | WhatsApp Bot Documentation",
    description: "Documentation for ProBoy-MD, a Node.js WhatsApp multi-device bot maintained by Shahan Ali (ProBoy, ProBoy315). Features, command categories, architecture, setup notes and project links.",
    path: "/proboy-md",
    jsonLd: [{
      "@context": "https://schema.org", "@type": "SoftwareApplication", name: "ProBoy-MD",
      applicationCategory: "DeveloperApplication", operatingSystem: "Node.js",
      description: "A Node.js WhatsApp multi-device bot with command categories for AI, media, group administration and developer utilities.",
      author: { "@type": "Person", name: "Shahan Ali", alternateName: ["ProBoy", "ProBoy315", "shahan315"], url: site },
      codeRepository: "https://github.com/ProBoy315/ProBoy-MD", url,
    }],
  });

  return (
    <div className="pmd">
      <header>
        <div className="wrap nav">
          <a className="brand" href="/proboy-md"><span className="mark">PB</span> PROBOY-MD</a>
          <nav aria-label="Documentation">
            {["overview", "features", "commands", "architecture", "owner", "links"].map((id) => <a key={id} href={`#${id}`}>{id[0].toUpperCase() + id.slice(1)}</a>)}
            <a href="/">Portfolio</a>
          </nav>
        </div>
      </header>
      <main className="wrap">
        <section className="hero" id="top">
          <p className="kicker">Project documentation</p>
          <h1>Meet <span>ProBoy-MD</span><br />by Shahan Ali (ProBoy)</h1>
          <p className="lead">ProBoy-MD is a Node.js WhatsApp multi-device bot with command-based automation, AI integrations, media utilities, group tools and developer utilities. This page explains the project, the reported architecture, feature categories and official links. It is not a claim that every command has been independently tested.</p>
          <div className="actions">
            <a className="btn primary" href="https://github.com/ProBoy315/ProBoy-MD">View source on GitHub</a>
            <a className="btn secondary" href="/">Owner portfolio</a>
          </div>
          <div className="pills" style={{ marginTop: 22 }}>{["Node.js", "JavaScript", "Baileys", "JSON storage", "ProBoy315"].map((p) => <span key={p} className="pill">{p}</span>)}</div>
        </section>

        <section id="overview">
          <p className="kicker">01 / Overview</p>
          <h2>What is ProBoy-MD?</h2>
          <p className="muted">A command-driven WhatsApp automation project by Shahan Ali, also known as ProBoy and ProBoy315, from Burewala, Pakistan.</p>
          <div className="grid">
            <article className="card"><h3>Command-based</h3><p className="muted">Features are organised into JavaScript command files. A message handler identifies the command and applies permission checks.</p></article>
            <article className="card"><h3>Feature groups</h3><p className="muted">The supplied project notes report AI, media, text effects, fun, general utilities, group administration and developer tools.</p></article>
            <article className="card"><h3>External APIs</h3><p className="muted">Some commands depend on outside services. Availability changes with network access, provider changes, keys and rate limits.</p></article>
          </div>
          <p className="callout"><strong>Status: </strong>Written from project notes and a partial source audit. It does not certify every endpoint or deployment.</p>
        </section>

        <section id="features">
          <p className="kicker">02 / Capabilities</p>
          <h2>Feature categories</h2>
          <p className="muted">Exact commands vary by the version installed.</p>
          <div className="grid">
            {[
              ["AI tools", "Reported chat, coding and image-related helpers. Availability depends on the configured provider.", ["Chat", "Code help"]],
              ["Media utilities", "Media and conversion commands, subject to third-party availability and usage rights.", ["Media", "Conversion"]],
              ["Textmaker", "Text effects and stylised text tools reported in the source set.", ["Typography"]],
              ["Group administration", "Group management commands with varying admin requirements.", ["Moderation"]],
              ["Developer tools", "Developer utilities, including some owner-restricted actions that should stay locked down.", ["Owner-restricted"]],
              ["Fun and general", "Entertainment commands and everyday bot utilities.", ["Fun", "General"]],
            ].map(([title, text, tags]) => (
              <article key={title as string} className="card"><h3>{title as string}</h3><p className="muted">{text as string}</p><div className="tag-row">{(tags as string[]).map((t) => <span key={t} className="tag">{t}</span>)}</div></article>
            ))}
          </div>
        </section>

        <section id="commands">
          <p className="kicker">03 / Command explorer</p>
          <h2>Example commands</h2>
          <p className="muted">Illustrative names from the audit, not a complete verified registry. The default prefix in the notes is a dot.</p>
          <label htmlFor="cmd">Search by command or category</label>
          <input id="cmd" className="search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try: ai, group, info" />
          <div className="commands">
            {shown.map((c) => (
              <article key={c[1]} className="command"><strong>{c[1]}</strong><p>{c[2]}</p><span className="status">{c[3]}</span></article>
            ))}
          </div>
          <p className="muted" style={{ marginTop: 12 }} aria-live="polite">{q ? `${shown.length} example ${shown.length === 1 ? "entry" : "entries"} found.` : "Showing all example entries."}</p>
        </section>

        <section id="architecture">
          <p className="kicker">04 / Architecture</p>
          <h2>How the bot is structured</h2>
          <div className="grid two">
            <article className="card">
              <h3>Typical message flow</h3>
              <div className="steps">
                {[["Connect", "Baileys opens a WhatsApp multi-device session."], ["Receive", "The main process receives a message and applies basic guards."], ["Resolve", "The handler checks prefix, command name and permissions."], ["Reply", "The command uses local JSON or an external API, then replies in WhatsApp."]].map(([t, d]) => (
                  <div key={t} className="step"><div><strong>{t}</strong><p className="muted">{d}</p></div></div>
                ))}
              </div>
            </article>
            <article className="card">
              <h3>Reported layout</h3>
              <pre><code>{`index.js\nproboy.js\ncommands/<category>/\ndatabase/\nsessions/\nsettings/`}</code></pre>
              <p className="muted">A simplified map. Confirm paths in the current repository before treating this as a deploy guide. Do not publish session files or tokens.</p>
            </article>
          </div>
        </section>

        <section id="setup">
          <p className="kicker">05 / Setup notes</p>
          <h2>Before you run it</h2>
          <div className="grid two">
            <article className="card"><h3>Checklist</h3><ul className="muted"><li>Use a Node.js version the repository supports.</li><li>Read the repository README and its dependencies.</li><li>Keep session, owner and API settings out of public files.</li><li>Run it on a machine you control and read the startup logs.</li></ul></article>
            <article className="card"><h3>Pairing site</h3><p className="muted">The live pairing page linked from this portfolio is <a href="https://proboy.vercel.app/pair/">proboy.vercel.app/pair/</a>. Confirm it is the deployment you intend before entering a phone number.</p></article>
          </div>
        </section>

        <section id="security">
          <p className="kicker">06 / Safety</p>
          <h2>Notes from the partial audit</h2>
          <div className="grid two">
            <article className="card"><h3>Remote actions</h3><p className="muted">The audit flagged possible remote command execution and remote configuration changes. Those paths should be verified and limited to authenticated, allow-listed actions. This page does not document how to run them.</p></article>
            <article className="card"><h3>Secrets</h3><p className="muted">Review stored tokens and any auto-download or auto-repair behaviour. Rotate credentials that have been exposed and keep secrets out of the repository.</p></article>
            <article className="card"><h3>Privacy-sensitive commands</h3><p className="muted">Commands that touch phone numbers, camera images or device data need consent, limited access and a lawful basis. Do not deploy them as a way to watch someone without permission.</p></article>
            <article className="card"><h3>What this audit did not cover</h3><p className="muted">Not every file, lockfile or runtime path was available. A reported issue is not automatically a confirmed bug.</p></article>
          </div>
        </section>

        <section id="owner">
          <p className="kicker">07 / Creator</p>
          <h2>Who made ProBoy-MD?</h2>
          <article className="card">
            <h3>Shahan Ali — ProBoy / ProBoy315</h3>
            <p className="muted">This documentation attributes ProBoy-MD to Shahan Ali (ProBoy), based in Burewala, Punjab, Pakistan. Public metadata can differ between files, so the repository history is the place to confirm maintainer details.</p>
            <p>Portfolio: <a href={site || "/"}>{site || "this site"}</a></p>
            <p>GitHub: <a href="https://github.com/ProBoy315">github.com/ProBoy315</a></p>
            <p>Email: <a href={`mailto:${info.email}`}>{info.email}</a> · WhatsApp: <a href={info.whatsapp}>{info.phone}</a></p>
          </article>
        </section>

        <section id="links">
          <p className="kicker">08 / Links</p>
          <h2>Project links</h2>
          <div className="grid">
            <a className="link-card" href="/"><span><b>Portfolio</b><br /><span className="muted">Shahan Ali — ProBoy</span></span></a>
            <a className="link-card" href="https://github.com/ProBoy315"><span><b>GitHub profile</b><br /><span className="muted">ProBoy315</span></span></a>
            <a className="link-card" href="https://github.com/ProBoy315/ProBoy-MD"><span><b>Source repository</b><br /><span className="muted">ProBoy-MD</span></span></a>
          </div>
        </section>

        <section id="faq">
          <p className="kicker">09 / FAQ</p>
          <h2>Common questions</h2>
          <div className="grid two">
            <article className="card"><h3>What is it built with?</h3><p className="muted">The notes describe a Node.js application using Baileys for WhatsApp multi-device connectivity, with JSON files for configuration.</p></article>
            <article className="card"><h3>Who maintains it?</h3><p className="muted">Shahan Ali, also known as ProBoy and ProBoy315. Check the repository for the latest public history.</p></article>
            <article className="card"><h3>Does every command always work?</h3><p className="muted">No. Commands can depend on APIs, keys, permissions and the files in that deployment.</p></article>
            <article className="card"><h3>Where is the pairing page?</h3><p className="muted">Linked as proboy.vercel.app/pair/. Verify the host before using it.</p></article>
          </div>
        </section>
      </main>
      <footer>
        <div className="wrap">PROBOY-MD · documentation for the project by Shahan Ali (ProBoy). Verify version-specific details in the repository before deployment.</div>
      </footer>
    </div>
  );
}
