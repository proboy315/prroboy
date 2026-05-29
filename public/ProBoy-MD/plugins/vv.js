const { definePlugin } = require('../main');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const config = require('../config');

definePlugin({
  name: 'viewonce',
  meta: {
    version: '1.0.0',
    description: 'Retrieve view-once media (image/video/audio)'
  },
  
  commands: [
    {
      pattern: 'vv(?:\\s+)?(.*)',
      alias: ['viewonce', 'retrieve', 'anti-vv', 'vw'],
      desc: 'Retrieve view-once media by replying',
      use: 'utility',
      usage: '.vv (reply to a view-once message)',
      menu: '_.vv_ (reply to view-once)',
      handler: async (m, match) => {
        await m.react('⏳');
        
        try {
          // Check if it's a reply
          const quoted = m.data.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          
          if (!quoted) {
            await m.react('❌');
            return await m.sendReply('_Please reply to a view-once message._\n_Usage:_ `.vv` (as reply to view-once)');
          }

          // Check for view-once media types
          const isViewOnceImage = quoted.imageMessage?.viewOnce;
          const isViewOnceVideo = quoted.videoMessage?.viewOnce;
          const isViewOnceAudio = quoted.audioMessage?.viewOnce;

          let buffer, mimeType, caption, fileName;

          if (isViewOnceImage) {
            const imgMsg = quoted.imageMessage;
            const stream = await downloadContentFromMessage(imgMsg, 'image');
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk]);
            }
            mimeType = imgMsg.mimetype || 'image/jpeg';
            caption = imgMsg.caption || '';
            fileName = `viewonce_${Date.now()}.jpg`;
            
            await m.sendMessage(
              { image: buffer, mimetype: mimeType },
              'image',
              { caption: caption ? `${caption}\n\n> ProBoy-MD` : '_Retrieved from view-once_\n\n> ProBoy-MD' }
            );
            
          } else if (isViewOnceVideo) {
            const vidMsg = quoted.videoMessage;
            const stream = await downloadContentFromMessage(vidMsg, 'video');
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk]);
            }
            mimeType = vidMsg.mimetype || 'video/mp4';
            caption = vidMsg.caption || '';
            fileName = `viewonce_${Date.now()}.mp4`;
            
            await m.sendMessage(
              { video: buffer, mimetype: mimeType },
              'video',
              { caption: caption ? `${caption}\n\n> ProBoy-MD` : '_Retrieved from view-once_\n\n> ProBoy-MD' }
            );
            
          } else if (isViewOnceAudio) {
            const audMsg = quoted.audioMessage;
            const stream = await downloadContentFromMessage(audMsg, 'audio');
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk]);
            }
            mimeType = audMsg.mimetype || 'audio/ogg; codecs=opus';
            fileName = `viewonce_${Date.now()}.${mimeType.includes('mpeg') ? 'mp3' : 'ogg'}`;
            
            // Check if it's voice note (ptt) or regular audio
            const isPtt = audMsg.ptt || false;
            
            await m.sendMessage(
              { audio: buffer, mimetype: mimeType },
              'audio',
              { ptt: isPtt }
            );
            
          } else {
            await m.react('❌');
            return await m.sendReply('_No view-once media found in the replied message._\n_Make sure you replied to a view-once image/video/audio._');
          }
          
          await m.react('✅');
          
        } catch (error) {
          console.error('ViewOnce Error:', error);
          await m.react('❌');
          return await m.sendReply(`_Failed to retrieve view-once media._\n_Error:_ ${error.message}`);
        }
      }
    },
    {
      pattern: 'vv2(?:\\s+)?(.*)',
      desc: 'Retrieve view-once and send to DM (owner only)',
      use: 'owner',
      usage: '.vv2 (reply to view-once)',
      menu: '_.vv2_ (owner only)',
      fromMe: true, // Owner only command
      handler: async (m, match) => {
        // Check if sender is owner
        const ownerNum = String(config.OWNER_NUMBER || '').replace(/[^0-9]/g, '');
        const senderNum = String(m.sender || '').split('@')[0].replace(/[^0-9]/g, '');
        
        if (ownerNum && senderNum !== ownerNum) {
          return; // Silent return for non-owner
        }
        
        await m.react('⏳');
        
        try {
          const quoted = m.data.message?.extendedTextMessage?.contextInfo?.quotedMessage;
          
          if (!quoted) {
            await m.react('❌');
            return await m.sendReply('_Please reply to a view-once message._');
          }

          const isViewOnceImage = quoted.imageMessage?.viewOnce;
          const isViewOnceVideo = quoted.videoMessage?.viewOnce;
          const isViewOnceAudio = quoted.audioMessage?.viewOnce;

          let buffer;

          if (isViewOnceImage) {
            const imgMsg = quoted.imageMessage;
            const stream = await downloadContentFromMessage(imgMsg, 'image');
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk]);
            }
            const caption = imgMsg.caption || '';
            
            // Send to user's DM
            await m.sock.sendMessage(
              m.sender,
              { image: buffer, caption: caption ? `${caption}\n\n_Sent to your DM_` : '_View-once image retrieved and sent to your DM_' }
            );
            
          } else if (isViewOnceVideo) {
            const vidMsg = quoted.videoMessage;
            const stream = await downloadContentFromMessage(vidMsg, 'video');
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk]);
            }
            const caption = vidMsg.caption || '';
            
            await m.sock.sendMessage(
              m.sender,
              { video: buffer, caption: caption ? `${caption}\n\n_Sent to your DM_` : '_View-once video retrieved and sent to your DM_' }
            );
            
          } else if (isViewOnceAudio) {
            const audMsg = quoted.audioMessage;
            const stream = await downloadContentFromMessage(audMsg, 'audio');
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
              buffer = Buffer.concat([buffer, chunk]);
            }
            const isPtt = audMsg.ptt || false;
            
            await m.sock.sendMessage(
              m.sender,
              { audio: buffer, ptt: isPtt }
            );
            
          } else {
            await m.react('❌');
            return await m.sendReply('_No view-once media found._');
          }
          
          await m.react('✅');
          await m.sendReply('_View-once media has been sent to your DM._');
          
        } catch (error) {
          console.error('ViewOnce2 Error:', error);
          await m.react('❌');
          return await m.sendReply(`_Failed: ${error.message}_`);
        }
      }
    }
  ]
});