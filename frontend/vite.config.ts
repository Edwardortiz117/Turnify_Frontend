import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget =
    env.VITE_PROXY_TARGET ||
    process.env.VITE_PROXY_TARGET ||
    'http://localhost:3000'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      // Windows + Docker Desktop: polling para detectar cambios en volúmenes
      watch: {
        usePolling: true,
        interval: 300,
      },
      hmr: {
        clientPort: Number(env.VITE_HMR_CLIENT_PORT || process.env.VITE_HMR_CLIENT_PORT || 5173),
      },
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
