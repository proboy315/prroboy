const fs = require('fs');
const path = require('path');
const { definePlugin } = require('../main');
const config = require('../config');

function groupsFile() {
  return path.join(config.DATA_DIR, 'groups.json');
}

function readGroups() {
  try {
    if (!fs.existsSync(groupsFile())) return {};
    const raw = fs.readFileSync(groupsFile(), 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeGroups(data) {
  fs.writeFileSync(groupsFile(), JSON.stringify(data, null, 2));
}

function setGroup(jid, patch) {
  const g = readGroups();
  if (!g[jid]) g[jid] = {};
  g[jid] = { ...g[jid], ...patch };
  writeGroups(g);
  return g[jid];
}

function parseOnOff(s) {
  const v = String(s || '').trim().toLowerCase();
  if (['on', 'true', '1'].includes(v)) return true;
  if (['off', 'false', '0'].includes(v)) return false;
  return null;
}

definePlugin({
  name: 'welcome',
  meta: { version: '1.0.0', description: 'Welcome/Goodbye toggles' },
  commands: [
    {
      pattern: 'welcome(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Welcome message on member add (group)',
      use: 'group',
      usage: '.welcome on/off',
      menu: '_.welcome_ *<on | off>*',
      handler: async (m, match) => {
        if (!String(m.jid).endsWith('@g.us')) return await m.sendReply('_Group only._');
        const val = parseOnOff(match?.[1]);
        if (val === null) return await m.sendReply('_Usage:_ `.welcome on` / `.welcome off`');
        setGroup(m.jid, { WELCOME: val });
        return await m.sendReply(`_*Welcome:*_ ${val ? 'on' : 'off'}`);
      }
    },
    {
      pattern: 'goodbye(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Goodbye message on member remove (group)',
      use: 'group',
      usage: '.goodbye on/off',
      menu: '_.goodbye_ *<on | off>*',
      handler: async (m, match) => {
        if (!String(m.jid).endsWith('@g.us')) return await m.sendReply('_Group only._');
        const val = parseOnOff(match?.[1]);
        if (val === null) return await m.sendReply('_Usage:_ `.goodbye on` / `.goodbye off`');
        setGroup(m.jid, { GOODBYE: val });
        return await m.sendReply(`_*Goodbye:*_ ${val ? 'on' : 'off'}`);
      }
    }
  ]
});
