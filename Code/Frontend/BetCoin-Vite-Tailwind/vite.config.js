import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/BetCoin-Vite-Tailwind/',// GitHub Pages path(repository name)
  plugins: [vue(), tailwindcss()],
})