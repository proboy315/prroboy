// Encrypted admin vault — AES-GCM + PBKDF2 via WebCrypto.
// Nothing is prefilled. Nothing is suggested. Credentials only exist
// encrypted in THIS browser until you unlock with your panel login.

import type { GitHubConfig } from "./githubApi";

const VAULT_KEY = "proboy_admin_vault_v2";
const LEGACY_KEYS = ["proboy_admin_github_cfg_v1", "proboy_admin_github_session_v1"];

export function clearLegacyPlaintextConfig() {
  if (typeof window === "undefined") return;
  try {
    for (const k of LEGACY_KEYS) {
      window.localStorage.removeItem(k);
      window.sessionStorage.removeItem(k);
    }
  } catch {
    // ignore
  }
}

type VaultBlob = {
  v: 2;
  saltB64: string;
  ivB64: string;
  cipherB64: string;
  updatedAt: string;
};

type VaultPayload = {
  panelUser: string;
  owner: string;
  repo: string;
  branch: string;
  token: string;
};

type SessionCache = {
  key: CryptoKey;
  salt: Uint8Array;
  panelUser: string;
  github: GitHubConfig;
};

let session: SessionCache | null = null;

// Fallback-mode transient (never persisted in plaintext)
let transientGithub: GitHubConfig | null = null;
let transientUser = "";

const hasSubtle =
  typeof window !== "undefined" &&
  Boolean(window.crypto?.subtle) &&
  Boolean(window.isSecureContext || window.location.hostname === "localhost");

function b64encode(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function b64decode(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const base = await window.crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, [
    "deriveKey",
  ]);
  return window.crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: 150000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Tiny fallback for non-secure contexts (http preview). Still obfuscated, never plaintext.
function fallbackEncrypt(text: string, pass: string): string {
  const t = new TextEncoder().encode(text);
  const p = new TextEncoder().encode(pass);
  const out = new Uint8Array(t.length);
  for (let i = 0; i < t.length; i++) out[i] = t[i] ^ p[i % p.length] ^ (i & 0xff);
  return "xor1." + b64encode(out);
}

function fallbackDecrypt(blob: string, pass: string): string {
  if (!blob.startsWith("xor1.")) throw new Error("Wrong passphrase.");
  const data = b64decode(blob.slice(5));
  const p = new TextEncoder().encode(pass);
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ p[i % p.length] ^ (i & 0xff);
  return new TextDecoder().decode(out);
}

export function vaultExists(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Boolean(window.localStorage.getItem(VAULT_KEY));
  } catch {
    return false;
  }
}

export function isUnlocked(): boolean {
  return session !== null;
}

export function getSessionGithub(): GitHubConfig | null {
  if (session) return { ...session.github };
  if (transientGithub) return { ...transientGithub };
  return null;
}

export function lockVault() {
  session = null;
}

export function deleteVault() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(VAULT_KEY);
    } catch {
      // ignore
    }
  }
  session = null;
}

function readBlob(): VaultBlob | { fallback: string } | null {
  try {
    const raw = window.localStorage.getItem(VAULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.fallback === "string") return { fallback: parsed.fallback };
    return parsed as VaultBlob;
  } catch {
    return null;
  }
}

export async function createVault(
  panelUser: string,
  passphrase: string,
  github: { owner: string; repo: string; branch: string; token: string }
): Promise<void> {
  const user = panelUser.trim();
  if (user.length < 3) throw new Error("Panel username must be at least 3 characters.");
  if (passphrase.length < 6) throw new Error("Passphrase must be at least 6 characters.");
  if (!github.owner.trim() || !github.repo.trim()) throw new Error("GitHub owner & repo are required.");
  if (!github.token.trim()) throw new Error("GitHub token is required.");

  const payload: VaultPayload = {
    panelUser: user.toLowerCase(),
    owner: github.owner.trim(),
    repo: github.repo.trim(),
    branch: github.branch.trim() || "main",
    token: github.token.trim(),
  };

  if (!hasSubtle) {
    const cipher = fallbackEncrypt(JSON.stringify(payload), passphrase + "::" + user.toLowerCase());
    window.localStorage.setItem(VAULT_KEY, JSON.stringify({ fallback: cipher, updatedAt: new Date().toISOString() }));
    clearLegacyPlaintextConfig();
    session = null;
    return;
  }

  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const cipherBuf = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    new TextEncoder().encode(JSON.stringify(payload))
  );
  const blob: VaultBlob = {
    v: 2,
    saltB64: b64encode(salt),
    ivB64: b64encode(iv),
    cipherB64: b64encode(new Uint8Array(cipherBuf)),
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(VAULT_KEY, JSON.stringify(blob));
  clearLegacyPlaintextConfig();
  session = {
    key,
    salt,
    panelUser: payload.panelUser,
    github: { owner: payload.owner, repo: payload.repo, branch: payload.branch, token: payload.token, remember: true },
  };
}

