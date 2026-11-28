const { definePlugin } = require('../main');

definePlugin({
  name: 'ping',
  meta: { version: '1.0.0', description: 'Latency check' },
  commands: [
    {
      pattern: 'ping',
      desc: 'Measures ping',
      use: 'general',
      usage: '.ping',
      menu: '_.ping_',
      handler: async (m) => {
        const start = Date.now();
        const sent = await m.sendReply('_Testing ping..._');
        const ms = Date.now() - start;
        try {
          await m.edit(`_Latency:_ *${ms}ms*`, m.jid, sent.key);
        } catch {
          await m.sendReply(`_Latency:_ *${ms}ms*`);
        }
      }
    }
  ]
});
