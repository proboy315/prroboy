// Lightweight interaction effects (no libraries): pointer tilt + specular highlight for cards.
// One delegated listener, rAF-throttled, only transform/opacity are animated (GPU friendly),
// disabled for touch devices, reduced-motion users, and when the admin turns motion off.
let started = false;

export function initEffects() {
  if (started || typeof window === "undefined") return;
  started = true;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  const SELECTOR = "[data-tilt], .card3d, .lg-card";
  let active: HTMLElement | null = null;
  let raf = 0;
  let last: PointerEvent | null = null;

  const reset = (el: HTMLElement | null) => {
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.classList.remove("is-tilting");
  };

  const frame = () => {
    raf = 0;
    const e = last;
    if (!e) return;
    const el = (e.target as Element | null)?.closest?.(SELECTOR) as HTMLElement | null;
    if (el !== active) { reset(active); active = el; }
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const max = parseFloat(getComputedStyle(root).getPropertyValue("--pb-tilt")) || 0;
    el.classList.add("is-tilting");
    el.style.setProperty("--ry", `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  };

  document.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse" || !fine.matches || reduce.matches || root.dataset.motion === "off") return;
      last = e;
      if (!raf) raf = requestAnimationFrame(frame);
    },
    { passive: true }
  );
  document.addEventListener("pointerleave", () => { reset(active); active = null; }, { passive: true });
  window.addEventListener("blur", () => { reset(active); active = null; });
}

/** Replays a short fade/rise when the SPA route changes (opacity + transform only, no layout shift). */
export function playPageTransition() {
  const main = document.getElementById("main");
  if (!main || document.documentElement.dataset.motion === "off") return;
  main.classList.remove("pb-enter");
  void main.offsetWidth; // restart the animation
  main.classList.add("pb-enter");
}
