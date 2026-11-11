import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['img/*'],
      manifest: {
        name: 'Demo - Menú Dinámico',
        short_name: 'Demo',
        description: 'Pizzas, hamburguesas y asados a domicilio',
        theme_color: '#0b1020',
        background_color: '#0b1020',
        display: 'standalone',
        start_url: base,
        scope: base,
        lang: 'es',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,webp,svg}'] }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    include: ['tests/**/*.test.{js,jsx}']
  }
})
