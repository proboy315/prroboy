const fs = require('fs');
const path = require('path');
const { Module } = require('../main');
const config = require('../config');

function normalizeNumber(input) {
  return String(input || '').replace(/[^0-9]/g, '');
}

function sudoFile() {
  return path.join(config.DATA_DIR, 'sudo.json');
}

function loadSudo() {
  let arr = [];
  try {
    if (fs.existsSync(sudoFile())) {
      const raw = fs.readFileSync(sudoFile(), 'utf8');
      arr = raw ? JSON.parse(raw) : [];
    }
  } catch {
    arr = [];
  }

  const list = Array.isArray(arr) ? arr.map(normalizeNumber).filter(Boolean) : [];
  const owner = normalizeNumber(config.OWNER_NUMBER);
  if (owner && !list.includes(owner)) list.unshift(owner);
  return Array.from(new Set(list));
}

function saveSudo(list) {
  const owner = normalizeNumber(config.OWNER_NUMBER);
  const cleaned = Array.isArray(list) ? list.map(normalizeNumber).filter(Boolean) : [];
  if (owner && !cleaned.includes(owner)) cleaned.unshift(owner);
  fs.writeFileSync(sudoFile(), JSON.stringify(Array.from(new Set(cleaned)), null, 2));
}

Module({
  pattern: 'getsudo',
  fromMe: true,
  desc: 'Show sudo list',
  use: 'owner'
}, async (m) => {
  const list = loadSudo();
  return await m.sendReply('_SUDO:_\n' + list.map((n) => '• ' + n).join('\n'));
});

Module({
  pattern: 'setsudo(?:\\s+)?(.*)',
  fromMe: true,
  desc: 'Add sudo number',
  use: 'owner',
  usage: '.setsudo 92300xxxxxxx'
}, async (m, match) => {
  const num = normalizeNumber(match[1]);
  if (!num) return await m.sendReply('_Usage:_ `.setsudo 92300xxxxxxx`');
  const list = loadSudo();
  if (!list.includes(num)) list.push(num);
  saveSudo(list);
  return await m.sendReply('_Added sudo:_ ' + num);
});

Module({
  pattern: 'delsudo(?:\\s+)?(.*)',
  fromMe: true,
  desc: 'Remove sudo number',
  use: 'owner',
  usage: '.delsudo 92300xxxxxxx'
}, async (m, match) => {
  const num = normalizeNumber(match[1]);
  if (!num) return await m.sendReply('_Usage:_ `.delsudo 92300xxxxxxx`');
  const owner = normalizeNumber(config.OWNER_NUMBER);
  if (num === owner) return await m.sendReply('_Owner cannot be removed from sudo._');
  const list = loadSudo().filter((n) => n !== num);
  saveSudo(list);
  return await m.sendReply('_Removed sudo:_ ' + num);
});
