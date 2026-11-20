import { useSyncExternalStore } from "react";
import { info, site } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, useSeo } from "../lib/seo";
import { Crumbs } from "../components/Reading";
import { getConsent, setConsent, subscribeConsent } from "../lib/collector";
import { useSiteConfig } from "../lib/siteConfig";
import "./reading.css";

const path = "/privacy";

export default function Privacy() {
  useSeo({
    title: "Privacy & Analytics | ProBoy — Shahan Ali",
    description:
      "How ProBoy (Shahan Ali) handles visitor data: cookie-free, aggregate first-party analytics with opt-out, no IP storage and no advertising trackers.",
    path,
    jsonLd: [
      breadcrumbLd([
        ["Home", "/"],
        ["Privacy & analytics", path],
      ]),
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Privacy & Analytics — ProBoy",
        url: `${site}${path}`,
        isPartOf: { "@id": `${site}/#website` },
        about: { "@id": `${site}/#person` },
      },
    ],
  });
  const cfg = useSiteConfig();
  const consent = useSyncExternalStore(subscribeConsent, getConsent, () => "unset" as const);

  return (
    <div className="reading-shell">
      <Crumbs items={[["Home", "/"], ["Privacy & analytics", path]]} />
      <header className="reading-hero">
        <p className="reading-kicker">Privacy</p>
        <h1>Privacy &amp; analytics.</h1>
        <p>
          ProBoy is the portfolio of {info.name}. This page explains, in plain language, what the site measures, what
          it never collects, and how you can opt out.
        </p>
      </header>
      <div className="reading-columns">
        <div className="reading-body">
          <section aria-labelledby="what">
            <h2 id="what">What is measured</h2>
            <p>
              When the site owner has analytics switched on, the site records anonymous, aggregate counters: which page
              was viewed, the website that referred you (domain only), your device type, browser and operating system
              family, and — only if the hosting platform supplies it — your country. Custom events such as clicking a
              contact link are counted by name only.
            </p>
            <p>
              Analytics is currently <strong>{cfg.analytics.enabled ? "ON" : "OFF"}</strong>
              {cfg.analytics.enabled ? ` (${cfg.analytics.consentMode === "optin" ? "opt-in: nothing is sent until you accept" : "notice with opt-out"})` : " — nothing is being collected"}.
            </p>
          </section>
          <section aria-labelledby="never">
            <h2 id="never">What is never collected</h2>
            <ul>
              <li>No cookies and no advertising or cross-site trackers.</li>
              <li>No IP addresses, user-agent strings or precise location are stored.</li>
              <li>No form contents, messages, passwords, keystrokes or payment details.</li>
              <li>No fingerprinting. Daily-unique counts use a salted hash that rotates every day, so visits cannot be linked across days.</li>
            </ul>
          </section>
          <section aria-labelledby="signals">
            <h2 id="signals">Your choices</h2>
            <p>
              Browser “Do Not Track” and “Global Privacy Control” signals are respected automatically — no events are
              sent when either is active. You can also decide here:
            </p>
            <p>
              Current choice: <strong>{consent === "unset" ? "not set" : consent === "granted" ? "allowed" : "opted out"}</strong>
            </p>
            <p style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="button" className="pb-btn-solid" onClick={() => setConsent("granted")}>Allow analytics</button>
              <button type="button" className="pb-btn-ghost" onClick={() => setConsent("denied")}>Opt out</button>
            </p>
            <p>
              Your choice (and an anonymous “returning visitor” flag) is stored only in your own browser and can be
              cleared at any time by clearing site data.
            </p>
          </section>
          <section aria-labelledby="contact-priv">
            <h2 id="contact-priv">Questions</h2>
            <p>
              Contact <a href={`mailto:${info.email}`}>{info.email}</a> or use the <a href="/contact" onClick={onLink}>contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
