const fs = require('fs');
const os = require('os');
const path = require('path');
const config = require('../config');
const { Module, commands } = require('../main');
const pkg = require('../package.json');

function patternToCommand(patternSource) {
  const s = String(patternSource || '').replace(/^\^\(\?:/, '').replace(/^\^/, '');
  const m = s.match(/[a-z0-9]+/i);
  return m ? m[0].toLowerCase() : 'cmd';
}

function menuLine(cmdInfo) {
  const cmd = patternToCommand(cmdInfo.pattern?.source);
  if (cmdInfo.menu) return cmdInfo.menu;

  // Build: _.cmd_ *<args>*
  let args = '';
  const usage = String(cmdInfo.usage || '').trim();
  const m = usage.match(/\.[a-z0-9_]+\s*(.*)$/i);
  if (m && m[1]) {
    args = m[1].trim();
    args = args.replace(/^\((.*)\)$/,'$1').trim();
  }

  if (args) return `_.${cmd}_ *${args}*`;
  return `_.${cmd}_`;
}

Module({
  pattern: 'menu',
  desc: 'Show command menu',
  use: 'general'
}, async (m) => {
  await m.react('⏳');

  const grouped = new Map();

  for (const c of commands) {
    if (c.excludeFromCommands) continue;
    if (!c.pattern) continue;
    const cat = c.use || 'other';
    const cmd = patternToCommand(c.pattern.source);
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat).push({ cmd, desc: c.desc || '', raw: c });
  }

  const usersFile = path.join(config.DATA_DIR, 'users.json');
  let totalUsers = 0;
  try {
    if (fs.existsSync(usersFile)) {
      const raw = fs.readFileSync(usersFile, 'utf8');
      const data = raw ? JSON.parse(raw) : {};
      totalUsers = Object.keys(data).length;
    }
  } catch {
    totalUsers = 0;
  }

  const mem = os.totalmem();
  const free = os.freemem();
  const toGB = (b) => (b / 1024 / 1024 / 1024).toFixed(1);
  const server = `${os.type()} ${os.release()}`;
  const mode = config.MODE;
  const userLabel = m.senderName ? m.senderName : 'User';

  let out = `╭═══〘 \`${config.BOT_NAME}\` 〙═══⊷❍\n`;
  out += `┃✯╭──────────────\n`;
  out += `┃✯│ _*\`Owner\`*_ : ${config.OWNER_NAME}\n`;
  out += `┃✯│ _*\`User\`*_ : ${userLabel}\n`;
  out += `┃✯│ _*\`Mode\`*_ : ${mode}\n`;
  out += `┃✯│ _*\`Server\`*_ : ${server}\n`;
  out += `┃✯│ _*\`Available RAM\`*_ : ${toGB(free)} GB of ${toGB(mem)} GB\n`;
  out += `┃✯│ _*\`Total Users\`*_ : ${totalUsers}\n`;
  out += `┃✯│ _*\`Version\`*_ : ${pkg.version}\n`;
  out += `┃✯╰───────────────\n`;
  out += `╰═════════════════⊷\n`;

  let counter = 1;
  for (const [cat, list] of grouped.entries()) {
    out += `╭════〘 *_\`${String(cat).replace(/\b\w/g, (c) => c.toUpperCase())}\`_* 〙════⊷❍\n`;
    for (const item of list) {
      out += `┃✯│ _\`${counter}.\`_ ${menuLine(item.raw)}\n`;
      counter += 1;
    }
    out += `┃✯╰─────────────────❍\n`;
    out += `╰══════════════════⊷❍\n`;
  }

  out += `\n┌┤✑ Thanks for using ${config.BOT_NAME} │\n`;
  out += `└────────────┈ ⳹\n`;
  out += `│© ${new Date().getFullYear()} @ProBoy\n`;
  out += `└─────────────────┈ ⳹\n`;

  if (config.BOT_IMAGE_URL) {
    const res = await m.sendMessage({ url: config.BOT_IMAGE_URL }, 'image', { caption: out.trim() });
    await m.react('✅');
    return res;
  }

  const imgPath = config.MENU_IMAGE;
  if (imgPath && fs.existsSync(imgPath)) {
    const res = await m.sendMessage({ stream: fs.createReadStream(imgPath) }, 'image', { caption: out.trim() });
    await m.react('✅');
    return res;
  }

  const res = await m.sendReply(out.trim());
  await m.react('✅');
  return res;
});