export async function unlockVault(panelUser: string, passphrase: string): Promise<GitHubConfig> {
  const user = panelUser.trim().toLowerCase();
  if (!user || !passphrase) throw new Error("Enter your panel username & passphrase.");
  const blob = readBlob();
  if (!blob) throw new Error("No saved admin vault found. Create one first.");

  if ("fallback" in blob) {
    const raw = fallbackDecrypt(blob.fallback, passphrase + "::" + user);
    const payload = JSON.parse(raw) as VaultPayload;
    if (payload.panelUser !== user) throw new Error("Wrong username or passphrase.");
    const github: GitHubConfig = {
      owner: payload.owner,
      repo: payload.repo,
      branch: payload.branch,
      token: payload.token,
      remember: true,
    };
    session = null; // fallback keeps no key in memory
    // store github in a transient variable via closure trick
    transientGithub = github;
    transientUser = user;
    return github;
  }

  const salt = b64decode(blob.saltB64);
  const iv = b64decode(blob.ivB64);
  const cipher = b64decode(blob.cipherB64);
  let key: CryptoKey;
  try {
    key = await deriveKey(passphrase, salt);
  } catch {
    throw new Error("This browser blocked decryption. Try HTTPS or localhost.");
  }
  let plain: string;
  try {
    const buf = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as BufferSource }, key, cipher as BufferSource);
    plain = new TextDecoder().decode(buf);
  } catch {
    throw new Error("Wrong username or passphrase.");
  }
  const payload = JSON.parse(plain) as VaultPayload;
  if (payload.panelUser !== user) throw new Error("Wrong username or passphrase.");
  const github: GitHubConfig = {
    owner: payload.owner,
    repo: payload.repo,
    branch: payload.branch,
    token: payload.token,
    remember: true,
  };
  session = { key, salt, panelUser: user, github };
  transientGithub = null;
  return github;
}

export function getTransientUser(): string {
  return session?.panelUser || transientUser || "";
}

export async function persistGithubToVault(github: GitHubConfig): Promise<void> {
  const user = session?.panelUser || transientUser;
  if (!user) throw new Error("Vault is locked.");
  if (typeof window === "undefined") return;
  // Re-encrypt with a fresh IV using the session key when available
  if (session && hasSubtle) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const payload: VaultPayload = {
      panelUser: user,
      owner: github.owner.trim(),
      repo: github.repo.trim(),
      branch: github.branch.trim() || "main",
      token: github.token.trim(),
    };
    const buf = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      session.key,
      new TextEncoder().encode(JSON.stringify(payload))
    );
    const blob: VaultBlob = {
      v: 2,
      saltB64: b64encode(session.salt),
      ivB64: b64encode(iv),
      cipherB64: b64encode(new Uint8Array(buf)),
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(VAULT_KEY, JSON.stringify(blob));
    session.github = { ...payload, remember: true };
    return;
  }
  // Fallback path — caller must supply passphrase again; handled by UI via re-create.
  throw new Error("Re-enter passphrase to update saved credentials on this connection.");
}

export async function changeVaultPassphrase(
  currentUser: string,
  currentPass: string,
  newUser: string,
  newPass: string
): Promise<void> {
  const github = await unlockVault(currentUser, currentPass);
  await createVault(newUser.trim() || currentUser, newPass, github);
}
