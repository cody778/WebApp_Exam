import { fileURLToPath } from 'node:url'
import pg from 'pg'
import { createApp } from './api.js'
import { createStore } from '../store.js'
import { createExtractor } from '../youtube.js'
import { createGenerator } from '../generate.js'
import { runWorker } from '../worker.js'

for (const name of ['DATABASE_URL', 'MISTRAL_API_KEY', 'AI_IMPORT_TOKEN']) {
  if (!process.env[name]?.trim()) throw new Error(`Set ${name} in the root .env.local before starting the importer.`)
}
const port = Number(process.env.AI_PORT ?? 3001)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('AI_PORT must be a valid port number.')
let databaseUrl
try {
  databaseUrl = new URL(process.env.DATABASE_URL)
  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) throw new Error()
  databaseUrl.searchParams.set('sslmode', 'verify-full')
} catch { throw new Error('DATABASE_URL must be a PostgreSQL connection string.') }
const pool = new pg.Pool({ connectionString: databaseUrl.href, max: 4, connectionTimeoutMillis: 10000, statement_timeout: 15000 })
pool.on('error', () => console.error('The database connection was interrupted.'))
const store = createStore(pool)
const app = createApp({
  store, token: process.env.AI_IMPORT_TOKEN,
  origins: [`http://127.0.0.1:${port}`, `http://localhost:${port}`, 'http://127.0.0.1:5174', 'http://localhost:5174', process.env.AI_ORIGIN].filter(Boolean),
  staticPath: fileURLToPath(new URL('./dist', import.meta.url)),
})
try {
  await pool.query('select id from ai_private.import_jobs limit 0')
  const { rows } = await pool.query("select is_nullable from information_schema.columns where table_schema = 'public' and table_name = 'lessons' and column_name = 'owner_id'")
  if (rows[0]?.is_nullable !== 'YES') throw new Error()
  await pool.query('select needs_review from public.lessons limit 0')
} catch {
  await pool.end()
  throw new Error('Check DATABASE_URL, apply ai/schema.sql, and confirm lessons has needs_review and a nullable owner_id.')
}
const controller = new AbortController()
let worker
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`Lesson importer listening at http://127.0.0.1:${port}`)
  worker = runWorker({
    store,
    extract: createExtractor({ executable: process.env.YTDLP_PATH || 'yt-dlp', language: process.env.AI_CAPTION_LANGUAGE || 'en' }),
    generate: createGenerator({ apiKey: process.env.MISTRAL_API_KEY, model: process.env.MISTRAL_MODEL || 'mistral-small-latest' }),
  }, controller.signal)
})
server.on('error', async () => { console.error('The import server could not listen on its port.'); controller.abort(); await pool.end(); process.exitCode = 1 })
async function stop() {
  if (controller.signal.aborted) return
  controller.abort()
  server.close()
  await worker
  await pool.end()
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
