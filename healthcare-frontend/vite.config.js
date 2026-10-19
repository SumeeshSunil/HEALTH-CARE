import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, isPreview }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'serve' && !isPreview ? '/' : '/healthcare-frontend/',
  server: { proxy: { '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true } } },
  preview: { proxy: { '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true } } },
}))
