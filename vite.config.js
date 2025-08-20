import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import svgLoader from 'vite-svg-loader' // Importera vite-svg-loader

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    svgLoader() // Lägg till svgLoader till dina plugins
  ],
  // Base path for GitHub Pages deployment
  // This ensures assets load correctly from https://rmannby.github.io/solar-charge-frontend/
  base: '/solar-charge-frontend/',
})
