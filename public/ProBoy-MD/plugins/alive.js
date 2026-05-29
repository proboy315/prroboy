const os = require('os');
const { definePlugin } = require('../main');
const config = require('../config');
const pkg = require('../package.json');

function formatUptime(sec) {
  sec = Math.floor(sec);
  const d = Math.floor(sec / 86400);
  sec %= 86400;
  const h = Math.floor(sec / 3600);
  sec %= 3600;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const parts = [];
  if (d) parts.push(d + 'd');
  if (h) parts.push(h + 'h');
  if (m) parts.push(m + 'm');
  parts.push(s + 's');
  return parts.join(' ');
}

definePlugin({
  name: 'alive',
  meta: { version: '1.0.0', description: 'Status/health commands' },
  commands: [
    {
      pattern: 'alive',
      desc: 'Check bot status',
      use: 'general',
      usage: '.alive',
      menu: '_.alive_',
      handler: async (m) => {
        await m.react('⏳');
        const mem = os.totalmem();
        const free = os.freemem();
        const toGB = (b) => (b / 1024 / 1024 / 1024).toFixed(1);

        const out = [
          `_*${config.BOT_NAME} is alive*_`,
          `_*Owner:*_ ${config.OWNER_NAME}`,
          `_*Mode:*_ ${config.MODE}`,
          `_*Server:*_ ${os.type()} ${os.release()}`,
          `_*Uptime:*_ ${formatUptime(process.uptime())}`,
          `_*RAM:*_ ${toGB(free)} GB free of ${toGB(mem)} GB`,
          `_*Version:*_ ${pkg.version}`
        ].join('\n');

        const res = await m.sendReply(out);
        await m.react('✅');
        return res;
      }
    }
  ]
});
