import { useEffect, useState } from "react";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import Icon from "./Icon";

/**
 * Ambient multi-orb + aurora + film-grain lighting field behind the page so
 * Liquid Glass surfaces refract subtle crimson and cool depth on every route.
 */
export function LiquidAmbient() {
  return (
    <div className="liquid-ambient-bg" aria-hidden="true">
      <div className="liquid-aurora" />
      <div className="liquid-orb liquid-orb-1" />
      <div className="liquid-orb liquid-orb-2" />
      <div className="liquid-orb liquid-orb-3" />
      <div className="liquid-orb liquid-orb-4" />
      <div className="liquid-orb liquid-orb-5" />
      <div className="liquid-noise" />
      <div className="liquid-vignette" />
    </div>
  );
}

/**
 * Interactive Liquid Glass card with pointer-tracking specular sheen
 * plus subtle 3D tilt physics (fine pointers only, motion-safe).
 */
export function LiquidCard({
  children,
  className = "",
  tilt = true,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / Math.max(1, rect.width);
    const py = (e.clientY - rect.top) / Math.max(1, rect.height);
    el.style.setProperty("--lg-x", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--lg-y", `${(py * 100).toFixed(1)}%`);
    if (
      tilt &&
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: fine)").matches &&
      !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      el.style.setProperty("--ry", `${((px - 0.5) * 5).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${((0.5 - py) * 5).toFixed(2)}deg`);
    }
  };

  const onLeave = (e: MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <div onMouseMove={onMove} onMouseLeave={onLeave} className={`lg-card ${className}`}>
      {children}
    </div>
  );
}

export function LiquidPill({
  children,
  crimson = false,
  className = "",
}: {
  children: ReactNode;
  crimson?: boolean;
  className?: string;
}) {
  return (
    <span className={`lg-pill ${crimson ? "lg-pill-crimson" : ""} ${className}`}>
      {children}
    </span>
  );
}

export function LiquidButton({
  children,
  variant = "glass",
  className = "",
  type = "button",
  disabled = false,
  onClick,
  title,
}: {
  children: ReactNode;
  variant?: "glass" | "primary";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`${variant === "primary" ? "lg-btn-primary" : "lg-btn"} ${className}`}
    >
      {children}
    </button>
  );
}

export function LiquidDock({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`lg-dock ${className}`}>{children}</div>;
}

export function LiquidModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md grid place-items-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`lg-surface w-full ${maxWidth} p-6 sm:p-7 relative my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-full bg-white/5 border border-white/15 hover:bg-white/15 grid place-items-center text-zinc-200 transition"
          >
            ✕
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

/** Butter-smooth count-up number (motion-safe). */
export function CountUp({
  to,
  duration = 1100,
  className = "",
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      setVal(to);
      return;
    }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return <span className={className}>{val.toLocaleString()}</span>;
}

/** Dashboard stat card with animated number + staggered entrance. */
export function LiquidStat({
  label,
  value,
  hint,
  icon = "chart",
  delay = 0,
  onOpen,
}: {
  label: string;
  value: number;
  hint?: string;
  icon?: string;
  delay?: number;
  onOpen?: () => void;
}) {
  return (
    <div
      onClick={onOpen}
      style={{ "--lg-d": `${delay}ms` } as CSSProperties}
      className={`lg-card lg-enter p-5 ${onOpen ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">{label}</p>
        <span className="w-9 h-9 grid place-items-center rounded-xl bg-red-500/15 border border-red-400/25 text-red-300 shadow-[0_0_18px_-4px_rgba(239,29,62,0.5)]">
          <Icon name={icon} className="w-4 h-4" />
        </span>
      </div>
      <p className="mt-2 text-[2rem] leading-none font-extrabold text-white tracking-tight">
        <CountUp to={value} />
      </p>
      {hint && <p className="mt-1.5 text-[11px] font-mono text-zinc-500 truncate">{hint}</p>}
      {onOpen && (
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
          Manage <Icon name="arrow" className="w-3.5 h-3.5" />
        </span>
      )}
    </div>
  );
}

export type ToastItem = {
  id: number;
  type: "ok" | "err" | "info";
  msg: string;
};

const TOAST_STYLE: Record<ToastItem["type"], { icon: string; border: string; glow: string; tint: string }> = {
  ok: {
    icon: "check",
    border: "rgba(52,211,153,0.5)",
    glow: "0 10px 30px -10px rgba(52,211,153,0.35)",
    tint: "rgba(52,211,153,0.16)",
  },
  err: {
    icon: "close",
    border: "rgba(244,63,94,0.55)",
    glow: "0 10px 30px -10px rgba(244,63,94,0.45)",
    tint: "rgba(244,63,94,0.16)",
  },
  info: {
    icon: "spark",
    border: "rgba(255,255,255,0.28)",
    glow: "0 10px 30px -12px rgba(0,0,0,0.8)",
    tint: "rgba(255,255,255,0.08)",
  },
};

/** Premium floating toast stack. */
export function Toasts({ items }: { items: ToastItem[] }) {
  if (!items.length) return null;
  return (
    <div
      className="fixed bottom-5 right-5 z-[90] flex flex-col gap-2.5 w-[min(92vw,370px)] pointer-events-none"
      aria-live="polite"
    >
      {items.map((t) => {
        const s = TOAST_STYLE[t.type];
        return (
          <div
            key={t.id}
            style={{ borderColor: s.border, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.22), ${s.glow}` }}
            className="lg-toast pointer-events-auto flex items-start gap-3 px-4 py-3.5 text-xs leading-relaxed text-zinc-100 lg-surface rounded-2xl"
          >
            <span
              style={{ background: s.tint, borderColor: s.border }}
              className="w-7 h-7 grid place-items-center rounded-full border shrink-0 mt-0.5"
            >
              <Icon name={s.icon} className="w-3.5 h-3.5" />
            </span>
            <span className="pt-1">{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
