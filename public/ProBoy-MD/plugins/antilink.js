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

function getGroup(jid) {
  const g = readGroups();
  return g[jid] || {};
}

function parseOnOff(s) {
  const v = String(s || '').trim().toLowerCase();
  if (['on', 'true', '1'].includes(v)) return true;
  if (['off', 'false', '0'].includes(v)) return false;
  return null;
}

function warnsFile() {
  return path.join(config.DATA_DIR, 'antilink_warns.json');
}

function readWarns() {
  try {
    if (!fs.existsSync(warnsFile())) return {};
    const raw = fs.readFileSync(warnsFile(), 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeWarns(db) {
  fs.writeFileSync(warnsFile(), JSON.stringify(db, null, 2));
}

async function isUserAdmin(m) {
  try {
    const meta = await m.sock.groupMetadata(m.jid);
    const p = meta.participants.find((x) => x.id === m.sender);
    return Boolean(p && (p.admin === 'admin' || p.admin === 'superadmin'));
  } catch {
    return false;
  }
}

async function isBotAdmin(m) {
  try {
    const meta = await m.sock.groupMetadata(m.jid);
    const botJid = m.sock.user?.id;
    const p = meta.participants.find((x) => x.id === botJid);
    return Boolean(p && (p.admin === 'admin' || p.admin === 'superadmin'));
  } catch {
    return false;
  }
}

definePlugin({
  name: 'antilink',
  meta: { version: '1.0.0', description: 'Anti-link with warn/kick' },
  services: {
    maxWarn: 3
  },
  commands: [
    {
      pattern: 'antilink(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Toggle antilink (group) with warn/kick',
      use: 'group',
      usage: '.antilink on/off',
      menu: '_.antilink_ *<on | off>*',
      handler: async (m, match) => {
        const val = parseOnOff(match?.[1]);
        if (val === null) return await m.sendReply('_Usage:_ `.antilink on` / `.antilink off`');
        if (!String(m.jid).endsWith('@g.us')) return await m.sendReply('_This command is group only._');
        setGroup(m.jid, { ANTILINK: val });
        return await m.sendReply(`_*AntiLink:*_ ${val ? 'on' : 'off'}`);
      }
    },
    {
      on: 'text',
      handlerPrefix: false,
      excludeFromCommands: true,
      handler: async (m, match, ctx) => {
        if (!String(m.jid).endsWith('@g.us')) return;
        const cfg = getGroup(m.jid);
        if (!cfg.ANTILINK) return;

        // allow bot/self, owner, and admins
        if (m.fromMe) return;
        const ownerNum = String(config.OWNER_NUMBER || '').replace(/[^0-9]/g, '');
        const senderNum = String(m.sender || '').split('@')[0].replace(/[^0-9]/g, '');
        if (ownerNum && senderNum && ownerNum === senderNum) return;
        if (await isUserAdmin(m)) return;

        const text = String(m.text || '');
        const hasLink = /(https?:\/\/\S+|chat\.whatsapp\.com\/\S+|wa\.me\/\S+|fb\.me\/\S+|facebook\.com\/\S+)/i.test(text);
        if (!hasLink) return;

        const db = readWarns();
        const g = db[m.jid] || {};
        const user = m.sender;
        const current = Number(g[user] || 0);
        const next = current + 1;
        g[user] = next;
        db[m.jid] = g;
        writeWarns(db);

        try { await m.sock.sendMessage(m.jid, { delete: m.data.key }); } catch {}
        try { await m.react('⚠️'); } catch {}

        if (next >= ctx.services.maxWarn) {
          if (await isBotAdmin(m)) {
            try { await m.sock.groupParticipantsUpdate(m.jid, [user], 'remove'); } catch {}
          }

          g[user] = 0;
          db[m.jid] = g;
          writeWarns(db);

          return await m.sock.sendMessage(
            m.jid,
            { text: `_*AntiLink:*_ @${user.split('@')[0]} removed (${ctx.services.maxWarn}/${ctx.services.maxWarn} warnings).`, mentions: [user] },
            { quoted: m.data }
          );
        }

        return await m.sock.sendMessage(
          m.jid,
          { text: `_*AntiLink:*_ @${user.split('@')[0]} link not allowed. Warning: ${next}/${ctx.services.maxWarn}`, mentions: [user] },
          { quoted: m.data }
        );
      }
    }
  ]
});
