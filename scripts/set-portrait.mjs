import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const supplied = process.argv[2];
if (!supplied || !fs.existsSync(supplied)) {
  console.error("Usage: node scripts/set-portrait.mjs path/to/your-original-photo.jpg");
  process.exit(1);
}

const bytes = fs.readFileSync(supplied);
if (!bytes.length || bytes.length > 15 * 1024 * 1024) {
  throw new Error("Use a non-empty image smaller than 15 MB.");
}
const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
const isJpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
const isWebp = bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
if (!isPng && !isJpeg && !isWebp) throw new Error("Use a valid JPEG, PNG or WebP file.");

const extension = isPng ? "png" : isWebp ? "webp" : "jpg";
const fingerprint = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
const filename = `shahan-ali-portrait-${fingerprint}.${extension}`;
const [width, height] = execFileSync("identify", ["-ping", "-format", "%w %h", path.resolve(supplied)], { encoding: "utf8" }).trim().split(" ").map(Number);
if (!width || !height) throw new Error("Could not read portrait dimensions.");
const target = path.join("public", "images", filename);
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, bytes);

const file = "src/data/info.json";
const info = JSON.parse(fs.readFileSync(file, "utf8"));
// A new URL cannot accidentally select the default portrait's generated variants.
info.profileImage = `/images/${filename}`;
info.portrait.width = width;
info.portrait.height = height;
fs.writeFileSync(file, `${JSON.stringify(info, null, 2)}\n`);
console.log(`Original image copied unchanged to ${target}.`);
console.log("Run npm run build and verify the portrait. The 1200x630 share card is separate.");