import { useEffect, useMemo, useState } from "react";
import {
  deleteRepoFile,
  deleteRepoFolder,
  fileToBase64,
  getRepoFile,
  getRepoTree,
  listDir,
  moveRepoFile,
  putRepoFile,
} from "../../lib/githubApi";
import type { GitHubConfig, GitHubEntry, GitHubTreeItem } from "../../lib/githubApi";
import Icon from "../Icon";

type Props = {
  cfg: GitHubConfig;
  connected: boolean;
  onToast: (type: "ok" | "err" | "info", msg: string) => void;
  onRepoChange: () => void;
};

const TEMPLATES: Record<string, { label: string; ext: string; code: string }> = {
  liquidHtml: {
    label: "Styled HTML page",
    ext: "index.html",
    code: `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>New Public Page</title>
<style>
body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07070a;color:#fff;font-family:Inter,system-ui,sans-serif}
.card{max-width:620px;padding:36px;border-radius:22px;background:#10141f;border:1px solid #232c44}
</style>
</head>
<body><main class="card"><h1>New public page</h1><p>Created via PROBOY Admin.</p></main></body>
</html>`,
  },
  blankHtml: {
    label: "Blank HTML",
    ext: "index.html",
    code: `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>Untitled</title>\n</head>\n<body>\n<h1>Hello</h1>\n</body>\n</html>\n`,
  },
  js: { label: "JavaScript", ext: "app.js", code: `console.log("loaded");\n` },
  css: { label: "CSS", ext: "style.css", code: `.box{border-radius:16px;border:1px solid #232c44;}\n` },
  json: { label: "JSON", ext: "data.json", code: `{\n  "ok": true,\n  "items": []\n}\n` },
  blank: { label: "Empty file", ext: "file.txt", code: "" },
};

