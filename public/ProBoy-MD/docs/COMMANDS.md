# 📜 ProBoy-MD Commands

> Prefix default: `.`

## General
- `.menu` — show menu
- `.alive` — bot alive status
- `.ping` — ping (uses message *edit*)

## Download
- `.ig <url>` — Instagram
- `.tiktok <url>` — TikTok (reply 1 video / 2 audio / 3 audio document)
- `.fb <url>` — Facebook (HD preferred)
- `.yt <url>` — YouTube (reply 1 video / 2 audio / 3 audio document)
- `.twitter <url>` — Twitter/X
- `.pinterest <url|query>` — Pinterest
- `.capcut <url>` — CapCut
- `.gdrive <url>` — Google Drive public file
- `.mediafire <url>` — MediaFire

## Owner
- `.install <gist_url>` — install external plugin from GitHub Gist
- `.uninstall <file.js>` — remove plugin
- `.restart` — restart

Notes:
- Commands are loaded from `plugins/*.js`.
- After any plugin file change, bot exits (auto-reload). Use PM2 so it comes back automatically.
