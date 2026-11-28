const { youtube } = require('ab-downloader');
const { Module } = require('../main');

Module({
  pattern: 'yt(?:\\s+)?(.*)',
  desc: 'Download YouTube (video/audio options)',
  use: 'download',
  usage: '.yt <youtube_url>'
}, async (m, match) => {
  const url = String(match[1] || '').trim();
  if (!url) return await m.sendReply('_Usage:_ `.yt <youtube_url>`');
  if (!/youtube\.com\//i.test(url) && !/youtu\.be\//i.test(url)) {
    return await m.sendReply('_Invalid link. Give a valid youtube url._');
  }

  await m.react('⏳');

  try {
    const data = await youtube(url);
    const title = data?.title || 'YouTube';
    const thumb = data?.thumbnail;
    const mp4 = data?.mp4 || null;
    const mp3 = data?.mp3 || null;

    if (!mp4 && !mp3) {
      await m.react('❌');
      return await m.sendReply('_Failed to fetch YouTube links._');
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
      await m.pendingSet(messageId, { type: 'youtube', title, mp4, mp3 });
    }

    await m.react('✅');
  } catch {
    await m.react('❌');
    return await m.sendReply('_Error while processing YouTube link._');
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
  if (!pending || pending.type !== 'youtube') return;

  await m.react('⏳');

  try {
    if (choice === '1') {
      if (!pending.mp4) throw new Error('No mp4');
      await m.sendMessage({ url: pending.mp4 }, 'video', { caption: `_*${pending.title}*_` });
    } else if (choice === '2') {
      if (!pending.mp3) throw new Error('No mp3');
      await m.sendMessage({ url: pending.mp3 }, 'audio', { mimetype: 'audio/mpeg', ptt: false });
    } else {
      if (!pending.mp3) throw new Error('No mp3');
      await m.sendMessage({ url: pending.mp3 }, 'document', { mimetype: 'audio/mpeg', fileName: `${pending.title}.mp3` });
    }

    await m.pendingDel(m.quotedKey.id);
    await m.react('✅');
  } catch {
    await m.react('❌');
    return await m.sendReply('_Failed to send media. Try again._');
  }
});
