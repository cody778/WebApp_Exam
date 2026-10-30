import { createClient } from '@supabase/supabase-js'
import { generatePathDraft, normalizeYouTubeUrl } from './lesson.server.js'

function json(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

export async function handlePathRequest(request, {
  env = process.env,
  makeClient = createClient,
  generate = generatePathDraft,
} = {}) {
  if (request.method !== 'POST') return json({ error: 'Use POST to generate a path.' }, 405)
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1]
  if (!token) return json({ error: 'Sign in to create a path.' }, 401)

  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
  const model = env.GEMINI_MODEL || 'gemini-3.8-flash'
  if (!url || !key) return json({ error: 'The sign-in service is not configured on the server.' }, 503)
  if (!env.GEMINI_API_KEY) return json({ error: 'The path generator API key is missing on the server.' }, 503)

  try {
    const client = makeClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data, error } = await client.auth.getUser(token)
    if (error) {
      if (error.status === 401 || error.status === 403 || error.code === 'bad_jwt' || error.code === 'session_not_found') {
        return json({ error: 'Your session expired. Please sign in again.' }, 401)
      }
      return json({ error: 'Could not reach the sign-in service. Please try again shortly.' }, 503)
    }
    if (!data?.user) return json({ error: 'Your session expired. Please sign in again.' }, 401)
  } catch {
    return json({ error: 'Could not check your session. Please try again.' }, 503)
  }

  let input
  try {
    const body = await request.text()
    if (body.length > 70000) return json({ error: 'The request is too large.' }, 413)
    input = JSON.parse(body)
    if (!input || typeof input !== 'object') throw new Error('Enter a path topic.')
    if ('prompt' in input) {
      if (typeof input.prompt !== 'string' || !input.prompt.trim() || input.prompt.length > 2000) {
        throw new Error('Enter a path topic under 2,000 characters.')
      }
      input = { prompt: input.prompt.trim() }
    } else {
      if (typeof input.youtubeUrl !== 'string' || input.youtubeUrl.length > 2048) {
        throw new Error('Enter a valid YouTube video link.')
      }
      input.youtubeUrl = normalizeYouTubeUrl(input.youtubeUrl)
      if (input.transcript !== undefined && (typeof input.transcript !== 'string' || input.transcript.length > 60000)) {
        throw new Error('The transcript must be text under 60,000 characters.')
      }
    }
  } catch (error) {
    return json({ error: error instanceof SyntaxError ? 'The request could not be read.' : error.message }, 400)
  }

  const generationOptions = { apiKey: env.GEMINI_API_KEY, model, signal: request.signal }
  if (request.headers.get('accept')?.includes('application/x-ndjson')) {
    const encoder = new TextEncoder()
    const abort = new AbortController()
    let closed = false
    const stream = new ReadableStream({
      start(controller) {
        const send = value => { if (!closed) controller.enqueue(encoder.encode(JSON.stringify(value) + '\n')) }
        send({ type: 'progress', title: '', description: '', lessons: [] })
        async function run() {
          try {
            const draft = await generate(input, {
              ...generationOptions,
              signal: AbortSignal.any([request.signal, abort.signal]),
              onProgress: preview => send({ ...preview, type: 'progress' }),
            })
            send({ type: 'complete', draft })
          } catch (error) {
            send({ type: 'error', error: error.message || 'Could not create the path.' })
          } finally {
            if (!closed) { closed = true; controller.close() }
          }
        }
        run()
      },
      cancel() { closed = true; abort.abort() },
    })
    return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' } })
  }

  try {
    const draft = await generate(input, {
      ...generationOptions,
    })
    return json(draft)
  } catch (error) {
    return json({ error: error.message || 'Could not create the path. Please try again.' }, 502)
  }
}
