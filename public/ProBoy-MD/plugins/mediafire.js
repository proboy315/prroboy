const { mediafire } = require('ab-downloader');
const { Module } = require('../main');

Module({
  pattern: 'mediafire(?:\\s+)?(.*)',
  desc: 'Download MediaFire direct file',
  use: 'download',
  usage: '.mediafire <mediafire_url>'
}, async (m, match) => {
  const url = String(match[1] || '').trim();
  if (!url) return await m.sendReply('_Usage:_ `.mediafire <mediafire_url>`');
  if (!/mediafire\.com\//i.test(url)) return await m.sendReply('_Invalid link. Give a valid mediafire.com url._');

  await m.react('⏳');

  try {
    const data = await mediafire(url);
    const result = data?.result;
    const fileUrl = result?.url;
    const fileName = result?.filename || 'mediafire_file';
    const mime = result?.mimetype || 'application/octet-stream';

    if (!fileUrl) {
      await m.react('❌');
      return await m.sendReply('_Failed to fetch MediaFire link._');
    }

    await m.sendMessage({ url: fileUrl }, 'document', { mimetype: mime, fileName });
    await m.react('✅');
  } catch {
    await m.react('❌');
    return await m.sendReply('_Error while downloading MediaFire file._');
  }
});
