import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) {
            return 'firebase'
          }

          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query'
          }

          if (id.includes('node_modules/react-router') || id.includes('node_modules/react-dom')) {
            return 'router'
          }

          if (id.includes('node_modules/react')) {
            return 'react-vendor'
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
