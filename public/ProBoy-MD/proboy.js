const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const chokidar = require('chokidar');

const config = require('./config');
const { commands } = require('./main');
const { loadAllPlugins } = require('./plugins');

const {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  Browsers,
  DisconnectReason
} = require('@whiskeysockets/baileys');

const pino = require('pino');

// 1. AUTO RESTART ON FATAL ERRORS
// Yeh uncaught errors ko catch karta hai aur process ko restart hone deta hai (PM2 ke through)
process.on('uncaughtException', (err) => {
  console.error(chalk.red('Uncaught Exception:', err));
  process.exit(1); // Exit code 1 batata hai PM2 ko k error tha, restart karo
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection:', reason));
  process.exit(1);
});

// Logger Setup
function createLogger(level) {
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  const file = path.join(logsDir, 'bot.log');
  const fileStream = pino.destination({ dest: file, sync: false });
  const transport = pino.transport({
    targets: [
      { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', singleLine: true } }
    ]
  });
  return pino({ level: level || 'info' }, pino.multistream([{ stream: transport }, { stream: fileStream }]));
}

const logger = createLogger(process.env.LOG_LEVEL || 'info');

function ensureDirs() {
  for (const dir of [config.SESSION_DIR, config.DATA_DIR, config.PLUGINS_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

function withFooter(text) {
  const t = String(text ?? '').trim();
  if (!t) return t;
  const footer = '> ProBoy-MD';
  return t.includes(footer) ? t : `${t}\n\n${footer}`;
}

async function start() {
  ensureDirs();

  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(config.SESSION_DIR);

  const sock = makeWASocket({
    auth: state,
    version,
    logger: pino({ level: 'silent' }), // Baileys internal logs silent
    browser: Browsers.ubuntu('ProBoy-MD'),
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  // Connection Update Logic with Auto-Reconnect
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(chalk.yellow('Scan the QR Code above to connect.'));
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(chalk.red('Connection closed. Reason:', lastDisconnect?.error?.message));
      
      if (shouldReconnect) {
        console.log(chalk.yellow('Reconnecting...'));
        start(); // Auto reconnect logic
      } else {
        console.log(chalk.red('Device Logged Out. Deleting session and exiting...'));
        fs.rmSync(config.SESSION_DIR, { recursive: true, force: true });
        process.exit(0); // Clean exit, PM2 will restart if configured to keep alive, else manual scan needed
      }
    }

    if (connection === 'open') {
      console.log(chalk.green(`Connected! ${config.BOT_NAME} is online.`));
      try {
        const ownerJid = `${config.OWNER_NUMBER}@s.whatsapp.net`;
        await sock.sendMessage(ownerJid, { text: withFooter(`_*${config.BOT_NAME} connected*_\n_Mode:_ ${config.MODE}`) });
      } catch (e) {
        logger.error({ err: e }, 'Failed to notify owner');
      }
    }
  });

  // Load Plugins
  await loadAllPlugins({
    onError: async ({ name, err }) => {
      logger.error({ err }, `Plugin failed: ${name}`);
    }
  });

  // Message Upsert Handler (Clean Base - No Internal Plugins)
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages?.[0];
    if (!msg || !msg.message) return;

    const jid = msg.key.remoteJid;
    const fromMe = Boolean(msg.key.fromMe);
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderName = msg.pushName || 'User';

    const extractText = (message) => {
      if (!message) return '';
      if (message.conversation) return message.conversation;
      if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
      // Add other extractions if needed by plugins directly via m.text
      return '';
    };

    const text = extractText(msg.message);

    const m = {
      jid,
      fromMe,
      sender,
      senderName,
      text,
      data: msg,
      sock,
      react: async (emoji) => {
        try { return await sock.sendMessage(jid, { react: { text: emoji, key: msg.key } }); } catch {}
      },
      sendReply: async (t) => {
        return await sock.sendMessage(jid, { text: withFooter(t) }, { quoted: msg });
      },
      sendMessage: async (content, type, options = {}) => {
        // Simplified media sending for plugins
        if (!type) return await sock.sendMessage(jid, { text: withFooter(content) }, options);
        const opts = { ...options };
        if (opts.caption) opts.caption = withFooter(opts.caption);

        if (type === 'image') return await sock.sendMessage(jid, { image: Buffer.isBuffer(content) ? content : { url: content.url || content }, ...opts }, opts);
        if (type === 'video') return await sock.sendMessage(jid, { video: Buffer.isBuffer(content) ? content : { url: content.url || content }, ...opts }, opts);
        if (type === 'audio') return await sock.sendMessage(jid, { audio: Buffer.isBuffer(content) ? content : { url: content.url || content }, mimetype: opts.mimetype, ptt: opts.ptt }, opts);
        if (type === 'document') return await sock.sendMessage(jid, { document: Buffer.isBuffer(content) ? content : { url: content.url || content }, mimetype: opts.mimetype, fileName: opts.fileName }, opts);
        if (type === 'sticker') return await sock.sendMessage(jid, { sticker: Buffer.isBuffer(content) ? content : { url: content.url || content } }, opts);
      },
      edit: async (newText, editJid, key) => {
        return await sock.sendMessage(editJid || jid, { text: withFooter(newText), edit: key });
      },
      // Pending system basic implementation
      pendingSet: async (id, data) => { /* needs storage logic if required by plugins */ },
      pendingGet: async (id) => { /* needs storage logic */ return null; }
    };

    // Run Plugin Commands
    for (const cmd of commands) {
      try {
        // Simple Owner Check
        const ownerNum = String(config.OWNER_NUMBER || '').replace(/[^0-9]/g, '');
        const senderNum = String(sender || '').split('@')[0].replace(/[^0-9]/g, '');
        if (cmd.fromMe && senderNum !== ownerNum) continue;

        if (cmd.on === 'text' || cmd.on === 'message') {
           await cmd.function(m, [text]);
        } else if (cmd.pattern) {
          const match = String(text).match(cmd.pattern);
          if (match) {
            await cmd.function(m, match);
          }
        }
      } catch (err) {
        logger.error({ err }, 'Command error');
      }
    }
  });

  // Watcher for development (Restarts bot if files change)
  const watcher = chokidar.watch([config.PLUGINS_DIR], {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 400, pollInterval: 50 }
  });

  watcher.on('add', () => process.exit(0)); // Exit to let PM2 restart
  watcher.on('change', () => process.exit(0));
  watcher.on('unlink', () => process.exit(0));
}

start().catch((err) => {
  console.error('Fatal start error:', err);
  process.exit(1);
});