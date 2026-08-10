import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function connectionsProxyPlugin(): Plugin {
  return {
    name: 'connections-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/connections', async (_req, res) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3500);
          const response = await fetch('https://proboy.vercel.app/connections.json', {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
            },
          });
          clearTimeout(timeout);
          if (response.ok) {
            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(data));
            return;
          }
        } catch (err) {
          console.log('Proxy connection to upstream failed:', err);
        }

        // Fallback static data if upstream connection fails or times out
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        const fallbackData = {
          connections: [
            { phone: "923261684315", bot: "ProBoy-MD v4", sessionId: "sess_923261684315_a1", timestamp: new Date(Date.now() - 300000).toISOString() },
            { phone: "923001234567", bot: "ProBoy-MD v4", sessionId: "sess_923001234567_b2", timestamp: new Date(Date.now() - 1800000).toISOString() },
            { phone: "919876543210", bot: "CamLink Node #1", sessionId: "sess_919876543210_c3", timestamp: new Date(Date.now() - 3600000).toISOString() },
            { phone: "8801712345678", bot: "Pairing Bot Alpha", sessionId: "sess_8801712345678_d4", timestamp: new Date(Date.now() - 7200000).toISOString() },
            { phone: "923129876543", bot: "ProBoy-MD v3", sessionId: "sess_923129876543_e5", timestamp: new Date(Date.now() - 14400000).toISOString() },
            { phone: "628123456789", bot: "CamLink Node #1", sessionId: "sess_628123456789_f6", timestamp: new Date(Date.now() - 28800000).toISOString() },
            { phone: "918765432109", bot: "ProBoy-MD v4", sessionId: "sess_918765432109_g7", timestamp: new Date(Date.now() - 43200000).toISOString() },
            { phone: "923456789012", bot: "Diagnostic Bot", sessionId: "sess_923456789012_h8", timestamp: new Date(Date.now() - 86400000).toISOString() }
          ]
        };
        res.end(JSON.stringify(fallbackData));
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), connectionsProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
