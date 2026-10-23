import { createHash, timingSafeEqual } from 'node:crypto'
import express from 'express'
import { parseVideoUrl } from '../youtube.js'
import { ImportError } from '../errors.js'

const hash = value => createHash('sha256').update(value).digest()
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createApp({ store, token, origins = [], staticPath }) {
  if (!token || token.length < 32) throw new Error('AI_IMPORT_TOKEN must contain at least 32 characters.')
  const app = express()
  const expected = hash(token)
  app.disable('x-powered-by')
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    if (req.get('Origin') && !origins.includes(req.get('Origin'))) return res.status(403).json({ error: 'This origin is not allowed.' })
    const supplied = req.get('Authorization')?.replace(/^Bearer /, '') ?? ''
    if (!req.get('Authorization')?.startsWith('Bearer ') || !timingSafeEqual(hash(supplied), expected)) return res.status(401).json({ error: 'Enter the import access key.' })
    next()
  })
  app.use('/api', express.json({ limit: '4kb' }))
  app.param('id', (req, res, next, id) => uuid.test(id) ? next() : res.status(400).json({ error: 'Invalid import ID.' }))
  app.get('/api/ai/jobs', async (req, res) => {
    const selected = req.query.selected
    if (selected !== undefined && (typeof selected !== 'string' || !uuid.test(selected))) return res.status(400).json({ error: 'Invalid import ID.' })
    res.json(await store.list(selected))
  })
  app.post('/api/ai/jobs', async (req, res) => {
    if (typeof req.body?.url !== 'string' || req.body.url.length > 2000) return res.status(400).json({ error: 'Enter a YouTube video URL.' })
    const job = await store.enqueue(parseVideoUrl(req.body.url))
    res.status(202).json(job)
  })
  app.get('/api/ai/jobs/:id', async (req, res) => {
    const job = await store.get(req.params.id)
    if (!job) return res.status(404).json({ error: 'Import not found.' })
    res.json(job)
  })
  app.get('/api/ai/jobs/:id/lesson', async (req, res) => {
    const lesson = await store.lesson(req.params.id)
    if (!lesson) return res.status(404).json({ error: 'The lesson is not available. It may still be processing or have been deleted.' })
    res.json(lesson)
  })
  app.post('/api/ai/jobs/:id/retry', async (req, res) => {
    const job = await store.retry(req.params.id)
    if (!job) return res.status(409).json({ error: 'Only failed imports can be retried.' })
    res.json(job)
  })
  app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }))
  if (staticPath) app.use(express.static(staticPath, { dotfiles: 'deny' }))
  app.use((error, req, res, next) => {
    if (error instanceof ImportError) return res.status(400).json({ error: error.message })
    if (error.type === 'entity.too.large') return res.status(413).json({ error: 'The request is too large.' })
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: 'The request must contain valid JSON.' })
    console.error(`Import request failed (${error.code ?? 'unexpected error'}).`)
    res.status(503).json({ error: 'The import service is unavailable. Check the server configuration.' })
  })
  return app
}
