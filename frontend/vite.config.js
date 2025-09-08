import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

export default defineConfig({
  plugins: [
    vue(),
    VueI18nPlugin({
      include: path.resolve(__dirname, './src/locales/**')
    })
  ],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    host: true,
    port: 8080,
    open: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://backend:5000', // compose içi backend servisi
        changeOrigin: true
      }
    }
    // Mac/WSL'de HMR sorunu yaşarsan:
    // ,hmr: { host: 'localhost', clientPort: 8080 }
    // ,watch: { usePolling: true }
  }
})