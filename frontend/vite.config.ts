import fs from 'node:fs'
import dns from 'node:dns'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Docker Desktop: evita timeouts IPv6 al resolver host.docker.internal / localhost
dns.setDefaultResultOrder('ipv4first')

function isRunningInDocker() {
  try {
    return fs.existsSync('/.dockerenv')
  } catch {
    return false
  }
}

function resolveProxyTarget(fileEnv: Record<string, string>) {
  const fromProcess = process.env.VITE_PROXY_TARGET?.trim()
  const fromFile = fileEnv.VITE_PROXY_TARGET?.trim()
  if (fromProcess) return fromProcess
  if (fromFile) return fromFile
  // Dentro del contenedor, localhost es el propio contenedor (no el host)
  if (isRunningInDocker() || process.env.DOCKER === '1') {
    return 'http://host.docker.internal:3000'
  }
  return 'http://localhost:3000'
}

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, process.cwd(), '')
  const proxyTarget = resolveProxyTarget(fileEnv)

  console.info(`[vite] API proxy → ${proxyTarget}`)

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      watch: {
        usePolling: true,
        interval: 300,
      },
      hmr: {
        clientPort: Number(
          process.env.VITE_HMR_CLIENT_PORT ||
            fileEnv.VITE_HMR_CLIENT_PORT ||
            5173,
        ),
      },
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          timeout: 30_000,
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              console.error(`[vite] proxy error → ${proxyTarget}`, err.message)
              const httpRes = res as { headersSent?: boolean; writeHead?: Function; end?: Function }
              if (httpRes && !httpRes.headersSent && typeof httpRes.writeHead === 'function') {
                httpRes.writeHead(502, { 'Content-Type': 'application/json' })
                httpRes.end?.(
                  JSON.stringify({
                    error: {
                      code: 'PROXY_ERROR',
                      message: 'Service temporarily unavailable',
                    },
                  }),
                )
              }
            })
          },
        },
      },
    },
  }
})
