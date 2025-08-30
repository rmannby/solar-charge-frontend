import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader' // Importera vite-svg-loader
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader(), // Lägg till svgLoader till dina plugins
    VitePWA({
      // Use your custom sw (src/sw.js) + precache injection
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true, // allow testing SW on localhost
        type: 'module'
      },
      manifest: {
        id: '/solar-charge-frontend/',
        name: 'Solar Charge',
        short_name: 'Solar Charge',
        description: 'Real-time dashboard for solar charge optimization',
        start_url: '/solar-charge-frontend/',
        scope: '/solar-charge-frontend/',
        display: 'standalone',
        background_color: '#111827',
        theme_color: '#111827',
        icons: [
          { src: '/solar-charge-frontend/icons/solar-charge-48x48.png', sizes: '48x48', type: 'image/png' },
          { src: '/solar-charge-frontend/icons/solar-charge-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: '/solar-charge-frontend/icons/solar-charge-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: '/solar-charge-frontend/icons/solar-charge-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/solar-charge-frontend/icons/solar-charge-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/solar-charge-frontend/icons/solar-charge-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: '/solar-charge-frontend/icons/solar-charge-167x167.png', sizes: '167x167', type: 'image/png' },
          { src: '/solar-charge-frontend/icons/solar-charge-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/solar-charge-frontend/icons/solar-charge-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: '/solar-charge-frontend/icons/solar-charge-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/solar-charge-frontend/icons/solar-charge-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/solar-charge-frontend/icons/solar-charge-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      }
    })
  ],
  // Base path for GitHub Pages deployment
  // This ensures assets load correctly from https://rmannby.github.io/solar-charge-frontend/
  base: '/solar-charge-frontend/',
})
