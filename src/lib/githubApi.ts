export type GitHubConfig = {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  remember: boolean;
};

export type GitHubRepoInfo = {
  fullName: string;
  private: boolean;
  defaultBranch: string;
  htmlUrl: string;
  description: string;
  permissions?: {
    admin?: boolean;
    push?: boolean;
    pull?: boolean;
  };
  ownerAvatar: string;
  viewerLogin: string;
  rateRemaining?: string;
};

export type GitHubEntry = {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: "file" | "dir" | "symlink" | "submodule";
  download_url: string | null;
  html_url: string;
};

export type GitHubTreeItem = {
  path: string;
  mode: string;
  type: "blob" | "tree";
  sha: string;
  size?: number;
};

export type GitHubCommit = {
  sha: string;
  message: string;
  author: string;
  date: string;
  htmlUrl: string;
};

const STORAGE_KEY = "proboy_admin_github_cfg_v1";
const SESSION_KEY = "proboy_admin_github_session_v1";

export function loadGitHubConfig(): GitHubConfig {
  const empty: GitHubConfig = {
    owner: "proboy315",
    repo: "prroboy",
    branch: "main",
    token: "",
    remember: true,
  };
  if (typeof window === "undefined") return empty;
  try {
    const rawSession = window.sessionStorage.getItem(SESSION_KEY);
    if (rawSession) {
      return { ...empty, ...JSON.parse(rawSession) };
    }
    const rawLocal = window.localStorage.getItem(STORAGE_KEY);
    if (rawLocal) {
      return { ...empty, ...JSON.parse(rawLocal) };
    }
  } catch {
    // ignore storage errors
  }
  return empty;
}

export function saveGitHubConfig(cfg: GitHubConfig) {
  if (typeof window === "undefined") return;
  // SECURITY: the Personal Access Token is NEVER written here in plain text.
  // Only owner/repo/branch are remembered; the token lives in memory and in
  // the AES-256 encrypted vault (src/lib/vault.ts).
  const safe = { owner: cfg.owner, repo: cfg.repo, branch: cfg.branch, token: "", remember: cfg.remember };
  try {
    if (cfg.remember) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
      window.sessionStorage.removeItem(SESSION_KEY);
    } else {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    }
  } catch {
    // ignore storage errors
  }
}

export function clearGitHubConfig() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function encodeBase64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function decodeBase64Utf8(base64: string): string {
  const cleaned = base64.replace(/\s+/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || "");
      const idx = res.indexOf(",");
      resolve(idx >= 0 ? res.slice(idx + 1) : res);
    };
    reader.onerror = () => reject(new Error("Failed to read local file"));
    reader.readAsDataURL(file);
  });
}

function encodePath(path: string): string {
  return path
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

async function ghFetch(cfg: GitHubConfig, url: string, init?: RequestInit): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (cfg.token.trim()) {
    headers.Authorization = `Bearer ${cfg.token.trim()}`;
  }
  return fetch(url, { ...init, headers });
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data?.message) return `${data.message} (${res.status})`;
  } catch {
    // ignore
  }
  return `GitHub API error (${res.status} ${res.statusText})`;
}

export async function verifyGitHubRepo(cfg: GitHubConfig): Promise<GitHubRepoInfo> {
  const owner = cfg.owner.trim();
  const repo = cfg.repo.trim();
  if (!owner || !repo) throw new Error("Enter both GitHub username and repository name.");
  if (!cfg.token.trim()) throw new Error("Enter your GitHub Personal Access Token.");

  const [repoRes, userRes] = await Promise.all([
    ghFetch(cfg, `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`),
    ghFetch(cfg, "https://api.github.com/user"),
  ]);

  if (!repoRes.ok) throw new Error(await parseError(repoRes));
  const repoJson = await repoRes.json();
  let viewerLogin = owner;
  if (userRes.ok) {
    const u = await userRes.json();
    if (u?.login) viewerLogin = u.login;
  }

  return {
    fullName: repoJson.full_name,
    private: Boolean(repoJson.private),
    defaultBranch: repoJson.default_branch || "main",
    htmlUrl: repoJson.html_url,
    description: repoJson.description || "",
    permissions: repoJson.permissions,
    ownerAvatar: repoJson.owner?.avatar_url || "",
    viewerLogin,
    rateRemaining: repoRes.headers.get("x-ratelimit-remaining") || undefined,
  };
}

