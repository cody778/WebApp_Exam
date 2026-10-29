import test from 'node:test'
import assert from 'node:assert/strict'
import { generatePathDraft, normalizeYouTubeUrl } from '../app/ai/lesson.server.js'
import { handlePathRequest } from '../app/ai/path-handler.server.js'
import { saveGeneratedPath } from '../app/user/generatedPath.js'

const url = 'https://www.youtube.com/watch?v=9hE5-98ZeCg'
const lesson = {
  title: 'Getting started',
  objectives: ['Understand the first step'],
  sections: [{ heading: 'First step', explanation: 'Start with a small example.' }],
  quiz: [{ question: 'Where do you start?', answer: 'With a small example.' }],
}
const path = { title: 'A short path', description: 'Learn one step at a time.', lessons: [lesson, { ...lesson, title: 'Next steps' }] }
const env = { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'public', GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'gemini-test' }
const options = { apiKey: 'test-key', model: 'gemini-test' }
const payload = draft => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: JSON.stringify(draft) }] } }] })

test('YouTube links are normalized and other hosts are rejected', () => {
  assert.equal(normalizeYouTubeUrl('https://youtu.be/9hE5-98ZeCg?t=10'), url)
  assert.equal(normalizeYouTubeUrl('https://www.youtube.com/shorts/9hE5-98ZeCg'), url)
  for (const value of ['https://youtube.com.evil.test/watch?v=9hE5-98ZeCg', 'http://youtu.be/9hE5-98ZeCg', 'https://youtube.com/playlist?list=abc', 'not a url']) {
    assert.throws(() => normalizeYouTubeUrl(value))
  }
})

test('generated lessons use the existing block format and keep the source video', async () => {
  const draft = await generatePathDraft({ youtubeUrl: url }, {
    ...options,
    fetchImpl: async (_, init) => {
      const body = JSON.parse(init.body)
      assert.equal(body.contents[0].parts[0].fileData.fileUri, url)
      assert.equal(body.generationConfig.responseSchema.properties.lessons.maxItems, 5)
      return Response.json(payload(path))
    },
  })
  assert.equal(draft.lessons.length, 2)
  const ids = [draft.id, ...draft.lessons.map(item => item.id), ...draft.lessons.flatMap(item => item.blocks.map(block => block.id))]
  assert.equal(new Set(ids).size, ids.length)
  for (const item of draft.lessons) {
    assert.deepEqual(item.blocks.at(-1).content, { url, title: 'Source video' })
    assert.ok(item.blocks.some(block => block.type === 'paragraph' && block.content.text === 'Start with a small example.'))
  }
})

test('invalid, truncated, and rate-limited generation cannot become a saved draft', async () => {
  for (const body of [payload({ ...path, lessons: [] }), payload({ ...path, lessons: [{ ...lesson, sections: [] }, lesson] }), { candidates: [{ finishReason: 'MAX_TOKENS' }] }]) {
    await assert.rejects(generatePathDraft({ youtubeUrl: url }, { ...options, fetchImpl: async () => Response.json(body) }))
  }
  await assert.rejects(generatePathDraft({ youtubeUrl: url }, { ...options, fetchImpl: async () => new Response('', { status: 429 }) }), /quota/)
})

function request(body, token = 'valid-token') {
  return new Request('http://localhost/api/generate-path', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {}, body: JSON.stringify(body) })
}

test('the API verifies the session before calling Gemini', async () => {
  let generated = false
  const dependencies = { env, generate: async () => { generated = true; return path }, makeClient: () => ({ auth: { getUser: async () => ({ data: { user: null }, error: { status: 401, message: 'expired' } }) } }) }
  assert.equal((await handlePathRequest(request({ youtubeUrl: url }, ''), dependencies)).status, 401)
  assert.equal((await handlePathRequest(request({ youtubeUrl: url }), dependencies)).status, 401)
  assert.equal(generated, false)
})

test('the API rejects bad input and returns a draft for an authenticated request', async () => {
  const dependencies = { env, generate: async () => path, makeClient: () => ({ auth: { getUser: async token => { assert.equal(token, 'valid-token'); return { data: { user: { id: 'owner' } } } } } }) }
  assert.equal((await handlePathRequest(request({ youtubeUrl: 'https://example.com' }), dependencies)).status, 400)
  assert.equal((await handlePathRequest(request({ youtubeUrl: url, transcript: 'x'.repeat(60001) }), dependencies)).status, 400)
  const response = await handlePathRequest(request({ youtubeUrl: url }), dependencies)
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), path)
  assert.equal(response.headers.get('cache-control'), 'no-store')
})

test('a partial save can be retried with the same path and lesson IDs in order', async () => {
  const draft = { ...path, id: 'path-id', lessons: [{ id: 'first', title: 'First', blocks: [] }, { id: 'second', title: 'Second', blocks: [] }] }
  const stored = new Map()
  const calls = []
  let fail = true
  const dependencies = {
    createPath: async (owner, id) => { assert.equal(owner, 'owner'); assert.equal(id, 'path-id') },
    saveLesson: async (id, pathId, title, blocks) => {
      calls.push(id)
      assert.equal(pathId, 'path-id')
      if (id === 'second' && fail) { fail = false; throw new Error('connection lost') }
      stored.set(id, { title, blocks })
    },
  }
  await assert.rejects(saveGeneratedPath('owner', draft, dependencies))
  assert.equal(stored.size, 1)
  assert.equal(await saveGeneratedPath('owner', draft, dependencies), 'path-id')
  assert.equal(stored.size, 2)
  assert.deepEqual(calls, ['first', 'second', 'first', 'second'])
})

test('connection failures are not reported as expired sessions', async () => {
  for (const error of [{ name: 'AuthRetryableFetchError', status: 0 }, { status: 503 }, { status: 429 }]) {
    const response = await handlePathRequest(request({ youtubeUrl: url }), {
      env,
      makeClient: () => ({ auth: { getUser: async () => ({ data: { user: null }, error }) } }),
      generate: async () => { throw new Error('Generation must not run without verified authentication') },
    })
    assert.equal(response.status, 503)
    assert.match((await response.json()).error, /Could not reach/)
  }
})
