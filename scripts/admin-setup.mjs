#!/usr/bin/env node
// Owner setup helper — run LOCALLY, never commit the output.
//   npm run admin:setup
// Prompts for the admin password (input hidden), then prints values to paste into your hosting
// provider's environment-variable settings (Vercel: Project → Settings → Environment Variables;
// Netlify: Site configuration → Environment variables). Nothing is written to disk.
import crypto from "node:crypto";
import { generateTotpSecret, hashPassword } from "../server/lib.mjs";

function askHidden(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    let value = "";
    if (!stdin.isTTY) {
      let data = "";
      stdin.on("data", (c) => (data += c));
      stdin.on("end", () => resolve(data.trim()));
      return;
    }
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    stdin.on("data", function onData(ch) {
      if (ch === "\u0003") process.exit(1);
      if (ch === "\r" || ch === "\n") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(value);
      } else if (ch === "\u007f") value = value.slice(0, -1);
      else value += ch;
    });
  });
}

const password = await askHidden("Choose an admin password (min 12 chars): ");
if (password.length < 12) {
  console.error("Password too short (minimum 12 characters).");
  process.exit(1);
}
const totp = generateTotpSecret();
console.log("\nSet these environment variables on your host (keep them private):\n");
console.log("ADMIN_USERNAME=<choose a username>");
console.log(`ADMIN_PASSWORD_HASH=${hashPassword(password)}`);
console.log(`SESSION_SECRET=${crypto.randomBytes(48).toString("base64url")}`);
console.log(`ADMIN_TOTP_SECRET=${totp}`);
console.log("\nAdd the TOTP secret to an authenticator app (Google Authenticator, 1Password, Aegis…):");
console.log(`otpauth://totp/ProBoy%20Admin?secret=${totp}&issuer=ProBoy\n`);
console.log("Also required for storage: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (or Vercel's KV_REST_API_*).");
