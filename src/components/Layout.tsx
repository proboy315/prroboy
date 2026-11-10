import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { info, services, socials } from "../lib/data";
import { onLink } from "../lib/router";
import "../styles/navigation.css";

export function Img({ src, alt, className = "", label }: { src: string; alt: string; className?: string; label?: string }) {
  const [bad, setBad] = useState(!src);
  if (bad)
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative overflow-hidden grid place-items-center content-center gap-3 px-4 text-center bg-[radial-gradient(ellipse_at_50%_0%,rgba(220,38,38,.18),transparent_70%),linear-gradient(135deg,#150a0d,#0b0b0f)] ${className}`}
      >
        <svg viewBox="0 0 40 32" className="w-10 h-8 opacity-60" aria-hidden="true">
          <path d="M10 2h26l-4 8H14zM6 12h22l-3 7H12l-5 11H0z" fill="#e11d2e" />
        </svg>
        <span className="max-w-full text-[11px] leading-snug tracking-[0.22em] uppercase text-zinc-500 break-words">
          {label || info.brand}
        </span>
      </div>
    );
  return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setBad(true)} className={`object-cover ${className}`} />;
}

export function Logo() {
  return (
    <a href="/" onClick={onLink} className="flex items-center gap-3 shrink-0" aria-label={`${info.brand} home`}>
      <svg viewBox="0 0 40 32" className="w-11 h-9" aria-hidden="true">
        <path d="M10 2h26l-4 8H14zM6 12h22l-3 7H12l-5 11H0z" fill="#e11d2e" />
      </svg>
      <span className="text-2xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
        {info.brand}
      </span>
    </a>
  );
}

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] || "");
  const signature = ids.join("|");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      const threshold = Math.min(innerHeight * 0.3, 180);
      const sections = signature
        .split("|")
        .map((id) => document.getElementById(id))
        .filter((element): element is HTMLElement => Boolean(element))
        .map((element) => ({ id: element.id, top: element.getBoundingClientRect().top }))
        .sort((a, b) => a.top - b.top);
      setActive(sections.filter((section) => section.top <= threshold).at(-1)?.id || sections[0]?.id || "");
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, [signature]);
  return active;
}

