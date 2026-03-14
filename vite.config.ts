import 'dotenv/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'api-server',
      configureServer(server) {
        let expressApp: any = null;

        // Register a synchronous middleware NOW (before Vite's SPA fallback)
        // that will forward /api requests to Express once it's loaded.
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api') && expressApp) {
            expressApp(req, res, next);
          } else {
            next();
          }
        });

        // Load the Express app asynchronously via Vite's SSR pipeline
        server.ssrLoadModule('./server/index.ts').then(({ createServer }) => {
          expressApp = createServer();
        }).catch((err) => {
          console.error('Failed to load API server:', err);
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
});