export async function listBranches(cfg: GitHubConfig): Promise<string[]> {
  const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner.trim())}/${encodeURIComponent(cfg.repo.trim())}/branches?per_page=100`;
  const res = await ghFetch(cfg, url);
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as Array<{ name: string }>;
  return data.map((b) => b.name);
}

export async function listCommits(cfg: GitHubConfig, perPage = 12): Promise<GitHubCommit[]> {
  const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner.trim())}/${encodeURIComponent(cfg.repo.trim())}/commits?sha=${encodeURIComponent(cfg.branch)}&per_page=${perPage}`;
  const res = await ghFetch(cfg, url);
  if (!res.ok) throw new Error(await parseError(res));
  const data = (await res.json()) as Array<{
    sha: string;
    html_url: string;
    commit: { message: string; author?: { name?: string; date?: string } };
  }>;
  return data.map((c) => ({
    sha: c.sha,
    message: c.commit.message,
    author: c.commit.author?.name || "Unknown",
    date: c.commit.author?.date || "",
    htmlUrl: c.html_url,
  }));
}

export async function listDir(cfg: GitHubConfig, dirPath = ""): Promise<GitHubEntry[]> {
  const clean = encodePath(dirPath);
  const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner.trim())}/${encodeURIComponent(cfg.repo.trim())}/contents/${clean}?ref=${encodeURIComponent(cfg.branch)}`;
  const res = await ghFetch(cfg, url);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return (data as GitHubEntry[]).sort((a, b) => {
    if (a.type === "dir" && b.type !== "dir") return -1;
    if (a.type !== "dir" && b.type === "dir") return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function getRepoTree(cfg: GitHubConfig): Promise<GitHubTreeItem[]> {
  const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner.trim())}/${encodeURIComponent(cfg.repo.trim())}/git/trees/${encodeURIComponent(cfg.branch)}?recursive=1`;
  const res = await ghFetch(cfg, url);
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  return Array.isArray(data?.tree) ? (data.tree as GitHubTreeItem[]) : [];
}

export async function getRepoFile(
  cfg: GitHubConfig,
  filePath: string
): Promise<{ path: string; sha: string; size: number; content: string; rawBase64: string; downloadUrl: string | null }> {
  const clean = encodePath(filePath);
  const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner.trim())}/${encodeURIComponent(cfg.repo.trim())}/contents/${clean}?ref=${encodeURIComponent(cfg.branch)}`;
  const res = await ghFetch(cfg, url);
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  if (Array.isArray(data)) throw new Error(`${filePath} is a directory, not a file.`);

  let rawBase64 = typeof data.content === "string" ? data.content.replace(/\s+/g, "") : "";
  if (!rawBase64 && data.sha) {
    // Files > 1MB fall back to Git Blobs API
    const blobUrl = `https://api.github.com/repos/${encodeURIComponent(cfg.owner.trim())}/${encodeURIComponent(cfg.repo.trim())}/git/blobs/${data.sha}`;
    const blobRes = await ghFetch(cfg, blobUrl);
    if (blobRes.ok) {
      const blob = await blobRes.json();
      if (typeof blob.content === "string") rawBase64 = blob.content.replace(/\s+/g, "");
    }
  }

  return {
    path: data.path,
    sha: data.sha,
    size: data.size,
    rawBase64,
    content: rawBase64 ? decodeBase64Utf8(rawBase64) : "",
    downloadUrl: data.download_url || null,
  };
}

async function lookupShaOptional(cfg: GitHubConfig, filePath: string): Promise<string | undefined> {
  try {
    const clean = encodePath(filePath);
    const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner.trim())}/${encodeURIComponent(cfg.repo.trim())}/contents/${clean}?ref=${encodeURIComponent(cfg.branch)}`;
    const res = await ghFetch(cfg, url);
    if (!res.ok) return undefined;
    const data = await res.json();
    return typeof data?.sha === "string" ? data.sha : undefined;
  } catch {
    return undefined;
  }
}

export async function putRepoFile(
  cfg: GitHubConfig,
  filePath: string,
  contentOrBase64: string,
  message: string,
  options?: { sha?: string; isBase64?: boolean }
): Promise<{ sha: string; commitUrl: string }> {
  const clean = encodePath(filePath);
  const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner.trim())}/${encodeURIComponent(cfg.repo.trim())}/contents/${clean}`;
  const b64 = options?.isBase64 ? contentOrBase64.replace(/\s+/g, "") : encodeBase64Utf8(contentOrBase64);

  let sha = options?.sha ?? (await lookupShaOptional(cfg, filePath));

  const send = async (useSha?: string) => {
    const body: Record<string, string> = {
      message: message || `Update ${filePath}`,
      content: b64,
      branch: cfg.branch,
    };
    if (useSha) body.sha = useSha;
    return ghFetch(cfg, url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  };

  let res = await send(sha);
  if (res.status === 409) {
    // Re-fetch latest SHA once on conflict and retry
    sha = await lookupShaOptional(cfg, filePath);
    res = await send(sha);
  }
  if (!res.ok) throw new Error(await parseError(res));
  const json = await res.json();
  return {
    sha: json.content?.sha || "",
    commitUrl: json.commit?.html_url || "",
  };
}

