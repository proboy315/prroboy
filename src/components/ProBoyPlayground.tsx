import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./Icon";
import {
  classifiedCommands,
  commandCategories,
  commandMeta,
  executePlaygroundCommand,
  playgroundCoverage,
  type ClassifiedCommand,
  type CommandExecutionResult,
  type ExecutionMode,
} from "../lib/proboyCommands";

type ChatMessage = {
  id: string;
  direction: "outgoing" | "incoming";
  text: string;
  timestamp: string;
  badgeLabel?: string;
  mode?: CommandExecutionResult["mode"];
  copyableText?: string;
  sourceFile?: string;
  requirements?: string[];
};

const QUICK_STARTERS = [
  { label: ".calc (125 * 4) + 32 / 2", cmd: ".calc (125 * 4) + 32 / 2", tag: "Local" },
  { label: ".github", cmd: ".github", tag: "Live API" },
  { label: ".npm @whiskeysockets/baileys", cmd: ".npm @whiskeysockets/baileys", tag: "Live API" },
  { label: ".funfact", cmd: ".funfact", tag: "Live API" },
  { label: ".roll", cmd: ".roll", tag: "Local" },
  { label: ".uptime", cmd: ".uptime", tag: "Local" },
  { label: ".owner", cmd: ".owner", tag: "Local" },
  { label: ".pair 923001234567", cmd: ".pair 923001234567", tag: "Simulated" },
  { label: ".restart", cmd: ".restart", tag: "Owner-Only" },
];

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function initialMessages(): ChatMessage[] {
  return [
    {
      id: "welcome-1",
      direction: "incoming",
      text: [
        `Welcome to the ProBoy-MD Playground (v${commandMeta.version} snapshot · prefix "${commandMeta.prefix}").`,
        `• Commands with pure browser logic (such as .calc, .roll, .uptime, .owner, .readmore) run directly in your browser.`,
        `• Commands backed by safe public CORS APIs (.github, .npm, .funfact) fetch live data.`,
        `• Session-dependent or owner-only commands (.pair, .ai, .sticker, .restart) show a clearly labeled simulated preview.`,
      ].join("\n"),
      // A fixed placeholder keeps the server and client render identical; the real
      // clock is applied after hydration (a live value would break hydration).
      timestamp: "--:--",
      badgeLabel: "Playground guide",
      mode: "browser-demo",
    },
  ];
}

