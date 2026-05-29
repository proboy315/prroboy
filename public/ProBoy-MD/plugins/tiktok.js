const { ttdl } = require('ab-downloader');
const { Module } = require('../main');

Module({
  pattern: 'tiktok(?:\\s+)?(.*)',
  desc: 'Download TikTok (video/audio options)',
  use: 'download',
  usage: '.tiktok <tiktok_url>'
}, async (m, match) => {
  const url = String(match[1] || '').trim();
  if (!url) return await m.sendReply('_Usage:_ `.tiktok <tiktok_url>`');
  if (!/tiktok\.com\//i.test(url)) return await m.sendReply('_Invalid link. Give a valid tiktok.com url._');

  await m.react('⏳');

  try {
    const data = await ttdl(url);
    const title = data?.title || 'TikTok';
    const thumb = data?.thumbnail;
    const videos = Array.isArray(data?.video) ? data.video : [];
    const audios = Array.isArray(data?.audio) ? data.audio : [];

    if (!videos.length && !audios.length) {
      await m.react('❌');
      return await m.sendReply('_Failed to fetch TikTok media._');
    }

    const caption = `_*${title}*_

Reply with:
- 1 for *Video*
- 2 for *Audio*
- 3 for *Audio Document*`;

    const sent = thumb
      ? await m.sendMessage({ url: thumb }, 'image', { caption })
      : await m.sendReply(caption);

    const messageId = sent?.key?.id;
    if (messageId) {
      await m.pendingSet(messageId, {
        type: 'tiktok',
        title,
        video: videos[0] || null,
        audio: audios[0] || null
      });
    }

    await m.react('✅');
  } catch {
    await m.react('❌');
    return await m.sendReply('_Error while processing TikTok link._');
  }
});

Module({
  on: 'text',
  handler: false
}, async (m) => {
  const choice = String(m.text || '').trim();
  if (choice !== '1' && choice !== '2' && choice !== '3') return;
  if (!m.quotedKey || !m.quotedKey.id) return;

  const pending = await m.pendingGet(m.quotedKey.id);
  if (!pending || pending.type !== 'tiktok') return;

  await m.react('⏳');

  try {
    if (choice === '1') {
      if (!pending.video) throw new Error('No video url');
      await m.sendMessage({ url: pending.video }, 'video', { caption: `_*${pending.title}*_` });
    } else if (choice === '2') {
      if (!pending.audio) throw new Error('No audio url');
      await m.sendMessage({ url: pending.audio }, 'audio', { mimetype: 'audio/mpeg', ptt: false });
    } else {
      if (!pending.audio) throw new Error('No audio url');
      await m.sendMessage({ url: pending.audio }, 'document', { mimetype: 'audio/mpeg', fileName: `${pending.title}.mp3` });
    }

    await m.pendingDel(m.quotedKey.id);
    await m.react('✅');
  } catch {
    await m.react('❌');
    return await m.sendReply('_Failed to send media. Try again._');
  }
});