export async function deleteRepoFile(
  cfg: GitHubConfig,
  filePath: string,
  sha: string | undefined,
  message: string
): Promise<void> {
  const clean = encodePath(filePath);
  const url = `https://api.github.com/repos/${encodeURIComponent(cfg.owner.trim())}/${encodeURIComponent(cfg.repo.trim())}/contents/${clean}`;
  const resolvedSha = sha || (await lookupShaOptional(cfg, filePath));
  if (!resolvedSha) throw new Error(`Cannot delete ${filePath}: file SHA not found.`);

  const res = await ghFetch(cfg, url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message || `Delete ${filePath}`,
      sha: resolvedSha,
      branch: cfg.branch,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
}

export async function moveRepoFile(
  cfg: GitHubConfig,
  oldPath: string,
  newPath: string,
  message?: string
): Promise<void> {
  const existing = await getRepoFile(cfg, oldPath);
  await putRepoFile(cfg, newPath, existing.rawBase64, message || `Move ${oldPath} -> ${newPath}`, {
    isBase64: true,
  });
  await deleteRepoFile(cfg, oldPath, existing.sha, message || `Remove old ${oldPath}`);
}

export async function deleteRepoFolder(cfg: GitHubConfig, folderPath: string): Promise<number> {
  const prefix = folderPath.replace(/^\/+|\/+$/g, "") + "/";
  const tree = await getRepoTree(cfg);
  const targets = tree.filter((item) => item.type === "blob" && item.path.startsWith(prefix));
  for (const item of targets) {
    await deleteRepoFile(cfg, item.path, item.sha, `Delete ${item.path} (folder removal)`);
  }
  return targets.length;
}

export type SeoHtmlSyncInput = {
  title: string;
  description: string;
  siteUrl: string;
  ogType: string;
  ogSiteName: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt: string;
  ogImageWidth: string;
  ogImageHeight: string;
  ogLocale: string;
  twitterCard: string;
  twitterSite: string;
  twitterCreator: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  robots: string;
  googleVerification: string;
  themeColor: string;
  geoRegion: string;
  geoPlacename: string;
  geoPosition: string;
  preloadPortrait?: string;
};

const escAttr = (v: string) =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function syncIndexHtmlSeo(html: string, s: SeoHtmlSyncInput): string {
  const cleanBase = s.siteUrl.replace(/\/$/, "");
  const toAbs = (pathOrUrl: string) => {
    if (!pathOrUrl) return "";
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    if (!cleanBase) return pathOrUrl;
    return `${cleanBase}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
  };

  const canonical = cleanBase ? `${cleanBase}/` : "/";
  const ogImgAbs = toAbs(s.ogImage);
  const twImgAbs = toAbs(s.twitterImage || s.ogImage);

  let next = html;
  next = next.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escAttr(s.title)}</title>`);
  next = next.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escAttr(s.description)}" />`
  );
  if (/<meta\s+name="theme-color"/i.test(next)) {
    next = next.replace(
      /<meta\s+name="theme-color"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="theme-color" content="${escAttr(s.themeColor || "#07070a")}" />`
    );
  }
  if (/<meta\s+name="google-site-verification"/i.test(next)) {
    next = next.replace(
      /<meta\s+name="google-site-verification"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="google-site-verification" content="${escAttr(s.googleVerification)}" />`
    );
  }

  // Preserve existing ld+json inside SEO block if present
  const ldMatch = next.match(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/i);
  const ldScript = ldMatch ? ldMatch[0] : "";

  const seoBlock = [
    "<!-- SEO:START -->",
    `    <link rel="canonical" href="${escAttr(canonical)}" />`,
    `    <meta name="robots" content="${escAttr(s.robots || "index, follow")}" />`,
    s.preloadPortrait
      ? `    <link rel="preload" as="image" href="${escAttr(s.preloadPortrait)}" fetchpriority="high" />`
      : "",
    `    <meta property="og:type" content="${escAttr(s.ogType || "profile")}" />`,
    `    <meta property="og:site_name" content="${escAttr(s.ogSiteName)}" />`,
    `    <meta property="og:title" content="${escAttr(s.ogTitle || s.title)}" />`,
    `    <meta property="og:description" content="${escAttr(s.ogDescription || s.description)}" />`,
    `    <meta property="og:url" content="${escAttr(canonical)}" />`,
    ogImgAbs ? `    <meta property="og:image" content="${escAttr(ogImgAbs)}" />` : "",
    s.ogImageAlt ? `    <meta property="og:image:alt" content="${escAttr(s.ogImageAlt)}" />` : "",
    s.ogImageWidth ? `    <meta property="og:image:width" content="${escAttr(s.ogImageWidth)}" />` : "",
    s.ogImageHeight ? `    <meta property="og:image:height" content="${escAttr(s.ogImageHeight)}" />` : "",
    `    <meta property="og:locale" content="${escAttr(s.ogLocale || "en_US")}" />`,
    `    <meta name="twitter:card" content="${escAttr(s.twitterCard || "summary_large_image")}" />`,
    s.twitterSite ? `    <meta name="twitter:site" content="${escAttr(s.twitterSite)}" />` : "",
    s.twitterCreator ? `    <meta name="twitter:creator" content="${escAttr(s.twitterCreator)}" />` : "",
    `    <meta name="twitter:title" content="${escAttr(s.twitterTitle || s.ogTitle || s.title)}" />`,
    `    <meta name="twitter:description" content="${escAttr(s.twitterDescription || s.ogDescription || s.description)}" />`,
    twImgAbs ? `    <meta name="twitter:image" content="${escAttr(twImgAbs)}" />` : "",
    s.geoRegion ? `    <meta name="geo.region" content="${escAttr(s.geoRegion)}" />` : "",
    s.geoPlacename ? `    <meta name="geo.placename" content="${escAttr(s.geoPlacename)}" />` : "",
    s.geoPosition ? `    <meta name="geo.position" content="${escAttr(s.geoPosition)}" />` : "",
    s.geoPosition ? `    <meta name="ICBM" content="${escAttr(s.geoPosition.replace(";", ", "))}" />` : "",
    ldScript ? `    ${ldScript}` : "",
    "    <!-- SEO:END -->",
  ]
    .filter(Boolean)
    .join("\n");

  if (/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/.test(next)) {
    next = next.replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, seoBlock);
  }
  return next;
}

export function extractIndexHtmlSeo(html: string): Partial<SeoHtmlSyncInput> {
  const matchTag = (re: RegExp) => {
    const m = html.match(re);
    return m ? m[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">") : "";
  };
  return {
    title: matchTag(/<title>([\s\S]*?)<\/title>/i),
    description: matchTag(/<meta\s+name="description"\s+content="([^"]*)"/i),
    themeColor: matchTag(/<meta\s+name="theme-color"\s+content="([^"]*)"/i) || "#07070a",
    googleVerification: matchTag(/<meta\s+name="google-site-verification"\s+content="([^"]*)"/i),
    robots: matchTag(/<meta\s+name="robots"\s+content="([^"]*)"/i) || "index, follow",
    ogType: matchTag(/<meta\s+property="og:type"\s+content="([^"]*)"/i) || "profile",
    ogSiteName: matchTag(/<meta\s+property="og:site_name"\s+content="([^"]*)"/i),
    ogTitle: matchTag(/<meta\s+property="og:title"\s+content="([^"]*)"/i),
    ogDescription: matchTag(/<meta\s+property="og:description"\s+content="([^"]*)"/i),
    ogImage: matchTag(/<meta\s+property="og:image"\s+content="([^"]*)"/i),
    ogImageAlt: matchTag(/<meta\s+property="og:image:alt"\s+content="([^"]*)"/i),
    ogImageWidth: matchTag(/<meta\s+property="og:image:width"\s+content="([^"]*)"/i) || "1200",
    ogImageHeight: matchTag(/<meta\s+property="og:image:height"\s+content="([^"]*)"/i) || "630",
    ogLocale: matchTag(/<meta\s+property="og:locale"\s+content="([^"]*)"/i) || "en_US",
    twitterCard: matchTag(/<meta\s+name="twitter:card"\s+content="([^"]*)"/i) || "summary_large_image",
    twitterSite: matchTag(/<meta\s+name="twitter:site"\s+content="([^"]*)"/i) || "@itx_proboy",
    twitterCreator: matchTag(/<meta\s+name="twitter:creator"\s+content="([^"]*)"/i) || "@itx_proboy",
    twitterTitle: matchTag(/<meta\s+name="twitter:title"\s+content="([^"]*)"/i),
    twitterDescription: matchTag(/<meta\s+name="twitter:description"\s+content="([^"]*)"/i),
    twitterImage: matchTag(/<meta\s+name="twitter:image"\s+content="([^"]*)"/i),
    geoRegion: matchTag(/<meta\s+name="geo\.region"\s+content="([^"]*)"/i) || "PK-PB",
    geoPlacename: matchTag(/<meta\s+name="geo\.placename"\s+content="([^"]*)"/i) || "Burewala",
    geoPosition: matchTag(/<meta\s+name="geo\.position"\s+content="([^"]*)"/i) || "30.1667;72.6833",
  };
}
