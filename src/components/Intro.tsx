import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { info } from "../lib/data";

const cfg = info.introAnimation;
const KEY = "proboy-intro-seen";
const AHEAD = 45; // frames decoded ahead of the playhead
const BUFFER = 30; // frames required before playback starts

export function shouldShowIntro() {
  if (!cfg.enabled || cfg.policy === "never") return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    if (cfg.policy === "session") return !sessionStorage.getItem(KEY);
    if (cfg.policy === "once") return !localStorage.getItem(KEY);
  } catch { /* storage blocked */ }
  return true; // "always" — plays on every page load, including refresh
}

const frameUrl = (i: number) => `${cfg.directory}${cfg.framePrefix}${i}${cfg.frameExtension}`;

export default function Intro({ onDone }: { onDone: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const frames = useRef<(HTMLImageElement | null | undefined)[]>([]); // undefined = not requested, null = failed/released
  const t0 = useRef(0);
  const useAudio = useRef(false);
  const done = useRef(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "playing" | "leaving">("loading");
  const [muted, setMuted] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    audio.current?.pause();
    try { sessionStorage.setItem(KEY, "1"); localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setPhase("leaving");
    setTimeout(onDone, 550);
  };

  const load = (i: number) => new Promise<void>((res) => {
    if (i >= cfg.frameCount || frames.current[i] !== undefined) return res();
    const img = new Image();
    img.decoding = "async";
    frames.current[i] = img;
    img.onload = () => res();
    img.onerror = () => { if (frames.current[i] === img) frames.current[i] = null; res(); };
    img.src = frameUrl(i);
  });

  const play = () => {
    if (done.current) return;
    setPhase("playing");
    t0.current = performance.now();
    const a = audio.current;
    const ctx = canvas.current?.getContext("2d", { alpha: false });
    let last = -1;
    let lastDrawn: HTMLImageElement | null = null;

    const tick = () => {
      if (done.current) return;
      const t = useAudio.current && a && !a.paused ? a.currentTime : (performance.now() - t0.current) / 1000;
      const idx = Math.min(cfg.frameCount - 1, Math.floor(t * cfg.fps));
      if (idx !== last) {
        for (let k = idx; k < idx + AHEAD; k++) load(k);
        for (let k = Math.max(0, last - 2); k < idx - 2; k++) if (frames.current[k]) frames.current[k] = null; // release memory
        last = idx;
      }
      const img = frames.current[idx];
      const drawable = img && img.complete && img.naturalWidth ? img : lastDrawn;
      if (ctx && canvas.current && drawable) {
        const c = canvas.current;
        if (c.width !== drawable.naturalWidth) { c.width = drawable.naturalWidth; c.height = drawable.naturalHeight; }
        ctx.drawImage(drawable, 0, 0);
        lastDrawn = drawable;
      }
      const ended = idx >= cfg.frameCount - 1 && (!useAudio.current || a?.ended || t * cfg.fps >= cfg.frameCount + cfg.fps);
      if (ended) return finish();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Buffer the first frames in strict numeric order, then start automatically.
  useEffect(() => {
    let cancelled = false;
    done.current = false;
    frames.current = [];
    useAudio.current = false;
    const guard = setTimeout(() => { if (!cancelled && !done.current && phase === "loading") finish(); }, cfg.maxWaitMs);

    (async () => {
      await load(0);
      if (cancelled || done.current) return;
      if (frames.current[0] === null) { finish(); return; } // frames missing: go straight to the site

      const a = new Audio(cfg.directory + cfg.audio);
      a.preload = "auto";
      a.onerror = () => { useAudio.current = false; setAudioFailed(true); };
      audio.current = a;

      const n = Math.min(BUFFER, cfg.frameCount);
      for (let i = 1; i < n; i += 5) {
        await Promise.all([i, i + 1, i + 2, i + 3, i + 4].filter((k) => k < n).map(load));
        if (cancelled || done.current) return;
        setProgress(Math.min(100, Math.round(((i + 5) / n) * 100)));
      }
      if (cancelled || done.current) return;
      clearTimeout(guard);
      setProgress(100);

      // Visual playback must never wait for an audio autoplay promise.
      play();
      a.play().then(() => {
        if (cancelled || done.current) { a.pause(); return; }
        a.currentTime = (performance.now() - t0.current) / 1000;
        useAudio.current = true;
      }).catch(() => {
        if (cancelled || done.current) return;
        useAudio.current = false;
        setMuted(true);
      });
    })();

    return () => { cancelled = true; done.current = true; clearTimeout(guard); audio.current?.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enableSound = async () => {
    const a = audio.current;
    if (!a || done.current) return;
    try {
      a.currentTime = (performance.now() - t0.current) / 1000;
      await a.play();
      if (done.current) { a.pause(); return; }
      useAudio.current = true;
      setMuted(false);
    } catch { /* still blocked */ }
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") finish(); };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  });

  return (
    <div role="dialog" aria-modal="true" aria-label="Intro animation"
      className={`fixed inset-0 z-[100] bg-black transition-opacity duration-500 ${phase === "leaving" ? "opacity-0" : "opacity-100"}`}>
      <canvas ref={canvas} aria-hidden="true"
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${phase === "playing" ? "opacity-100" : "opacity-0"}`} />

      {phase === "loading" && (
        <div className="absolute inset-0 grid place-items-center text-center px-6">
          <div>
            <p className="text-3xl font-extrabold tracking-[0.25em] text-white">{info.brand}</p>
            <div className="mt-6 w-56 h-[2px] bg-white/10 mx-auto overflow-hidden rounded">
              <div className="h-full bg-red-600 transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-xs tracking-widest text-zinc-500" aria-live="polite">{progress}%</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 flex items-center gap-2">
        {muted && !audioFailed && phase === "playing" && (
          <button onClick={enableSound} aria-label="Turn on sound"
            className="w-10 h-10 grid place-items-center rounded-full border border-white/20 bg-black/50 text-zinc-200 hover:text-white hover:border-white/50 transition">
            <Icon name="volume" className="w-5 h-5" />
          </button>
        )}
        <button onClick={finish}
          className="text-[11px] tracking-[0.2em] uppercase text-zinc-400 hover:text-white border border-white/15 hover:border-white/40 rounded-full px-4 py-2 transition">
          Skip
        </button>
      </div>
    </div>
  );
}
