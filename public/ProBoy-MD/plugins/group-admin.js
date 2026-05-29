const fs = require('fs');
const path = require('path');
const { definePlugin } = require('../main');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

function isGroup(jid) {
  return String(jid || '').endsWith('@g.us');
}

async function getMeta(m) {
  return await m.sock.groupMetadata(m.jid);
}

async function isAdmin(m, jid) {
  const meta = await m.sock.groupMetadata(jid);
  const p = meta.participants.find((x) => x.id === m.sender);
  return Boolean(p && (p.admin === 'admin' || p.admin === 'superadmin'));
}

async function isBotAdmin(m, jid) {
  const meta = await m.sock.groupMetadata(jid);
  const botJid = m.sock.user?.id;
  const p = meta.participants.find((x) => x.id === botJid);
  return Boolean(p && (p.admin === 'admin' || p.admin === 'superadmin'));
}

function parseNumbersCsv(text) {
  return String(text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/[^0-9]/g, ''))
    .filter(Boolean);
}

function toJid(num) {
  const n = String(num || '').replace(/[^0-9]/g, '');
  return n ? `${n}@s.whatsapp.net` : null;
}

function muteFile() {
  return path.join(__dirname, '..', 'data', 'mute_timers.json');
}

function readMuteDb() {
  try {
    if (!fs.existsSync(muteFile())) return {};
    const raw = fs.readFileSync(muteFile(), 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeMuteDb(db) {
  fs.writeFileSync(muteFile(), JSON.stringify(db, null, 2));
}

function parseDuration(input) {
  const s = String(input || '').trim().toLowerCase();
  if (!s) return null;
  const m = s.match(/^([0-9]+)\s*(s|m|h)$/);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2];
  if (!Number.isFinite(n) || n <= 0) return null;
  if (unit === 's') return n * 1000;
  if (unit === 'm') return n * 60 * 1000;
  if (unit === 'h') return n * 60 * 60 * 1000;
  return null;
}

async function streamToBuffer(stream) {
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}

definePlugin({
  name: 'group-admin',
  meta: { version: '1.0.0', description: 'Group management commands' },
  services: {
    addLimit: 10
  },
  commands: [
    {
      pattern: 'add(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Add members (csv numbers)',
      use: 'group',
      usage: '.add 92300...,92300...',
      menu: '_.add_ *<num,num,...>*',
      handler: async (m, match, ctx) => {
        if (!isGroup(m.jid)) return await m.sendReply('_Group only._');
        const nums = parseNumbersCsv(match?.[1]);
        if (!nums.length) return await m.sendReply('_Usage:_ `.add 92300...,92300...`');
        if (nums.length > ctx.services.addLimit) return await m.sendReply(`_Limit: add max ${ctx.services.addLimit} numbers at once._`);

        if (!(await isAdmin(m, m.jid))) return await m.sendReply('_Admin only._');
        if (!(await isBotAdmin(m, m.jid))) return await m.sendReply('_I need admin to add members._');

        await m.react('⏳');
        const jids = nums.map(toJid).filter(Boolean);
        await m.sock.groupParticipantsUpdate(m.jid, jids, 'add');
        await m.react('✅');
        return await m.sendReply(`_Added:_ ${jids.length}`);
      }
    },
    {
      pattern: 'kick(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Kick member (mention/reply/number)',
      use: 'group',
      usage: '.kick @user (or reply / number)',
      menu: '_.kick_ *<@user | reply | number>*',
      handler: async (m, match) => {
        if (!isGroup(m.jid)) return await m.sendReply('_Group only._');
        if (!(await isAdmin(m, m.jid))) return await m.sendReply('_Admin only._');
        if (!(await isBotAdmin(m, m.jid))) return await m.sendReply('_I need admin to kick._');

        const ctx = m.data?.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctx?.mentionedJid?.[0];
        const replied = ctx?.participant;
        const numArg = String(match?.[1] || '').trim();
        const target = mentioned || replied || (numArg ? toJid(numArg) : null);
        if (!target) return await m.sendReply('_Usage:_ `.kick @user` (or reply / number)_');

        await m.react('⏳');
        await m.sock.groupParticipantsUpdate(m.jid, [target], 'remove');
        await m.react('✅');
      }
    },
    {
      pattern: 'invite',
      fromMe: true,
      desc: 'Get group invite link',
      use: 'group',
      usage: '.invite',
      menu: '_.invite_',
      handler: async (m) => {
        if (!isGroup(m.jid)) return await m.sendReply('_Group only._');
        if (!(await isAdmin(m, m.jid))) return await m.sendReply('_Admin only._');

        await m.react('⏳');
        const code = await m.sock.groupInviteCode(m.jid);
        await m.react('✅');
        return await m.sendReply(`https://chat.whatsapp.com/${code}`);
      }
    },
    {
      pattern: 'revoke',
      fromMe: true,
      desc: 'Reset group invite link',
      use: 'group',
      usage: '.revoke',
      menu: '_.revoke_',
      handler: async (m) => {
        if (!isGroup(m.jid)) return await m.sendReply('_Group only._');
        if (!(await isAdmin(m, m.jid))) return await m.sendReply('_Admin only._');

        await m.react('⏳');
        await m.sock.groupRevokeInvite(m.jid);
        await m.react('✅');
        return await m.sendReply('_Invite link revoked._');
      }
    },
    {
      pattern: 'promote(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Promote member (mention/reply/number)',
      use: 'group',
      usage: '.promote @user (or reply / number)',
      menu: '_.promote_ *<@user | reply | number>*',
      handler: async (m, match) => {
        if (!isGroup(m.jid)) return await m.sendReply('_Group only._');
        if (!(await isAdmin(m, m.jid))) return await m.sendReply('_Admin only._');
        if (!(await isBotAdmin(m, m.jid))) return await m.sendReply('_I need admin to promote._');

        const ctx = m.data?.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctx?.mentionedJid?.[0];
        const replied = ctx?.participant;
        const numArg = String(match?.[1] || '').trim();
        const target = mentioned || replied || (numArg ? toJid(numArg) : null);
        if (!target) return await m.sendReply('_Usage:_ `.promote @user` (or reply / number)_');

        await m.react('⏳');
        await m.sock.groupParticipantsUpdate(m.jid, [target], 'promote');
        await m.react('✅');
      }
    },
    {
      pattern: 'demote(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Demote admin (mention/reply/number)',
      use: 'group',
      usage: '.demote @user (or reply / number)',
      menu: '_.demote_ *<@user | reply | number>*',
      handler: async (m, match) => {
        if (!isGroup(m.jid)) return await m.sendReply('_Group only._');
        if (!(await isAdmin(m, m.jid))) return await m.sendReply('_Admin only._');
        if (!(await isBotAdmin(m, m.jid))) return await m.sendReply('_I need admin to demote._');

        const ctx = m.data?.message?.extendedTextMessage?.contextInfo;
        const mentioned = ctx?.mentionedJid?.[0];
        const replied = ctx?.participant;
        const numArg = String(match?.[1] || '').trim();
        const target = mentioned || replied || (numArg ? toJid(numArg) : null);
        if (!target) return await m.sendReply('_Usage:_ `.demote @user` (or reply / number)_');

        await m.react('⏳');
        await m.sock.groupParticipantsUpdate(m.jid, [target], 'demote');
        await m.react('✅');
      }
    },
    {
      pattern: 'setgpp',
      fromMe: true,
      desc: 'Set group profile pic (reply image)',
      use: 'group',
      usage: '.setgpp (reply to image)',
      menu: '_.setgpp_ *<reply image>*',
      handler: async (m) => {
        if (!isGroup(m.jid)) return await m.sendReply('_Group only._');
        if (!(await isAdmin(m, m.jid))) return await m.sendReply('_Admin only._');
        if (!(await isBotAdmin(m, m.jid))) return await m.sendReply('_I need admin to change group pic._');

        const q = m.quoted;
        if (!q || !q.imageMessage) return await m.sendReply('_Reply to an image._');

        await m.react('⏳');
        const stream = await downloadContentFromMessage(q.imageMessage, 'image');
        const buff = await streamToBuffer(stream);
        await m.sock.updateProfilePicture(m.jid, buff);
        await m.react('✅');
      }
    },
    {
      pattern: 'setgd(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Set group description',
      use: 'group',
      usage: '.setgd <text>',
      menu: '_.setgd_ *<text>*',
      handler: async (m, match) => {
        if (!isGroup(m.jid)) return await m.sendReply('_Group only._');
        if (!(await isAdmin(m, m.jid))) return await m.sendReply('_Admin only._');

        const text = String(match?.[1] || '').trim();
        if (!text) return await m.sendReply('_Usage:_ `.setgd your description`');

        await m.react('⏳');
        await m.sock.groupUpdateDescription(m.jid, text);
        await m.react('✅');
      }
    },
    {
      pattern: 'mute(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Mute group (lock). Optional duration: 60s/10m/1h',
      use: 'group',
      usage: '.mute [60s|10m|1h]',
      menu: '_.mute_ *<[60s|10m|1h]>*',
      handler: async (m, match) => {
        if (!isGroup(m.jid)) return await m.sendReply('_Group only._');
        if (!(await isAdmin(m, m.jid))) return await m.sendReply('_Admin only._');
        if (!(await isBotAdmin(m, m.jid))) return await m.sendReply('_I need admin to mute._');

        const dur = parseDuration(match?.[1]);

        await m.react('⏳');
        await m.sock.groupSettingUpdate(m.jid, 'announcement');

        const db = readMuteDb();
        if (dur) {
          db[m.jid] = { unmuteAt: Date.now() + dur };
          writeMuteDb(db);
        } else {
          delete db[m.jid];
          writeMuteDb(db);
        }

        await m.react('✅');
        return await m.sendReply(dur ? `_Group muted for ${String(match?.[1] || '').trim()}._` : '_Group muted._');
      }
    },
    {
      pattern: 'unmute',
      fromMe: true,
      desc: 'Unmute group (unlock)',
      use: 'group',
      usage: '.unmute',
      menu: '_.unmute_',
      handler: async (m) => {
        if (!isGroup(m.jid)) return await m.sendReply('_Group only._');
        if (!(await isAdmin(m, m.jid))) return await m.sendReply('_Admin only._');
        if (!(await isBotAdmin(m, m.jid))) return await m.sendReply('_I need admin to unmute._');

        await m.react('⏳');
        await m.sock.groupSettingUpdate(m.jid, 'not_announcement');

        const db = readMuteDb();
        delete db[m.jid];
        writeMuteDb(db);

        await m.react('✅');
        return await m.sendReply('_Group unmuted. You can talk now._');
      }
    },
    {
      pattern: 'tagall(?:\\s+)?(.*)',
      fromMe: true,
      desc: 'Mention all members (optional message)',
      use: 'group',
      usage: '.tagall [message]',
      menu: '_.tagall_ *<[message]>*',
      handler: async (m, match) => {
        if (!isGroup(m.jid)) return await m.sendReply('_Group only._');
        if (!(await isAdmin(m, m.jid))) return await m.sendReply('_Admin only._');

        const meta = await getMeta(m);
        const members = meta.participants.map((p) => p.id);
        const msg = String(match?.[1] || '').trim();

        const header = msg ? `*Message:* ${msg}\n\n` : '';
        const body = members.map((j) => `@${j.split('@')[0]}`).join(' ');

        return await m.sock.sendMessage(m.jid, { text: header + body, mentions: members }, { quoted: m.data });
      }
    },

    // passive task: best-effort unmute when timer elapsed
    {
      on: 'message',
      handlerPrefix: false,
      excludeFromCommands: true,
      handler: async (m) => {
        if (!isGroup(m.jid)) return;
        const db = readMuteDb();
        const entry = db[m.jid];
        if (!entry?.unmuteAt) return;
        if (Date.now() < entry.unmuteAt) return;
        try {
          await m.sock.groupSettingUpdate(m.jid, 'not_announcement');
          delete db[m.jid];
          writeMuteDb(db);
          await m.sock.sendMessage(m.jid, { text: 'Group unmuted. You can talk now.' });
        } catch {
          // ignore
        }
      }
    }
  ]
});
