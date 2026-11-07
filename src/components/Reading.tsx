import { useState } from "react";
import { onLink } from "../lib/router";
import { track } from "../lib/measure";

export function Crumbs({ items }: { items: [string, string][] }) {
  return <nav className="reading-crumbs" aria-label="Breadcrumb"><ol>{items.map(([label, path], i) => <li key={path}>{i > 0 && <span aria-hidden="true">/</span>}{i === items.length - 1 ? <span aria-current="page">{label}</span> : <a href={path} onClick={onLink}>{label}</a>}</li>)}</ol></nav>;
}

export function CodeCopy({ code }: { code: string }) {
  const [status, setStatus] = useState("Copy code");
  const copy = async () => { try { await navigator.clipboard.writeText(code); setStatus("Copied"); track("copy_code"); } catch { setStatus("Copy failed; select the text instead"); } window.setTimeout(() => setStatus("Copy code"), 2400); };
  return <div className="reading-code"><div className="reading-code-top"><span>Example</span><button type="button" onClick={copy} aria-label="Copy example code">{status}</button></div><pre><code>{code}</code></pre><span className="sr-only" role="status" aria-live="polite">{status === "Copy code" ? "" : status}</span></div>;
}

export function CopyText({ value, label, event }: { value: string; label: string; event?: string }) {
  const [status, setStatus] = useState("Copy");
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setStatus("Copied"); if (event) track(event); }
    catch { setStatus("Copy failed; select the text instead"); }
    window.setTimeout(() => setStatus("Copy"), 2400);
  };
  return <button type="button" className="reading-copy" onClick={copy} aria-label={`${label} — copy to clipboard`}>{status}</button>;
}

export function LinkList({ links }: { links: { label: string; href: string }[] }) {
  return <ul className="reading-links">{links.map(l => <li key={l.href}><a href={l.href} onClick={onLink} target={l.href.startsWith("http") ? "_blank" : undefined} rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}>{l.label}</a></li>)}</ul>;
}
