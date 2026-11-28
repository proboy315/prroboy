const yts = require('yt-search');
const { youtube } = require('ab-downloader');
const { Module } = require('../main');

Module({
  pattern: 'song(?:\\s+)?(.*)',
  desc: 'Song downloader (search query)',
  use: 'download',
  usage: '.song <query>'
}, async (m, match) => {
  const query = String(match[1] || '').trim();
  if (!query) return await m.sendReply('_Usage:_ `.song <query>`');

  await m.react('⏳');

  try {
    const results = await yts.search(query);
    const vid = results?.videos?.[0];
    if (!vid || !vid.url) {
      await m.react('❌');
      return await m.sendReply('_No results found._');
    }

    const data = await youtube(vid.url);
    const title = data?.title || vid.title || 'Song';
    const thumb = data?.thumbnail || vid.thumbnail;
    const mp3 = data?.mp3 || null;

    if (!mp3) {
      await m.react('❌');
      return await m.sendReply('_Failed to fetch audio._');
    }

    const caption = `_*${title}*_

Reply with:
- 1 for *Voice Note*
- 2 for *Document*`;

    const sent = thumb
      ? await m.sendMessage({ url: thumb }, 'image', { caption })
      : await m.sendReply(caption);

    const messageId = sent?.key?.id;
    if (messageId) {
      await m.pendingSet(messageId, { type: 'song', title, mp3 });
    }

    await m.react('✅');
  } catch {
    await m.react('❌');
    return await m.sendReply('_Error while processing song._');
  }
});

Module({
  on: 'text',
  handler: false
}, async (m) => {
  const choice = String(m.text || '').trim();
  if (choice !== '1' && choice !== '2') return;
  if (!m.quotedKey || !m.quotedKey.id) return;

  const pending = await m.pendingGet(m.quotedKey.id);
  if (!pending || pending.type !== 'song') return;

  await m.react('⏳');

  try {
    if (choice === '1') {
      await m.sendMessage({ url: pending.mp3 }, 'audio', { mimetype: 'audio/mpeg', ptt: true });
    } else {
      await m.sendMessage({ url: pending.mp3 }, 'document', { mimetype: 'audio/mpeg', fileName: `${pending.title}.mp3` });
    }

    await m.pendingDel(m.quotedKey.id);
    await m.react('✅');
  } catch {
    await m.react('❌');
    return await m.sendReply('_Failed to send audio._');
  }
});
