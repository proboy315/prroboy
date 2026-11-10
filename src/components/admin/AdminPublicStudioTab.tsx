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
import infoLocal from "../../data/info.json";
import Icon from "../Icon";
import { LiquidButton, LiquidCard, LiquidModal, LiquidPill } from "../LiquidGlass";

type Props = {
  cfg: GitHubConfig;
  connected: boolean;
  onToast: (type: "ok" | "err" | "info", msg: string) => void;
  onRepoChange: () => void;
};

const TEMPLATES: Record<string, { label: string; ext: string; code: string }> = {
  liquidHtml: {
    label: "Liquid Glass HTML5 Page",
    ext: "index.html",
    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>PROBOY App</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        min-height: 100vh;
        font-family: Inter, system-ui, sans-serif;
        color: #fff;
        background: radial-gradient(circle at 20% 20%, rgba(239, 29, 62, 0.25), transparent 45%), #07070a;
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .liquid-glass {
        max-width: 640px;
        width: 100%;
        padding: 36px;
        border-radius: 24px;
        background: linear-gradient(145deg, rgba(255,255,255,.1), rgba(255,255,255,.03));
        border: 1px solid rgba(255,255,255,.2);
        backdrop-filter: blur(22px) saturate(180%);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.28), 0 24px 60px rgba(0,0,0,.65);
      }
      h1 { font-size: 2rem; margin-bottom: 10px; }
      p { color: #b4b6c4; line-height: 1.6; }
    </style>
  </head>
  <body>
    <main class="liquid-glass">
      <h1>New Public Page</h1>
      <p>Created inside public/ via PROBOY Admin Studio.</p>
    </main>
  </body>
</html>
`,
  },
  blankHtml: {
    label: "Blank HTML5 Page",
    ext: "index.html",
    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Untitled Page</title>
  </head>
  <body>
    <h1>Hello from public/</h1>
  </body>
</html>
`,
  },
  jsModule: {
    label: "JavaScript File",
    ext: "app.js",
    code: `// PROBOY Public Script\nconsole.log("Script loaded successfully");\n`,
  },
  cssFile: {
    label: "Liquid Glass CSS",
    ext: "style.css",
    code: `.liquid-box {\n  background: linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03));\n  border: 1px solid rgba(255,255,255,0.18);\n  border-radius: 20px;\n  backdrop-filter: blur(20px) saturate(180%);\n}\n`,
  },
  jsonFile: {
    label: "JSON Data File",
    ext: "data.json",
    code: `{\n  "ok": true,\n  "author": "Shahan Ali (PROBOY)",\n  "items": []\n}\n`,
  },
  blank: {
    label: "Empty File",
    ext: "file.txt",
    code: "",
  },
};

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg", "avif", "ico"]);
const AUDIO_EXTS = new Set(["mp3", "wav", "ogg", "m4a"]);

