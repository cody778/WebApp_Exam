import { loadEnv } from 'vite'
import { pathMiddleware } from './path-middleware.js'

export function pathApi() {
  let middleware
  return {
    name: 'path-api',
    // Use the production API middleware in Vite development and preview.
    configResolved(config) {
      middleware = pathMiddleware({ ...loadEnv(config.mode, config.envDir, ''), ...process.env })
    },
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}
