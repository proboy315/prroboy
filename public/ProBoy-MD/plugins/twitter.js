const { twitter } = require('ab-downloader');
const { Module } = require('../main');

Module({
  pattern: 'twitter(?:\\s+)?(.*)',
  desc: 'Download Twitter/X media',
  use: 'download',
  usage: '.twitter <tweet_url>'
}, async (m, match) => {
  const url = String(match[1] || '').trim();
  if (!url) return await m.sendReply('_Usage:_ `.twitter <tweet_url>`');
  if (!/twitter\.com\//i.test(url) && !/x\.com\//i.test(url)) {
    return await m.sendReply('_Invalid link. Give a valid twitter/x url._');
  }

  await m.react('⏳');

  try {
    const data = await twitter(url);
    const list = Array.isArray(data?.url) ? data.url : [];
    const hd = list.find((x) => x.hd)?.hd || null;
    const sd = list.find((x) => x.sd)?.sd || null;
    const outUrl = hd || sd;

    if (!outUrl) {
      await m.react('❌');
      return await m.sendReply('_Failed to fetch Twitter media._');
    }

    await m.sendMessage({ url: outUrl }, 'video', { caption: '_Twitter downloaded (HD preferred)._'});
    await m.react('✅');
  } catch {
    await m.react('❌');
    return await m.sendReply('_Error while downloading Twitter media._');
  }
});
