import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  preserveBlockedPublicData,
  publicBlockedPaths,
} from "../scripts/private-paths.mjs";

const root = mkdtempSync(join(tmpdir(), "proboy-privacy-test-"));
const publicDir = join(root, "public");
const preserveDir = join(root, "preserved-data");

try {
  const fixtures = [
    "connections.json",
    "otp.json",
    "bot/ids.json",
    "bot/example-bot/sessions.json",
    "sessions/index.json",
  ];
  const expected = new Map();
  for (const [index, path] of fixtures.entries()) {
    const full = join(publicDir, path);
    mkdirSync(dirname(full), { recursive: true });
    const bytes = Buffer.from(`fixture-${index + 1}-not-real-visitor-data`);
    writeFileSync(full, bytes);
    expected.set(path, bytes);
  }

  assert.equal(publicBlockedPaths(publicDir).length, fixtures.length);
  const moved = preserveBlockedPublicData({ publicDir, preserveDir, logger: () => {} });
  assert.equal(moved.length, fixtures.length);
  assert.equal(publicBlockedPaths(publicDir).length, 0);

  for (const path of fixtures) {
    const destination = join(preserveDir, path);
    assert.deepEqual(readFileSync(destination), expected.get(path), `${path} bytes changed`);
  }
  assert.equal(readdirSync(publicDir, { recursive: true }).length, 0);
  assert.equal(moved.reduce((sum, item) => sum + item.bytes, 0), [...expected.values()].reduce((sum, b) => sum + b.length, 0));

  // Running again with an empty public/ is a no-op.
  assert.equal(preserveBlockedPublicData({ publicDir, preserveDir, logger: () => {} }).length, 0);
  console.log(`privacy preserve: ${moved.length} fixtures preserved byte-for-byte; public/ cleaned; no deletions`);
} finally {
  rmSync(root, { recursive: true, force: true });
}
