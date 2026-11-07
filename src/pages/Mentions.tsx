import { site } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, useSeo } from "../lib/seo";
import { track } from "../lib/measure";
import { Crumbs } from "../components/Reading";
import { mentionPolicy, ownedProfiles, verifiedMentions } from "../data/mentions";
import "./reading.css";

const path = "/mentions";

export default function Mentions() {
  useSeo({
    title: "Mentions & Publications | Shahan Ali (PROBOY)",
    description:
      "Independently published mentions, repository references and community contributions about Shahan Ali (PROBOY). Only verified third-party publications are listed as independent coverage.",
    path,
    jsonLd: [
      breadcrumbLd([
        ["Home", "/"],
        ["Mentions & publications", path],
      ]),
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Mentions and publications about Shahan Ali (PROBOY)",
        url: `${site}${path}`,
        description:
          "Verified third-party publications and community contributions, listed with publication date and canonical URL.",
        mainEntity: { "@id": `${site}/#person` },
        dateModified: "2026-11-07",
      },
    ],
  });

  return (
    <div className="reading-shell">
      <Crumbs items={[["Home", "/"], ["Mentions & publications", path]]} />

      <header className="reading-hero">
        <p className="reading-kicker">Third-party record</p>
        <h1>Mentions &amp; publications.</h1>
        <p>
          This page lists outside coverage of the work: articles written by other people, community answers, project
          listings, guest articles and videos. Only entries that a third party has actually published appear here, each
          with its date and canonical link. Owned profiles are listed separately and are clearly not independent
          coverage.
        </p>
        <p className="reading-meta">
          <a href="/press" onClick={onLink}>Press kit and brand facts</a> / <a href="/about" onClick={onLink}>About</a> /{" "}
          <a href="/projects" onClick={onLink}>Projects</a> / <a href="/blog" onClick={onLink}>Blog</a>
        </p>
      </header>

      <div className="reading-columns">
        <div className="reading-body">
          <section aria-labelledby="independent-heading">
            <h2 id="independent-heading">Independent mentions</h2>
            {verifiedMentions.length === 0 ? (
              <div className="reading-empty">
                <h3>No independently published mentions yet</h3>
                <p>
                  As of the last review, no third-party publication, community answer or editorial feature about this
                  work has been published. This section stays empty on purpose: it fills up only when someone else
                  publishes something, and the entry is verified against the live URL before it is added. A submission or
                  a planned pitch is not a mention.
                </p>
                <p>
                  If you have written about <a href="/projects/proboy-md" onClick={onLink}>ProBoy-MD</a> or published
                  something that references this work, send the link and it can be checked and listed.
                </p>
                <p>
                  <a className="reading-cta" href="mailto:shahanali.dev@gmail.com?subject=Verification%20of%20a%20mention">Report a published mention</a>
                </p>
              </div>
            ) : (
              <ul className="press-mentions">
                {verifiedMentions.map(m => (
                  <li key={m.id}>
                    <span className="press-mention-meta">{m.publication} / {m.type} / <time dateTime={m.date}>{m.date}</time></span>
                    <h3><a href={m.url} target="_blank" rel="noopener noreferrer">{m.title}</a></h3>
                    <p>{m.summary}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="owned-heading">
            <h2 id="owned-heading">Owned and controlled profiles</h2>
            <p>
              These are real accounts, but they are controlled by Shahan, so they are not independent mentions. They are
              listed so a reader can tell the difference between a self-published page and outside coverage.
            </p>
            <ul className="press-profiles">
              {ownedProfiles.map(p => (
                <li key={p.id}>
                  <div>
                    <span className="press-fact-value">{p.platform} — {p.handle}</span>
                    <span className="press-fact-note">{p.purpose}</span>
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("mentions_profile_click", { profile: p.id })}
                  >
                    Visit profile
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="policy-heading">
            <h2 id="policy-heading">How entries are verified</h2>
            <ul className="reading-links">{mentionPolicy.map(p => <li key={p}>{p}</li>)}</ul>
            <p>
              This policy exists because &quot;featured in&quot; claims are easy to make and hard to verify. If an entry
              cannot be opened and read, it does not go on this page. Questions about a listing can be sent to{" "}
              <a href="mailto:shahanali.dev@gmail.com">shahanali.dev@gmail.com</a>.
            </p>
          </section>

          <section aria-labelledby="proof-heading">
            <h2 id="proof-heading">Where the work itself is verifiable</h2>
            <p>
              Independent coverage is one signal. Verifiable work is a stronger one, and it is public today:
            </p>
            <ul className="reading-links">
              <li><a href="/projects/proboy-md" onClick={onLink}>ProBoy-MD project page</a> — scope, features and honest limitations.</li>
              <li><a href="/proboy-md/docs" onClick={onLink}>ProBoy-MD documentation centre</a> — 30 chapters written against a pinned source commit.</li>
              <li><a href="/blog" onClick={onLink}>Engineering blog</a> — source-checked articles on bot architecture, React SEO and accessibility.</li>
              <li><a href="/demos" onClick={onLink}>Interactive demos</a> — working browser-based tools built with sample data.</li>
              <li><a href="/press" onClick={onLink}>Press kit</a> — approved bios, brand facts and asset links.</li>
            </ul>
            <p>
              <a className="reading-cta" href="/contact" onClick={(e) => { track("contact_cta", { from: "mentions" }); onLink(e); }}>
                Get in touch about a project
              </a>
            </p>
          </section>
        </div>

        <aside className="reading-toc" aria-label="On this page">
          <strong>On this page</strong>
          <a href="#independent-heading">Independent mentions</a>
          <a href="#owned-heading">Owned profiles</a>
          <a href="#policy-heading">Verification policy</a>
          <a href="#proof-heading">Verifiable work</a>
          <a href="/press" onClick={onLink}>Press kit</a>
        </aside>
      </div>
    </div>
  );
}
