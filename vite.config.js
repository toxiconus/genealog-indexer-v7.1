import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    open: '/public/viewer-osd-v7.html'  // 🚀 Updated to v7 (Phase 6.1 features)
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
