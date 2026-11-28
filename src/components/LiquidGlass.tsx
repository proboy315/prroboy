import type { ReactNode, MouseEvent } from "react";

/**
 * Ambient multi-orb lighting field behind the page so Liquid Glass surfaces
 * refract subtle crimson and cool depth across every route.
 */
export function LiquidAmbient() {
  return (
    <div className="liquid-ambient-bg" aria-hidden="true">
      <div className="liquid-orb liquid-orb-1" />
      <div className="liquid-orb liquid-orb-2" />
      <div className="liquid-orb liquid-orb-3" />
    </div>
  );
}

/**
 * Interactive Liquid Glass card with pointer-tracking specular sheen.
 */
export function LiquidCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 100;
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 100;
    e.currentTarget.style.setProperty("--lg-x", `${x.toFixed(1)}%`);
    e.currentTarget.style.setProperty("--lg-y", `${y.toFixed(1)}%`);
  };

  return (
    <div onMouseMove={onMove} className={`lg-card ${className}`}>
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
