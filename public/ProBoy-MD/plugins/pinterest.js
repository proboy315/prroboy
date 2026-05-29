const { pinterest } = require('ab-downloader');
const { Module } = require('../main');

Module({
  pattern: 'pinterest(?:\\s+)?(.*)',
  desc: 'Download Pinterest image or search',
  use: 'download',
  usage: '.pinterest <url | query>'
}, async (m, match) => {
  const input = String(match[1] || '').trim();
  if (!input) return await m.sendReply('_Usage:_ `.pinterest <url | query>`');

  await m.react('⏳');

  try {
    const data = await pinterest(input);

    if (data?.result?.image) {
      await m.sendMessage({ url: data.result.image }, 'image', { caption: '_Pinterest downloaded._' });
      await m.react('✅');
      return;
    }

    const results = data?.result?.result;
    if (Array.isArray(results) && results.length) {
      const top = results[0];
      const img = top?.image || top?.images?.orig?.url;
      if (img) {
        await m.sendMessage({ url: img }, 'image', { caption: '_Pinterest result (top)._'});
        await m.react('✅');
        return;
      }
    }

    await m.react('❌');
    return await m.sendReply('_No Pinterest result found._');
  } catch {
    await m.react('❌');
    return await m.sendReply('_Error while processing Pinterest._');
  }
});
