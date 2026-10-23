import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'app-icon.svg'],
      manifest: {
        name: 'Mirage - メディア管理システム',
        short_name: 'Mirage',
        description: 'Mirage - 映像制作メディア持ち出し＆保存データ管理システム',
        theme_color: '#0b0f19',
        background_color: '#0b0f19',
        display: 'standalone',
        start_url: './',
        icons: [
          {
            src: 'app-icon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
