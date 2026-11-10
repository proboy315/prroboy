/**
 * PROBOY Encrypted Admin Vault
 * AES-256-GCM + PBKDF2 (210,000 iterations, SHA-256).
 * GitHub owner / repo / branch / token are NEVER stored in plain text —
 * only an opaque ciphertext blob lives in localStorage.
 */

export type VaultPayload = {
  owner: string;
  repo: string;
  branch: string;
  token: string;
  remember: boolean;
  updatedAt: string;
};

const VAULT_KEY = "proboy_admin_vault_v1";

const enc = new TextEncoder();
const dec = new TextDecoder();

/** Fresh ArrayBuffer-backed copy so WebCrypto accepts the bytes under strict TS. */
function copyBytes(u: Uint8Array): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(u.byteLength);
  out.set(u);
  return out;
}

function toB64(bytes: Uint8Array): string {
  let s = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    s += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(s);
}

function fromB64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", copyBytes(enc.encode(passphrase)), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: copyBytes(salt), iterations: 210000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Unlocked AES key lives ONLY in module memory (cleared on Lock / reload).
let sessionKey: CryptoKey | null = null;

function requireCrypto() {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new Error("WebCrypto is unavailable — open the Admin Panel over HTTPS or localhost.");
  }
}

export function hasVault(): boolean {
  try {
    return Boolean(window.localStorage.getItem(VAULT_KEY));
  } catch {
    return false;
  }
}

export function isVaultOpen(): boolean {
  return sessionKey !== null;
}

export async function createVault(payload: VaultPayload, passphrase: string): Promise<void> {
  requireCrypto();
  if (!passphrase || passphrase.length < 8) {
    throw new Error("Vault passphrase must be at least 8 characters long.");
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: copyBytes(iv) },
    key,
    copyBytes(enc.encode(JSON.stringify(payload)))
  );
  const blob = JSON.stringify({
    v: 1,
    algo: "AES-256-GCM",
    kdf: "PBKDF2-SHA256-210000",
    salt: toB64(salt),
    iv: toB64(iv),
    data: toB64(new Uint8Array(cipher)),
  });
  window.localStorage.setItem(VAULT_KEY, blob);
  sessionKey = key;
}

export async function unlockVault(passphrase: string): Promise<VaultPayload> {
  requireCrypto();
  const raw = window.localStorage.getItem(VAULT_KEY);
  if (!raw) throw new Error("No encrypted vault found in this browser.");
  let blob: { salt: string; iv: string; data: string };
  try {
    blob = JSON.parse(raw);
  } catch {
    throw new Error("Vault data is corrupted — delete it and reconnect.");
  }
  const key = await deriveKey(passphrase, fromB64(blob.salt));
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: copyBytes(fromB64(blob.iv)) },
      key,
      copyBytes(fromB64(blob.data))
    );
    sessionKey = key;
    return JSON.parse(dec.decode(plain)) as VaultPayload;
  } catch {
    throw new Error("Wrong passphrase — vault could not be decrypted.");
  }
}

export async function changeVaultPassphrase(oldPass: string, newPass: string): Promise<void> {
  const payload = await unlockVault(oldPass);
  payload.updatedAt = new Date().toISOString();
  await createVault(payload, newPass);
}

export function lockVaultSession(): void {
  sessionKey = null;
}

export function deleteVault(): void {
  try {
    window.localStorage.removeItem(VAULT_KEY);
  } catch {
    // ignore
  }
  sessionKey = null;
}

/** SHA-256 fingerprint (hash) of the stored ciphertext — proves vault integrity. */
export async function vaultFingerprint(): Promise<string> {
  requireCrypto();
  const raw = window.localStorage.getItem(VAULT_KEY) || "";
  if (!raw) return "";
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(raw));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function exportVaultBackup(): string {
  return window.localStorage.getItem(VAULT_KEY) || "";
}

export function importVaultBackup(blob: string): void {
  const parsed = JSON.parse(blob);
  if (!parsed?.salt || !parsed?.iv || !parsed?.data) {
    throw new Error("Not a valid PROBOY vault backup file.");
  }
  window.localStorage.setItem(VAULT_KEY, blob);
  sessionKey = null;
}
