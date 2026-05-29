const config = require('./config');

const commands = [];

function escapeRegex(str) {
  return String(str).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
}

function buildHandlerPrefix(rawHandlers, allowNoPrefix) {
  if (rawHandlers === '^' || rawHandlers === '' || rawHandlers == null) return '^';
  const handlersStr = String(rawHandlers);
  const parts = Array.from(handlersStr)
    .map((h) => escapeRegex(h))
    .filter(Boolean);
  if (parts.length === 0) return '^';
  const group = `^(?:${parts.join('|')})`;
  return allowNoPrefix ? `${group}?` : group;
}

const handlerPrefix = buildHandlerPrefix(config.HANDLERS, Boolean(config.MULTI_HANDLERS));

function Module(info, func) {
  const commandInfo = {
    plugin: info.plugin ?? '',
    fromMe: info.fromMe ?? (config.MODE !== 'public'),
    desc: info.desc ?? '',
    usage: info.usage ?? '',
    menu: info.menu ?? '',
    use: info.use ?? '',
    warn: info.warn ?? '',
    excludeFromCommands: info.excludeFromCommands ?? false,
    function: func
  };

  // Agar na pattern ho na event ho to default message event
  if (info.on === undefined && info.pattern === undefined) {
    commandInfo.on = 'message';
    commandInfo.fromMe = false;
  } else if (info.on) {
    commandInfo.on = info.on;
    if (info.pattern) {
      const prefix = (info.handler ?? true) ? handlerPrefix : '';
      commandInfo.pattern = new RegExp(`${prefix}${info.pattern}`, 's');
    }
  } else if (info.pattern) {
    const prefix = (info.handler ?? true) ? handlerPrefix : '';
    commandInfo.pattern = new RegExp(`${prefix}${info.pattern}`, 's');
  }

  commands.push(commandInfo);
  return commandInfo;
}

function definePlugin(pluginSpec = {}) {
  const name = String(pluginSpec.name || pluginSpec.plugin || '').trim();
  if (!name) throw new Error('definePlugin: missing plugin name');

  const meta = pluginSpec.meta || {};
  const services = pluginSpec.services || {};
  const context = { name, meta, services };

  const list = Array.isArray(pluginSpec.commands) ? pluginSpec.commands : [];
  for (const c of list) {
    if (!c || typeof c !== 'object') continue;
    const handler = c.handler || c.run || c.function;
    if (typeof handler !== 'function') throw new Error(`definePlugin(${name}): command missing handler`);

    Module(
      {
        plugin: name,
        pattern: c.pattern,
        on: c.on,
        handler: c.handlerPrefix,
        fromMe: c.fromMe,
        desc: c.desc,
        usage: c.usage,
        menu: c.menu,
        use: c.use,
        warn: c.warn,
        excludeFromCommands: c.excludeFromCommands
      },
      async (m, match) => handler(m, match, context)
    );
  }

  if (typeof pluginSpec.init === 'function') {
    try { pluginSpec.init(context); } catch {}
  }

  return context;
}

module.exports = {
  Module,
  definePlugin,
  commands
};