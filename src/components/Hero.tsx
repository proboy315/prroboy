import { useEffect, useRef, useState } from "react";
import type { CSSProperties, DragEvent } from "react";
import { info } from "../lib/data";
import { onLink } from "../lib/router";
import { readLocalPortrait, saveLocalPortrait, validatePortrait } from "../lib/portrait";
import type { LocalPortrait } from "../lib/portrait";
import Icon from "./Icon";
import { Socials } from "./Layout";
import "../styles/hero.css";

function Portrait() {
  const input = useRef<HTMLInputElement>(null);
  const [local, setLocal] = useState<LocalPortrait>();
  const [localUrl, setLocalUrl] = useState("");
  const [failedSource, setFailedSource] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  // A published portrait file in the project always wins over a browser-only preview.
  const publishedSource = info.profileImage;
  const source = publishedSource || localUrl;
  const usable = Boolean(source && source !== failedSource);

  useEffect(() => {
    if (publishedSource) return;
    let cancelled = false;
    readLocalPortrait().then((value) => {
      if (!cancelled && value?.file instanceof Blob) setLocal(value);
    }).catch(() => { /* A private browser may disable local storage. */ });
    return () => { cancelled = true; };
  }, [publishedSource]);

  useEffect(() => {
    if (!local) return;
    const url = URL.createObjectURL(local.file);
    setLocalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [local]);

  async function choose(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const portrait = await validatePortrait(file);
      setLocal(portrait);
      setFailedSource("");
      try {
        await saveLocalPortrait(portrait);
      } catch {
        setError("Preview ready. This browser cannot remember the image after a refresh.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not open the image.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void choose(event.dataTransfer.files[0]);
  }

  const style = {
    "--portrait-position": info.portrait.objectPosition,
  } as CSSProperties;

  return (
    <div className={`portrait-stage${usable ? " has-portrait" : " is-pending"}${dragging ? " is-dragging" : ""}`}
      onDragOver={(event) => { if (!publishedSource) { event.preventDefault(); setDragging(true); } }}
      onDragLeave={() => setDragging(false)} onDrop={(event) => { if (!publishedSource) drop(event); }}>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif"
        aria-label="Select your portrait image" className="sr-only" tabIndex={-1}
        onChange={(event) => void choose(event.target.files?.[0])} />
      {usable ? (
        <div className="portrait-shadow">
          <img key={source} src={source} className="hero-portrait" style={style}
            alt={info.portrait.alt} width={local?.width || info.portrait.width}
            height={local?.height || info.portrait.height} loading="eager" fetchPriority="high"
            decoding="async" onError={() => setFailedSource(source)} />
        </div>
      ) : (
        <div className="portrait-missing">
          <span className="portrait-monogram" aria-hidden="true">P</span>
          <div className="portrait-upload">
            <p className="portrait-upload-title">{info.portrait.emptyTitle}</p>
            <p>{info.portrait.emptyDescription}</p>
            <button type="button" className="portrait-choose" disabled={busy} onClick={() => input.current?.click()}>
              <Icon name="image" className="w-4 h-4" />
              {busy ? "Opening image..." : info.portrait.chooseLabel}
              <Icon name="arrow" className="w-4 h-4" />
            </button>
            <small>{info.portrait.localNotice}</small>
          </div>
        </div>
      )}
      {localUrl && usable && !publishedSource && (
        <div className="portrait-preview-controls">
          <span>Local preview</span>
          <button type="button" onClick={() => input.current?.click()}>Change photo</button>
          <details>
            <summary>Publish this image</summary>
            <p>To make it visible to everyone, add the original file to your project and run <code>node scripts/set-portrait.mjs path/to/photo.jpg</code>, then rebuild. This preview is stored only in this browser.</p>
          </details>
        </div>
      )}
      {error && <p role="alert" className="portrait-error">{error}</p>}
    </div>
  );
}

function HeroArt() {
  return (
    <div className="hero-visual">
      <div className="hero-light" aria-hidden="true" />
      <svg viewBox="0 0 800 850" className="hero-orbits" aria-hidden="true">
        <defs>
          <linearGradient id="orbit-light" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#fb153d" stopOpacity="0.1" />
            <stop offset=".35" stopColor="#ff2954" stopOpacity=".8" />
            <stop offset=".7" stopColor="#34121c" stopOpacity=".4" />
            <stop offset="1" stopColor="#ef0036" stopOpacity=".65" />
          </linearGradient>
        </defs>
        <ellipse cx="408" cy="474" rx="358" ry="74" transform="rotate(-17 408 474)" fill="none" stroke="url(#orbit-light)" strokeWidth="2" />
        <ellipse cx="408" cy="479" rx="355" ry="72" transform="rotate(-17 408 479)" fill="none" stroke="url(#orbit-light)" strokeWidth=".6" />
      </svg>
      <Portrait />
      <ul className="hero-tech" aria-label="Core technologies">
        {info.skills.map((skill) => (
          <li key={skill.label}>
            <span className={`tech-symbol tech-${skill.icon}`}><Icon name={skill.icon} className="w-6 h-6" /></span>
            <span>{skill.label}</span>
          </li>
        ))}
      </ul>
      <div className="hero-code-object" aria-hidden="true">
        <svg viewBox="0 0 112 132" fill="none">
          <path d="M23 11 84 1 111 53 91 115 33 130 1 71Z" fill="#13121a" fillOpacity=".7" stroke="#5e4c5d" />
          <path d="m23 11 55 2 22 44-23 48-47 9L10 66Z" stroke="#c7bcc8" strokeOpacity=".45" />
          <path d="M23 11 10 66 1 71m29 43 3 16m44-25 14 10m9-58 11-4" stroke="#a490a2" strokeOpacity=".35" />
        </svg>
        <Icon name="code" className="code-symbol" />
      </div>
      <div className="hero-signature" aria-hidden="true">
        <span>{info.name}</span>
        <small>{info.motto.map((word, index) => <span key={word}>{index > 0 && <i>/</i>}{word}</span>)}</small>
      </div>
      <div className="hero-brand-object" aria-hidden="true">
        <svg className="brand-crown" viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="m5 10 15 13L32 4l14 19 13-13-7 30H12Z" />
          <ellipse cx="32" cy="41" rx="21" ry="5" />
        </svg>
        <span>{info.brand}</span>
      </div>
      <p className="hero-tagline"><span />{info.tagline[0]}<br />{info.tagline[1]}</p>
    </div>
  );
}

export default function Hero() {
  const heroServices = info.heroServices.flatMap((icon) => info.services.filter((service) => service.icon === icon));
  return (
    <section id="home" className="portfolio-hero" aria-labelledby="hero-name">
      <div className="hero-inner page-container">
        <HeroArt />
        <div className="hero-content">
          <p className="hero-availability"><span />{info.availability}</p>
          <p className="hero-greeting">{info.greeting}</p>
          <h1 id="hero-name"><span>{info.name.split(" ")[0]}</span> <em>{info.name.split(" ").slice(1).join(" ")}</em><span className="sr-only"> (ProBoy), full-stack developer, bot architect and Shopify expert</span></h1>
          <p className="hero-role">{info.role}</p>
          <p className="hero-specialties">{info.subtitles.map((title) => <span key={title}>{title}</span>)}</p>
          <p className="hero-description">{info.heroDescription}<strong>{info.heroEmphasis}</strong></p>
          <ul className="hero-services" aria-label="Explore development services">
            {heroServices.map((service) => (
              <li key={service.icon}>
                <a href={service.slug ? `/services/${service.slug}` : "/services"} onClick={onLink}>
                  <span className={`service-symbol tech-${service.icon}`}><Icon name={service.icon} className="w-6 h-6" /></span>
                  <span><b>{service.heroLabel || service.title}</b><small>{service.heroMeta || service.meta}</small></span>
                </a>
              </li>
            ))}
          </ul>
          <div className="hero-actions">
            <a className="hero-button primary" href="/projects" onClick={onLink}>View My Projects <Icon name="arrow" className="w-[18px] h-[18px]" /></a>
            {info.resume ? (
              <a className="hero-button secondary" href={info.resume} download>Download CV <Icon name="download" className="w-[18px] h-[18px]" /></a>
            ) : (
              <a className="hero-button secondary" href="/contact" onClick={onLink}>Get in Touch <Icon name="arrow" className="w-[18px] h-[18px]" /></a>
            )}
          </div>
          <dl className="hero-stats">
            {info.stats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
          </dl>
          <div className="hero-socials"><Socials /></div>
          <address className="hero-contactline">
            <span><Icon name="pin" className="w-3.5 h-3.5" />{info.location}</span>
            <a href={`mailto:${info.email}`}>{info.email}</a>
          </address>
        </div>
      </div>
    </section>
  );
}