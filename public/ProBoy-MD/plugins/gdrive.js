const { gdrive } = require('ab-downloader');
const { Module } = require('../main');

Module({
  pattern: 'gdrive(?:\\s+)?(.*)',
  desc: 'Download Google Drive public file',
  use: 'download',
  usage: '.gdrive <drive_url>'
}, async (m, match) => {
  const url = String(match[1] || '').trim();
  if (!url) return await m.sendReply('_Usage:_ `.gdrive <drive_url>`');
  if (!/drive\.google\.com\//i.test(url) && !/drive\.usercontent\.google\.com\//i.test(url)) {
    return await m.sendReply('_Invalid link. Give a valid Google Drive url._');
  }

  await m.react('⏳');

  try {
    const data = await gdrive(url);
    const result = data?.result;
    const fileUrl = result?.downloadUrl;
    const fileName = result?.filename || 'drive_file';

    if (!fileUrl) {
      await m.react('❌');
      return await m.sendReply('_Failed to fetch Google Drive download url._');
    }

    await m.sendMessage({ url: fileUrl }, 'document', { fileName, mimetype: 'application/octet-stream' });
    await m.react('✅');
  } catch {
    await m.react('❌');
    return await m.sendReply('_Error while downloading Google Drive file._');
  }
});
