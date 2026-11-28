const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config');
const { definePlugin, commands } = require('../main');

function isGistUrl(url) {
  const u = String(url || '').toLowerCase();
  return u.startsWith('https://gist.github.com/') || u.startsWith('http://gist.github.com/');
}

function gistIdFromUrl(url) {
  const u = new URL(url);
  const parts = u.pathname.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  return parts[1];
}

definePlugin({
  name: 'install',
  meta: { version: '1.0.0', description: 'Install external plugins' },
  commands: [
    {
      pattern: 'install(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Install external plugin from gist',
      use: 'owner',
      usage: '.install <gist_url>',
      menu: '_.install_ *<gist url>*',
      handler: async (m, match) => {
        const input = String(match?.[1] || '').trim();
        if (!input) {
          return await m.sendReply('_Usage:_ `.install <gist_url>`\nExample: `.install https://gist.github.com/user/id`');
        }
        if (!isGistUrl(input)) return await m.sendReply('_Only GitHub Gist URLs are supported._');

        await m.react('⏳');

        const gid = gistIdFromUrl(input);
        if (!gid) return await m.sendReply('_Invalid gist url._');

        const api = `https://api.github.com/gists/${gid}`;
        const apiRes = await axios.get(api, { timeout: 30000, responseType: 'json', headers: { 'User-Agent': 'ProBoy-MD' } });
        const files = apiRes.data?.files || {};
        const jsFiles = Object.values(files).filter((f) => String(f?.filename || '').endsWith('.js'));
        const fileObj = jsFiles[0] || Object.values(files)[0];
        if (!fileObj?.content) return await m.sendReply('_Could not read gist content._');

        const code = String(fileObj.content || '');
        const fileName = String(fileObj.filename || 'plugin.js');

        if (!code.includes('Module(') && !code.includes('Module({') && !code.includes('definePlugin(')) {
          await m.react('❌');
          return await m.sendReply('_This does not look like a ProBoy-MD plugin (Module/definePlugin not found)._');
        }

        const filePath = path.join(config.PLUGINS_DIR, fileName);

        if (fs.existsSync(filePath)) {
          const bak = path.join(config.PLUGINS_DIR, `${fileName}.bak_${Date.now()}`);
          fs.renameSync(filePath, bak);
        }

        const before = commands.length;
        fs.writeFileSync(filePath, code, 'utf8');

        try {
          const resolved = require.resolve(filePath);
          if (require.cache[resolved]) delete require.cache[resolved];
          require(filePath);
        } catch {
          // ignore
        }

        const added = commands.slice(before).filter((c) => c.pattern && !c.excludeFromCommands);
        const lines = [];
        lines.push(`_Plugin installed:_ \`${fileName}\``);
        if (added.length) {
          lines.push('');
          lines.push('*Added commands:*');
          for (const c of added) {
            const name = String(c.pattern.source).replace(/^\^\(\?:/, '').replace(/^\^/, '').match(/[a-z0-9_]+/i)?.[0] || 'cmd';
            lines.push(`• .${String(name).toLowerCase()}${c.desc ? ` — ${c.desc}` : ''}`);
            if (c.usage) lines.push(`   Usage: ${c.usage}`);
          }
        }
        lines.push('');
        lines.push('_Restarting..._');

        await m.react('✅');
        return await m.sendReply(lines.join('\n'));
      }
    }
  ]
});
