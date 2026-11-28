# 📦 ab-downloader (used in ProBoy-MD)

## Installation
### Node.js
```bash
npm install ab-downloader
```

### Python
```bash
pip install ab-downloader
```

## Supported Platforms (status)
- Instagram ✅ Posts / Stories / Reels
- TikTok ✅ Videos (no watermark)
- Facebook ✅ Videos / Posts
- Twitter ✅ Videos / Images
- YouTube ✅ Videos / Audio
- MediaFire ✅ Direct downloads
- CapCut ✅ Templates
- Google Drive ✅ Public files
- Pinterest ✅ Images + Search
- AIO 🔧 Maintenance

## Quick Start (Node.js)
```js
const { aio } = require('ab-downloader');
const url = 'https://www.instagram.com/p/ByxKbUSnubS/';
aio(url)
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## ProBoy-MD Plugins
- `.ig <url>`
- `.tiktok <url>` then reply `1` (video) or `2` (audio)
- `.fb <url>`
- `.yt <url>` then reply `1` (video) or `2` (audio)

## Notes
- Only download public/accessible content.
- Respect copyright and platform terms.
- Never share your `creds.json`.
