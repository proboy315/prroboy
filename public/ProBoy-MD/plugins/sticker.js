const fs = require('fs');
const os = require('os');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Module } = require('../main');

function tmpPath(ext) {
  const name = `proboy_${Date.now()}_${Math.random().toString(16).slice(2)}${ext ? '.' + ext : ''}`;
  return path.join(os.tmpdir(), name);
}

function safeUnlink(p) {
  try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch {}
}

async function streamToFile(stream, filePath) {
  return await new Promise((resolve, reject) => {
    const w = fs.createWriteStream(filePath);
    stream.pipe(w);
    w.on('finish', resolve);
    w.on('error', reject);
  });
}

Module({
  pattern: 'sticker',
  desc: 'Make sticker (reply to image/video)',
  use: 'edit',
  usage: '.sticker (reply image/video)'
}, async (m) => {
  const q = m.quoted;
  if (!q) return await m.sendReply('_Reply to an image/video._');

  const img = q.imageMessage;
  const vid = q.videoMessage;
  if (!img && !vid) return await m.sendReply('_Reply to an image/video._');

  await m.react('⏳');

  const inPath = tmpPath(img ? 'jpg' : 'mp4');
  const outPath = tmpPath('webp');

  try {
    const stream = await downloadContentFromMessage(img || vid, img ? 'image' : 'video');
    await streamToFile(stream, inPath);

    await new Promise((resolve, reject) => {
      ffmpeg(inPath)
        .outputOptions([
          '-vcodec',
          'libwebp',
          '-vf',
          'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0',
          '-lossless',
          '1',
          '-qscale',
          '75',
          '-preset',
          'default',
          '-loop',
          '0',
          '-an',
          '-vsync',
          '0'
        ])
        .toFormat('webp')
        .save(outPath)
        .on('end', resolve)
        .on('error', reject);
    });

    const buff = fs.readFileSync(outPath);
    await m.sendMessage(buff, 'sticker');
    await m.react('✅');
  } catch {
    await m.react('❌');
    await m.sendReply('_Sticker failed._');
  } finally {
    safeUnlink(inPath);
    safeUnlink(outPath);
  }
});
