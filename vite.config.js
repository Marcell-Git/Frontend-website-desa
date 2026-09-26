import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons.svg', 'gambar-desa.jpg'],
      manifest: {
        name: 'RT 26 Tegalyoso Klaten',
        short_name: 'RT 26',
        description:
          'Sistem Informasi Manajemen RT Tegalyoso 26: pengumuman, laporan keuangan, dan pengaduan warga.',
        lang: 'id',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#059669',
        background_color: '#f1f5f9',
        categories: ['government', 'utilities'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // PENTING: tanpa denylist ini, setiap request bernavigasi (termasuk
        // <iframe src="*.pdf"> dan <a target="_blank" href="*.pdf">) dilayani
        // index.html oleh NavigationRoute di bawah, bukan file aslinya. Gejalanya
        // PDF "berubah jadi halaman website". Regex diuji terhadap pathname+search.
        navigateFallbackDenylist: [/^\/uploads\//, /^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/uploads/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'uploads-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
