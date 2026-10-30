import express from 'express'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { pathMiddleware } from './path-middleware.js'

export function createApp(clientDirectory = fileURLToPath(new URL('../build/client/', import.meta.url))) {
  const app = express()
  app.disable('x-powered-by')
  app.get('/health', (req, res) => res.json({ status: 'ok' }))
  // API routes must run before the static SPA fallback.
  app.use(pathMiddleware())
  app.use('/api', (req, res) => res.status(404).json({ error: 'API endpoint not found.' }))
  app.use(express.static(clientDirectory, { index: false, dotfiles: 'ignore' }))
  // Client-side routes all start from the same HTML document.
  app.get('/{*path}', (req, res) => {
    if (req.path.startsWith('/assets/') || req.path.split('/').some(part => part.startsWith('.')) || !req.accepts('html')) {
      return res.sendStatus(404)
    }
    res.set('Cache-Control', 'no-cache')
    res.sendFile(join(clientDirectory, 'index.html'))
  })
  return app
}
