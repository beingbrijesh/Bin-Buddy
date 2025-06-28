import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin']
      }
    })
  ],
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser'
  },
  resolve: {
    alias: {
      // This ensures Leaflet assets are properly resolved
      'leaflet': resolve(__dirname, 'node_modules/leaflet'),
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['@emotion/react', '@emotion/styled']
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled', '@mui/material/styles']
  }
})
