import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    target: 'es2018',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          tinymce: ['@tinymce/tinymce-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true
  }
})
