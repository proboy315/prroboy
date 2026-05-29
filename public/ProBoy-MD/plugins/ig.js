const { igdl } = require('ab-downloader');
const { Module } = require('../main');

Module({
  pattern: 'ig(?:\\s+)?(.*)',
  desc: 'Download Instagram reel/post/story (public)',
  use: 'download',
  usage: '.ig <instagram_url>'
}, async (m, match) => {
  const url = String(match[1] || '').trim();
  if (!url) return await m.sendReply('_Usage:_ `.ig <instagram_url>`');
  if (!/instagram\.com\//i.test(url)) return await m.sendReply('_Invalid link. Give a valid instagram.com url._');

  await m.react('⏳');

  try {
    const data = await igdl(url);
    const first = Array.isArray(data) ? data[0] : data;
    const mediaUrl = first?.url;
    if (!mediaUrl) {
      await m.react('❌');
      return await m.sendReply('_Failed to fetch media. Try another link._');
    }

    // No preview message — send the media directly
    await m.sendMessage({ url: mediaUrl }, 'video', { caption: '_Instagram downloaded._' });
    await m.react('✅');
  } catch (e) {
    await m.react('❌');
    return await m.sendReply('_Error while downloading Instagram content._');
  }
});
