const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, 'config.env'))) {
  require('dotenv').config({ path: path.join(__dirname, 'config.env') });
}

const BOT_NAME = 'ProBoy-MD';
const OWNER_NAME = 'SHAHAN';

const OWNER_NUMBER = '923261684315';

const HANDLERS = process.env.HANDLERS || '.';
const MULTI_HANDLERS = (process.env.MULTI_HANDLERS || 'true') === 'true';

const MODE = process.env.MODE || 'public';

const FOOTER = '> ProBoy-MD';
const BOT_IMAGE_URL = 'https://proboy.vercel.app/botimg.png';
const MENU_IMAGE = process.env.MENU_IMAGE || path.join(__dirname, 'assets', 'Botimg.jpg');
const PLUGINS_DIR = path.join(__dirname, 'plugins');
const DATA_DIR = path.join(__dirname, 'data');
const SESSION_DIR = path.join(__dirname, 'session');

const SELF_JID = process.env.SELF_JID || null;

module.exports = {
  BOT_NAME,
  OWNER_NAME,
  OWNER_NUMBER,
  HANDLERS,
  MULTI_HANDLERS,
  MODE,
  FOOTER,
  BOT_IMAGE_URL,
  MENU_IMAGE,
  PLUGINS_DIR,
  DATA_DIR,
  SESSION_DIR,
  SELF_JID
};
