import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

// compute repo name from the GitHub Actions environment, fallback to manual string
// set REPO_NAME in other environments if necessary
const repoName = process.env.GITHUB_REPOSITORY
  ? process.env.GITHUB_REPOSITORY.split('/')[1]
  : process.env.REPO_NAME || 'vrtiq'

const basePath = process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  logLevel: 'error', // Suppress warnings, only show errors
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    minify: 'esbuild', // fast minification
    rollupOptions: {
      // code splitting is enabled by default
    }
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
        changeOrigin: true,
        // Forward /api/* requests to the backend /api/v1/* endpoints
        rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'robots.txt',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png'
      ],
      manifest: {
        id: '/',
        name: 'vrtIQ',
        short_name: 'vrtIQ',
        description: 'Real-time ski run difficulty, lift waits, and resort condition intelligence.',
        categories: ['sports', 'travel', 'navigation', 'weather'],
        lang: 'en-US',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        theme_color: '#0EA5E9',
        background_color: '#ffffff',
        display: 'standalone',
        shortcuts: [
          {
            name: 'Browse Resorts',
            short_name: 'Resorts',
            url: '/#/Resorts'
          },
          {
            name: 'Compare Runs',
            short_name: 'Compare',
            url: '/#/Compare'
          },
          {
            name: 'Lift Board',
            short_name: 'Lifts',
            url: '/#/LiftBoard'
          }
        ],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          // same‑origin API (relative paths)
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 10
            }
          },
          // external API example; adjust to fit your own domain
          {
            urlPattern: /^https:\/\/api\.[\w-]+\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'external-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ]
});