const { definePlugin } = require('../main');

function normalize(input) {
  return String(input || '').replace(/[^0-9]/g, '');
}

function toJidFromNumber(n) {
  const num = normalize(n);
  if (!num) return null;
  return `${num}@s.whatsapp.net`;
}

definePlugin({
  name: 'jid',
  meta: { version: '1.0.0', description: 'JID utilities' },
  commands: [
    {
      pattern: 'jid(?:\\s+)?(.*)',
      desc: 'Get JID (reply / number / current chat)',
      use: 'general',
      usage: '.jid [number] (or reply)',
      menu: '_.jid_ *<reply | number | chat>*',
      handler: async (m, match) => {
        const arg = String(match?.[1] || '').trim();

        const repliedParticipant = m.data?.message?.extendedTextMessage?.contextInfo?.participant;
        if (m.quoted && repliedParticipant) {
          return await m.sendReply(`JID: ${repliedParticipant}`);
        }

        if (arg) {
          const jid = toJidFromNumber(arg);
          if (!jid) return await m.sendReply('_Invalid number._');
          return await m.sendReply(`JID: ${jid}`);
        }

        return await m.sendReply(`JID: ${m.jid}`);
      }
    }
  ]
});
