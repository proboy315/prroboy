import { useEffect, useMemo, useState } from "react";
import { demos as baseDemos, type Demo } from "../lib/data";
import { onLink } from "../lib/router";
import Icon from "./Icon";

const STORAGE_KEY = "proboy_demo_control_room_v1";

export function loadWorkspaceDemos(): { items: Demo[]; hasOverrides: boolean } {
  if (typeof window === "undefined") {
    return { items: baseDemos, hasOverrides: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: baseDemos, hasOverrides: false };
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return { items: parsed as Demo[], hasOverrides: true };
    }
  } catch {
    // ignore corrupt localStorage
  }
  return { items: baseDemos, hasOverrides: false };
}

export function saveWorkspaceDemos(items: Demo[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("proboy-demos-updated"));
  } catch {
    // ignore quota errors
  }
}

export function resetWorkspaceDemos() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("proboy-demos-updated"));
  } catch {
    // ignore
  }
}

export default function DemoControlRoom({ onChange }: { onChange?: (items: Demo[]) => void }) {
  const [items, setItems] = useState<Demo[]>(() => loadWorkspaceDemos().items);
  const [hasOverrides, setHasOverrides] = useState<boolean>(() => loadWorkspaceDemos().hasOverrides);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "visible" | "hidden" | "featured">("all");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [previewDemo, setPreviewDemo] = useState<Demo | null>(null);
  const [toast, setToast] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [newEntry, setNewEntry] = useState({
    name: "",
    kind: "",
    category: "SaaS",
    accent: "#ef4444",
    summary: "",
  });
  const [addError, setAddError] = useState("");

  useEffect(() => {
    const sync = () => {
      const state = loadWorkspaceDemos();
      setItems(state.items);
      setHasOverrides(state.hasOverrides);
    };
    window.addEventListener("proboy-demos-updated", sync);
    return () => window.removeEventListener("proboy-demos-updated", sync);
  }, []);

  const persist = (next: Demo[], msg: string) => {
    setItems(next);
    setHasOverrides(true);
    saveWorkspaceDemos(next);
    onChange?.(next);
    setToast(msg);
    window.setTimeout(() => setToast(""), 2600);
  };

  const categories = useMemo(() => ["All", ...new Set(items.map((d) => d.category))], [items]);

  const stats = useMemo(() => {
    const visible = items.filter((d) => !d.hidden).length;
    const hidden = items.filter((d) => d.hidden).length;
    const featured = items.filter((d) => d.featured).length;
    const custom = items.filter((d) => d.isCustom).length;
    const uniqueCats = new Set(items.map((d) => d.category)).size;
    return { total: items.length, visible, hidden, featured, custom, uniqueCats };
  }, [items]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((d) => {
      if (catFilter !== "All" && d.category !== catFilter) return false;
      if (statusFilter === "visible" && d.hidden) return false;
      if (statusFilter === "hidden" && !d.hidden) return false;
      if (statusFilter === "featured" && !d.featured) return false;
      if (!term) return true;
      return `${d.name} ${d.kind} ${d.category} ${d.summary}`.toLowerCase().includes(term);
    });
  }, [items, q, catFilter, statusFilter]);

  const moveItem = (slug: string, dir: -1 | 1) => {
    const idx = items.findIndex((d) => d.slug === slug);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= items.length) return;
    const copy = [...items];
    const [removed] = copy.splice(idx, 1);
    copy.splice(target, 0, removed);
    persist(copy, `Moved "${removed.name}" ${dir === -1 ? "up" : "down"} in local workspace.`);
  };

  const toggleHidden = (slug: string) => {
    const copy = items.map((d) => (d.slug === slug ? { ...d, hidden: !d.hidden } : d));
    const found = copy.find((d) => d.slug === slug);
    persist(copy, `${found?.hidden ? "Hidden" : "Unhidden"} "${found?.name}" in your local demo directory.`);
  };

  const toggleFeatured = (slug: string) => {
    const copy = items.map((d) => (d.slug === slug ? { ...d, featured: !d.featured } : d));
    const found = copy.find((d) => d.slug === slug);
    persist(copy, `${found?.featured ? "Marked" : "Unmarked"} "${found?.name}" as featured locally.`);
  };

  const updateItemField = (slug: string, patch: Partial<Demo>) => {
    const copy = items.map((d) => (d.slug === slug ? { ...d, ...patch } : d));
    persist(copy, "Saved local demo entry updates.");
  };

  const removeCustomItem = (slug: string) => {
    const target = items.find((d) => d.slug === slug);
    if (!target?.isCustom) return;
    const copy = items.filter((d) => d.slug !== slug);
    persist(copy, `Removed custom sandbox entry "${target.name}".`);
  };

  const handleAddDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEntry.name.trim().length < 2) {
      setAddError("Enter a demo name (at least 2 characters).");
      return;
    }
    if (newEntry.summary.trim().length < 10) {
      setAddError("Enter a brief summary (at least 10 characters).");
      return;
    }
    setAddError("");
    const baseSlug = newEntry.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const slug = `${baseSlug || "custom-demo"}-${Date.now().toString(36).slice(-4)}`;
    const created: Demo = {
      slug,
      name: newEntry.name.trim(),
      kind: newEntry.kind.trim() || "Custom sandbox entry",
      category: newEntry.category,
      accent: newEntry.accent,
      ink: "#090a0f",
      featured: true,
      has360Viewer: false,
      summary: newEntry.summary.trim(),
      testGuide: "Custom sandbox entry added in your browser's Local Demo Workspace.",
      features: ["Local browser sandbox entry", "Editable metadata & accent", "Resettable anytime"],
      isCustom: true,
    };
    persist([created, ...items], `Added "${created.name}" to your local demo workspace.`);
    setNewEntry({ name: "", kind: "", category: "SaaS", accent: "#ef4444", summary: "" });
    setShowAddForm(false);
  };

  const handleReset = () => {
    resetWorkspaceDemos();
    setItems(baseDemos);
    setHasOverrides(false);
    setEditingSlug(null);
    setPreviewDemo(null);
    onChange?.(baseDemos);
    setToast("Reset workspace back to default sample catalogue.");
    window.setTimeout(() => setToast(""), 2600);
  };

  return (
    <section className="cr-wrap" aria-labelledby="cr-title">
      {/* Security Boundary Banner */}
      <div className="cr-banner" role="note">
        <div>
          <span className="cr-badge">Local Demo Workspace · Browser Sandbox</span>
          <h2 id="cr-title" className="cr-title">
            Demo Control Room
          </h2>
          <p className="cr-sub">
            Safely customize, add, reorder, hide/show, and preview demo catalogue entries in your browser. All changes
            are stored only in <code>localStorage</code> and never modify the deployed site, ProBoy-MD source, or
            contact API.
          </p>
        </div>
        <div className="cr-banner-actions">
          <button type="button" className="cr-btn cr-btn--primary" onClick={() => setShowAddForm((v) => !v)}>
            {showAddForm ? "Close New Entry Form" : "+ Add Local Demo Entry"}
          </button>
          <button
            type="button"
            className="cr-btn cr-btn--ghost"
            disabled={!hasOverrides}
            onClick={handleReset}
          >
            Reset to Default Sample Data
          </button>
        </div>
      </div>

      {toast && (
        <p role="status" aria-live="polite" className="cr-toast">
          {toast}
        </p>
      )}

      {/* Derived Catalogue Overview Metrics */}
      <dl className="cr-stats">
        <div>
          <dt>Total Catalogue</dt>
          <dd>{stats.total}</dd>
        </div>
        <div>
          <dt>Visible in Directory</dt>
          <dd>{stats.visible}</dd>
        </div>
        <div>
          <dt>Hidden Locally</dt>
          <dd>{stats.hidden}</dd>
        </div>
        <div>
          <dt>Featured</dt>
          <dd>{stats.featured}</dd>
        </div>
        <div>
          <dt>Categories</dt>
          <dd>{stats.uniqueCats}</dd>
        </div>
        <div>
          <dt>Custom Local Entries</dt>
          <dd>{stats.custom}</dd>
        </div>
      </dl>

      {/* Add Local Demo Form */}
      {showAddForm && (
        <form onSubmit={handleAddDemo} noValidate className="cr-add-card">
          <h3>Create Local Sandbox Demo Card</h3>
          <p className="cr-hint">Adds a preview card to your local browser workspace.</p>
          <div className="cr-add-grid">
            <label>
              <span>Demo Name *</span>
              <input
                type="text"
                value={newEntry.name}
                onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                placeholder="e.g. CloudPulse Monitor"
              />
            </label>
            <label>
              <span>Subtitle / Kind</span>
              <input
                type="text"
                value={newEntry.kind}
                onChange={(e) => setNewEntry({ ...newEntry, kind: e.target.value })}
                placeholder="e.g. Infrastructure status portal"
              />
            </label>
            <label>
              <span>Category</span>
              <select
                value={newEntry.category}
                onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
              >
                {["E-Commerce", "SaaS", "Hospitality", "Real Estate", "Agency", "AI", "Documentation", "Automotive", "Education", "Recruitment", "Media", "Events", "Fitness", "Healthcare", "Productivity", "Finance"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </label>
            <label>
              <span>Accent Color</span>
              <input
                type="color"
                value={newEntry.accent}
                onChange={(e) => setNewEntry({ ...newEntry, accent: e.target.value })}
              />
            </label>
          </div>
          <label className="cr-full-field">
            <span>Summary *</span>
            <textarea
              rows={2}
              value={newEntry.summary}
              onChange={(e) => setNewEntry({ ...newEntry, summary: e.target.value })}
              placeholder="Describe what this sample demo demonstrates..."
            />
          </label>
          {addError && (
            <p role="alert" className="cr-err">
              {addError}
            </p>
          )}
          <div className="cr-row">
            <button type="submit" className="cr-btn cr-btn--primary">
              Save to Local Workspace
            </button>
            <button type="button" className="cr-btn cr-btn--ghost" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="cr-toolbar">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search demo entries by name, category, or summary..."
          aria-label="Search Control Room demos"
        />
        <div className="cr-chips" role="group" aria-label="Filter by visibility status">
          {(
            [
              ["all", "All"],
              ["visible", "Visible"],
              ["hidden", "Hidden"],
              ["featured", "Featured"],
            ] as const
          ).map(([val, lbl]) => (
            <button
              key={val}
              type="button"
              aria-pressed={statusFilter === val}
              className={statusFilter === val ? "is-on" : ""}
              onClick={() => setStatusFilter(val)}
            >
              {lbl}
            </button>
          ))}
        </div>
        <select
          aria-label="Filter by category"
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="cr-select"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All Categories" : c}
            </option>
          ))}
        </select>
      </div>

      {/* Main Split: Catalogue Management Table + Live Preview Panel */}
      <div className="cr-split">
        <div className="cr-table-wrap" role="region" aria-label="Demo entries manager">
          {filtered.length === 0 ? (
            <div className="cr-empty">
              <p>No demo entries match your current filter.</p>
              <button
                type="button"
                className="cr-btn cr-btn--ghost"
                onClick={() => {
                  setQ("");
                  setCatFilter("All");
                  setStatusFilter("all");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="cr-list">
              {filtered.map((d) => {
                const isEditing = editingSlug === d.slug;
                const realIndex = items.findIndex((x) => x.slug === d.slug);
                return (
                  <li key={d.slug} className={`cr-item${d.hidden ? " is-hidden" : ""}`}>
                    <div className="cr-item-main">
                      <span className="cr-swatch-dot" style={{ background: d.accent }} aria-hidden="true" />
                      <div className="cr-item-info">
                        <div className="cr-item-head">
                          <strong>{d.name}</strong>
                          <span className="cr-pill">{d.category}</span>
                          {d.featured && <span className="cr-pill cr-pill--feat">Featured</span>}
                          {d.hidden && <span className="cr-pill cr-pill--muted">Hidden</span>}
                          {d.isCustom && <span className="cr-pill cr-pill--custom">Local Custom</span>}
                        </div>
                        <p>{d.summary}</p>
                      </div>
                    </div>

                    <div className="cr-item-actions">
                      <button
                        type="button"
                        className="cr-icon-btn"
                        aria-label={`Move ${d.name} up`}
                        disabled={realIndex <= 0}
                        onClick={() => moveItem(d.slug, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="cr-icon-btn"
                        aria-label={`Move ${d.name} down`}
                        disabled={realIndex >= items.length - 1}
                        onClick={() => moveItem(d.slug, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="cr-mini"
                        onClick={() => toggleFeatured(d.slug)}
                      >
                        {d.featured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        type="button"
                        className="cr-mini"
                        onClick={() => toggleHidden(d.slug)}
                      >
                        {d.hidden ? "Show" : "Hide"}
                      </button>
                      <button
                        type="button"
                        className="cr-mini"
                        onClick={() => setEditingSlug(isEditing ? null : d.slug)}
                      >
                        {isEditing ? "Done" : "Edit"}
                      </button>
                      <button
                        type="button"
                        className="cr-mini"
                        onClick={() => setPreviewDemo(d)}
                      >
                        Preview
                      </button>
                      {!d.isCustom ? (
                        <a href={`/demos/${d.slug}`} onClick={onLink} className="cr-open-link">
                          Open <Icon name="arrow" className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="cr-mini cr-mini--danger"
                          onClick={() => removeCustomItem(d.slug)}
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {isEditing && (
                      <div className="cr-editor">
                        <label>
                          <span>Display Name</span>
                          <input
                            type="text"
                            value={d.name}
                            onChange={(e) => updateItemField(d.slug, { name: e.target.value })}
                          />
                        </label>
                        <label>
                          <span>Accent</span>
                          <input
                            type="color"
                            value={d.accent}
                            onChange={(e) => updateItemField(d.slug, { accent: e.target.value })}
                          />
                        </label>
                        <label className="cr-editor-wide">
                          <span>Summary</span>
                          <input
                            type="text"
                            value={d.summary}
                            onChange={(e) => updateItemField(d.slug, { summary: e.target.value })}
                          />
                        </label>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Live Card Preview Panel */}
        <aside className="cr-preview-pane" aria-label="Selected demo preview">
          <h3>Live Card Preview</h3>
          <p className="cr-hint">Shows how your local workspace configuration renders in the directory.</p>
          {(() => {
            const target = previewDemo || filtered[0] || items[0];
            if (!target) return null;
            return (
              <div
                className="cr-preview-card"
                style={{
                  borderColor: `${target.accent}66`,
                  background: `linear-gradient(160deg, ${target.accent}22, rgba(255,255,255,.02))`,
                }}
              >
                <div className="cr-preview-top">
                  <span style={{ color: target.accent, borderColor: `${target.accent}66` }}>{target.category}</span>
                  {target.has360Viewer && <em>360° Studio Viewer</em>}
                </div>
                <h4>{target.name}</h4>
                <small>{target.kind}</small>
                <p>{target.summary}</p>
                <ul>
                  {target.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                {!target.isCustom ? (
                  <a href={`/demos/${target.slug}`} onClick={onLink} className="cr-btn cr-btn--primary" style={{ marginTop: 14 }}>
                    Launch Live Demo <Icon name="arrow" className="w-4 h-4" />
                  </a>
                ) : (
                  <p className="cr-hint" style={{ marginTop: 12 }}>
                    Custom local card — saved in browser storage only.
                  </p>
                )}
              </div>
            );
          })()}
        </aside>
      </div>
    </section>
  );
}
