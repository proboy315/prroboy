const { definePlugin, commands } = require('../main');
const config = require('../config');

function patternToCommand(patternSource) {
  const s = String(patternSource || '').replace(/^\^\(\?:/, '').replace(/^\^/, '');
  const m = s.match(/[a-z0-9_]+/i);
  return m ? m[0].toLowerCase() : null;
}

function findCommand(name) {
  const q = String(name || '').trim().toLowerCase().replace(/^\./, '');
  if (!q) return null;
  for (const c of commands) {
    if (!c.pattern) continue;
    const cmd = patternToCommand(c.pattern.source);
    if (!cmd) continue;
    if (cmd === q) return c;
  }
  return null;
}

definePlugin({
  name: 'help',
  meta: { version: '1.0.0', description: 'Help & command listing' },
  commands: [
    {
      pattern: 'list',
      desc: 'List all commands (with usage)',
      use: 'general',
      usage: '.list',
      menu: '_.list_',
      handler: async (m) => {
        const rows = [];
        for (const c of commands) {
          if (c.excludeFromCommands) continue;
          if (!c.pattern) continue;
          const cmd = patternToCommand(c.pattern.source);
          if (!cmd) continue;
          const usage = c.usage ? `\n   • Usage: ${c.usage}` : '';
          const desc = c.desc ? `\n   • Info: ${c.desc}` : '';
          rows.push(`• .${cmd}${desc}${usage}`);
        }
        if (!rows.length) return await m.sendReply('_No commands found._');
        const out = [`_*${config.BOT_NAME} Commands*_`, '', ...rows].join('\n');
        return await m.sendReply(out);
      }
    },
    {
      pattern: 'help(?:\\s+)?(.*)',
      desc: 'Show help for a command',
      use: 'general',
      usage: '.help <command>',
      menu: '_.help_ *<command>*',
      handler: async (m, match) => {
        const arg = String(match?.[1] || '').trim();
        if (!arg) {
          return await m.sendReply(`_Usage:_ \`${config.HANDLERS}help <command>\`\nExample: \`${config.HANDLERS}help alive\``);
        }

        const c = findCommand(arg);
        if (!c) return await m.sendReply(`_Not found:_ ${arg}`);

        const cmd = patternToCommand(c.pattern?.source) || arg;
        const lines = [];
        lines.push(`_*Help:*_ .${cmd}`);
        if (c.desc) lines.push(`• _Info:_ ${c.desc}`);
        if (c.usage) lines.push(`• _Usage:_ ${c.usage}`);
        if (c.use) lines.push(`• _Category:_ ${c.use}`);
        if (c.fromMe) lines.push('• _Owner only:_ yes');
        if (c.plugin) lines.push(`• _Plugin:_ ${c.plugin}`);
        return await m.sendReply(lines.join('\n'));
      }
    }
  ]
});
