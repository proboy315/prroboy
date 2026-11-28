const { capcut } = require('ab-downloader');
const { Module } = require('../main');

Module({
  pattern: 'capcut(?:\\s+)?(.*)',
  desc: 'Download CapCut template video/cover (public)',
  use: 'download',
  usage: '.capcut <capcut_template_url>'
}, async (m, match) => {
  const url = String(match[1] || '').trim();
  if (!url) return await m.sendReply('_Usage:_ `.capcut <capcut_url>`');
  if (!/capcut\.com\//i.test(url)) return await m.sendReply('_Invalid link. Give a valid capcut.com url._');

  await m.react('⏳');

  try {
    const data = await capcut(url);
    const cover = data?.coverUrl;
    const original = data?.originalVideoUrl;
    const title = data?.title || 'CapCut';

    if (cover) {
      await m.sendMessage({ url: cover }, 'image', { caption: `_*${title}*_` });
    }

    if (!original) {
      await m.react('❌');
      return await m.sendReply('_Failed to fetch CapCut template video._');
    }

    await m.sendMessage({ url: original }, 'video', { caption: `_*${title}*_` });
    await m.react('✅');
  } catch {
    await m.react('❌');
    return await m.sendReply('_Error while downloading CapCut template._');
  }
});
