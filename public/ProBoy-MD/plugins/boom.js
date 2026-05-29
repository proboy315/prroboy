const { definePlugin } = require('../main');

function normalize(num) {
  return String(num || '').replace(/[^0-9]/g, '');
}

function toJid(num) {
  const n = normalize(num);
  return n ? `${n}@s.whatsapp.net` : null;
}

definePlugin({
  name: 'boom',
  meta: { version: '1.0.0', description: 'Spam/repeat utility (limited)' },
  services: {
    maxCount: 20
  },
  commands: [
    {
      pattern: 'boom(?:\\s+)?(.*)',
      desc: 'Repeat a message N times (optional target number)',
      use: 'fun',
      usage: '.boom <message,count[,number]>',
      menu: '_.boom_ *<message,count[,number]>*',
      handler: async (m, match, ctx) => {
        const raw = String(match?.[1] || '').trim();
        if (!raw) {
          return await m.sendReply(
            '*Boom usage:*\n' +
            '• `.boom hi,2` (send 2 times in current chat)\n' +
            '• `.boom hi,2,923027598023` (send to that number)'
          );
        }

        const parts = raw.split(',').map((x) => x.trim());
        const message = parts[0];
        const count = Number(parts[1]);
        const num = parts[2] || '';

        if (!message || !Number.isFinite(count) || count <= 0 || count > ctx.services.maxCount) {
          return await m.sendReply(`_Format:_ \`.boom message,count[,number]\`\n_Note:_ count 1-${ctx.services.maxCount}`);
        }

        const targetJid = num ? toJid(num) : m.jid;
        if (num && !targetJid) return await m.sendReply('_Invalid number._');

        await m.react('⏳');
        for (let i = 0; i < count; i++) {
          await m.sock.sendMessage(targetJid, { text: message });
        }
        await m.react('✅');
      }
    }
  ]
});
