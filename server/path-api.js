import { loadEnv } from 'vite'
import { handlePathRequest } from '../app/ai/path-handler.server.js'

export function pathApi() {
  let env

  function middleware(req, res, next) {
    if (req.url?.split('?')[0] !== '/api/generate-path') return next()

    async function respond() {
      const abort = new AbortController()
      res.on('close', () => { if (!res.writableEnded) abort.abort() })
      const chunks = []
      let size = 0
      for await (const chunk of req) {
        size += chunk.length
        if (size > 280000) {
          res.writeHead(413, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'The request is too large.' }))
          return
        }
        chunks.push(chunk)
      }
      const request = new Request('http://localhost/api/generate-path', {
        method: req.method,
        signal: abort.signal,
        headers: new Headers(Object.entries(req.headers).flatMap(([key, value]) =>
          value === undefined ? [] : [[key, Array.isArray(value) ? value.join(', ') : value]])),
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
      })
      const response = await handlePathRequest(request, { env })
      res.writeHead(response.status, Object.fromEntries(response.headers))
      res.flushHeaders()
      for await (const chunk of response.body) {
        if (res.destroyed) break
        res.write(chunk)
      }
      res.end()
    }

    respond().catch(() => {
      if (res.headersSent) { res.end(); return }
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Could not generate the path. Please try again.' }))
    })
  }

  return {
    name: 'path-api',
    configResolved(config) {
      env = { ...loadEnv(config.mode, config.envDir, ''), ...process.env }
    },
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}
