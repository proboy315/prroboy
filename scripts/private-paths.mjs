// Shared privacy guard for files that must never be published from public/ or dist/.
// This module deliberately inspects PATHS ONLY. It never reads or logs file contents,
// tokens, phone numbers or visitor records.
//
// The build calls preserveBlockedPublicData() before Vite copies public/ into dist/.
// Flagged files are MOVED (bytes unchanged) to preserved-data/, which is outside public/
// and outside the published dist/, and is excluded from Vercel uploads in .vercelignore.
// Nothing is deleted. Vite is not allowed to copy these paths into dist/.
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  renameSync,
  rmdirSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";

export const BLOCKED_PUBLIC_PATHS = [
  "connections.json",
  "otp.json",
  "bot/ids.json",
  "sessions/index.json",
  "bot/ahmad-trader-md/sessions.json",
  "bot/fahdii-md/sessions.json",
  "bot/fm-abdullah-md/sessions.json",
  "bot/muhammadzahid/sessions.json",
  "bot/proboy/sessions.json",
  "bot/rahman-md/sessions.json",
  "bot/rehman/sessions.json",
  "bot/saqib-md/sessions.json",
  "bot/saqib/sessions.json",
  "bot/team-zero-trace-intelligence/sessions.json",
  "bot/vehari-boy93/sessions.json",
];

const blocked = [
  /^sessions\//,
  /(^|\/)sessions\.json$/,
  /(^|\/)connections\.json$/,
  /(^|\/)otp\.json$/,
  /^bot\/ids\.json$/,
];

export function normalizeRelative(file) {
  return String(file).replaceAll("\\", "/").replace(/^\.\//, "");
}

export function isBlockedPublicPath(file) {
  const path = normalizeRelative(file);
  return blocked.some((rule) => rule.test(path));
}

/** Returns blocked paths only. Never returns file contents. */
export function findBlockedPaths(root, { recursive = true } = {}) {
  let entries;
  try {
    entries = readdirSync(root, { recursive });
  } catch {
    return [];
  }
  return entries
    .map((entry) => normalizeRelative(entry))
    .filter((entry) => isBlockedPublicPath(entry))
    .sort();
}

export function publicBlockedPaths(publicDir = "public") {
  return findBlockedPaths(publicDir);
}

export function distBlockedPaths(distDir = "dist") {
  return findBlockedPaths(distDir);
}

export function blockedSummary(paths) {
  return paths.map((path) => `public/${path}`).join(", ");
}

export const PRESERVED_DIR = "preserved-data";

/** Resolves a relative path inside a root, rejecting traversal. */
function safeResolve(root, relativePath) {
  const base = resolve(root);
  const target = resolve(base, relativePath);
  if (target !== base && !target.startsWith(base + sep)) {
    throw new Error(`Privacy guard: unsafe relative path rejected: ${relativePath}`);
  }
  return target;
}

/** Picks a non-conflicting destination without reading file contents. */
function nextDestination(preserveRoot, relativePath) {
  const first = safeResolve(preserveRoot, relativePath);
  if (!existsSync(first)) return first;
  const parsed = { dir: dirname(relativePath), name: basename(relativePath, extname(relativePath)), ext: extname(relativePath) };
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  for (let n = 1; n < 1000; n++) {
    const suffix = n === 1 ? stamp : `${stamp}-${n}`;
    const candidate = safeResolve(
      preserveRoot,
      join(parsed.dir, `${parsed.name}.preserved-${suffix}${parsed.ext}`),
    );
    if (!existsSync(candidate)) return candidate;
  }
  throw new Error("Privacy guard: could not allocate a unique preserved-data destination.");
}

function removeEmptyParents(startDir, stopDir) {
  const stop = resolve(stopDir);
  let current = dirname(resolve(startDir));
  while (current.startsWith(stop + sep) && current !== stop) {
    try {
      rmdirSync(current);
      current = dirname(current);
    } catch {
      break;
    }
  }
}

/**
 * Moves blocked files from public/ to preserved-data/ without changing bytes.
 * Returns { source, destination, bytes } records; it never returns file contents.
 * Runs automatically from scripts/build.mjs and the Vite privacy plugin.
 */
export function preserveBlockedPublicData({
  publicDir = "public",
  preserveDir = PRESERVED_DIR,
  logger = console.log,
} = {}) {
  const paths = publicBlockedPaths(publicDir);
  const moved = [];

  for (const relativePath of paths) {
    const source = safeResolve(publicDir, relativePath);
    if (!existsSync(source)) continue;
    const sourceStat = lstatSync(source);
    if (!sourceStat.isFile()) continue;

    let destination = nextDestination(preserveDir, relativePath);
    mkdirSync(dirname(destination), { recursive: true });

    try {
      // Prefer rename: same inode, same bytes, no content read.
      renameSync(source, destination);
    } catch {
      // Cross-device builds: copy bytes, then remove only after a successful copy.
      cpSync(source, destination, { preserveTimestamps: true, errorOnExist: false, force: false });
      const copied = statSync(destination);
      if (!copied.isFile() || copied.size !== sourceStat.size) {
        throw new Error(`Privacy guard: could not safely preserve public/${relativePath}. Build stopped.`);
      }
      unlinkSync(source);
    }

    const destinationStat = statSync(destination);
    if (!destinationStat.isFile() || destinationStat.size !== sourceStat.size) {
      throw new Error(`Privacy guard: preserved file size mismatch for public/${relativePath}. Build stopped.`);
    }

    moved.push({
      source: `${publicDir}/${relativePath}`,
      destination: relative(process.cwd(), destination),
      bytes: destinationStat.size,
    });
    logger(`Preserved private path outside dist/: public/${relativePath} -> ${relative(process.cwd(), destination)}`);
    removeEmptyParents(source, publicDir);
  }

  const remaining = publicBlockedPaths(publicDir);
  if (remaining.length) {
    throw new Error(
      `Privacy guard: could not relocate blocked path(s) from public/: ${blockedSummary(remaining)}. ` +
      "Build stopped before Vite could publish them. Check filesystem permissions; no file contents were read.",
    );
  }
  return moved;
}

/** Throws without printing any file contents, tokens or visitor data. */
export function assertNoBlockedPublicData(publicDir = "public") {
  const paths = publicBlockedPaths(publicDir);
  if (paths.length) {
    throw new Error(
      `Privacy guard: blocked path(s) still present in public/: ${blockedSummary(paths)}. ` +
      "The build normally relocates them automatically to preserved-data/. Do not publish their contents.",
    );
  }
}

export function assertCleanDist(distDir = "dist") {
  const paths = distBlockedPaths(distDir);
  if (paths.length) {
    throw new Error(`Privacy guard: generated output contains blocked file(s): ${paths.join(", ")}.`);
  }
}
