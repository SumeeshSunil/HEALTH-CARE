import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  if (process.env.VERCEL === '1') {
    let api;
    try { api = new URL(env.VITE_API_BASE_URL); } catch { /* Show configuration guidance below. */ }
    if (!api || api.protocol !== 'https:' || !api.pathname.replace(/\/$/, '').endsWith('/api')
        || api.username || api.password || api.search || api.hash) {
      throw new Error('Set VITE_API_BASE_URL in Vercel to https://YOUR-BACKEND.onrender.com/api, then redeploy.');
    }
  }
  return {
    plugins: [react(), tailwindcss()],
    base: env.VITE_BASE_PATH || '/',
    server: { proxy: { '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true } } },
    preview: { proxy: { '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true } } },
  };
})
