import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// The dev server proxies /api to the Express backend so no CORS setup is needed.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    build: { chunkSizeWarningLimit: 1200 },
    server: {
      port: 5173,
      host: true,
      proxy: { '/api': { target: env.API_PROXY_TARGET || 'http://localhost:4000', changeOrigin: true } },
    },
  };
});