function extOf(path: string) {
  return path.split(".").pop()?.toLowerCase() || "";
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AdminPublicStudioTab({ cfg, connected, onToast, onRepoChange }: Props) {
  const [cwd, setCwd] = useState("public");
  const [entries, setEntries] = useState<GitHubEntry[]>([]);
  const [tree, setTree] = useState<GitHubTreeItem[]>([]);
  const [search, setSearch] = useState("");
  const [loadingDir, setLoadingDir] = useState(false);

  // Active opened file state
  const [activePath, setActivePath] = useState("");
  const [activeSha, setActiveSha] = useState<string | undefined>(undefined);
  const [activeCode, setActiveCode] = useState("");
  const [originalCode, setOriginalCode] = useState("");
  const [activeDownloadUrl, setActiveDownloadUrl] = useState<string | null>(null);
  const [activeRawBase64, setActiveRawBase64] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [savingFile, setSavingFile] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [commitMsg, setCommitMsg] = useState("");
  const [previewMode, setPreviewMode] = useState<"code" | "preview">("code");

  // Modals
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderTemplate, setFolderTemplate] = useState<keyof typeof TEMPLATES>("liquidHtml");
  const [folderStarterFile, setFolderStarterFile] = useState("index.html");

  const [newFileOpen, setNewFileOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileTemplate, setNewFileTemplate] = useState<keyof typeof TEMPLATES>("liquidHtml");

  const [moveOpen, setMoveOpen] = useState(false);
  const [moveTargetPath, setMoveTargetPath] = useState("");

  const loadFolder = async (dirPath: string) => {
    if (!connected) return;
    setLoadingDir(true);
    try {
      const clean = dirPath.replace(/^\/+|\/+$/g, "");
      const list = await listDir(cfg, clean);
      setEntries(list);
      setCwd(clean);
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : `Failed to open folder ${dirPath}`);
    } finally {
      setLoadingDir(false);
    }
  };

  const loadTreeIndex = async () => {
    if (!connected) return;
    try {
      const t = await getRepoTree(cfg);
      setTree(t);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => {
    if (connected) {
      void loadFolder(cwd);
      void loadTreeIndex();
    }
  }, [connected, cfg.owner, cfg.repo, cfg.branch]);

  const openFile = async (filePath: string) => {
    if (!connected) return;
    setLoadingFile(true);
    setPreviewMode("code");
    try {
      const f = await getRepoFile(cfg, filePath);
      setActivePath(f.path);
      setActiveSha(f.sha);
      setActiveCode(f.content);
      setOriginalCode(f.content);
      setActiveDownloadUrl(f.downloadUrl);
      setActiveRawBase64(f.rawBase64);
      setCommitMsg(`Update ${f.path}`);
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : `Could not read ${filePath}`);
    } finally {
      setLoadingFile(false);
    }
  };

  const saveActiveFile = async () => {
    if (!connected || !activePath) return;
    setSavingFile(true);
    try {
      const res = await putRepoFile(cfg, activePath, activeCode, commitMsg || `Update ${activePath}`, {
        sha: activeSha,
      });
      setActiveSha(res.sha);
      setOriginalCode(activeCode);
      onToast("ok", `Saved ${activePath} to GitHub!`);
      await loadFolder(cwd);
      await loadTreeIndex();
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : `Failed to save ${activePath}`);
    } finally {
      setSavingFile(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!connected) return;
    const cleanFolder = folderName.trim().replace(/^\/+|\/+$/g, "");
    if (!cleanFolder) {
      onToast("err", "Enter a folder name (e.g. my-tool).");
      return;
    }
    const starter = folderStarterFile.trim() || ".gitkeep";
    const fullFolder = cwd ? `${cwd}/${cleanFolder}` : cleanFolder;
    const targetFile = `${fullFolder}/${starter}`;
    const tpl = starter === ".gitkeep" ? "" : TEMPLATES[folderTemplate]?.code || "";

    setSavingFile(true);
    try {
      await putRepoFile(cfg, targetFile, tpl, `Create folder ${fullFolder} (${starter}) via Admin`);
      setNewFolderOpen(false);
      setFolderName("");
      onToast("ok", `Folder ${fullFolder}/ created with ${starter}!`);
      await loadFolder(fullFolder);
      await loadTreeIndex();
      if (starter !== ".gitkeep") {
        await openFile(targetFile);
      }
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to create folder.");
    } finally {
      setSavingFile(false);
    }
  };

  const handleCreateFile = async () => {
    if (!connected) return;
    const cleanFile = newFileName.trim().replace(/^\/+/, "");
    if (!cleanFile) {
      onToast("err", "Enter a filename (e.g. index.html or tools/script.js).");
      return;
    }
    const targetPath = cwd ? `${cwd}/${cleanFile}` : cleanFile;
    const tplCode = TEMPLATES[newFileTemplate]?.code ?? "";

    setSavingFile(true);
    try {
      await putRepoFile(cfg, targetPath, tplCode, `Create ${targetPath} via Admin`);
      setNewFileOpen(false);
      setNewFileName("");
      onToast("ok", `Created ${targetPath}!`);
      await loadFolder(cwd);
      await loadTreeIndex();
      await openFile(targetPath);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to create file.");
    } finally {
      setSavingFile(false);
    }
  };

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || !files.length || !connected) return;
    setUploading(true);
    try {
      let count = 0;
      for (const file of Array.from(files)) {
        const b64 = await fileToBase64(file);
        const dest = cwd ? `${cwd}/${file.name}` : file.name;
        await putRepoFile(cfg, dest, b64, `Upload ${dest} via Admin`, { isBase64: true });
        count++;
      }
      onToast("ok", `Uploaded ${count} file(s) to ${cwd || "/"}/`);
      await loadFolder(cwd);
      await loadTreeIndex();
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to upload file(s).");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEntry = async (entry: GitHubEntry) => {
    if (!connected) return;
    const ok = window.confirm(
      entry.type === "dir"
        ? `Delete folder "${entry.path}" and ALL files inside it from GitHub?`
        : `Delete file "${entry.path}" from GitHub?`
    );
    if (!ok) return;
    setSavingFile(true);
    try {
      if (entry.type === "dir") {
        const removed = await deleteRepoFolder(cfg, entry.path);
        onToast("ok", `Deleted folder ${entry.path} (${removed} file(s)).`);
      } else {
        await deleteRepoFile(cfg, entry.path, entry.sha, `Delete ${entry.path} via Admin`);
        onToast("ok", `Deleted ${entry.path}.`);
      }
      if (activePath === entry.path || activePath.startsWith(`${entry.path}/`)) {
        setActivePath("");
        setActiveCode("");
        setOriginalCode("");
      }
      await loadFolder(cwd);
      await loadTreeIndex();
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setSavingFile(false);
    }
  };

  const handleMoveFile = async () => {
    if (!connected || !activePath || !moveTargetPath.trim()) return;
    setSavingFile(true);
    try {
      const nextPath = moveTargetPath.trim().replace(/^\/+/, "");
      await moveRepoFile(cfg, activePath, nextPath, `Move ${activePath} -> ${nextPath} via Admin`);
      setMoveOpen(false);
      onToast("ok", `Moved to ${nextPath}`);
      await loadFolder(cwd);
      await loadTreeIndex();
      await openFile(nextPath);
      onRepoChange();
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Failed to move/rename file.");
    } finally {
      setSavingFile(false);
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(activeCode);
      setActiveCode(JSON.stringify(parsed, null, 2) + "\n");
      onToast("info", "Formatted JSON.");
    } catch (e) {
      onToast("err", e instanceof Error ? e.message : "Invalid JSON syntax.");
    }
  };

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return tree.filter((t) => t.path.toLowerCase().includes(q)).slice(0, 60);
  }, [search, tree]);

  const crumbs = cwd ? cwd.split("/") : [];
  const ext = extOf(activePath);
  const isImage = IMAGE_EXTS.has(ext);
  const isAudio = AUDIO_EXTS.has(ext);
  const isHtml = ext === "html" || ext === "htm";
  const isSvg = ext === "svg";
  const isDirty = activePath && activeCode !== originalCode;
  const publicUrl = activePath.startsWith("public/") ? `/${activePath.slice("public/".length)}` : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <LiquidPill crimson>public/ Folder &amp; Full Repo Code Studio</LiquidPill>
          <h2 className="mt-2 text-2xl font-bold text-white">File Manager, Folder Builder &amp; Code Editor</h2>
          <p className="text-sm text-zinc-400">
            Create folders inside <code className="text-zinc-200">public/</code>, write HTML/CSS/JS/JSON/TSX code,
            upload images or assets, and push directly to GitHub.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LiquidButton onClick={() => setNewFolderOpen(true)} disabled={!connected}>
            <Icon name="folderPlus" className="w-4 h-4 text-red-400" />
            New Folder
          </LiquidButton>
          <LiquidButton onClick={() => setNewFileOpen(true)} disabled={!connected}>
            <Icon name="plus" className="w-4 h-4 text-red-400" />
            New File / Code
          </LiquidButton>
          <label className="lg-btn cursor-pointer">
            <Icon name="upload" className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload Files"}
            <input
              type="file"
              multiple
              className="hidden"
              disabled={!connected || uploading}
              onChange={(e) => {
                void handleUploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {/* Quick Root Shortcuts + Breadcrumbs */}
      <LiquidCard className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "public/", path: "public" },
              { label: "public/images/", path: "public/images" },
              { label: "src/", path: "src" },
              { label: "src/data/", path: "src/data" },
              { label: "/ (Repo Root)", path: "" },
            ].map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => void loadFolder(q.path)}
                disabled={!connected}
                className={`px-3 py-1.5 rounded-full text-xs border transition ${
                  cwd === q.path
                    ? "bg-red-600/25 border-red-500/60 text-white"
                    : "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10"
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            className="lg-input sm:w-72 text-xs"
            placeholder="Search any file/folder in repo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 pt-1 border-t border-white/10">
          <button
            type="button"
            onClick={() => void loadFolder("")}
            className="hover:text-white font-mono"
            disabled={!connected}
          >
            root
          </button>
          {crumbs.map((seg, i) => {
            const pathUpTo = crumbs.slice(0, i + 1).join("/");
            return (
              <span key={pathUpTo} className="inline-flex items-center gap-1.5">
                <span>/</span>
                <button
                  type="button"
                  onClick={() => void loadFolder(pathUpTo)}
                  className="hover:text-white font-mono text-zinc-200"
                >
                  {seg}
                </button>
              </span>
            );
          })}
          {loadingDir && <span className="ml-2 text-red-400">Loading...</span>}
        </div>
      </LiquidCard>

      {/* Main Split: Explorer + Code Studio */}
      <div className="grid lg:grid-cols-[330px_1fr] gap-6 items-start">
        {/* Directory / Search Tree */}
        <LiquidCard className="p-4">
          {search.trim() ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/10">
                <span>Search results ({searchResults.length})</span>
                <button type="button" onClick={() => setSearch("")} className="text-red-400">
                  Clear
                </button>
              </div>
              <ul className="space-y-1 max-h-[580px] overflow-y-auto pr-1">
                {searchResults.map((item) => (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.type === "tree") void loadFolder(item.path);
                        else {
                          const parent = item.path.includes("/")
                            ? item.path.slice(0, item.path.lastIndexOf("/"))
                            : "";
                          void loadFolder(parent);
                          void openFile(item.path);
                        }
                        setSearch("");
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-white/10 text-xs flex items-center gap-2 text-zinc-200"
                    >
                      <Icon name={item.type === "tree" ? "folder" : "file"} className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="truncate font-mono">{item.path}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-white/10">
                <span className="font-mono truncate">{cwd || "/"}/ ({entries.length})</span>
                {cwd && (
                  <button
                    type="button"
                    onClick={() => {
                      const parent = cwd.includes("/") ? cwd.slice(0, cwd.lastIndexOf("/")) : "";
                      void loadFolder(parent);
                    }}
                    className="text-red-400 hover:text-red-300 shrink-0"
                  >
                    ↑ Up
                  </button>
                )}
              </div>

              <ul className="space-y-1 max-h-[580px] overflow-y-auto pr-1">
                {entries.map((entry) => {
                  const active = activePath === entry.path;
                  return (
                    <li
                      key={entry.path}
                      className={`group flex items-center gap-1 rounded-xl border transition ${
                        active
                          ? "bg-red-600/20 border-red-500/50"
                          : "border-transparent hover:bg-white/[0.06]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (entry.type === "dir") void loadFolder(entry.path);
                          else void openFile(entry.path);
                        }}
                        className="flex-1 min-w-0 text-left px-2.5 py-2 flex items-center gap-2.5 text-xs"
                      >
                        <Icon
                          name={entry.type === "dir" ? "folder" : "file"}
                          className={`w-4 h-4 shrink-0 ${
                            entry.type === "dir" ? "text-amber-400" : "text-zinc-400"
                          }`}
                        />
                        <span className="truncate font-mono text-zinc-100">{entry.name}</span>
                        {entry.type === "file" && (
                          <span className="ml-auto text-[10px] text-zinc-500 shrink-0">
                            {formatSize(entry.size)}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        title={`Delete ${entry.name}`}
                        onClick={() => void handleDeleteEntry(entry)}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 mr-1 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-300 transition"
                      >
                        <Icon name="trash" className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
                {!entries.length && !loadingDir && (
                  <li className="py-8 text-center text-xs text-zinc-500">
                    Folder is empty or not loaded yet.
                  </li>
                )}
              </ul>
            </div>
          )}
        </LiquidCard>

        {/* Code Editor / Preview */}
        <LiquidCard className="p-5 sm:p-6 space-y-4">
          {!activePath ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/15 border border-red-400/30 grid place-items-center text-red-400">
                <Icon name="code" className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-white">Select a file or create a new folder/file</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto">
                Click any file on the left to edit its code, preview HTML/images, or click{" "}
                <strong className="text-zinc-200">New Folder</strong> /{" "}
                <strong className="text-zinc-200">New File</strong> to build inside{" "}
                <code className="text-zinc-200">public/</code>.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                <LiquidButton onClick={() => setNewFolderOpen(true)} disabled={!connected}>
                  <Icon name="folderPlus" className="w-4 h-4" /> Create Folder in {cwd || "root"}/
                </LiquidButton>
                <LiquidButton variant="primary" onClick={() => setNewFileOpen(true)} disabled={!connected}>
                  <Icon name="plus" className="w-4 h-4" /> Create New Code File
                </LiquidButton>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-white break-all">{activePath}</span>
                    {isDirty && <LiquidPill crimson>Unsaved edits</LiquidPill>}
                  </div>
                  {publicUrl && (
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                      <span>
                        Public URL: <code className="text-emerald-300">{publicUrl}</code>
                      </span>
                      <button
                        type="button"
                        className="text-red-400 hover:underline"
                        onClick={() => {
                          const full = `${(infoLocal.siteUrl || "").replace(/\/$/, "")}${publicUrl}`;
                          navigator.clipboard?.writeText(full || publicUrl);
                          onToast("info", `Copied ${full || publicUrl}`);
                        }}
                      >
                        Copy Full URL
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(isHtml || isSvg || isImage) && (
                    <div className="lg-dock p-1">
                      <button
                        type="button"
                        onClick={() => setPreviewMode("code")}
                        className={`lg-tab py-1 px-2.5 text-xs ${previewMode === "code" ? "is-active" : ""}`}
                      >
                        Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode("preview")}
                        className={`lg-tab py-1 px-2.5 text-xs ${previewMode === "preview" ? "is-active" : ""}`}
                      >
                        Preview
                      </button>
                    </div>
                  )}
                  {ext === "json" && (
                    <LiquidButton onClick={formatJson}>Format JSON</LiquidButton>
                  )}
                  <LiquidButton
                    onClick={() => {
                      setMoveTargetPath(activePath);
                      setMoveOpen(true);
                    }}
                  >
                    Move / Rename
                  </LiquidButton>
                  <LiquidButton
                    onClick={() => {
                      navigator.clipboard?.writeText(activeCode);
                      onToast("info", "Copied code to clipboard.");
                    }}
                  >
                    <Icon name="copy" className="w-4 h-4" />
                  </LiquidButton>
                </div>
              </div>

              {loadingFile ? (
                <div className="py-16 text-center text-sm text-zinc-400">Loading file from GitHub...</div>
              ) : isImage && previewMode === "preview" ? (
                <div className="rounded-xl border border-white/10 bg-black/50 p-6 grid place-items-center">
                  <img
                    src={
                      activeRawBase64
                        ? `data:image/${ext === "svg" ? "svg+xml" : ext};base64,${activeRawBase64}`
                        : activeDownloadUrl || ""
                    }
                    alt={activePath}
                    className="max-h-[460px] object-contain rounded-lg"
                  />
                </div>
              ) : isImage && !isSvg ? (
                <div className="rounded-xl border border-white/10 bg-black/50 p-6 text-center space-y-4">
                  <img
                    src={
                      activeRawBase64
                        ? `data:image/${ext};base64,${activeRawBase64}`
                        : activeDownloadUrl || ""
                    }
                    alt={activePath}
                    className="max-h-[420px] mx-auto object-contain rounded-lg"
                  />
                  <p className="text-xs text-zinc-400">
                    Binary image file. Upload a replacement in this folder using the same filename to overwrite.
                  </p>
                </div>
              ) : isAudio ? (
                <div className="rounded-xl border border-white/10 bg-black/50 p-8 text-center space-y-3">
                  <audio controls src={activeDownloadUrl || ""} className="mx-auto" />
                  <p className="text-xs text-zinc-400">Binary audio asset ({activePath})</p>
                </div>
              ) : (isHtml || isSvg) && previewMode === "preview" ? (
                <iframe
                  title={`Preview of ${activePath}`}
                  srcDoc={activeCode}
                  sandbox="allow-scripts allow-forms"
                  className="w-full h-[500px] rounded-xl border border-white/15 bg-white"
                />
              ) : (
                <div className="space-y-0 overflow-hidden rounded-xl border border-white/10">
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white/[0.05] border-b border-white/10">
                    <span className="lg-traffic" aria-hidden="true">
                      <i style={{ background: "#ff5f57" }} />
                      <i style={{ background: "#febc2e" }} />
                      <i style={{ background: "#28c840" }} />
                    </span>
                    <span className="ml-1 font-mono text-[11px] text-zinc-400 truncate">{activePath}</span>
                    {isDirty ? (
                      <span className="ml-auto text-[10px] font-semibold text-amber-300 flex items-center gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Unsaved
                      </span>
                    ) : (
                      <span className="ml-auto text-[10px] text-emerald-300 shrink-0">● Synced</span>
                    )}
                  </div>
                  <textarea
                    rows={22}
                    spellCheck={false}
                    value={activeCode}
                    onChange={(e) => setActiveCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const el = e.currentTarget;
                        const start = el.selectionStart;
                        const end = el.selectionEnd;
                        const next = activeCode.slice(0, start) + "  " + activeCode.slice(end);
                        setActiveCode(next);
                        requestAnimationFrame(() => {
                          el.selectionStart = el.selectionEnd = start + 2;
                        });
                      }
                    }}
                    className="lg-input lg-code text-xs leading-6 whitespace-pre overflow-x-auto"
                  />
                  <div className="flex flex-wrap justify-between text-[11px] text-zinc-500">
                    <span>Lines: {activeCode.split("\n").length} · Characters: {activeCode.length}</span>
                    <span>Tip: Tab inserts 2 spaces</span>
                  </div>
                </div>
              )}

              {(!isImage || isSvg) && !isAudio && (
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-3">
                  <input
                    className="lg-input flex-1 min-w-[200px]"
                    value={commitMsg}
                    onChange={(e) => setCommitMsg(e.target.value)}
                    placeholder={`Commit message for ${activePath}`}
                  />
                  <LiquidButton variant="primary" onClick={saveActiveFile} disabled={!connected || savingFile}>
                    <Icon name="save" className="w-4 h-4" />
                    {savingFile ? "Pushing..." : "Commit & Save File"}
                  </LiquidButton>
                </div>
              )}
            </>
          )}
        </LiquidCard>
      </div>

      {/* New Folder Modal */}
      <LiquidModal open={newFolderOpen} onClose={() => setNewFolderOpen(false)} title="Create New Folder">
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Creates inside <code className="text-zinc-200">{cwd || "/"}/</code>. Git stores folders when they contain a
            file, so pick an initial file or <code className="text-zinc-200">.gitkeep</code>.
          </p>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Folder Name (supports nested like tools/my-app)</label>
            <input
              className="lg-input font-mono"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="my-app"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Initial File Name</label>
              <input
                className="lg-input font-mono"
                value={folderStarterFile}
                onChange={(e) => setFolderStarterFile(e.target.value)}
                placeholder="index.html or .gitkeep"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Starter Template</label>
              <select
                className="lg-input"
                value={folderTemplate}
                onChange={(e) => setFolderTemplate(e.target.value as keyof typeof TEMPLATES)}
              >
                {Object.entries(TEMPLATES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <LiquidButton onClick={() => setNewFolderOpen(false)}>Cancel</LiquidButton>
            <LiquidButton variant="primary" onClick={handleCreateFolder} disabled={savingFile}>
              <Icon name="folderPlus" className="w-4 h-4" />
              {savingFile ? "Creating..." : "Create Folder & Open"}
            </LiquidButton>
          </div>
        </div>
      </LiquidModal>

      {/* New File Modal */}
      <LiquidModal open={newFileOpen} onClose={() => setNewFileOpen(false)} title="Create New File / Code">
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Creates inside <code className="text-zinc-200">{cwd || "/"}/</code>
          </p>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">File Name (or subpath like widget/app.js)</label>
            <input
              className="lg-input font-mono"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="index.html"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Code Template</label>
            <select
              className="lg-input"
              value={newFileTemplate}
              onChange={(e) => {
                const key = e.target.value as keyof typeof TEMPLATES;
                setNewFileTemplate(key);
                if (!newFileName) setNewFileName(TEMPLATES[key].ext);
              }}
            >
              {Object.entries(TEMPLATES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <LiquidButton onClick={() => setNewFileOpen(false)}>Cancel</LiquidButton>
            <LiquidButton variant="primary" onClick={handleCreateFile} disabled={savingFile}>
              <Icon name="plus" className="w-4 h-4" />
              {savingFile ? "Creating..." : "Create File"}
            </LiquidButton>
          </div>
        </div>
      </LiquidModal>

      {/* Move / Rename Modal */}
      <LiquidModal open={moveOpen} onClose={() => setMoveOpen(false)} title="Move / Rename File">
        <div className="space-y-4">
          <p className="text-xs text-zinc-400">
            Current path: <code className="text-zinc-200">{activePath}</code>
          </p>
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">New Full Path</label>
            <input
              className="lg-input font-mono"
              value={moveTargetPath}
              onChange={(e) => setMoveTargetPath(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <LiquidButton onClick={() => setMoveOpen(false)}>Cancel</LiquidButton>
            <LiquidButton variant="primary" onClick={handleMoveFile} disabled={savingFile}>
              {savingFile ? "Moving..." : "Move File"}
            </LiquidButton>
          </div>
        </div>
      </LiquidModal>
    </div>
  );
}
