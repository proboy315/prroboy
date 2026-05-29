const fs = require('fs');
const path = require('path');
const config = require('../config');

function listPluginFiles() {
  if (!fs.existsSync(config.PLUGINS_DIR)) return [];
  return fs
    .readdirSync(config.PLUGINS_DIR)
    .filter((f) => f.endsWith('.js'))
    .filter((f) => !['index.js'].includes(f))
    .map((f) => path.join(config.PLUGINS_DIR, f));
}

function safeRequireFresh(filePath) {
  const resolved = require.resolve(filePath);
  if (require.cache[resolved]) delete require.cache[resolved];
  return require(filePath);
}

async function loadAllPlugins({ onError } = {}) {
  const files = listPluginFiles();
  const loaded = [];
  const failed = [];

  for (const file of files) {
    const name = path.basename(file, '.js');
    try {
      safeRequireFresh(file);
      loaded.push(name);
    } catch (err) {
      failed.push({ name, file, err });
      if (onError) await onError({ name, file, err });
    }
  }

  return { loaded, failed };
}

module.exports = {
  loadAllPlugins,
  listPluginFiles
};
