import { useEffect, useMemo, useState } from "react";
import { botDocs, botRepo, botAuditCommit, getBotDoc } from "../data/botDocs";
import { articles } from "../data/editorial";
import { info, site } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, useSeo } from "../lib/seo";
import { track } from "../lib/measure";
import { CodeCopy, Crumbs } from "../components/Reading";
import "./reading.css";

const home = "/proboy-md/docs";
const urlFor = (s: string) => s === "documentation-home" ? home : `${home}/${s}`;
const anchor = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const sourcePaths: Record<string, string[]> = {
  "documentation-home": ["README.md", "handler.js"], overview: ["handler.js", "utils/commandLoader.js"], features: ["commands", "handler.js"],
  requirements: ["package.json", "README.md"], installation: ["package.json", "README.md"], configuration: ["config.js", "settings/apis.js"],
  pairing: ["README.md", "config.js"], "session-storage": ["handler.js", "database.js"], process: ["package.json", "commands/dev/restart.js"],
  "command-syntax": ["handler.js", "commands/general/ping.js"], aliases: ["utils/commandLoader.js"], "command-categories": ["commands", "utils/commandLoader.js"],
  "ai-commands": ["commands/ai"], "dev-commands": ["commands/dev/connect.js"], "fun-commands": ["commands/fun"],
  "general-commands": ["commands/general/ping.js"], "group-commands": ["commands/group/kick.js"], "media-commands": ["commands/media"],
  "textmaker-commands": ["commands/textmaker"], "utility-commands": ["commands/utility"], "admin-commands": ["handler.js", "commands/dev"],
  permissions: ["handler.js", "commands/dev/connect.js"], "multi-session": ["commands/dev/connect.js"], plugins: ["commands/dev/install.js", "commands/dev/uninstall.js"],
  troubleshooting: ["README.md", "utils/commandLoader.js"], diagnostics: ["commands/dev/health.js", "handler.js"],
  security: ["config.js", "settings/api-keys.js"], deployment: ["README.md", "package.json"], updating: ["package.json", "config.js"],
  "faq-support": ["README.md", "PROMPT.MD"]
};
export const docSeo = (slug: string) => {
  const doc = getBotDoc(slug);
  const path = doc ? urlFor(doc.slug) : `${home}/${slug}`;
  return doc ? {
    title: `${doc.title} | ProBoy-MD Docs`, description: doc.intro.slice(0, 155), path,
    jsonLd: [breadcrumbLd([["Home", "/"], ["ProBoy-MD", "/proboy-md"], ["Docs", home], ...(slug === "documentation-home" ? [] : [[doc.title, path] as [string, string]])]), {
      "@context": "https://schema.org", "@type": "TechArticle", headline: doc.title, description: doc.intro,
      url: `${site}${path}`, dateModified: "2026-11-07", author: { "@type": "Person", "@id": `${site}/#person`, name: info.name },
      about: { "@type": "SoftwareApplication", name: "ProBoy-MD", codeRepository: botRepo }
    }]
  } : { title: "Documentation not found | PROBOY", description: "This documentation chapter does not exist.", path, noindex: true, jsonLd: [] };
};

function DocNav({ current }: { current: string }) {
  let last = "";
  return <nav aria-label="Documentation chapters"><h2>ProBoy-MD docs</h2>{botDocs.map(d => { const group = last !== d.group ? d.group : ""; last = d.group; return <div key={d.slug}>{group && <h3>{group}</h3>}<a href={urlFor(d.slug)} onClick={onLink} aria-current={current === d.slug ? "page" : undefined}>{d.title}</a></div>; })}</nav>;
}

