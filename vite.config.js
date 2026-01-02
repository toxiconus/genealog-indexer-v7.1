import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    open: '/viewer-osd-v8.html'  // v8.0 with Firebase integration
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