function isRouteActive(currentPath: string, href: string) {
  if (href === "/") return currentPath === "/";
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function Header({
  currentPath,
  menuOpen,
  setMenuOpen,
}: {
  currentPath: string;
  menuOpen: boolean;
  setMenuOpen: (b: boolean) => void;
}) {
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);
  const focused = useRef(false);
  useEffect(() => {
    const f = () => {
      const y = scrollY;
      if (menuOpen || focused.current || y < 120) setHidden(false);
      else if (y > last.current + 6) setHidden(true);
      else if (y < last.current - 6) setHidden(false);
      last.current = y;
    };
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, [menuOpen]);
  return (
    <header
      onFocus={() => {
        focused.current = true;
        setHidden(false);
      }}
      onBlur={(event) => {
        focused.current = event.currentTarget.contains(event.relatedTarget as Node | null);
      }}
      className={`site-header${hidden && !menuOpen ? " is-hidden" : ""}`}
    >
      <div className="header-inner page-container">
        <Logo />
        <nav aria-label="Primary" className="header-nav">
          {info.nav
            .filter((n) => n.header)
            .map((n) => {
              const active = isRouteActive(currentPath, n.href);
              return (
                <a
                  key={n.id}
                  href={n.href}
                  onClick={onLink}
                  aria-current={active ? "page" : undefined}
                  className={`relative pb-2 transition-colors hover:text-red-500 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-red-500 after:transition-all ${
                    active ? "text-red-500 after:w-full" : "text-zinc-200 after:w-0"
                  }`}
                >
                  {n.label}
                </a>
              );
            })}
        </nav>
        <a href="/contact" onClick={onLink} className="header-contact">
          Let&apos;s Talk <Icon name="arrow" className="w-4 h-4" />
        </a>
        <button
          className="header-menu"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation"
          aria-expanded={menuOpen}
          aria-controls="drawer"
        >
          <Icon name="menu" className="w-7 h-7" />
        </button>
      </div>
    </header>
  );
}

const HOME_RAIL_ITEMS = [
  { id: "home", label: "Home", icon: "home", href: "/#home" },
  { id: "about", label: "About", icon: "user", href: "/#about" },
  { id: "services", label: "Services", icon: "layers", href: "/#services" },
  { id: "projects", label: "Projects", icon: "folder", href: "/#projects" },
  { id: "demos", label: "Demos", icon: "terminal", href: "/#demos" },
  { id: "certificates", label: "Credential", icon: "award", href: "/#certificates" },
  { id: "qa", label: "FAQ", icon: "help", href: "/#qa" },
  { id: "contact", label: "Contact", icon: "mail", href: "/#contact" },
];

export function Sidebar({ active }: { active: string }) {
  const [expanded, setExpanded] = useState(false);
  const [hint, setHint] = useState<{ label: string; top: number } | null>(null);
  const showHint = (element: HTMLAnchorElement, label: string) => {
    const bounds = element.getBoundingClientRect();
    setHint({ label, top: Math.min(innerHeight - 38, Math.max(12, bounds.top + bounds.height / 2)) });
  };
  return (
    <aside
      aria-label="Section navigation"
      className={`section-rail${expanded ? " is-expanded" : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setExpanded(false);
          setHint(null);
        }
      }}
    >
      <div className="rail-shell">
        <nav id="section-links" className="rail-links" aria-label="Homepage sections" onScroll={() => setHint(null)}>
          {HOME_RAIL_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(event) => {
                setHint(null);
                onLink(event);
              }}
              aria-label={item.label}
              aria-current={active === item.id ? "location" : undefined}
              className={`rail-link${active === item.id ? " is-active" : ""}`}
              onMouseEnter={(event) => showHint(event.currentTarget, item.label)}
              onMouseLeave={() => setHint(null)}
              onFocus={(event) => showHint(event.currentTarget, item.label)}
              onBlur={() => setHint(null)}
            >
              <Icon name={item.icon} className="w-[18px] h-[18px] shrink-0" />
              <span className="rail-label" aria-hidden={!expanded}>
                {item.label}
              </span>
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="rail-toggle"
          aria-controls="section-links"
          onClick={() => {
            setExpanded((value) => !value);
            setHint(null);
          }}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Icon name="chevron" className={`w-4 h-4 transition-transform ${expanded ? "" : "rotate-180"}`} />
          <span className="rail-label" aria-hidden={!expanded}>
            Collapse
          </span>
        </button>
      </div>
      {hint && !expanded && (
        <span role="tooltip" className="rail-tooltip" style={{ top: hint.top }}>
          {hint.label}
        </span>
      )}
    </aside>
  );
}

export function Drawer({
  open,
  setOpen,
  currentPath,
}: {
  open: boolean;
  setOpen: (b: boolean) => void;
  currentPath: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("button,a")?.focus();
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>("a,button");
        const first = f[0],
          lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    addEventListener("keydown", k);
    const desktop = matchMedia("(min-width: 1100px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", resize);
    return () => {
      document.body.style.overflow = previousOverflow;
      removeEventListener("keydown", k);
      desktop.removeEventListener("change", resize);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [open, setOpen]);
  return (
    <div className={`mobile-drawer fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open} inert={!open}>
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={() => setOpen(false)}
      />
      <div
        id="drawer"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`drawer-panel ${open ? "" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-5 shrink-0">
          <span className="font-extrabold tracking-widest">{info.brand}</span>
          <button onClick={() => setOpen(false)} aria-label="Close navigation" tabIndex={open ? 0 : -1}>
            <Icon name="close" className="w-7 h-7" />
          </button>
        </div>
        <nav className="drawer-links" aria-label="Mobile navigation">
          {info.nav.map((n) => {
            const active = isRouteActive(currentPath, n.href);
            return (
              <a
                key={n.id}
                href={n.href}
                tabIndex={open ? 0 : -1}
                onClick={(e) => {
                  setOpen(false);
                  onLink(e);
                }}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base shrink-0 ${
                  active ? "bg-red-600/15 text-red-500" : "text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Icon name={n.icon} /> {n.label}
              </a>
            );
          })}
        </nav>
        <a
          href="/contact"
          tabIndex={open ? 0 : -1}
          onClick={(e) => {
            setOpen(false);
            onLink(e);
          }}
          className="mt-5 shrink-0 flex justify-center items-center gap-2 rounded-full py-3.5 bg-red-600 font-medium"
        >
          Let&apos;s Talk <Icon name="arrow" className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export function Socials() {
  return (
    <ul className="flex flex-wrap gap-3">
      {socials.map((s) => (
        <li key={s.id}>
          <a
            href={s.url}
            aria-label={s.label}
            target={s.url.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer me"
            className="w-11 h-11 grid place-items-center rounded-xl bg-white/[.06] border border-white/15 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] text-zinc-200 hover:bg-red-600 hover:border-red-600 hover:text-white hover:-translate-y-0.5 transition"
          >
            <Icon name={s.id} className="w-5 h-5" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/15 mt-24 pb-[env(safe-area-inset-bottom)] bg-white/[0.02] backdrop-blur-xl">
      <div className="page-container py-14 grid gap-10 md:grid-cols-[1.35fr_1fr_1.15fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 text-zinc-400 max-w-sm text-sm leading-relaxed">
            {info.name} ({info.brand}) — {info.role}, AI &amp; WhatsApp Bot Architect, and Shopify Expert based in{" "}
            {info.location}.
          </p>
          <p className="mt-2 text-xs text-zinc-500">Aliases: {info.aliases.join(" · ")}</p>
        </div>

        <nav aria-label="Footer pages">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 font-semibold">Pages</h2>
          <ul className="space-y-2.5 text-sm">
            {info.nav.map((n) => (
              <li key={n.id}>
                <a href={n.href} onClick={onLink} className="text-zinc-300 hover:text-red-500 transition">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="/proboy-md/docs" onClick={onLink} className="text-sm text-zinc-300 hover:text-red-500 mt-3 block">ProBoy-MD documentation</a>
          <a href="/press" onClick={onLink} className="text-sm text-zinc-300 hover:text-red-500 mt-2 block">Press kit &amp; brand facts</a>
          <a href="/mentions" onClick={onLink} className="text-sm text-zinc-300 hover:text-red-500 mt-2 block">Mentions &amp; publications</a>
        </nav>

        <nav aria-label="Footer services">
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 font-semibold">Services</h2>
          <ul className="space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <a href={`/services/${s.slug}`} onClick={onLink} className="text-zinc-300 hover:text-red-500 transition">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-500 mb-4 font-semibold">Connect</h2>
          <a href={`mailto:${info.email}`} className="text-sm text-zinc-300 hover:text-red-500 break-all block">
            {info.email}
          </a>
          <a
            href={info.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-300 hover:text-red-500 mt-1.5 block"
          >
            {info.phone}
          </a>
          <p className="text-sm text-zinc-400 mt-1.5">{info.location}</p>
          <div className="mt-5">
            <Socials />
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-zinc-500 px-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <span>© {new Date().getFullYear()} {info.name} · {info.brand}. Designed and engineered by {info.name} ({info.handle}).</span>
        <a
          href="/admin"
          onClick={onLink}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-white hover:border-red-500/40 transition"
        >
          <Icon name="lock" className="w-3 h-3" /> Admin Panel
        </a>
      </div>
    </footer>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => setShow(scrollY > 800);
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  return (
    <button
      onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-30 w-11 h-11 grid place-items-center rounded-full bg-red-600 shadow-[0_0_25px_rgba(220,38,38,.45)] hover:bg-red-500 transition ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <Icon name="up" />
    </button>
  );
}
