const fs = require('fs');
const path = require('path');
const { definePlugin } = require('../main');
const config = require('../config');

definePlugin({
  name: 'mode',
  meta: { version: '1.0.0', description: 'Bot mode control' },
  commands: [
    {
      pattern: 'mode(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Set bot mode (public/private)',
      use: 'settings',
      usage: '.mode <public|private>',
      menu: '_.mode_ *<Public | Private>*',
      handler: async (m, match) => {
        const mode = String(match?.[1] || '').trim().toLowerCase();
        if (!mode) return await m.sendReply('_Usage:_ `.mode public` or `.mode private`');
        if (!['public', 'private'].includes(mode)) return await m.sendReply('_Mode must be:_ `public` or `private`');

        const file = path.join(config.DATA_DIR, 'settings.json');
        let data = {};
        try {
          if (fs.existsSync(file)) {
            const raw = fs.readFileSync(file, 'utf8');
            data = raw ? JSON.parse(raw) : {};
          }
        } catch {
          data = {};
        }

        data.MODE = mode;
        fs.writeFileSync(file, JSON.stringify(data, null, 2));

        return await m.sendReply(`_Mode saved:_ *${mode}*\n_Note:_ restart bot to fully apply.`);
      }
    }
  ]
});