export default function BotDocs({ slug }: { slug: string }) {
  const doc = getBotDoc(slug);
  const [q, setQ] = useState("");
  const matches = useMemo(() => q.trim().length < 2 ? [] : botDocs.filter(d => `${d.title} ${d.intro} ${d.sections.map(s => s.heading + " " + s.text).join(" ")}`.toLowerCase().includes(q.toLowerCase().trim())), [q]);
  useSeo(docSeo(slug));
  useEffect(() => { setQ(""); }, [slug]);
  if (!doc) return <div className="reading-shell"><h1>Documentation chapter not found</h1><a href={home} onClick={onLink}>Documentation home</a></div>;
  const i = botDocs.indexOf(doc);
  return <div className="reading-shell"><Crumbs items={[["Home", "/"], ["ProBoy-MD", "/proboy-md"], ...(slug === "documentation-home" ? [["Docs", home] as [string, string]] : [["Docs", home] as [string, string], [doc.title, urlFor(slug)] as [string, string]])]} />
    <div className="reading-doc-layout"><div className="reading-doc-nav"><DocNav current={slug} /></div><div className="reading-doc-main">
      <details className="reading-mobile-nav"><summary>Browse documentation chapters</summary><DocNav current={slug} /></details>
      <form role="search" className="reading-search" onSubmit={e => e.preventDefault()}><label htmlFor="docs-search">Search documentation</label><input id="docs-search" type="search" value={q} onChange={e => { setQ(e.target.value); if (e.target.value.trim().length === 3) track("docs_search", { query_length: 3 }); }} placeholder="Search chapters and body text" /></form>
      {q.trim().length >= 2 && <div role="status" className="reading-doc-search-results"><span>{matches.length ? `${matches.length} matching chapters` : "No matching chapters. Try a different term."}</span>{matches.map(m => <a key={m.slug} href={urlFor(m.slug)} onClick={onLink}>{m.title}<span>{m.intro.slice(0, 115)}...</span></a>)}</div>}
      <article><header className="reading-hero"><p className="reading-kicker">ProBoy-MD / {doc.group}</p><h1>{doc.title}</h1><p>{doc.intro}</p><p className="reading-meta">Source reviewed <time dateTime="2026-11-07">2026-11-07</time> / Commit <a href={`${botRepo}/tree/${botAuditCommit}`} target="_blank" rel="noopener noreferrer">{botAuditCommit.slice(0, 8)}</a></p></header>
      {slug === "documentation-home" && <p className="reading-callout"><strong>Start here:</strong> This source audit found a missing startup file at the checked revision. Read <a href={urlFor("installation")} onClick={onLink}>installation and setup caveats</a> before attempting deployment.</p>}
      <div className="reading-body">{doc.sections.map(s => <section key={s.heading}><h2 id={anchor(s.heading)}>{s.heading}</h2><p>{s.text}</p>{s.code && <CodeCopy code={s.code} />}</section>)}
        <section><h2>Verify in the source</h2><p>These files or directories are the evidence for this chapter at the audited commit. Check their latest version before applying operational guidance.</p><ul className="reading-links">{(sourcePaths[slug] || []).map(f => <li key={f}><a href={`${botRepo}/${f.includes(".") ? "blob" : "tree"}/${botAuditCommit}/${f}`} target="_blank" rel="noopener noreferrer">{f}</a></li>)}</ul></section>
        <section><h2>Continue exploring</h2><p>Check the <a href={botRepo} target="_blank" rel="noopener noreferrer" onClick={() => track("docs_to_github", { chapter: slug })}>real ProBoy-MD repository</a> for the latest code. The <a href="/proboy-md#commands" onClick={() => track("docs_to_playground", { chapter: slug })}>command directory and illustrative playground</a> do not connect to a live WhatsApp account. {slug === "pairing" && <>The <a href="https://proboy-md.gt.tc/" target="_blank" rel="noopener noreferrer">pairing site</a> is a separate external service; verify its privacy handling before using it. </>}{doc.related && <>Read the related <a href={`/blog/${doc.related}`} onClick={onLink}>engineering article</a>.</>}</p></section>
      </div></article>
      <nav className="reading-next" aria-label="Documentation navigation">{i > 0 && <a href={urlFor(botDocs[i-1].slug)} onClick={onLink}>Previous: {botDocs[i-1].title}</a>}{i < botDocs.length - 1 && <a href={urlFor(botDocs[i+1].slug)} onClick={onLink}>Next: {botDocs[i+1].title}</a>}</nav>
      {slug === "documentation-home" && <div className="reading-end"><h2>From the journal</h2>{articles.slice(0, 3).map(a => <p key={a.slug}><a href={`/blog/${a.slug}`} onClick={onLink}>{a.title}</a></p>)}<p><a href="/press" onClick={onLink}>Press kit and verified project facts</a></p><p><a href="/mentions" onClick={onLink}>Mentions and publications</a></p><p><a href="/contact" onClick={(e) => { track("contact_cta", { from: "docs" }); onLink(e); }}>Contact Shahan about development work</a></p></div>}
    </div></div>
  </div>;
}