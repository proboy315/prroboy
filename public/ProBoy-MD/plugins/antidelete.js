const fs = require('fs');
const path = require('path');
const { definePlugin } = require('../main');
const config = require('../config');

function dbFile() {
  return path.join(config.DATA_DIR, 'antidelete.json');
}

function readDb() {
  try {
    if (!fs.existsSync(dbFile())) return {};
    const raw = fs.readFileSync(dbFile(), 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeDb(data) {
  fs.writeFileSync(dbFile(), JSON.stringify(data, null, 2));
}

function getGroupSettings(jid) {
  const db = readDb();
  return db[jid] || { enabled: false, messages: [] };
}

function setGroupSettings(jid, settings) {
  const db = readDb();
  db[jid] = settings;
  writeDb(db);
}

function parseOnOff(s) {
  const v = String(s || '').trim().toLowerCase();
  if (['on', 'true', '1'].includes(v)) return true;
  if (['off', 'false', '0'].includes(v)) return false;
  return null;
}

async function extractMessageContent(m) {
  const msg = {
    sender: m.sender,
    senderName: m.senderName,
    text: m.text || '',
    timestamp: Date.now(),
    type: 'text',
    mediaUrl: null,
    caption: '',
    fileName: '',
    messageKey: m.data?.key
  };

  // Image
  if (m.data?.message?.imageMessage) {
    msg.type = 'image';
    msg.caption = m.data.message.imageMessage?.caption || '';
    msg.fileName = m.data.message.imageMessage?.filename || 'image.jpg';
  }

  // Video
  if (m.data?.message?.videoMessage) {
    msg.type = 'video';
    msg.caption = m.data.message.videoMessage?.caption || '';
    msg.fileName = m.data.message.videoMessage?.filename || 'video.mp4';
  }

  // Audio
  if (m.data?.message?.audioMessage) {
    msg.type = 'audio';
    msg.fileName = m.data.message.audioMessage?.filename || 'audio.mp3';
  }

  // Document
  if (m.data?.message?.documentMessage) {
    msg.type = 'document';
    msg.fileName = m.data.message.documentMessage?.fileName || 'document';
    msg.caption = m.data.message.documentMessage?.caption || '';
  }

  return msg;
}

function cleanOldMessages(messages) {
  const now = Date.now();
  const seventyHours = 70 * 60 * 60 * 1000;
  const filtered = messages.filter((msg) => now - msg.timestamp < seventyHours);
  
  // Keep only last 100 messages
  if (filtered.length > 100) {
    return filtered.slice(-100);
  }
  return filtered;
}

definePlugin({
  name: 'antidelete',
  meta: {
    version: '1.0.0',
    description: 'Anti-delete: restore deleted messages (70 hours retention)'
  },
  services: {
    retentionMs: 70 * 60 * 60 * 1000,
    maxMessages: 100
  },
  commands: [
    {
      pattern: 'antidelete(?:\\s+)?(.*)',
      desc: 'Enable/disable message recovery',
      use: 'group',
      usage: '.antidelete on / .antidelete off',
      menu: '_.antidelete_ *<on | off>*',
      handler: async (m, match) => {
        const val = parseOnOff(match?.[1]);
        if (val === null) {
          return await m.sendReply('_Usage:_ `.antidelete on` / `.antidelete off`');
        }

        const settings = getGroupSettings(m.jid);
        settings.enabled = val;
        setGroupSettings(m.jid, settings);

        return await m.sendReply(
          `_*AntiDelete:*_ ${val ? '✅ ON' : '❌ OFF'}`
        );
      }
    },

    // Passive: store messages
    {
      on: 'message',
      handlerPrefix: false,
      excludeFromCommands: true,
      handler: async (m) => {
        const settings = getGroupSettings(m.jid);
        if (!settings.enabled) return;

        // Don't store bot's own messages
        if (m.fromMe) return;

        const msgData = await extractMessageContent(m);
        
        if (!settings.messages) settings.messages = [];
        settings.messages.push(msgData);
        
        // Clean old and excess messages
        settings.messages = cleanOldMessages(settings.messages);
        
        setGroupSettings(m.jid, settings);
      }
    },

    // Passive: detect deleted messages
    {
      on: 'delete',
      handlerPrefix: false,
      excludeFromCommands: true,
      handler: async (m) => {
        const settings = getGroupSettings(m.jid);
        if (!settings.enabled) return;
        if (!settings.messages) return;

        const deletedKey = m.data?.key;
        if (!deletedKey) return;

        const found = settings.messages.find((msg) => {
          return msg.messageKey?.id === deletedKey.id;
        });

        if (!found) return;

        // Skip if message is from bot owner
        const ownerNum = String(config.OWNER_NUMBER || '').replace(/[^0-9]/g, '');
        const senderNum = String(found.sender || '').split('@')[0].replace(/[^0-9]/g, '');
        if (ownerNum && senderNum && ownerNum === senderNum) return;

        // Restore message
        try {
          let restoreText = '';

          if (found.type === 'text') {
            restoreText = `_*[Restored Message]*_\n\n${found.text}`;
          } else if (found.type === 'image') {
            restoreText = `_*[Restored Image]*_\n${found.caption || '(no caption)'}`;
          } else if (found.type === 'video') {
            restoreText = `_*[Restored Video]*_\n${found.caption || '(no caption)'}`;
          } else if (found.type === 'audio') {
            restoreText = `_*[Restored Audio]*_\n${found.fileName}`;
          } else if (found.type === 'document') {
            restoreText = `_*[Restored Document]*_\n${found.fileName}\n${found.caption || ''}`;
          }

          restoreText += `\n\n_From:_ @${found.sender.split('@')[0]}\n_Time:_ ${new Date(found.timestamp).toLocaleString()}`;

          await m.sock.sendMessage(
            m.jid,
            { text: restoreText, mentions: [found.sender] },
            { quoted: m.data }
          );
        } catch (error) {
          console.error('Antidelete restore error:', error);
        }
      }
    }
  ]
});