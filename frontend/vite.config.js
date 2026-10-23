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
          changeOrigin: true,
          // Mirror production reverse-proxy behaviour: backend down => 502 (not Vite's generic 500),
          // so the frontend backend gate can hold & retry idempotent requests.
          configure: (proxy) => {
            proxy.on('error', (_err, _req, res) => {
              if (res && typeof res.writeHead === 'function' && !res.headersSent && !res.writableEnded) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ status: 502, message: 'Backend unreachable' }))
              }
            })
          }
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
