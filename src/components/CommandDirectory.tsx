import { useMemo, useState } from "react";
import Icon from "./Icon";
import data from "../data/commands.json";
import { botAuditCommit, botRepo } from "../data/botSource";

type Cmd = { key: string; name: string; category: string; description: string; usage: string[]; aliases: string[]; file: string };
const list = data.commands as Cmd[];
const meta = data.meta;
const categories = data.categories as { id: string; count: number; documented: number }[];
const PAGE = 48;

const label = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

function Copy({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "done" | "fail">("idle");
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setState("done"); }
    catch { setState("fail"); }
    setTimeout(() => setState("idle"), 1600);
  };
  return (
    <button type="button" className="cmd-copy" onClick={copy} aria-label={`Copy ${text} to clipboard`}>
      <Icon name={state === "done" ? "check" : state === "fail" ? "close" : "copy"} className="w-3.5 h-3.5" />
      <span>{state === "done" ? "Copied" : state === "fail" ? "Select" : "Copy"}</span>
    </button>
  );
}

export function CommandDirectory({ id = "commands" }: { id?: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [shown, setShown] = useState(PAGE);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const pool = list.filter((c) => cat === "all" || c.category === cat);
    if (!term) return pool;
    const score = (c: Cmd) => {
      if (c.name === term || `.${c.name}` === term) return 6;
      if (c.name.startsWith(term) || c.aliases.some((a) => a === term)) return 5;
      if (c.aliases.some((a) => a.startsWith(term))) return 4;
      if (c.name.includes(term)) return 3;
      if (c.aliases.some((a) => a.includes(term))) return 2;
      if (c.description.toLowerCase().includes(term) || c.usage.join(" ").toLowerCase().includes(term)) return 1;
      return 0;
    };
    return pool
      .map((c) => ({ c, s: score(c) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.c.name.length - b.c.name.length || a.c.name.localeCompare(b.c.name))
      .map((x) => x.c);
  }, [q, cat]);

  const reset = () => { setQ(""); setCat("all"); setShown(PAGE); };
  const visible = results.slice(0, shown);

  return (
    <section id={id} className="cmd-section" aria-labelledby={`${id}-title`}>
      <div className="cmd-head reveal">
        <p className="cmd-kicker">Command directory</p>
        <h2 id={`${id}-title`}>Browse every command</h2>
        <p className="cmd-lead">
          {list.length} command files parsed from the ProBoy-MD source, across {categories.length} categories.
          Use the prefix <code className="cmd-inline">{meta.prefix}</code> in WhatsApp, then search by name, alias or description.
        </p>
      </div>

      <div className="cmd-controls reveal">
        <label className="cmd-search">
          <span className="sr-only">Search commands</span>
          <Icon name="search" className="cmd-search-icon" />
          <input type="search" value={q} onChange={(e) => { setQ(e.target.value); setShown(PAGE); }}
            placeholder={`Try ${meta.prefix}pair, ${meta.prefix}ai, ${meta.prefix}menu ...`} autoComplete="off" />
          {q && <button type="button" className="cmd-clear" onClick={() => setQ("")} aria-label="Clear search"><Icon name="close" className="w-4 h-4" /></button>}
        </label>
        <div className="cmd-filters" role="group" aria-label="Filter commands by category">
          <button type="button" className={cat === "all" ? "is-on" : ""} aria-pressed={cat === "all"}
            onClick={() => { setCat("all"); setShown(PAGE); }}>All <span>{list.length}</span></button>
          {categories.map((c) => (
            <button key={c.id} type="button" className={cat === c.id ? "is-on" : ""} aria-pressed={cat === c.id}
              onClick={() => { setCat(c.id); setShown(PAGE); }}>{label(c.id)} <span>{c.count}</span></button>
          ))}
        </div>
      </div>

      <p className="cmd-count" role="status" aria-live="polite">
        {results.length === 0 ? "No commands match your search."
          : `Showing ${Math.min(shown, results.length)} of ${results.length} ${cat === "all" ? "commands" : `commands in ${label(cat)}`}${q ? ` for "${q}"` : ""}.`}
      </p>

      {results.length === 0 ? (
        <div className="cmd-empty">
          <Icon name="search" className="cmd-empty-icon" />
          <p>No command matches <strong>{q}</strong>{cat !== "all" && <> in <strong>{label(cat)}</strong></>}.</p>
          <p className="cmd-empty-hint">Try a shorter term, an alias, or reset the filters.</p>
          <button type="button" className="cmd-reset" onClick={reset}>Reset search and filters</button>
        </div>
      ) : (
        <ul className="cmd-list">
          {visible.map((c) => (
            <li key={c.key} className="cmd-card">
              <div className="cmd-card-top">
                <h3 className="cmd-name">{meta.prefix}{c.name}</h3>
                <span className="cmd-cat">{label(c.category)}</span>
              </div>
              {c.description
                ? <p className="cmd-desc">{c.description}</p>
                : <p className="cmd-desc cmd-desc--muted">No description provided in the source file.</p>}
              {c.usage.length > 0 && (
                <div className="cmd-usage">
                  <span className="cmd-usage-label">Usage</span>
                  {c.usage.slice(0, 3).map((u, i) => (
                    <div key={i} className="cmd-usage-row"><code>{u}</code><Copy text={u} /></div>
                  ))}
                </div>
              )}
              {c.aliases.length > 0 && (
                <p className="cmd-aliases"><span>Aliases</span>{c.aliases.map((a) => <code key={a}>{a}</code>)}</p>
              )}
              <a className="text-xs text-red-400 underline mt-3 inline-block" href={`${botRepo}/blob/${botAuditCommit}/${c.file}`} target="_blank" rel="noopener noreferrer">View source file</a>
            </li>
          ))}
        </ul>
      )}

      {shown < results.length && (
        <div className="cmd-more">
          <button type="button" onClick={() => setShown((n) => n + PAGE)}>
            Show {Math.min(PAGE, results.length - shown)} more commands
          </button>
        </div>
      )}

      <aside className="cmd-note">
        <strong>Count verification.</strong> The older menu snapshot reports {meta.reportedMenuTotal} commands and lists {meta.reportedListed} entries.
        The pinned repository contains {meta.repositoryCommandFiles} JavaScript command files in eight physical folders; this older website index records
        {meta.uniquePrimaryNames} unique primary names and {meta.uniqueInvocableTokens} invocable tokens across nine logical categories.
        File counts, names and aliases are different units. The checked package declares 1.0.0 and config.js 3.0.42; the older menu reports v{meta.version}.
        <a href="/proboy-md/docs/command-categories" className="text-red-400 underline"> Read the source count audit.</a>
      </aside>
    </section>
  );
}

export const commandMeta = meta;
export const commandCategories = categories;
