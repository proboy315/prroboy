# 🔍 ProBoy-MD — How it Works (Internal)

## High-level architecture
1) `index.js` starts the WhatsApp socket (Baileys)
2) `main.js` registers commands via `Module()` and stores them in memory
3) `plugins/index.js` loads every plugin in `plugins/`
4) Incoming messages are matched against command regex and executed

## Plugin loading
- Any `.js` file in `plugins/` (except `plugins/index.js`) is loaded.
- If a plugin throws error on load, it’s reported in logs.

## Auto-reload
- `chokidar` watches the plugins folder.
- When a plugin is added/changed/removed, the process exits.
- With PM2, the bot restarts automatically.

## Footer branding
- Text replies go through `withFooter()` so every text includes:
  `> ProBoy-MD`
- Captions also get footer appended.

## Session system
- Uses `useMultiFileAuthState(session/)`
- This build is intended for: upload creds into `session/` (no QR flow)
