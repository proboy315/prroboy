const fs = require('fs');
const os = require('os');
const path = require('path');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { definePlugin } = require('../main');

function tmpPath(ext) {
  const name = `proboy_${Date.now()}_${Math.random().toString(16).slice(2)}${ext ? '.' + ext : ''}`;
  return path.join(os.tmpdir(), name);
}

function safeUnlink(p) {
  try { if (p && fs.existsSync(p)) fs.unlinkSync(p); } catch {}
}

async function streamToBuffer(stream) {
  let buffer = Buffer.from([]);
  for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
  return buffer;
}

definePlugin({
  name: 'toimg',
  meta: { version: '1.0.0', description: 'Sticker conversion' },
  commands: [
    {
      pattern: 'toimg',
      desc: 'Sticker to image (reply sticker)',
      use: 'edit',
      usage: '.toimg (reply sticker)',
      menu: '_.toimg_ *<reply sticker>*',
      handler: async (m) => {
        const q = m.quoted;
        if (!q || !q.stickerMessage) return await m.sendReply('_Reply to a sticker._');

        await m.react('⏳');

        const inPath = tmpPath('webp');
        const outPath = tmpPath('png');
        try {
          const stream = await downloadContentFromMessage(q.stickerMessage, 'sticker');
          const buff = await streamToBuffer(stream);
          fs.writeFileSync(inPath, buff);

          const ffmpeg = require('fluent-ffmpeg');
          await new Promise((resolve, reject) => {
            ffmpeg(inPath)
              .outputOptions(['-vcodec', 'png'])
              .toFormat('png')
              .save(outPath)
              .on('end', resolve)
              .on('error', reject);
          });

          await m.sendMessage({ stream: fs.createReadStream(outPath) }, 'image', { caption: '_Converted._' });
          await m.react('✅');
        } catch {
          await m.react('❌');
          await m.sendReply('_Convert failed._');
        } finally {
          safeUnlink(inPath);
          safeUnlink(outPath);
        }
      }
    }
  ]
});
