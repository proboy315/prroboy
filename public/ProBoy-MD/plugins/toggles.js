const { definePlugin } = require('../main');
const config = require('../config');

function parseOnOff(input) {
  const v = String(input || '').trim().toLowerCase();
  if (v === 'on' || v === 'true' || v === '1') return true;
  if (v === 'off' || v === 'false' || v === '0') return false;
  return null;
}

async function toggleCmd(m, match, key, label) {
  const val = parseOnOff(match?.[1]);
  if (val === null) {
    return await m.sendReply('_Usage:_ `' + config.HANDLERS + label.toLowerCase() + ' on` / `' + config.HANDLERS + label.toLowerCase() + ' off`');
  }
  await m.react('⏳');
  await m.setSettings({ [key]: val });
  await m.react('✅');
  return await m.sendReply(`_*${label}:*_ ${val ? 'on' : 'off'}`);
}

definePlugin({
  name: 'toggles',
  meta: { version: '1.0.0', description: 'Runtime toggles/settings' },
  commands: [
    {
      pattern: 'antidelete(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Anti-delete (restore deleted msgs)',
      use: 'settings',
      usage: '.antidelete on/off',
      menu: '_.antidelete_ *<on | off>*',
      handler: async (m, match) => toggleCmd(m, match, 'ANTIDELETE', 'AntiDelete')
    },
    {
      pattern: 'antiviewonce(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Anti view-once saver',
      use: 'settings',
      usage: '.antiviewonce on/off',
      menu: '_.antiviewonce_ *<on | off>*',
      handler: async (m, match) => toggleCmd(m, match, 'ANTIVIEWONCE', 'AntiViewOnce')
    },
    {
      pattern: 'autostatusview(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Auto view status',
      use: 'settings',
      usage: '.autostatusview on/off',
      menu: '_.autostatusview_ *<on | off>*',
      handler: async (m, match) => toggleCmd(m, match, 'AUTOSTATUSVIEW', 'AutoStatusView')
    },
    {
      pattern: 'typing(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Typing indicator',
      use: 'settings',
      usage: '.typing on/off',
      menu: '_.typing_ *<on | off>*',
      handler: async (m, match) => toggleCmd(m, match, 'AUTOTYPING', 'AutoTyping')
    },
    {
      pattern: 'recording(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Recording indicator',
      use: 'settings',
      usage: '.recording on/off',
      menu: '_.recording_ *<on | off>*',
      handler: async (m, match) => toggleCmd(m, match, 'AUTORECORDING', 'AutoRecording')
    },
    {
      pattern: 'setting',
      fromMe: true,
      desc: 'Show all settings',
      use: 'settings',
      usage: '.setting',
      menu: '_.setting_',
      handler: async (m) => {
        const s = await m.getSettings();
        const out = [
          `_*${config.BOT_NAME} Settings*_`,
          '',
          `• _ANTIDELETE:_ ${s.ANTIDELETE ? 'on' : 'off'}`,
          `• _ANTIVIEWONCE:_ ${s.ANTIVIEWONCE ? 'on' : 'off'}`,
          `• _AUTOSTATUSVIEW:_ ${s.AUTOSTATUSVIEW ? 'on' : 'off'}`,
          `• _AUTOTYPING:_ ${s.AUTOTYPING ? 'on' : 'off'}`,
          `• _AUTORECORDING:_ ${s.AUTORECORDING ? 'on' : 'off'}`
        ].join('\n');
        return await m.sendReply(out);
      }
    }
  ]
});
