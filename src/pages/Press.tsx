import { site } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, useSeo } from "../lib/seo";
import { track } from "../lib/measure";
import { CopyText, Crumbs, LinkList } from "../components/Reading";
import { AUDIT_DATE, bios, BOT_REPO, contactChannels, factSheet, pressAssets, projectFacts } from "../data/press";
import "./reading.css";

const path = "/press";

export default function Press() {
  useSeo({
    title: "Press Kit & Brand Facts | Shahan Ali (PROBOY)",
    description:
      "Approved bios, verified brand facts, project notes and asset links for Shahan Ali (PROBOY), full-stack developer from Burewala, Pakistan. Facts checked against public source.",
    path,
    jsonLd: [
      breadcrumbLd([
        ["Home", "/"],
        ["Press kit", path],
      ]),
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Press kit and brand facts",
        url: `${site}${path}`,
        description: "Approved bios, verified brand facts and asset links for Shahan Ali (PROBOY).",
        mainEntity: { "@id": `${site}/#person` },
        dateModified: AUDIT_DATE,
      },
    ],
  });

  const bot = projectFacts["ProBoy-MD"];
  const assetLinks = pressAssets.map(a => ({ label: `${a.label} — ${a.path}`, href: `${site}${a.path}` }));

  return (
    <div className="reading-shell">
      <Crumbs items={[["Home", "/"], ["Press kit", path]]} />

      <header className="reading-hero">
        <p className="reading-kicker">Press &amp; verification</p>
        <h1>Press kit and brand facts.</h1>
        <p>
          Approved bios, verified facts and asset links for <a href="/about" onClick={onLink}>Shahan Ali</a> (PROBOY), a
          full-stack developer from Burewala, Punjab, Pakistan. Everything below is either supplied by Shahan or checked
          against public source on {AUDIT_DATE}. Nothing here is aspirational, and no metric on this page is estimated.
        </p>
        <p className="reading-meta">
          <a href="/mentions" onClick={onLink}>Independent mentions</a> / <a href="/projects" onClick={onLink}>Projects</a> /{" "}
          <a href="/proboy-md/docs" onClick={onLink}>ProBoy-MD documentation</a> / <a href="/blog" onClick={onLink}>Engineering blog</a>
        </p>
      </header>

      <div className="reading-columns">
        <div className="reading-body">
          <section aria-labelledby="bios-heading">
            <h2 id="bios-heading">Approved bios</h2>
            <p>
              Use these verbatim if you need a description of the person. Longer versions name concrete work; shorter
              ones stay inside a paragraph. Each block can be copied in one click.
            </p>

            <article className="press-bio">
              <header><h3>Short bio (about 50 words)</h3><CopyText value={bios.short} label="Short bio" event="press_bio_copy" /></header>
              <p>{bios.short}</p>
            </article>

            <article className="press-bio">
              <header><h3>Medium bio (about 100 words)</h3><CopyText value={bios.medium} label="Medium bio" event="press_bio_copy" /></header>
              <p>{bios.medium}</p>
            </article>

            <article className="press-bio">
              <header><h3>Detailed bio (about 200 words)</h3><CopyText value={bios.detailed} label="Detailed bio" event="press_bio_copy" /></header>
              <p>{bios.detailed}</p>
            </article>
          </section>

          <section aria-labelledby="facts-heading">
            <h2 id="facts-heading">Brand fact sheet</h2>
            <p>
              Each row is a claim that can be checked. The note column explains the exact scope, so a description does not
              drift into something stronger than the evidence supports.
            </p>
            <dl className="press-facts">
              {Object.values(factSheet).map(f => (
                <div key={f.label} className="press-fact">
                  <dt>{f.label}</dt>
                  <dd>
                    <span className="press-fact-value">{f.value}</span>
                    <span className="press-fact-note">{f.note}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <h3>Identity disambiguation</h3>
            <p>
              Several people share the name Shahan Ali. This site refers to one of them: the developer behind the PROBOY
              brand who works from Burewala, Punjab, Pakistan and maintains the ProBoy-MD repository. This page makes no
              claim about any other person with the same name, and requests the same restraint in return.
            </p>
          </section>

          <section aria-labelledby="probot-heading">
            <h2 id="probot-heading">Project note: ProBoy-MD</h2>
            <p>{bot.summary}</p>
            <h3>Verified in the public repository</h3>
            <ul className="reading-links">{bot.verified.map(v => <li key={v}>{v}</li>)}</ul>
            <h3>Known limitations, stated plainly</h3>
            <ul className="reading-links">{bot.caveats.map(v => <li key={v}>{v}</li>)}</ul>
            <p>
              Source of record: <a href={BOT_REPO} target="_blank" rel="noopener noreferrer">github.com/proboy315/ProBoy-MD</a>.
              The site&apos;s own write-up is in the <a href="/proboy-md/docs" onClick={onLink}>documentation centre</a>.
            </p>
          </section>

          <section aria-labelledby="assets-heading">
            <h2 id="assets-heading">Assets</h2>
            <p>Images and icons that can be used when writing about this work.</p>
            <ul className="press-assets">
              {pressAssets.map(a => (
                <li key={a.id}>
                  <div>
                    <span className="press-fact-value">{a.label}</span>
                    <span className="press-fact-note">{a.note}</span>
                  </div>
                  <span className={`press-asset-status ${a.status === "published" ? "is-ok" : "is-pending"}`}>
                    {a.status === "published" ? "Available" : "Pending file restore"}
                  </span>
                  <a href={a.path} target="_blank" rel="noopener noreferrer">{a.path}</a>
                </li>
              ))}
            </ul>
            <LinkList links={assetLinks} />
          </section>

          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading">Contact for verification</h2>
            <p>
              If you are verifying something on this page, or you have published something about this work, email first and
              the entry can be checked before it appears anywhere on this site.
            </p>
            <ul className="reading-links">
              {contactChannels.map(c => (
                <li key={c.label}>
                  <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">{c.label}: {c.value}</a>
                  <span className="press-fact-note"> {c.note}</span>
                </li>
              ))}
            </ul>
            <p>
              <a
                className="reading-cta"
                href="/contact"
                onClick={(e) => { track("contact_cta", { from: "press" }); onLink(e); }}
              >
                Open the contact page
              </a>
            </p>
          </section>
        </div>

        <aside className="reading-toc" aria-label="On this page">
          <strong>On this page</strong>
          <a href="#bios-heading">Approved bios</a>
          <a href="#facts-heading">Brand fact sheet</a>
          <a href="#probot-heading">Project note: ProBoy-MD</a>
          <a href="#assets-heading">Assets</a>
          <a href="#contact-heading">Contact for verification</a>
          <a href="/mentions" onClick={onLink}>Mentions &amp; publications</a>
          <a href="/about" onClick={onLink}>About page</a>
        </aside>
      </div>
    </div>
  );
}
