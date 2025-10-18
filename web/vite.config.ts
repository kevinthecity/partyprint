import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/health': 'http://localhost:8000',
      '/printers': 'http://localhost:8000',
      '/upload': 'http://localhost:8000',
      '/print': 'http://localhost:8000',
      '/files': 'http://localhost:8000',
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})