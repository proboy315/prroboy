import { useEffect, useMemo, useState } from "react";
import DemoControlRoom, { loadWorkspaceDemos, resetWorkspaceDemos } from "../components/DemoControlRoom";
import Icon from "../components/Icon";
import { demos as baseDemos, info, site, type Demo } from "../lib/data";
import { onLink } from "../lib/router";
import { breadcrumbLd, personLd, useSeo } from "../lib/seo";
import "./demos.css";

export default function DemosDirectory({ initialTab = "directory" }: { initialTab?: "directory" | "control-room" }) {
  const [tab, setTab] = useState<"directory" | "control-room">(initialTab);
  const [workspaceItems, setWorkspaceItems] = useState<Demo[]>(() => loadWorkspaceDemos().items);
  const [hasOverrides, setHasOverrides] = useState<boolean>(() => loadWorkspaceDemos().hasOverrides);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const sync = () => {
      const state = loadWorkspaceDemos();
      setWorkspaceItems(state.items);
      setHasOverrides(state.hasOverrides);
    };
    window.addEventListener("proboy-demos-updated", sync);
    return () => window.removeEventListener("proboy-demos-updated", sync);
  }, []);

  const isControlRoom = initialTab === "control-room";
  const trail: [string, string][] = isControlRoom
    ? [
        ["Home", "/"],
        ["Demos", "/demos"],
        ["Control Room", "/demos/control-room"],
      ]
    : [
        ["Home", "/"],
        ["Demos", "/demos"],
      ];

  useSeo({
    title: isControlRoom
      ? `Demo Control Room | Shahan Ali (PROBOY)`
      : `Interactive Demos (${baseDemos.length}) | Shahan Ali (PROBOY)`,
    description: isControlRoom
      ? "Local browser sandbox to customize, reorder, hide/show, and preview interactive demo cards built by Shahan Ali (PROBOY)."
      : `Explore ${baseDemos.length} interactive website and app demos by Shahan Ali (PROBOY) across e-commerce, SaaS, AI, hospitality, real estate, and developer tools.`,
    path: isControlRoom ? "/demos/control-room" : "/demos",
    noindex: isControlRoom,
    jsonLd: isControlRoom
      ? []
      : [
          breadcrumbLd(trail),
          personLd(),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Interactive Demos by ${info.name} (${info.brand})`,
            url: `${site}/demos`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: baseDemos.map((d, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: d.name,
                description: d.summary,
                url: `${site}/demos/${d.slug}`,
              })),
            },
          },
        ],
  });

  const visibleDemos = useMemo(() => workspaceItems.filter((d) => !d.hidden), [workspaceItems]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of visibleDemos) {
      counts.set(d.category, (counts.get(d.category) || 0) + 1);
    }
    return [{ name: "All", count: visibleDemos.length }, ...[...counts.entries()].map(([name, count]) => ({ name, count }))];
  }, [visibleDemos]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return visibleDemos.filter((d) => {
      if (cat !== "All" && d.category !== cat) return false;
      if (featuredOnly && !d.featured) return false;
      if (!term) return true;
      return `${d.name} ${d.kind} ${d.category} ${d.summary} ${d.features.join(" ")}`.toLowerCase().includes(term);
    });
  }, [visibleDemos, q, cat, featuredOnly]);

  return (
    <article className="max-w-[1220px] mx-auto px-5 lg:px-10 pt-32 lg:pt-40 pb-14">
      <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 mb-8">
        <ol className="flex flex-wrap gap-2">
          {trail.map(([name, path], i) => (
            <li key={path} className="flex gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i < trail.length - 1 ? (
                <a href={path} onClick={onLink} className="hover:text-red-400">
                  {name}
                </a>
              ) : (
                <span aria-current="page" className="text-zinc-300">
                  {name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="max-w-3xl">
        <p className="text-red-500 text-xs tracking-[0.3em] uppercase font-semibold">
          Interactive Studio · Sample Demonstrations
        </p>
        <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold tracking-tight">
          {baseDemos.length} working product &amp; interface demos
        </h1>
        <p className="mt-5 text-lg text-zinc-300 leading-relaxed">
          Explore interactive storefronts, SaaS analytics workspaces, AI prompt tools, booking flows, and Kanban
          boards built by {info.name} ({info.brand}). Every demo runs directly in your browser using clearly labeled
          sample data — not live client deployments.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTab("directory")}
            aria-pressed={tab === "directory"}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
              tab === "directory"
                ? "bg-red-600 text-white"
                : "bg-white/5 border border-white/15 text-zinc-200 hover:border-white/40"
            }`}
          >
            <Icon name="grid" className="w-4 h-4" /> Explore Demos ({visibleDemos.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("control-room")}
            aria-pressed={tab === "control-room"}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
              tab === "control-room"
                ? "bg-red-600 text-white"
                : "bg-white/5 border border-white/15 text-zinc-200 hover:border-white/40"
            }`}
          >
            <Icon name="layers" className="w-4 h-4" /> Demo Control Room
          </button>
          <a
            href="/proboy-md#playground"
            onClick={onLink}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium border border-white/20 text-zinc-200 hover:bg-white hover:text-black transition"
          >
            <Icon name="terminal" className="w-4 h-4" /> Try ProBoy-MD Playground
          </a>
        </div>
      </header>

      {hasOverrides && tab === "directory" && (
        <div
          role="status"
          className="mt-8 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-5 py-3.5 text-sm text-amber-200 flex flex-wrap items-center justify-between gap-3"
        >
          <span>
            Local Demo Workspace changes are active in this browser ({visibleDemos.length} visible of{" "}
            {workspaceItems.length} entries).
          </span>
          <button
            type="button"
            onClick={() => {
              resetWorkspaceDemos();
              setWorkspaceItems(baseDemos);
              setHasOverrides(false);
            }}
            className="text-xs font-semibold underline hover:text-white"
          >
            Reset to default sample data
          </button>
        </div>
      )}

      {tab === "control-room" ? (
        <div className="mt-10">
          <DemoControlRoom
            onChange={(next) => {
              setWorkspaceItems(next);
              setHasOverrides(true);
            }}
          />
        </div>
      ) : (
        <section aria-label="Interactive demos directory" className="mt-12">
          {/* Search & Category Controls */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[260px]">
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search demos by name, category, or capability..."
                  aria-label="Search interactive demos"
                  className="w-full min-h-[48px] rounded-xl bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-red-500"
                />
              </div>
              <button
                type="button"
                aria-pressed={featuredOnly}
                onClick={() => setFeaturedOnly((v) => !v)}
                className={`min-h-[48px] px-5 rounded-xl text-sm font-medium border transition ${
                  featuredOnly
                    ? "bg-red-600 border-red-600 text-white"
                    : "border-white/15 bg-white/[0.03] text-zinc-300 hover:border-white/40"
                }`}
              >
                {featuredOnly ? "★ Featured Only" : "☆ Featured Filter"}
              </button>
            </div>

            <div role="group" aria-label="Filter demos by category" className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  aria-pressed={cat === c.name}
                  onClick={() => setCat(c.name)}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium border transition ${
                    cat === c.name
                      ? "bg-red-600 border-red-600 text-white"
                      : "border-white/15 bg-white/[0.02] text-zinc-300 hover:border-white/40"
                  }`}
                >
                  {c.name} ({c.count})
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-sm text-zinc-400" role="status">
            Showing {filtered.length} of {visibleDemos.length} interactive sample demos
            {cat !== "All" ? ` in ${cat}` : ""}
            {q ? ` matching "${q}"` : ""}.
          </p>

          {filtered.length === 0 ? (
            <div className="mt-8 glass p-10 text-center">
              <p className="text-zinc-300">No demos match your current search or filter.</p>
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setCat("All");
                  setFeaturedOnly(false);
                }}
                className="mt-4 rounded-full px-5 py-2.5 text-sm bg-red-600 hover:bg-red-500 text-white font-medium"
              >
                Reset search &amp; filters
              </button>
            </div>
          ) : (
            <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((d) => (
                <li
                  key={d.slug}
                  className="group rounded-2xl border border-white/12 overflow-hidden flex flex-col justify-between transition hover:-translate-y-1"
                  style={{
                    background: `linear-gradient(160deg, ${d.accent}1f, rgba(255,255,255,.025))`,
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className="inline-block text-[10.5px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
                        style={{ color: d.accent, borderColor: `${d.accent}66` }}
                      >
                        {d.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {d.has360Viewer && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-zinc-200">
                            360° Viewer
                          </span>
                        )}
                        {d.featured && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-white group-hover:text-red-400 transition">
                      {d.isCustom ? (
                        d.name
                      ) : (
                        <a href={`/demos/${d.slug}`} onClick={onLink}>
                          {d.name}
                        </a>
                      )}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">{d.kind}</p>
                    <p className="mt-3 text-sm text-zinc-300 leading-relaxed">{d.summary}</p>

                    <ul className="mt-4 space-y-1.5 text-xs text-zinc-400">
                      {d.features.slice(0, 3).map((feat) => (
                        <li key={feat} className="flex gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: d.accent }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3 bg-black/20">
                    {d.isCustom ? (
                      <span className="text-xs text-zinc-400">Custom local workspace card</span>
                    ) : (
                      <a
                        href={`/demos/${d.slug}`}
                        onClick={onLink}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-300"
                      >
                        Open demo <Icon name="arrow" className="w-4 h-4" />
                      </a>
                    )}
                    <span className="text-[11px] text-zinc-500">Sample data</span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* Hiring CTA */}
          <div className="mt-16 glass p-7 sm:p-9 flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-red-500 text-xs tracking-[0.28em] uppercase font-semibold">Custom Engineering</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold">Need a custom web app, bot, or storefront?</h2>
              <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                Every demo above is built with clean React, TypeScript, and modular UI architecture. Reach out to
                discuss building a tailored product for your team.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="/contact"
                onClick={onLink}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white transition"
              >
                Start a Project <Icon name="arrow" className="w-4 h-4" />
              </a>
              <a
                href="/services"
                onClick={onLink}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium border border-white/25 hover:bg-white hover:text-black transition"
              >
                View Services
              </a>
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
