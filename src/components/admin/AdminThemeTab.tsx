import { useState } from "react";
import { getRepoFile, putRepoFile } from "../../lib/githubApi";
import type { GitHubConfig } from "../../lib/githubApi";
import Icon from "../Icon";
import { LiquidButton, LiquidCard, LiquidDock, LiquidPill } from "../LiquidGlass";

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
  const [crimson, setCrimson] = useState("#ef1d3e");
  const [saving, setSaving] = useState(false);

  const applyLiveVars = (b: number, s: number, r: number, c: string) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--lg-blur", `${b}px`);
    root.style.setProperty("--lg-sat", `${s}%`);
    root.style.setProperty("--lg-radius", `${r}px`);
    root.style.setProperty("--lg-crimson", c);
  };

  const resetDefaults = () => {
    setBlur(22);
    setSat(180);
    setRadius(22);
    setCrimson("#ef1d3e");
    applyLiveVars(22, 180, 22, "#ef1d3e");
    onToast("info", "Reset Liquid Glass CSS variables to defaults.");
  };

  const pushThemeToGitHub = async () => {
    if (!connected) {
      onToast("err", "Connect your GitHub repository first.");
      return;
    }
    setSaving(true);
    try {
      const f = await getRepoFile(cfg, "src/styles/liquid-glass.css");
      let css = f.content;
      css = css.replace(/--lg-blur:\s*[^;]+;/, `--lg-blur: ${blur}px;`);
      css = css.replace(/--lg-sat:\s*[^;]+;/, `--lg-sat: ${sat}%;`);
      css = css.replace(/--lg-radius:\s*[^;]+;/, `--lg-radius: ${radius}px;`);
      css = css.replace(/--lg-crimson:\s*[^;]+;/, `--lg-crimson: ${crimson};`);
      await putRepoFile(cfg, "src/styles/liquid-glass.css", css, "Customize Liquid Glass theme tokens via Admin", {
        sha: f.sha,
      });
      onToast("ok", "Updated src/styles/liquid-glass.css on GitHub!");
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to save Liquid Glass CSS.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <LiquidPill crimson>Liquid Glass Theme Studio</LiquidPill>
          <h2 className="mt-2 text-2xl font-bold text-white">Liquid Glass Elements &amp; Theme Tokens</h2>
          <p className="text-sm text-zinc-400">
            Tune backdrop blur, color saturation, corner curvature, and crimson specular accent live, then push to{" "}
            <code className="text-zinc-200">src/styles/liquid-glass.css</code>.
          </p>
        </div>
        <div className="flex gap-2">
          <LiquidButton onClick={resetDefaults}>Reset</LiquidButton>
          <LiquidButton variant="primary" onClick={pushThemeToGitHub} disabled={!connected || saving}>
            <Icon name="save" className="w-4 h-4" />
            {saving ? "Pushing..." : "Save Theme to GitHub"}
          </LiquidButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <LiquidCard className="p-6 space-y-5">
          <h3 className="text-base font-semibold text-white">Glass Physics Controls</h3>

          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
              <span>Backdrop Blur (--lg-blur)</span>
              <span className="font-mono">{blur}px</span>
            </div>
            <input
              type="range"
              min={6}
              max={40}
              value={blur}
              onChange={(e) => {
                const v = Number(e.target.value);
                setBlur(v);
                applyLiveVars(v, sat, radius, crimson);
              }}
              className="w-full accent-red-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
              <span>Refractive Saturation (--lg-sat)</span>
              <span className="font-mono">{sat}%</span>
            </div>
            <input
              type="range"
              min={100}
              max={260}
              value={sat}
              onChange={(e) => {
                const v = Number(e.target.value);
                setSat(v);
                applyLiveVars(blur, v, radius, crimson);
              }}
              className="w-full accent-red-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
              <span>Surface Corner Radius (--lg-radius)</span>
              <span className="font-mono">{radius}px</span>
            </div>
            <input
              type="range"
              min={8}
              max={34}
              value={radius}
              onChange={(e) => {
                const v = Number(e.target.value);
                setRadius(v);
                applyLiveVars(blur, sat, v, crimson);
              }}
              className="w-full accent-red-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-zinc-300">Primary Specular Accent</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={crimson}
                onChange={(e) => {
                  const v = e.target.value;
                  setCrimson(v);
                  applyLiveVars(blur, sat, radius, v);
                }}
                className="w-9 h-9 rounded-lg bg-transparent cursor-pointer"
              />
              <span className="font-mono text-xs text-zinc-400">{crimson}</span>
            </div>
          </div>
        </LiquidCard>

        <LiquidCard className="p-6 space-y-5">
          <h3 className="text-base font-semibold text-white">Installed Liquid Glass Elements</h3>
          <div className="flex flex-wrap gap-2">
            <LiquidPill>Glass Pill</LiquidPill>
            <LiquidPill crimson>Crimson Liquid Pill</LiquidPill>
            <span className="lg-pill">Specular Rim</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <LiquidButton>Frosted Button</LiquidButton>
            <LiquidButton variant="primary">Molten Crimson Button</LiquidButton>
          </div>
          <LiquidDock>
            <span className="lg-tab is-active">Dock Active</span>
            <span className="lg-tab">Tab Two</span>
            <span className="lg-tab">Tab Three</span>
          </LiquidDock>
          <input className="lg-input" readOnly value="Liquid Glass Input Surface (.lg-input)" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            Classes available globally across your portfolio:{" "}
            <code className="text-zinc-200">.glass</code>, <code className="text-zinc-200">.lg-surface</code>,{" "}
            <code className="text-zinc-200">.lg-card</code>, <code className="text-zinc-200">.lg-pill</code>,{" "}
            <code className="text-zinc-200">.lg-btn</code>, <code className="text-zinc-200">.lg-btn-primary</code>,{" "}
            <code className="text-zinc-200">.lg-input</code>, <code className="text-zinc-200">.lg-dock</code>.
          </p>
        </LiquidCard>
      </div>
    </div>
  );
}
