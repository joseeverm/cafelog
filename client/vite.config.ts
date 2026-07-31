import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png',
      ],
      manifest: {
        name: 'CaféLog — Gestión de Compras de Café',
        short_name: 'CaféLog',
        description: 'Registra tus compras de café, gestiona lotes y calcula tus ganancias',
        theme_color: '#f59e0b',      // amber-500, el acento del tema claro
        background_color: '#f4f4f5', // zinc-100, el fondo del tema claro
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'es-CO',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precachea todo el build: la app abre offline con el shell completo
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,woff,woff2}'],
        // Los bundles de xlsx/jspdf pasan del límite por defecto (2 MiB)
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // SPA: cualquier navegación resuelve al index precacheado
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // ── Caché de la API ──────────────────────────────────────────────
        // Los datos viven en el backend (/api/v1), así que sin red la app
        // abre pero no trae datos. Para servir la última respuesta conocida
        // cuando no hay conexión, descomentar este bloque:
        //
        // runtimeCaching: [
        //   {
        //     urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
        //     handler: 'NetworkFirst',
        //     options: {
        //       cacheName: 'cafelog-api',
        //       networkTimeoutSeconds: 5,
        //       expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
        //       cacheableResponse: { statuses: [200] },
        //     },
        //   },
        // ],
      },
      devOptions: {
        // El service worker no corre en `pnpm dev` salvo que se active aquí
        enabled: false,
      },
    }),
  ],
})
