#!/usr/bin/env node
// Compatibility command for the old private-public cleanup workflow.
// It now PRESERVES bytes into preserved-data/; it never deletes them.
//
// The normal `npm run build` does this automatically. This command is optional.
//
//   node scripts/prune-private-public.mjs            # dry run (paths + destinations)
//   node scripts/prune-private-public.mjs --apply    # preserve now
//   node scripts/prune-private-public.mjs --check    # exit 1 if any remain in public/
//
// Paths only: this script never reads or prints file contents, tokens or visitor data.
import { preserveBlockedPublicData, publicBlockedPaths, PRESERVED_DIR } from "./private-paths.mjs";

const apply = process.argv.includes("--apply");
const check = process.argv.includes("--check");
const paths = publicBlockedPaths("public");

if (!paths.length) {
  console.log("Privacy guard: public/ is clean; no visitor/session/verification paths to preserve.");
  process.exit(0);
}

console.log(`Privacy guard: ${paths.length} flagged path(s) are still in public/ (contents not read):`);
for (const path of paths) console.log(`- public/${path} -> ${PRESERVED_DIR}/${path}`);

if (check) process.exit(1);
if (!apply) {
  console.log("\nDry run only. `npm run build` performs this preservation automatically; no manual deletion is needed.");
  process.exit(0);
}

const moved = preserveBlockedPublicData();
console.log(`\nPreserved ${moved.length} file(s) byte-for-byte in ${PRESERVED_DIR}/. Nothing was deleted.`);
process.exit(publicBlockedPaths("public").length ? 1 : 0);