const IMG = new Set(["png", "jpg", "jpeg", "webp", "gif", "avif", "ico", "svg"]);
const extOf = (p: string) => p.split(".").pop()?.toLowerCase() || "";
const fmtSize = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`);

export default function AdminPublicStudioTab({ cfg, connected, onToast, onRepoChange }: Props) {
  const [cwd, setCwd] = useState("public");
  const [entries, setEntries] = useState<GitHubEntry[]>([]);
  const [tree, setTree] = useState<GitHubTreeItem[]>([]);
  const [q, setQ] = useState("");
  const [loadingDir, setLoadingDir] = useState(false);

  const [activePath, setActivePath] = useState("");
  const [activeSha, setActiveSha] = useState<string | undefined>();
  const [code, setCode] = useState("");
  const [orig, setOrig] = useState("");
  const [dlUrl, setDlUrl] = useState<string | null>(null);
  const [rawB64, setRawB64] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<"code" | "view">("code");

  const [folderOpen, setFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderFile, setFolderFile] = useState("index.html");
  const [folderTpl, setFolderTpl] = useState("liquidHtml");

  const [fileOpen, setFileOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileTpl, setFileTpl] = useState("liquidHtml");

  const [moveOpen, setMoveOpen] = useState(false);
  const [moveTo, setMoveTo] = useState("");

  const loadFolder = async (dir: string) => {
    if (!connected) return;
    setLoadingDir(true);
    try {
      const clean = dir.replace(/^\/+|\/+$/g, "");
      setEntries(await listDir(cfg, clean));
      setCwd(clean);
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Folder open failed.");
    } finally {
      setLoadingDir(false);
    }
  };

  const loadTree = async () => {
    if (!connected) return;
    try {
      setTree(await getRepoTree(cfg));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (connected) {
      void loadFolder(cwd);
      void loadTree();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, cfg.owner, cfg.repo, cfg.branch]);

  const openFile = async (p: string) => {
    if (!connected) return;
    setLoadingFile(true);
    setPreview("code");
    try {
      const f = await getRepoFile(cfg, p);
      setActivePath(f.path);
      setActiveSha(f.sha);
      setCode(f.content);
      setOrig(f.content);
      setDlUrl(f.downloadUrl);
      setRawB64(f.rawBase64);
      setMsg(`Update ${f.path}`);
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Read failed.");
    } finally {
      setLoadingFile(false);
    }
  };

  const saveFile = async () => {
    if (!connected || !activePath) return;
    setSaving(true);
    try {
      const r = await putRepoFile(cfg, activePath, code, msg || `Update ${activePath}`, { sha: activeSha });
      setActiveSha(r.sha);
      setOrig(code);
      onToast("ok", `Saved ${activePath}.`);
      await loadFolder(cwd);
      await loadTree();
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return tree.filter((t) => t.path.toLowerCase().includes(s)).slice(0, 60);
  }, [q, tree]);

  const ext = extOf(activePath);
  const isImg = IMG.has(ext) && ext !== "svg";
  const isSvg = ext === "svg";
  const isHtml = ext === "html" || ext === "htm";
  const dirty = activePath !== "" && code !== orig;
  const pubUrl = activePath.startsWith("public/") ? `/${activePath.slice(7)}` : "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="ad-card">
        <div className="ad-card-head">
          <div>
            <span className="ad-pill ad-pill-red">public/ · Files &amp; Code Studio</span>
            <h2 className="ad-card-title" style={{ marginTop: 10, fontSize: 20 }}>File manager &amp; code editor</h2>
            <p className="ad-card-sub">Create folders in <code>public/</code>, write HTML/CSS/JS/JSON, upload &amp; push to GitHub.</p>
          </div>
          <div className="ad-row" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button className="ad-btn ad-btn-sm" disabled={!connected} onClick={() => setFolderOpen(true)}>
              <Icon name="folderPlus" className="w-4 h-4" /> Folder
            </button>
            <button className="ad-btn ad-btn-sm" disabled={!connected} onClick={() => setFileOpen(true)}>
              <Icon name="plus" className="w-4 h-4" /> File
            </button>
            <label className="ad-btn ad-btn-primary ad-btn-sm" style={{ cursor: "pointer" }}>
              <Icon name="upload" className="w-4 h-4" /> {uploading ? "…" : "Upload"}
              <input
                type="file"
                multiple
                hidden
                disabled={!connected || uploading}
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files?.length) return;
                  setUploading(true);
                  try {
                    for (const f of Array.from(files)) {
                      const dest = cwd ? `${cwd}/${f.name}` : f.name;
                      await putRepoFile(cfg, dest, await fileToBase64(f), `Upload ${dest}`, { isBase64: true });
                    }
                    onToast("ok", `Uploaded ${files.length} file(s) to ${cwd || "/"}.`);
                    await loadFolder(cwd);
                    await loadTree();
                    onRepoChange();
                  } catch (err) {
                    onToast("err", err instanceof Error ? err.message : "Upload failed.");
                  } finally {
                    setUploading(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </div>
        </div>

        <div className="ad-row" style={{ flexWrap: "wrap", justifyContent: "space-between" }}>
          <div className="ad-row" style={{ flexWrap: "wrap" }}>
            {[
              { l: "public/", p: "public" },
              { l: "images/", p: "public/images" },
              { l: "src/data/", p: "src/data" },
              { l: "root /", p: "" },
            ].map((b) => (
              <button key={b.l} className={`ad-btn ad-btn-sm ${cwd === b.p ? "ad-btn-primary" : ""}`} disabled={!connected} onClick={() => void loadFolder(b.p)}>
                {b.l}
              </button>
            ))}
          </div>
          <input className="ad-input" style={{ maxWidth: 300 }} placeholder="Search whole repo…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" spellCheck={false} />
        </div>

        <p className="ad-hint ad-mono" style={{ marginTop: 12 }}>
          /{cwd || ""} {loadingDir ? "· loading…" : `· ${entries.length} items`}
        </p>
      </div>

      <div className="ad-grid-2" style={{ gridTemplateColumns: "320px 1fr", alignItems: "start" }}>
        <div className="ad-card" style={{ padding: 14 }}>
          {q.trim() ? (
            <div className="ad-list" style={{ maxHeight: 560, overflowY: "auto" }}>
              {results.map((r) => (
                <button
                  key={r.path}
                  className="ad-item"
                  style={{ cursor: "pointer", textAlign: "left", width: "100%" }}
                  onClick={() => {
                    if (r.type === "tree") void loadFolder(r.path);
                    else {
                      const parent = r.path.includes("/") ? r.path.slice(0, r.path.lastIndexOf("/")) : "";
                      void loadFolder(parent);
                      void openFile(r.path);
                    }
                    setQ("");
                  }}
                >
                  <Icon name={r.type === "tree" ? "folder" : "file"} className="w-4 h-4" />
                  <span className="ad-mono" style={{ fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.path}</span>
                </button>
              ))}
              {!results.length && <p className="ad-hint">No matches.</p>}
            </div>
          ) : (
            <div className="ad-list" style={{ maxHeight: 560, overflowY: "auto" }}>
              {cwd && (
                <button className="ad-btn ad-btn-sm" onClick={() => void loadFolder(cwd.includes("/") ? cwd.slice(0, cwd.lastIndexOf("/")) : "")}>
                  ↑ Up one level
                </button>
              )}
              {entries.map((en) => (
                <div key={en.path} className={`ad-item ${activePath === en.path ? "active" : ""}`}>
                  <button
                    style={{ flex: 1, minWidth: 0, textAlign: "left", display: "flex", gap: 10, alignItems: "center", cursor: "pointer", background: "none", border: "none", color: "inherit" }}
                    onClick={() => (en.type === "dir" ? void loadFolder(en.path) : void openFile(en.path))}
                  >
                    <Icon name={en.type === "dir" ? "folder" : "file"} className="w-4 h-4" />
                    <span className="ad-mono" style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{en.name}</span>
                    {en.type === "file" && <span style={{ marginLeft: "auto", fontSize: 10.5, color: "#7c86a3" }}>{fmtSize(en.size)}</span>}
                  </button>
                  <button
                    title="Delete"
                    style={{ background: "none", border: "none", color: "#8b93ad", cursor: "pointer" }}
                    onClick={async () => {
                      if (!window.confirm(en.type === "dir" ? `Delete folder ${en.path} + everything inside?` : `Delete ${en.path}?`)) return;
                      setSaving(true);
                      try {
                        if (en.type === "dir") await deleteRepoFolder(cfg, en.path);
                        else await deleteRepoFile(cfg, en.path, en.sha, `Delete ${en.path}`);
                        if (activePath === en.path) { setActivePath(""); setCode(""); setOrig(""); }
                        onToast("ok", `Deleted ${en.path}.`);
                        await loadFolder(cwd);
                        await loadTree();
                        onRepoChange();
                      } catch (err) {
                        onToast("err", err instanceof Error ? err.message : "Delete failed.");
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {!entries.length && !loadingDir && <p className="ad-hint">Empty folder.</p>}
            </div>
          )}
        </div>

        <div className="ad-card">
          {!activePath ? (
            <div style={{ textAlign: "center", padding: "56px 20px" }}>
              <h3 className="ad-card-title" style={{ fontSize: 17 }}>Pick a file or create something new</h3>
              <p className="ad-card-sub">HTML preview, image preview, Tab indentation, JSON formatter.</p>
              <div className="ad-row" style={{ justifyContent: "center", marginTop: 16, flexWrap: "wrap" }}>
                <button className="ad-btn" disabled={!connected} onClick={() => setFolderOpen(true)}>Create folder in {cwd || "root"}/</button>
                <button className="ad-btn ad-btn-primary" disabled={!connected} onClick={() => setFileOpen(true)}>New code file</button>
              </div>
            </div>
          ) : (
            <>
              <div className="ad-card-head">
                <div style={{ minWidth: 0 }}>
                  <p className="ad-mono" style={{ color: "#fff", fontWeight: 700, overflowWrap: "anywhere" }}>{activePath} {dirty && <span className="ad-pill ad-pill-amber" style={{ marginLeft: 8 }}>Unsaved</span>}</p>
                  {pubUrl && <p className="ad-hint">Public URL: <code>{pubUrl}</code></p>}
                </div>
                <div className="ad-row" style={{ flexWrap: "wrap" }}>
                  {(isHtml || isSvg) && (
                    <div className="ad-tabs">
                      <button className={`ad-tab ${preview === "code" ? "active" : ""}`} onClick={() => setPreview("code")}>Code</button>
                      <button className={`ad-tab ${preview === "view" ? "active" : ""}`} onClick={() => setPreview("view")}>Preview</button>
                    </div>
                  )}
                  {ext === "json" && (
                    <button
                      className="ad-btn ad-btn-sm"
                      onClick={() => {
                        try {
                          setCode(JSON.stringify(JSON.parse(code), null, 2) + "\n");
                          onToast("info", "JSON formatted.");
                        } catch {
                          onToast("err", "Invalid JSON.");
                        }
                      }}
                    >
                      Format
                    </button>
                  )}
                  <button className="ad-btn ad-btn-sm" onClick={() => { setMoveTo(activePath); setMoveOpen(true); }}>Move</button>
                </div>
              </div>

              {loadingFile ? (
                <p className="ad-hint">Loading from GitHub…</p>
              ) : isImg ? (
                <div style={{ background: "#080c15", border: "1px solid #1c2742", borderRadius: 12, padding: 20, textAlign: "center" }}>
                  <img src={rawB64 ? `data:image/${ext};base64,${rawB64}` : dlUrl || ""} alt={activePath} style={{ maxHeight: 420, maxWidth: "100%", borderRadius: 10 }} />
                  <p className="ad-hint">Binary image — upload same filename to replace.</p>
                </div>
              ) : (isHtml || isSvg) && preview === "view" ? (
                <iframe title={activePath} srcDoc={code} sandbox="allow-scripts allow-forms" style={{ width: "100%", height: 480, borderRadius: 12, border: "1px solid #223047", background: "#fff" }} />
              ) : (
                <>
                  <textarea
                    className="ad-textarea"
                    rows={22}
                    spellCheck={false}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const el = e.currentTarget;
                        const s = el.selectionStart, en2 = el.selectionEnd;
                        setCode(code.slice(0, s) + "  " + code.slice(en2));
                        requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 2; });
                      }
                    }}
                  />
                  <p className="ad-hint">Lines {code.split("\n").length} · {code.length} chars · Tab = 2 spaces</p>
                </>
              )}

              {!isImg && (
                <div className="ad-row" style={{ marginTop: 14, flexWrap: "wrap" }}>
                  <input className="ad-input ad-mono" style={{ flex: 1, minWidth: 200 }} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Commit message" autoComplete="off" />
                  <button className="ad-btn ad-btn-primary" onClick={saveFile} disabled={!connected || saving}>
                    <Icon name="save" className="w-4 h-4" /> {saving ? "Pushing…" : "Commit file"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {folderOpen && (
        <div className="ad-modal-bg" onClick={() => setFolderOpen(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="ad-card-title">New folder in {cwd || "/"}/</h3>
            <p className="ad-card-sub">Git needs a file inside — pick <code>.gitkeep</code> or a starter page.</p>
            <div className="ad-field">
              <label className="ad-label">Folder name (nested ok: tools/my-app)</label>
              <input className="ad-input ad-mono" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="my-app" autoComplete="off" spellCheck={false} />
            </div>
            <div className="ad-form-grid">
              <div>
                <label className="ad-label">First file</label>
                <input className="ad-input ad-mono" value={folderFile} onChange={(e) => setFolderFile(e.target.value)} />
              </div>
              <div>
                <label className="ad-label">Template</label>
                <select className="ad-select" value={folderTpl} onChange={(e) => setFolderTpl(e.target.value)}>
                  {Object.entries(TEMPLATES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="ad-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
              <button className="ad-btn" onClick={() => setFolderOpen(false)}>Cancel</button>
              <button
                className="ad-btn ad-btn-primary"
                disabled={saving}
                onClick={async () => {
                  const f = folderName.trim().replace(/^\/+|\/+$/g, "");
                  if (!f) return onToast("err", "Enter folder name.");
                  const starter = folderFile.trim() || ".gitkeep";
                  const target = `${cwd ? cwd + "/" : ""}${f}/${starter}`;
                  setSaving(true);
                  try {
                    await putRepoFile(cfg, target, starter === ".gitkeep" ? "" : TEMPLATES[folderTpl].code, `Create ${target}`);
                    setFolderOpen(false);
                    setFolderName("");
                    onToast("ok", `Created ${target}.`);
                    await loadFolder(`${cwd ? cwd + "/" : ""}${f}`);
                    await loadTree();
                    if (starter !== ".gitkeep") await openFile(target);
                    onRepoChange();
                  } catch (err) {
                    onToast("err", err instanceof Error ? err.message : "Create failed.");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Creating…" : "Create folder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {fileOpen && (
        <div className="ad-modal-bg" onClick={() => setFileOpen(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="ad-card-title">New file in {cwd || "/"}/</h3>
            <div className="ad-field">
              <label className="ad-label">Filename (subpath ok: widget/app.js)</label>
              <input className="ad-input ad-mono" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="index.html" autoComplete="off" spellCheck={false} />
            </div>
            <div className="ad-field">
              <label className="ad-label">Template</label>
              <select
                className="ad-select"
                value={fileTpl}
                onChange={(e) => {
                  setFileTpl(e.target.value);
                  if (!fileName) setFileName(TEMPLATES[e.target.value].ext);
                }}
              >
                {Object.entries(TEMPLATES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className="ad-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
              <button className="ad-btn" onClick={() => setFileOpen(false)}>Cancel</button>
              <button
                className="ad-btn ad-btn-primary"
                disabled={saving}
                onClick={async () => {
                  const n = fileName.trim().replace(/^\/+/, "");
                  if (!n) return onToast("err", "Enter filename.");
                  const target = `${cwd ? cwd + "/" : ""}${n}`;
                  setSaving(true);
                  try {
                    await putRepoFile(cfg, target, TEMPLATES[fileTpl].code, `Create ${target}`);
                    setFileOpen(false);
                    setFileName("");
                    onToast("ok", `Created ${target}.`);
                    await loadFolder(cwd);
                    await loadTree();
                    await openFile(target);
                    onRepoChange();
                  } catch (err) {
                    onToast("err", err instanceof Error ? err.message : "Create failed.");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Creating…" : "Create file"}
              </button>
            </div>
          </div>
        </div>
      )}

      {moveOpen && (
        <div className="ad-modal-bg" onClick={() => setMoveOpen(false)}>
          <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="ad-card-title">Move / rename</h3>
            <p className="ad-card-sub ad-mono">{activePath}</p>
            <div className="ad-field">
              <label className="ad-label">New full path</label>
              <input className="ad-input ad-mono" value={moveTo} onChange={(e) => setMoveTo(e.target.value)} autoComplete="off" spellCheck={false} />
            </div>
            <div className="ad-row" style={{ justifyContent: "flex-end", marginTop: 16 }}>
              <button className="ad-btn" onClick={() => setMoveOpen(false)}>Cancel</button>
              <button
                className="ad-btn ad-btn-primary"
                disabled={saving}
                onClick={async () => {
                  const next = moveTo.trim().replace(/^\/+/, "");
                  if (!next) return;
                  setSaving(true);
                  try {
                    await moveRepoFile(cfg, activePath, next);
                    setMoveOpen(false);
                    onToast("ok", `Moved to ${next}.`);
                    await loadFolder(cwd);
                    await loadTree();
                    await openFile(next);
                    onRepoChange();
                  } catch (err) {
                    onToast("err", err instanceof Error ? err.message : "Move failed.");
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
