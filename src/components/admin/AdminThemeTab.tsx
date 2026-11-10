import { useState } from "react";
import { getRepoFile, putRepoFile } from "../../lib/githubApi";
import type { GitHubConfig } from "../../lib/githubApi";
import Icon from "../Icon";

type Props = {
  cfg: GitHubConfig;
  connected: boolean;
  onToast: (type: "ok" | "err" | "info", msg: string) => void;
  onRepoChange: () => void;
};

export default function AdminThemeTab({ cfg, connected, onToast, onRepoChange }: Props) {
  const [blur, setBlur] = useState(22);
  const [sat, setSat] = useState(180);
  const [radius, setRadius] = useState(22);
  const [accent, setAccent] = useState("#ef1d3e");
  const [saving, setSaving] = useState(false);

  const apply = (b: number, s: number, r: number, c: string) => {
    const root = document.documentElement;
    root.style.setProperty("--lg-blur", `${b}px`);
    root.style.setProperty("--lg-sat", `${s}%`);
    root.style.setProperty("--lg-radius", `${r}px`);
    root.style.setProperty("--lg-crimson", c);
  };

  const push = async () => {
    if (!connected) return onToast("err", "Unlock & connect first.");
    setSaving(true);
    try {
      const f = await getRepoFile(cfg, "src/styles/liquid-glass.css");
      let css = f.content;
      css = css.replace(/--lg-blur:\s*[^;]+;/, `--lg-blur: ${blur}px;`);
      css = css.replace(/--lg-sat:\s*[^;]+;/, `--lg-sat: ${sat}%;`);
      css = css.replace(/--lg-radius:\s*[^;]+;/, `--lg-radius: ${radius}px;`);
      css = css.replace(/--lg-crimson:\s*[^;]+;/, `--lg-crimson: ${accent};`);
      await putRepoFile(cfg, "src/styles/liquid-glass.css", css, "Tune site glass theme via Admin", { sha: f.sha });
      onToast("ok", "Site theme pushed to GitHub.");
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Theme save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ad-card">
        <div className="ad-card-head">
          <div>
            <span className="ad-pill ad-pill-red">Theme · Appearance</span>
            <h2 className="ad-card-title" style={{ marginTop: 10, fontSize: 20 }}>Site glass theme studio</h2>
            <p className="ad-card-sub">Live-tune the public portfolio glass, then push <code>src/styles/liquid-glass.css</code>.</p>
          </div>
          <div className="ad-row">
            <button
              className="ad-btn ad-btn-sm"
              onClick={() => {
                setBlur(22);
                setSat(180);
                setRadius(22);
                setAccent("#ef1d3e");
                apply(22, 180, 22, "#ef1d3e");
              }}
            >
              Reset
            </button>
            <button className="ad-btn ad-btn-primary ad-btn-sm" onClick={push} disabled={!connected || saving}>
              <Icon name="save" className="w-4 h-4" /> {saving ? "Pushing…" : "Push theme"}
            </button>
          </div>
        </div>

        <div className="ad-grid-2">
          <div className="ad-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 18 }}>
            <div>
              <div className="ad-row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#c6cde4" }}>Backdrop blur</span>
                <span className="ad-mono" style={{ color: "#fff" }}>{blur}px</span>
              </div>
              <input type="range" min={6} max={40} value={blur} onChange={(e) => { const v = Number(e.target.value); setBlur(v); apply(v, sat, radius, accent); }} style={{ width: "100%", accentColor: "#f43f5e" }} />
            </div>
            <div>
              <div className="ad-row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#c6cde4" }}>Saturation</span>
                <span className="ad-mono" style={{ color: "#fff" }}>{sat}%</span>
              </div>
              <input type="range" min={100} max={260} value={sat} onChange={(e) => { const v = Number(e.target.value); setSat(v); apply(blur, v, radius, accent); }} style={{ width: "100%", accentColor: "#f43f5e" }} />
            </div>
            <div>
              <div className="ad-row" style={{ justifyContent: "space-between" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#c6cde4" }}>Corner radius</span>
                <span className="ad-mono" style={{ color: "#fff" }}>{radius}px</span>
              </div>
              <input type="range" min={8} max={34} value={radius} onChange={(e) => { const v = Number(e.target.value); setRadius(v); apply(blur, sat, v, accent); }} style={{ width: "100%", accentColor: "#f43f5e" }} />
            </div>
            <div className="ad-row" style={{ justifyContent: "space-between" }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "#c6cde4" }}>Accent glow</span>
              <div className="ad-row">
                <input type="color" value={accent} onChange={(e) => { setAccent(e.target.value); apply(blur, sat, radius, e.target.value); }} style={{ width: 38, height: 38, borderRadius: 10, background: "none", border: "1px solid #223047" }} />
                <span className="ad-mono" style={{ color: "#8b93ad" }}>{accent}</span>
              </div>
            </div>
          </div>

          <div className="ad-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 12 }}>
            <p className="ad-brand-sub">Live preview swatches</p>
            <div className="ad-row" style={{ flexWrap: "wrap" }}>
              <span className="ad-pill">Glass pill</span>
              <span className="ad-pill ad-pill-red">Crimson pill</span>
              <span className="ad-pill ad-pill-green">Online</span>
            </div>
            <div className="ad-row" style={{ flexWrap: "wrap" }}>
              <button className="ad-btn">Ghost button</button>
              <button className="ad-btn ad-btn-primary">Primary button</button>
            </div>
            <input className="ad-input" readOnly value="Input surface preview" />
            <p className="ad-hint">
              Public classes: <code>.glass</code> <code>.lg-card</code> <code>.lg-pill</code> <code>.lg-btn</code> <code>.lg-input</code> <code>.lg-dock</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
