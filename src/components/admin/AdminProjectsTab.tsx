import { useEffect, useState } from "react";
import projectsLocal from "../../data/projects.json";
import { fileToBase64, getRepoFile, putRepoFile } from "../../lib/githubApi";
import type { GitHubConfig } from "../../lib/githubApi";
import type { Project } from "../../lib/data";
import Icon from "../Icon";
import { LiquidButton, LiquidCard, LiquidPill } from "../LiquidGlass";

type Props = {
  cfg: GitHubConfig;
  connected: boolean;
  onToast: (type: "ok" | "err" | "info", msg: string) => void;
  onRepoChange: () => void;
};

const EMPTY_PROJECT: Project = {
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
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function AdminProjectsTab({ cfg, connected, onToast, onRepoChange }: Props) {
  const [items, setItems] = useState<Project[]>(projectsLocal as Project[]);
  const [sha, setSha] = useState<string | undefined>(undefined);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [commitMsg, setCommitMsg] = useState("Update projects.json via Admin Panel");
  const [search, setSearch] = useState("");

  const pullProjects = async () => {
    if (!connected) return;
    setLoading(true);
    try {
      const f = await getRepoFile(cfg, "src/data/projects.json");
      const parsed = JSON.parse(f.content) as Project[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
        setSha(f.sha);
        setSelectedIdx((idx) => Math.min(idx, Math.max(0, parsed.length - 1)));
      }
      onToast("ok", `Loaded ${parsed.length} projects from GitHub.`);
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to load projects.json");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (connected) void pullProjects();
  }, [connected, cfg.owner, cfg.repo, cfg.branch]);

  const current = items[selectedIdx];

  const updateCurrent = (patch: Partial<Project>) => {
    setItems((prev) => prev.map((p, i) => (i === selectedIdx ? { ...p, ...patch } : p)));
  };

  const addProject = () => {
    const num = items.length + 1;
    const next: Project = {
      ...EMPTY_PROJECT,
      title: `New Project ${num}`,
      slug: `new-project-${num}`,
      summary: "Describe what this project does and who it helps.",
      description: ["Detailed overview paragraph 1."],
      features: ["Key feature 1"],
      technologies: ["React", "TypeScript"],
    };
    const nextList = [...items, next];
    setItems(nextList);
    setSelectedIdx(nextList.length - 1);
  };

  const duplicateProject = (idx: number) => {
    const src = items[idx];
    if (!src) return;
    const copy: Project = {
      ...src,
      slug: `${src.slug}-copy`,
      title: `${src.title} (Copy)`,
      featured: false,
    };
    const next = [...items.slice(0, idx + 1), copy, ...items.slice(idx + 1)];
    setItems(next);
    setSelectedIdx(idx + 1);
  };

  const removeProject = (idx: number) => {
    if (items.length <= 1) {
      onToast("err", "At least one project should remain, or edit the existing item.");
      return;
    }
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    setSelectedIdx(Math.max(0, idx - 1));
  };

  const moveProject = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
    setSelectedIdx(target);
  };

  const pushProjects = async () => {
    if (!connected) {
      onToast("err", "Connect your GitHub repository first.");
      return;
    }
    setSaving(true);
    try {
      const cleaned = items.map((p) => ({
        ...p,
        slug: slugify(p.slug || p.title),
        description: p.description.filter((d) => d.trim().length > 0),
        features: p.features.filter((f) => f.trim().length > 0),
        technologies: p.technologies.filter((t) => t.trim().length > 0),
        screenshots: p.screenshots.filter((s) => s.trim().length > 0),
      }));
      const res = await putRepoFile(
        cfg,
        "src/data/projects.json",
        JSON.stringify(cleaned, null, 2) + "\n",
        commitMsg || "Update projects.json via Admin",
        { sha }
      );
      setItems(cleaned);
      setSha(res.sha);
      onToast("ok", "projects.json committed & pushed to GitHub!");
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to save projects.json");
    } finally {
      setSaving(false);
    }
  };

  const uploadImageForProject = async (file: File | undefined, mode: "cover" | "screenshot") => {
    if (!file || !connected || !current) return;
    setUploadingImg(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const baseSlug = slugify(current.slug || current.title || "project");
      const fileSlug = slugify(file.name.replace(/\.[^.]+$/, "")) || String(Date.now());
      const ghPath = `public/images/${baseSlug}-${fileSlug}.${ext}`;
      const publicPath = `/images/${baseSlug}-${fileSlug}.${ext}`;
      const b64 = await fileToBase64(file);

      await putRepoFile(cfg, ghPath, b64, `Upload project image ${ghPath}`, { isBase64: true });
      if (mode === "cover") {
        updateCurrent({ image: publicPath });
      } else {
        updateCurrent({ screenshots: [...current.screenshots, publicPath] });
      }
      onToast("ok", `Uploaded ${ghPath} to GitHub! Don't forget to click "Save All Projects".`);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to upload project image.");
    } finally {
      setUploadingImg(false);
    }
  };

  const filteredIndexes = items
    .map((p, idx) => ({ p, idx }))
    .filter(({ p }) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <LiquidPill crimson>Portfolio Projects ({items.length})</LiquidPill>
          <h2 className="mt-2 text-2xl font-bold text-white">Projects Manager</h2>
          <p className="text-sm text-zinc-400">
            Add, edit, reorder, feature, or remove projects in{" "}
            <code className="text-zinc-200">src/data/projects.json</code> and upload covers directly to GitHub.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <LiquidButton onClick={pullProjects} disabled={!connected || loading}>
            <Icon name="refresh" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Pull
          </LiquidButton>
          <LiquidButton onClick={addProject}>
            <Icon name="plus" className="w-4 h-4" />
            New Project
          </LiquidButton>
          <LiquidButton variant="primary" onClick={pushProjects} disabled={!connected || saving}>
            <Icon name="save" className="w-4 h-4" />
            {saving ? "Pushing..." : "Save All Projects"}
          </LiquidButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-[310px_1fr] gap-6 items-start">
        {/* Left Project List */}
        <LiquidCard className="p-4 space-y-3">
          <input
            type="search"
            className="lg-input text-xs"
            placeholder="Filter projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <ul className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredIndexes.map(({ p, idx }) => (
              <li key={`${p.slug}-${idx}`}>
                <button
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    selectedIdx === idx
                      ? "bg-red-600/20 border-red-500/50 text-white"
                      : "bg-white/[0.03] border-white/10 text-zinc-300 hover:bg-white/[0.07]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm truncate">{p.title || "(Untitled)"}</span>
                    {p.featured && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/25 text-red-200 border border-red-400/30">
                        Featured
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 truncate">
                    /{p.slug} · {p.category}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </LiquidCard>

        {/* Right Project Editor */}
        {current && (
          <LiquidCard className="p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">{current.title || "Edit Project"}</h3>
                <p className="text-xs text-zinc-400">Route: /projects/{current.slug || "..."}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <LiquidButton onClick={() => moveProject(selectedIdx, -1)} disabled={selectedIdx === 0} title="Move up">
                  ↑
                </LiquidButton>
                <LiquidButton
                  onClick={() => moveProject(selectedIdx, 1)}
                  disabled={selectedIdx === items.length - 1}
                  title="Move down"
                >
                  ↓
                </LiquidButton>
                <LiquidButton onClick={() => duplicateProject(selectedIdx)} title="Duplicate project">
                  <Icon name="copy" className="w-4 h-4" />
                </LiquidButton>
                <LiquidButton onClick={() => removeProject(selectedIdx)} title="Delete project">
                  <Icon name="trash" className="w-4 h-4 text-red-400" />
                </LiquidButton>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Project Title *</label>
                <input
                  className="lg-input"
                  value={current.title}
                  onChange={(e) => updateCurrent({ title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Slug (URL path)</label>
                <div className="flex gap-2">
                  <input
                    className="lg-input font-mono text-xs"
                    value={current.slug}
                    onChange={(e) => updateCurrent({ slug: e.target.value })}
                  />
                  <LiquidButton onClick={() => updateCurrent({ slug: slugify(current.title) })}>
                    Auto
                  </LiquidButton>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Category</label>
                <input
                  className="lg-input"
                  value={current.category}
                  onChange={(e) => updateCurrent({ category: e.target.value })}
                  list="proboy-project-cats"
                />
                <datalist id="proboy-project-cats">
                  <option value="WhatsApp Bot" />
                  <option value="Full-Stack Development" />
                  <option value="Developer Tools" />
                  <option value="Security & Privacy" />
                  <option value="AI & Automation" />
                  <option value="Shopify & E-Commerce" />
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Year</label>
                  <input
                    className="lg-input"
                    value={current.year}
                    onChange={(e) => updateCurrent({ year: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Creator</label>
                  <input
                    className="lg-input"
                    value={current.creator}
                    onChange={(e) => updateCurrent({ creator: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <label className="inline-flex items-center gap-2.5 text-sm text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(current.featured)}
                onChange={(e) => updateCurrent({ featured: e.target.checked })}
                className="w-4 h-4 accent-red-500"
              />
              Featured project
            </label>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Summary</label>
              <textarea
                rows={2}
                className="lg-input"
                value={current.summary}
                onChange={(e) => updateCurrent({ summary: e.target.value })}
              />
            </div>

            {/* Links */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Demo URL (or /folder/)</label>
                <input
                  className="lg-input"
                  value={current.demo}
                  onChange={(e) => updateCurrent({ demo: e.target.value })}
                  placeholder="/my-tool/ or https://..."
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">GitHub Repo URL</label>
                <input
                  className="lg-input"
                  value={current.repo}
                  onChange={(e) => updateCurrent({ repo: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Docs Route / URL</label>
                <input
                  className="lg-input"
                  value={current.docs}
                  onChange={(e) => updateCurrent({ docs: e.target.value })}
                />
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Cover Image URL / Path</label>
              <div className="flex flex-wrap gap-2">
                <input
                  className="lg-input flex-1 min-w-[200px]"
                  value={current.image}
                  onChange={(e) => updateCurrent({ image: e.target.value })}
                  placeholder="/images/my-project.png or https://..."
                />
                <label className="lg-btn cursor-pointer">
                  <Icon name="upload" className="w-4 h-4" />
                  {uploadingImg ? "Uploading..." : "Upload Cover"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!connected || uploadingImg}
                    onChange={(e) => {
                      void uploadImageForProject(e.target.files?.[0], "cover");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Technologies */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Technologies</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {current.technologies.map((t, i) => (
                  <span key={`${t}-${i}`} className="lg-pill">
                    {t}
                    <button
                      type="button"
                      onClick={() =>
                        updateCurrent({ technologies: current.technologies.filter((_, idx) => idx !== i) })
                      }
                      className="text-zinc-400 hover:text-red-400 ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="lg-input"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && techInput.trim()) {
                      e.preventDefault();
                      updateCurrent({ technologies: [...current.technologies, techInput.trim()] });
                      setTechInput("");
                    }
                  }}
                  placeholder="Type a technology and press Enter or Add"
                />
                <LiquidButton
                  onClick={() => {
                    if (!techInput.trim()) return;
                    updateCurrent({ technologies: [...current.technologies, techInput.trim()] });
                    setTechInput("");
                  }}
                >
                  Add
                </LiquidButton>
              </div>
            </div>

            {/* Description paragraphs */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-zinc-400">Description Paragraphs</label>
                <button
                  type="button"
                  className="text-xs text-red-400 hover:text-red-300"
                  onClick={() => updateCurrent({ description: [...current.description, ""] })}
                >
                  + Add paragraph
                </button>
              </div>
              <div className="space-y-2">
                {current.description.map((para, i) => (
                  <div key={i} className="flex gap-2">
                    <textarea
                      rows={2}
                      className="lg-input flex-1"
                      value={para}
                      onChange={(e) =>
                        updateCurrent({
                          description: current.description.map((d, idx) => (idx === i ? e.target.value : d)),
                        })
                      }
                    />
                    <LiquidButton
                      onClick={() =>
                        updateCurrent({ description: current.description.filter((_, idx) => idx !== i) })
                      }
                    >
                      ✕
                    </LiquidButton>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-zinc-400">Key Features</label>
                <button
                  type="button"
                  className="text-xs text-red-400 hover:text-red-300"
                  onClick={() => updateCurrent({ features: [...current.features, ""] })}
                >
                  + Add feature
                </button>
              </div>
              <div className="space-y-2">
                {current.features.map((feat, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="lg-input flex-1"
                      value={feat}
                      onChange={(e) =>
                        updateCurrent({
                          features: current.features.map((f, idx) => (idx === i ? e.target.value : f)),
                        })
                      }
                    />
                    <LiquidButton
                      onClick={() => updateCurrent({ features: current.features.filter((_, idx) => idx !== i) })}
                    >
                      ✕
                    </LiquidButton>
                  </div>
                ))}
              </div>
            </div>

            {/* Screenshots */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-zinc-400">Screenshots ({current.screenshots.length})</label>
                <label className="text-xs text-red-400 hover:text-red-300 cursor-pointer">
                  + Upload screenshot
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={!connected || uploadingImg}
                    onChange={(e) => {
                      void uploadImageForProject(e.target.files?.[0], "screenshot");
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div className="space-y-2">
                {current.screenshots.map((sc, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      className="lg-input flex-1"
                      value={sc}
                      onChange={(e) =>
                        updateCurrent({
                          screenshots: current.screenshots.map((x, idx) => (idx === i ? e.target.value : x)),
                        })
                      }
                    />
                    <LiquidButton
                      onClick={() =>
                        updateCurrent({ screenshots: current.screenshots.filter((_, idx) => idx !== i) })
                      }
                    >
                      ✕
                    </LiquidButton>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3 items-center">
              <input
                className="lg-input flex-1 min-w-[200px]"
                value={commitMsg}
                onChange={(e) => setCommitMsg(e.target.value)}
                placeholder="Commit message"
              />
              <LiquidButton variant="primary" onClick={pushProjects} disabled={!connected || saving}>
                <Icon name="save" className="w-4 h-4" />
                {saving ? "Pushing..." : "Commit & Push projects.json"}
              </LiquidButton>
            </div>
          </LiquidCard>
        )}
      </div>
    </div>
  );
}
