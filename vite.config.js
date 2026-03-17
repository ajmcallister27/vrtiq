import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// compute repo name from the GitHub Actions environment, fallback to manual string
// set REPO_NAME in other environments if necessary
const repoName = process.env.GITHUB_REPOSITORY
  ? process.env.GITHUB_REPOSITORY.split('/')[1]
  : process.env.REPO_NAME || '<REPO_NAME>'

const basePath = process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  logLevel: 'error', // Suppress warnings, only show errors
  build: {
    minify: 'esbuild', // fast minification
    rollupOptions: {
      // code splitting is enabled by default
    }
  },
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true
    }),
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
        name: 'vrtIQ',
        short_name: 'vrtIQ',
        description: 'Real Difficulty',
        theme_color: '#0EA5E9',
        background_color: '#ffffff',
        display: 'standalone',
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