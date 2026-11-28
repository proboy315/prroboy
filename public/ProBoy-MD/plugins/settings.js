const fs = require('fs');
const path = require('path');
const { Module } = require('../main');
const config = require('../config');

function readSettings() {
  const file = path.join(config.DATA_DIR, 'settings.json');
  if (!fs.existsSync(file)) return {};
  const raw = fs.readFileSync(file, 'utf8');
  return raw ? JSON.parse(raw) : {};
}

Module({
  pattern: 'settings',
  fromMe: true,
  desc: 'Show current settings',
  use: 'settings',
  excludeFromCommands: true
}, async (m) => {
  let s = {};
  try {
    s = readSettings();
  } catch {
    s = {};
  }

  const lines = [];
  lines.push(`_*${config.BOT_NAME} Settings*_`);
  lines.push('');
  lines.push(`• _Mode:_ ${s.MODE || config.MODE}`);
  lines.push(`• _Handlers:_ ${config.HANDLERS}`);
  lines.push(`• _Footer:_ ${config.FOOTER}`);
  lines.push(`• _Bot image:_ ${config.BOT_IMAGE_URL || 'none'}`);

  return await m.sendReply(lines.join('\n'));
});
