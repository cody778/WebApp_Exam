import { loadEnv } from 'vite'
import { pathMiddleware } from './path-middleware.js'

export function pathApi() {
  let middleware
  return {
    name: 'path-api',
    configResolved(config) {
      middleware = pathMiddleware({ ...loadEnv(config.mode, config.envDir, ''), ...process.env })
    },
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}
