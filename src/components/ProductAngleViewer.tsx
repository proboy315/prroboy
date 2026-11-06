import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

export type AngleFrame = {
  label: string;
  angleDeg: number;
  src: string;
  caption: string;
  transform?: string;
};

export type ProductFinish = {
  id: string;
  name: string;
  swatch: string;
  priceDelta?: number;
};

export function ProductAngleViewer({
  title,
  subtitle,
  frames,
  finishes,
  selectedFinish,
  onSelectFinish,
}: {
  title: string;
  subtitle: string;
  frames: AngleFrame[];
  finishes?: ProductFinish[];
  selectedFinish?: string;
  onSelectFinish?: (id: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const [autoSpin, setAutoSpin] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [failedSrcs, setFailedSrcs] = useState<Record<string, boolean>>({});
  const dragStartX = useRef<number | null>(null);

  const safeFrames = frames.length > 0 ? frames : [];
  const activeFrame = safeFrames[index % safeFrames.length];

  useEffect(() => {
    if (!autoSpin || safeFrames.length < 2) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAutoSpin(false);
      return;
    }
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % safeFrames.length);
    }, 1100);
    return () => window.clearInterval(timer);
  }, [autoSpin, safeFrames.length]);

  const prevAngle = () => {
    setAutoSpin(false);
    setIndex((prev) => (prev - 1 + safeFrames.length) % safeFrames.length);
  };

  const nextAngle = () => {
    setAutoSpin(false);
    setIndex((prev) => (prev + 1) % safeFrames.length);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX;
    setAutoSpin(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartX.current === null || safeFrames.length < 2) return;
    const delta = e.clientX - dragStartX.current;
    if (Math.abs(delta) >= 36) {
      dragStartX.current = e.clientX;
      setIndex((prev) =>
        delta > 0 ? (prev - 1 + safeFrames.length) % safeFrames.length : (prev + 1) % safeFrames.length
      );
    }
  };

  const handlePointerUp = () => {
    dragStartX.current = null;
  };

  if (!activeFrame) return null;
  const isImageBroken = Boolean(failedSrcs[activeFrame.src]);

  return (
    <section className="d-viewer" aria-label={`Interactive multi-angle viewer for ${title}`}>
      <div className="d-viewer-top">
        <div>
          <span className="d-badge">360° Studio Angle Viewer</span>
          <h2 className="d-viewer-title">{title}</h2>
          <p className="d-note">{subtitle}</p>
        </div>
        <div className="d-viewer-controls">
          <button type="button" className="d-btn d-btn--ghost" onClick={prevAngle} aria-label="Previous product angle">
            <Icon name="left" className="w-4 h-4" /> Prev
          </button>
          <button type="button" className="d-btn d-btn--ghost" onClick={nextAngle} aria-label="Next product angle">
            Next <Icon name="right" className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`d-btn ${autoSpin ? "d-btn--primary" : "d-btn--ghost"}`}
            aria-pressed={autoSpin}
            onClick={() => setAutoSpin((v) => !v)}
          >
            {autoSpin ? "Stop 360°" : "Auto-Rotate"}
          </button>
          <button
            type="button"
            className={`d-btn ${zoomed ? "d-btn--primary" : "d-btn--ghost"}`}
            aria-pressed={zoomed}
            onClick={() => setZoomed((v) => !v)}
          >
            {zoomed ? "Reset Zoom" : "Inspect Detail"}
          </button>
        </div>
      </div>

      <div
        className={`d-viewer-stage${zoomed ? " is-zoomed" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="region"
        aria-label="Drag horizontally or use angle controls to inspect views"
      >
        {isImageBroken ? (
          <div className="d-viewer-fallback" role="img" aria-label={activeFrame.caption}>
            <strong>{title}</strong>
            <span>{activeFrame.label} ({activeFrame.angleDeg}°)</span>
            <small>Multi-angle studio preview unavailable offline</small>
          </div>
        ) : (
          <img
            src={activeFrame.src}
            alt={activeFrame.caption}
            loading="lazy"
            draggable={false}
            style={{ transform: activeFrame.transform || undefined }}
            onError={() => setFailedSrcs((prev) => ({ ...prev, [activeFrame.src]: true }))}
          />
        )}
        <div className="d-viewer-hud">
          <span>
            Angle: <strong>{activeFrame.label}</strong> ({activeFrame.angleDeg}°)
          </span>
          <span>Drag horizontally or use Prev/Next · Multi-angle photography</span>
        </div>
      </div>

      <div className="d-viewer-bar">
        <div className="d-chips" role="group" aria-label="Select camera angle">
          {safeFrames.map((f, i) => (
            <button
              key={f.label}
              type="button"
              aria-pressed={index === i}
              className={index === i ? "on" : ""}
              onClick={() => {
                setAutoSpin(false);
                setIndex(i);
              }}
            >
              {f.label} ({f.angleDeg}°)
            </button>
          ))}
        </div>

        {finishes && finishes.length > 0 && onSelectFinish && (
          <div className="d-swatches" role="group" aria-label="Select finish">
            <span>Finish:</span>
            {finishes.map((fin) => (
              <button
                key={fin.id}
                type="button"
                aria-pressed={selectedFinish === fin.id}
                className={`d-swatch-btn${selectedFinish === fin.id ? " is-active" : ""}`}
                onClick={() => onSelectFinish(fin.id)}
              >
                <i style={{ background: fin.swatch }} aria-hidden="true" />
                {fin.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
