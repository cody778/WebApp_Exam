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
  if (!token) return json({ error: 'Sign in to create a path from YouTube.' }, 401)

  const url = env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key || !env.GEMINI_API_KEY || !env.GEMINI_MODEL) {
    return json({ error: 'YouTube path creation is not configured yet.' }, 503)
  }

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
    if (body.length > 70000) return json({ error: 'The transcript is too long.' }, 413)
    input = JSON.parse(body)
    if (!input || typeof input.youtubeUrl !== 'string' || input.youtubeUrl.length > 2048) {
      throw new Error('Enter a valid YouTube video link.')
    }
    input.youtubeUrl = normalizeYouTubeUrl(input.youtubeUrl)
    if (input.transcript !== undefined && (typeof input.transcript !== 'string' || input.transcript.length > 60000)) {
      throw new Error('The transcript must be text under 60,000 characters.')
    }
  } catch (error) {
    return json({ error: error instanceof SyntaxError ? 'The request could not be read.' : error.message }, 400)
  }

  try {
    const draft = await generate({ youtubeUrl: input.youtubeUrl, transcript: input.transcript }, {
      apiKey: env.GEMINI_API_KEY,
      model: env.GEMINI_MODEL,
    })
    return json(draft)
  } catch (error) {
    return json({ error: error.message || 'Could not create lessons from this video. Please try again.' }, 502)
  }
}
