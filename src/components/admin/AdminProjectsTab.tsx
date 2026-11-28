import { useEffect, useState } from "react";
import projectsLocal from "../../data/projects.json";
import { fileToBase64, getRepoFile, putRepoFile } from "../../lib/githubApi";
import type { GitHubConfig } from "../../lib/githubApi";
import type { Project } from "../../lib/data";
import Icon from "../Icon";

type Props = {
  cfg: GitHubConfig;
  connected: boolean;
  onToast: (type: "ok" | "err" | "info", msg: string) => void;
  onRepoChange: () => void;
};

const EMPTY: Project = {
  slug: "",
  title: "",
  featured: false,
  category: "Full-Stack Development",
  summary: "",
  description: [""],
  features: [""],
  technologies: [],
  image: "",
  screenshots: [],
  repo: "",
  demo: "",
  docs: "",
  creator: "Shahan Ali",
  year: String(new Date().getFullYear()),
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminProjectsTab({ cfg, connected, onToast, onRepoChange }: Props) {
  const [items, setItems] = useState<Project[]>(projectsLocal as Project[]);
  const [sha, setSha] = useState<string | undefined>();
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tech, setTech] = useState("");
  const [msg, setMsg] = useState("Update projects.json via Admin");
  const [q, setQ] = useState("");

  const pull = async () => {
    if (!connected) return;
    setLoading(true);
    try {
      const f = await getRepoFile(cfg, "src/data/projects.json");
      const parsed = JSON.parse(f.content) as Project[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
        setSha(f.sha);
        setIdx((i) => Math.min(i, Math.max(0, parsed.length - 1)));
      }
      onToast("ok", `Loaded ${parsed.length} projects from GitHub.`);
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) void pull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, cfg.owner, cfg.repo, cfg.branch]);

  const cur = items[idx];
  const patch = (p: Partial<Project>) => setItems((prev) => prev.map((x, i) => (i === idx ? { ...x, ...p } : x)));

  const push = async () => {
    if (!connected) return onToast("err", "Unlock & connect first.");
    setSaving(true);
    try {
      const cleaned = items.map((p) => ({
        ...p,
        slug: slugify(p.slug || p.title),
        description: p.description.filter((d) => d.trim()),
        features: p.features.filter((f) => f.trim()),
        technologies: p.technologies.filter((t) => t.trim()),
        screenshots: p.screenshots.filter((s) => s.trim()),
      }));
      const res = await putRepoFile(cfg, "src/data/projects.json", JSON.stringify(cleaned, null, 2) + "\n", msg, { sha });
      setItems(cleaned);
      setSha(res.sha);
      onToast("ok", "projects.json pushed. Vercel redeploys automatically.");
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImg = async (file: File | undefined, mode: "cover" | "shot") => {
    if (!file || !connected || !cur) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const base = slugify(cur.slug || cur.title || "project");
      const name = slugify(file.name.replace(/\.[^.]+$/, "")) || String(Date.now());
      const gh = `public/images/${base}-${name}.${ext}`;
      const pub = `/images/${base}-${name}.${ext}`;
      await putRepoFile(cfg, gh, await fileToBase64(file), `Upload ${gh}`, { isBase64: true });
      if (mode === "cover") patch({ image: pub });
      else patch({ screenshots: [...cur.screenshots, pub] });
      onToast("ok", `Uploaded ${gh}. Press Save All to commit.`);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const list = items.map((p, i) => ({ p, i })).filter(({ p }) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    return p.title.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s) || p.category.toLowerCase().includes(s);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ad-card">
        <div className="ad-card-head">
          <div>
            <span className="ad-pill ad-pill-red">Projects · {items.length}</span>
            <h2 className="ad-card-title" style={{ marginTop: 10, fontSize: 20 }}>Projects manager</h2>
            <p className="ad-card-sub"><code>src/data/projects.json</code> — add, reorder, feature, upload covers.</p>
          </div>
          <div className="ad-row" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button className="ad-btn ad-btn-sm" onClick={pull} disabled={!connected || loading}>
              <Icon name="refresh" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Pull
            </button>
            <button
              className="ad-btn ad-btn-sm"
              onClick={() => {
                const n = items.length + 1;
                const next = [...items, { ...EMPTY, title: `New Project ${n}`, slug: `new-project-${n}`, summary: "Describe what this project does.", description: ["Overview paragraph."], features: ["Key feature"], technologies: ["React"] }];
                setItems(next);
                setIdx(next.length - 1);
              }}
            >
              <Icon name="plus" className="w-4 h-4" /> New
            </button>
            <button className="ad-btn ad-btn-primary ad-btn-sm" onClick={push} disabled={!connected || saving}>
              <Icon name="save" className="w-4 h-4" /> {saving ? "Pushing…" : "Save all"}
            </button>
          </div>
        </div>
        <input className="ad-input" placeholder="Filter projects…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
      </div>

      <div className="ad-grid-2" style={{ gridTemplateColumns: "300px 1fr", alignItems: "start" }}>
        <div className="ad-card" style={{ padding: 14 }}>
          <div className="ad-list" style={{ maxHeight: 620, overflowY: "auto" }}>
            {list.map(({ p, i }) => (
              <button
                key={`${p.slug}-${i}`}
                onClick={() => setIdx(i)}
                className={`ad-item ${idx === i ? "active" : ""}`}
                style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title || "(Untitled)"}</p>
                  <p className="ad-mono" style={{ color: "#7c86a3", fontSize: 11, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>/{p.slug} · {p.category}</p>
                </div>
                {p.featured && <span className="ad-pill ad-pill-red">Featured</span>}
              </button>
            ))}
          </div>
        </div>

        {cur && (
          <div className="ad-card">
            <div className="ad-card-head">
              <div>
                <h3 className="ad-card-title" style={{ fontSize: 17 }}>{cur.title || "Edit project"}</h3>
                <p className="ad-card-sub ad-mono">/projects/{cur.slug || "…"}</p>
              </div>
              <div className="ad-row">
                <button className="ad-btn ad-btn-sm" disabled={idx === 0} onClick={() => { const n = [...items]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; setItems(n); setIdx(idx - 1); }}>↑</button>
                <button className="ad-btn ad-btn-sm" disabled={idx === items.length - 1} onClick={() => { const n = [...items]; [n[idx + 1], n[idx]] = [n[idx], n[idx + 1]]; setItems(n); setIdx(idx + 1); }}>↓</button>
                <button
                  className="ad-btn ad-btn-sm"
                  onClick={() => {
                    const copy = { ...cur, slug: `${cur.slug}-copy`, title: `${cur.title} (Copy)`, featured: false };
                    const n = [...items.slice(0, idx + 1), copy, ...items.slice(idx + 1)];
                    setItems(n);
                    setIdx(idx + 1);
                  }}
                >
                  <Icon name="copy" className="w-4 h-4" />
                </button>
                <button className="ad-btn ad-btn-sm" onClick={() => { if (items.length <= 1) return onToast("err", "Keep at least one project."); setItems(items.filter((_, i) => i !== idx)); setIdx(Math.max(0, idx - 1)); }}>
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="ad-form-grid">
              <div>
                <label className="ad-label">Title *</label>
                <input className="ad-input" value={cur.title} onChange={(e) => patch({ title: e.target.value })} autoComplete="off" />
              </div>
              <div>
                <label className="ad-label">Slug</label>
                <div className="ad-row">
                  <input className="ad-input ad-mono" style={{ flex: 1 }} value={cur.slug} onChange={(e) => patch({ slug: e.target.value })} autoComplete="off" spellCheck={false} />
                  <button className="ad-btn ad-btn-sm" onClick={() => patch({ slug: slugify(cur.title) })}>Auto</button>
                </div>
              </div>
              <div>
                <label className="ad-label">Category</label>
                <input className="ad-input" value={cur.category} onChange={(e) => patch({ category: e.target.value })} list="ad-proj-cats" autoComplete="off" />
                <datalist id="ad-proj-cats">
                  <option value="WhatsApp Bot" />
                  <option value="Full-Stack Development" />
                  <option value="Developer Tools" />
                  <option value="Security & Privacy" />
                  <option value="AI & Automation" />
                </datalist>
              </div>
              <div className="ad-form-grid" style={{ gap: 10 }}>
                <div>
                  <label className="ad-label">Year</label>
                  <input className="ad-input" value={cur.year} onChange={(e) => patch({ year: e.target.value })} />
                </div>
                <div>
                  <label className="ad-label">Creator</label>
                  <input className="ad-input" value={cur.creator} onChange={(e) => patch({ creator: e.target.value })} />
                </div>
              </div>
            </div>

            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, color: "#d5dbea", cursor: "pointer" }}>
              <input type="checkbox" checked={Boolean(cur.featured)} onChange={(e) => patch({ featured: e.target.checked })} /> Featured project
            </label>

            <div className="ad-field">
              <label className="ad-label">Summary</label>
              <textarea className="ad-input" rows={2} value={cur.summary} onChange={(e) => patch({ summary: e.target.value })} />
            </div>

            <div className="ad-form-grid-3">
              <div>
                <label className="ad-label">Demo URL / folder</label>
                <input className="ad-input ad-mono" value={cur.demo} onChange={(e) => patch({ demo: e.target.value })} placeholder="/tool/ or https://" autoComplete="off" spellCheck={false} />
              </div>
              <div>
                <label className="ad-label">Repo URL</label>
                <input className="ad-input ad-mono" value={cur.repo} onChange={(e) => patch({ repo: e.target.value })} autoComplete="off" spellCheck={false} />
              </div>
              <div>
                <label className="ad-label">Docs route</label>
                <input className="ad-input ad-mono" value={cur.docs} onChange={(e) => patch({ docs: e.target.value })} autoComplete="off" spellCheck={false} />
              </div>
            </div>

            <div className="ad-field">
              <label className="ad-label">Cover image URL / path</label>
              <div className="ad-row">
                <input className="ad-input ad-mono" style={{ flex: 1 }} value={cur.image} onChange={(e) => patch({ image: e.target.value })} autoComplete="off" spellCheck={false} />
                <label className="ad-btn ad-btn-sm" style={{ cursor: "pointer" }}>
                  <Icon name="upload" className="w-4 h-4" /> {uploading ? "…" : "Upload"}
                  <input type="file" accept="image/*" hidden disabled={!connected || uploading} onChange={(e) => { void uploadImg(e.target.files?.[0], "cover"); e.target.value = ""; }} />
                </label>
              </div>
              {cur.image && (
                <img src={cur.image} alt="" style={{ marginTop: 10, width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 12, border: "1px solid #223047" }} />
              )}
            </div>

            <div className="ad-field">
              <label className="ad-label">Technologies</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                {cur.technologies.map((t, i) => (
                  <span key={i} className="ad-pill">{t} <button onClick={() => patch({ technologies: cur.technologies.filter((_, x) => x !== i) })} style={{ color: "#f43f5e" }}>✕</button></span>
                ))}
              </div>
              <div className="ad-row">
                <input className="ad-input" style={{ flex: 1 }} value={tech} onChange={(e) => setTech(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && tech.trim()) { e.preventDefault(); patch({ technologies: [...cur.technologies, tech.trim()] }); setTech(""); } }} placeholder="Add technology + Enter" />
                <button className="ad-btn ad-btn-sm" onClick={() => { if (tech.trim()) { patch({ technologies: [...cur.technologies, tech.trim()] }); setTech(""); } }}>Add</button>
              </div>
            </div>

            <div className="ad-field">
              <div className="ad-row" style={{ justifyContent: "space-between" }}>
                <label className="ad-label" style={{ margin: 0 }}>Description paragraphs</label>
                <button className="ad-btn ad-btn-sm" onClick={() => patch({ description: [...cur.description, ""] })}>+ Paragraph</button>
              </div>
              <div className="ad-list" style={{ marginTop: 10 }}>
                {cur.description.map((d, i) => (
                  <div key={i} className="ad-row">
                    <textarea className="ad-input" style={{ flex: 1 }} rows={2} value={d} onChange={(e) => patch({ description: cur.description.map((x, xi) => (xi === i ? e.target.value : x)) })} />
                    <button className="ad-btn ad-btn-sm" onClick={() => patch({ description: cur.description.filter((_, xi) => xi !== i) })}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="ad-field">
              <div className="ad-row" style={{ justifyContent: "space-between" }}>
                <label className="ad-label" style={{ margin: 0 }}>Key features</label>
                <button className="ad-btn ad-btn-sm" onClick={() => patch({ features: [...cur.features, ""] })}>+ Feature</button>
              </div>
              <div className="ad-list" style={{ marginTop: 10 }}>
                {cur.features.map((f, i) => (
                  <div key={i} className="ad-row">
                    <input className="ad-input" style={{ flex: 1 }} value={f} onChange={(e) => patch({ features: cur.features.map((x, xi) => (xi === i ? e.target.value : x)) })} />
                    <button className="ad-btn ad-btn-sm" onClick={() => patch({ features: cur.features.filter((_, xi) => xi !== i) })}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="ad-row" style={{ marginTop: 16, flexWrap: "wrap" }}>
              <input className="ad-input ad-mono" style={{ flex: 1, minWidth: 200 }} value={msg} onChange={(e) => setMsg(e.target.value)} autoComplete="off" />
              <button className="ad-btn ad-btn-primary" onClick={push} disabled={!connected || saving}>
                <Icon name="save" className="w-4 h-4" /> {saving ? "Pushing…" : "Commit & Push"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
