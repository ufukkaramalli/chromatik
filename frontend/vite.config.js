import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

export default defineConfig(({ mode }) => {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5000'

  return {
    plugins: [
      vue(),
      VueI18nPlugin({
        include: path.resolve(__dirname, './src/locales/**')
      })
    ],
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : []
    },
    resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
    server: {
      host: true,
      port: 8080,
      open: false,
      strictPort: true,
      allowedHosts: true,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true
        },
        '/sitemap.xml': {
          target: backendUrl,
          changeOrigin: true
        },
        '/uploads': {
          target: backendUrl,
          changeOrigin: true
        },
        '/docs': {
          target: backendUrl,
          changeOrigin: true
        }
      },
      watch: { usePolling: true }
    }
  }
})
