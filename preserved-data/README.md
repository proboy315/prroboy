# Preserved private data (not deployed)

This directory is **outside `public/` and outside the Vercel/Netlify publish directory (`dist/`)**.

`npm run build` automatically relocates these files here, byte-for-byte, before Vite copies
`public/` into `dist/`:

- `sessions/**`
- `connections.json`
- `otp.json`
- `bot/ids.json`
- `bot/*/sessions.json`

The build stops if a flagged path cannot be relocated. The privacy guard never reads or logs
file contents, tokens, phone numbers or visitor records. Nothing in this directory is imported
by the site, the API, `server/`, or `scripts/`, and it is listed in `.vercelignore`.

Treat this directory as sensitive local storage. Back it up with the same care as any WhatsApp
session or verification material. Do not copy it into `public/`, `dist/`, a static host, or a
public Git remote.