export default function ProBoyPlayground() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => initialMessages());
  const [input, setInput] = useState(".calc (125 * 4) + 32 / 2");
  const [busy, setBusy] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState<"all" | ExecutionMode>("all");
  const [selectedCmd, setSelectedCmd] = useState<ClassifiedCommand>(
    () => classifiedCommands.find((c) => c.name === "calc") || classifiedCommands[0]
  );

  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((list) =>
      list.map((message) =>
        message.badgeLabel === "Playground guide" ? { ...message, timestamp: nowTime() } : message
      )
    );
  }, []);

  useEffect(() => {
    const el = feedRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/^\.+/, "");
    return classifiedCommands.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (modeFilter !== "all" && c.executionMode !== modeFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.aliases.some((a) => a.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    });
  }, [search, categoryFilter, modeFilter]);

  const autocompleteMatches = useMemo(() => {
    const raw = input.trim();
    if (!raw.startsWith(commandMeta.prefix)) return [];
    const token = raw.slice(commandMeta.prefix.length).split(/\s+/)[0]?.toLowerCase() || "";
    if (!token || raw.includes(" ")) return [];
    return classifiedCommands
      .filter((c) => c.name.toLowerCase().startsWith(token) || c.aliases.some((a) => a.toLowerCase().startsWith(token)))
      .slice(0, 6);
  }, [input]);

  const copyText = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 1600);
    } catch {
      setCopiedId("");
    }
  };

  const runCommand = async (rawCommand: string) => {
    const text = rawCommand.trim();
    if (!text || busy) return;

    const outId = `out-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setMessages((prev) => [
      ...prev,
      {
        id: outId,
        direction: "outgoing",
        text,
        timestamp: nowTime(),
      },
    ]);
    setInput("");
    setBusy(true);

    try {
      const result = await executePlaygroundCommand(text);
      if (result.command) {
        setSelectedCmd(result.command);
      }

      const inId = `in-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const reducedMotion =
        typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (result.frames && result.frames.length > 1 && !reducedMotion) {
        setMessages((prev) => [
          ...prev,
          {
            id: inId,
            direction: "incoming",
            text: result.frames![0],
            timestamp: nowTime(),
            badgeLabel: result.badgeLabel,
            mode: result.mode,
            copyableText: result.copyableText,
            sourceFile: result.sourceFile,
            requirements: result.requirements,
          },
        ]);
        for (let i = 1; i < result.frames.length; i++) {
          await new Promise((r) => setTimeout(r, 240));
          const frameText = result.frames[i];
          setMessages((prev) => prev.map((m) => (m.id === inId ? { ...m, text: frameText } : m)));
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: inId,
            direction: "incoming",
            text: result.text,
            timestamp: nowTime(),
            badgeLabel: result.badgeLabel,
            mode: result.mode,
            copyableText: result.copyableText,
            sourceFile: result.sourceFile,
            requirements: result.requirements,
          },
        ]);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSelectCommand = (cmd: ClassifiedCommand) => {
    setSelectedCmd(cmd);
    setInput(cmd.exampleInput);
  };

  const handleResetPlayground = () => {
    setMessages(initialMessages());
    setInput(".calc (125 * 4) + 32 / 2");
    setSearch("");
    setCategoryFilter("all");
    setModeFilter("all");
    const defaultCmd = classifiedCommands.find((c) => c.name === "calc") || classifiedCommands[0];
    setSelectedCmd(defaultCmd);
  };

  return (
    <div className="pg-section" aria-labelledby="pg-heading">
      <div className="pmd-head">
        <p className="pmd-kicker">
          <span /> Interactive Browser Sandbox
        </p>
        <h2 id="pg-heading">ProBoy-MD Playground</h2>
        <p className="pmd-lead">
          Test ProBoy-MD commands in a WhatsApp-style chat interface. This is an independent browser playground built
          from the repository source — not an official WhatsApp product and not connected to a live WhatsApp account.
        </p>
      </div>

      {/* Quick Starter Pills */}
      <div className="pg-starters" role="group" aria-label="Quick command examples">
        {QUICK_STARTERS.map((s) => (
          <button
            key={s.cmd}
            type="button"
            className="pg-starter-btn"
            onClick={() => {
              setInput(s.cmd);
              void runCommand(s.cmd);
            }}
          >
            <code>{s.label}</code>
            <span>{s.tag}</span>
          </button>
        ))}
      </div>

      <div className="pg-grid">
        {/* Left: WhatsApp-style Chat Interface */}
        <div className="pg-chat" aria-label="ProBoy-MD Playground chat window">
          <header className="pg-chat-head">
            <div className="pg-bot-avatar" aria-hidden="true">
              PB
            </div>
            <div className="pg-bot-meta">
              <strong>ProBoy-MD Playground</strong>
              <span>
                {busy
                  ? "Processing command..."
                  : `Sandbox · Prefix "${commandMeta.prefix}" · ${playgroundCoverage.total} verified commands`}
              </span>
            </div>
            <div className="pg-chat-actions">
              <button
                type="button"
                className="pg-mini-btn"
                onClick={() => setMessages(initialMessages())}
                title="Clear chat messages"
              >
                Clear chat
              </button>
              <button
                type="button"
                className="pg-mini-btn"
                onClick={handleResetPlayground}
                title="Reset playground state"
              >
                Reset playground
              </button>
            </div>
          </header>

          <div ref={feedRef} className="pg-feed" role="log" aria-live="polite" aria-label="Command conversation">
            {messages.map((m) => (
              <div key={m.id} className={`pg-msg pg-msg--${m.direction}`}>
                {m.direction === "incoming" && m.badgeLabel && (
                  <div className="pg-msg-badges">
                    <span className={`pg-mode-badge pg-mode-badge--${m.mode || "simulation-only"}`}>
                      {m.badgeLabel}
                    </span>
                    {m.sourceFile && <code className="pg-src-pill">{m.sourceFile}</code>}
                  </div>
                )}
                <pre className="pg-msg-text">{m.text}</pre>
                <div className="pg-msg-foot">
                  {m.copyableText && (
                    <button
                      type="button"
                      className="pg-copy-inline"
                      onClick={() => void copyText(m.id, m.copyableText!)}
                    >
                      <Icon name={copiedId === m.id ? "check" : "copy"} className="w-3 h-3" />
                      {copiedId === m.id ? "Copied" : "Copy output"}
                    </button>
                  )}
                  <time>{m.timestamp}</time>
                  {m.direction === "outgoing" && <span aria-label="Delivered in playground">✓✓</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Autocomplete bar */}
          {autocompleteMatches.length > 0 && (
            <div className="pg-suggest" role="listbox" aria-label="Command suggestions">
              {autocompleteMatches.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => {
                    setSelectedCmd(c);
                    setInput(c.exampleInput);
                  }}
                >
                  <code>
                    {commandMeta.prefix}
                    {c.name}
                  </code>
                  <span>{c.description || c.category}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input hint */}
          <div className="pg-hint-bar">
            <span>{selectedCmd.inputHint}</span>
            <div className="pg-hint-actions">
              <button
                type="button"
                onClick={() => setInput(selectedCmd.exampleInput)}
                className="pg-link-btn"
              >
                Try example
              </button>
              <button
                type="button"
                onClick={() => void copyText("input-copy", input || selectedCmd.exampleInput)}
                className="pg-link-btn"
              >
                {copiedId === "input-copy" ? "Copied!" : "Copy command"}
              </button>
            </div>
          </div>

          <form
            className="pg-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void runCommand(input);
            }}
          >
            <label htmlFor="pg-cmd-input" className="sr-only">
              Enter a ProBoy-MD command
            </label>
            <input
              id="pg-cmd-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Type a command like ${commandMeta.prefix}calc 9 * 7 or ${commandMeta.prefix}github ...`}
              autoComplete="off"
              spellCheck={false}
            />
            <button type="submit" disabled={busy || !input.trim()} className="pg-send-btn">
              <Icon name="send" className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Right: Command Inspector & Catalog Picker */}
        <aside className="pg-inspector" aria-label="Command inspector and catalog">
          {/* Selected Command Detail Card */}
          <div className="pg-detail-card">
            <div className="pg-detail-head">
              <div>
                <p className="pg-detail-kicker">Selected Command · {selectedCmd.category}</p>
                <h3>
                  {commandMeta.prefix}
                  {selectedCmd.name}
                </h3>
              </div>
              <span className={`pg-mode-badge pg-mode-badge--${selectedCmd.executionMode}`}>
                {selectedCmd.executionMode === "browser-demo"
                  ? "Browser-Executable"
                  : selectedCmd.executionMode === "public-api"
                  ? "Public API"
                  : "Simulation-Only"}
              </span>
            </div>

            <p className="pg-detail-desc">
              {selectedCmd.description || "No description string was declared in the source file."}
            </p>

            <dl className="pg-detail-meta">
              <div>
                <dt>Source file</dt>
                <dd>
                  <code>{selectedCmd.file}</code>
                </dd>
              </div>
              <div>
                <dt>Usage syntax</dt>
                <dd>
                  <code>{selectedCmd.usage[0] || `${commandMeta.prefix}${selectedCmd.name}`}</code>
                </dd>
              </div>
              <div>
                <dt>Aliases</dt>
                <dd>{selectedCmd.aliases.length > 0 ? selectedCmd.aliases.join(", ") : "None"}</dd>
              </div>
              <div>
                <dt>Runtime &amp; permissions</dt>
                <dd>
                  {selectedCmd.requirements.length > 0
                    ? selectedCmd.requirements.join(" · ")
                    : "None (runs directly in browser)"}
                </dd>
              </div>
            </dl>

            <p className="pg-detail-note">{selectedCmd.sourceNotes}</p>

            <div className="pg-detail-actions">
              <button
                type="button"
                className="pg-run-selected"
                onClick={() => {
                  setInput(selectedCmd.exampleInput);
                  void runCommand(selectedCmd.exampleInput);
                }}
              >
                Run {selectedCmd.exampleInput}
              </button>
              <button
                type="button"
                className="pg-mini-btn"
                onClick={() => void copyText("selected-copy", selectedCmd.exampleInput)}
              >
                {copiedId === "selected-copy" ? "Copied" : "Copy command"}
              </button>
            </div>
          </div>

          {/* Search & Filter Picker */}
          <div className="pg-picker">
            <div className="pg-picker-controls">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Filter all ${playgroundCoverage.total} commands...`}
                aria-label="Filter playground commands"
              />
              <div className="pg-mode-tabs" role="group" aria-label="Filter by execution mode">
                {(
                  [
                    ["all", `All (${playgroundCoverage.total})`],
                    ["browser-demo", `Local (${playgroundCoverage.browserDemo})`],
                    ["public-api", `Live API (${playgroundCoverage.publicApi})`],
                    ["simulation-only", `Simulated (${playgroundCoverage.simulationOnly})`],
                  ] as const
                ).map(([val, lbl]) => (
                  <button
                    key={val}
                    type="button"
                    aria-pressed={modeFilter === val}
                    className={modeFilter === val ? "is-on" : ""}
                    onClick={() => setModeFilter(val)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              <div className="pg-cat-pills" role="group" aria-label="Filter by category">
                <button
                  type="button"
                  aria-pressed={categoryFilter === "all"}
                  className={categoryFilter === "all" ? "is-on" : ""}
                  onClick={() => setCategoryFilter("all")}
                >
                  All
                </button>
                {commandCategories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={categoryFilter === c.id}
                    className={categoryFilter === c.id ? "is-on" : ""}
                    onClick={() => setCategoryFilter(c.id)}
                  >
                    {c.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="pg-picker-list" role="list" aria-label="Matching commands">
              {filteredCatalog.length === 0 ? (
                <p className="pg-picker-empty">No commands match your filter.</p>
              ) : (
                filteredCatalog.slice(0, 60).map((cmd) => (
                  <button
                    key={cmd.key}
                    type="button"
                    role="listitem"
                    className={`pg-picker-item${selectedCmd.key === cmd.key ? " is-selected" : ""}`}
                    onClick={() => handleSelectCommand(cmd)}
                  >
                    <div>
                      <code>
                        {commandMeta.prefix}
                        {cmd.name}
                      </code>
                      <span>{cmd.description || cmd.file}</span>
                    </div>
                    <em className={`pg-dot-mode pg-dot-mode--${cmd.executionMode}`}>{cmd.category}</em>
                  </button>
                ))
              )}
              {filteredCatalog.length > 60 && (
                <p className="pg-picker-more">
                  Showing first 60 of {filteredCatalog.length} matches. Narrow your search or browse the full directory
                  below.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* QA & Source Coverage Summary */}
      <div className="pg-qa-box" aria-label="Command catalogue verification and coverage summary">
        <h3>Command Catalogue QA &amp; Coverage Summary</h3>
        <dl className="pg-qa-stats">
          <div>
            <dt>Repository files verified</dt>
            <dd>{playgroundCoverage.total}</dd>
          </div>
          <div>
            <dt>Categories covered</dt>
            <dd>{playgroundCoverage.categories}</dd>
          </div>
          <div>
            <dt>Locally executable</dt>
            <dd>{playgroundCoverage.browserDemo}</dd>
          </div>
          <div>
            <dt>Public CORS API</dt>
            <dd>{playgroundCoverage.publicApi}</dd>
          </div>
          <div>
            <dt>Simulated / session-req.</dt>
            <dd>{playgroundCoverage.simulationOnly}</dd>
          </div>
          <div>
            <dt>Owner-only restricted</dt>
            <dd>{playgroundCoverage.ownerOnly}</dd>
          </div>
        </dl>
        <p className="pg-qa-note">
          Snapshot verification ({commandMeta.repoVerifiedAt}): {playgroundCoverage.total} command files (
          {playgroundCoverage.uniquePrimaryNames} unique primary names, {playgroundCoverage.uniqueInvocableTokens}{" "}
          invocable tokens) across {playgroundCoverage.categories} categories. The supplied menu reported{" "}
          {playgroundCoverage.reportedMenuTotal} commands ({playgroundCoverage.reportedListed} listed); this discrepancy
          is preserved transparently rather than inventing missing commands.
        </p>
      </div>
    </div>
  );
}
