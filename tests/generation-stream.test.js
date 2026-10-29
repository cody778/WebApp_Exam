import test from 'node:test'
import assert from 'node:assert/strict'
import { readLines } from '../app/ai/readLines.js'
import { pathPreview, readGeminiStream } from '../app/ai/geminiStream.server.js'
import { generatePathDraft } from '../app/ai/lesson.server.js'
import { handlePathRequest } from '../app/ai/path-handler.server.js'

const lesson = { title: 'A "quoted" {lesson}', objectives: ['First step'], sections: [{ heading: 'Start', explanation: 'Work carefully.' }], quiz: [{ question: 'How?', answer: 'Carefully.' }] }
const draft = { title: 'Macramé', description: 'Make a small piece.', lessons: [lesson, { ...lesson, title: 'Finishing' }] }
const input = { youtubeUrl: 'https://www.youtube.com/watch?v=xPgPKRuFia4' }
const encoder = new TextEncoder()

function streamText(text, size = 7) {
  const bytes = encoder.encode(text)
  return new ReadableStream({ start(controller) {
    for (let index = 0; index < bytes.length; index += size) controller.enqueue(bytes.slice(index, index + size))
    controller.close()
  } })
}

function sse(parts) {
  return parts.map((text, index) => 'data: ' + JSON.stringify({ candidates: [{ content: { parts: [{ text }] }, ...(index === parts.length - 1 ? { finishReason: 'STOP' } : {}) }] }) + '\r\n\r\n').join('')
}

test('stream lines survive split UTF-8 characters, CRLF, and a final line without a newline', async () => {
  const result = []
  for await (const line of readLines(streamText('Macramé\r\nnext\nlast', 1))) result.push(line)
  assert.deepEqual(result, ['Macramé', 'next', 'last'])
})

test('partial JSON exposes complete lessons, including escaped quotes and braces', () => {
  const prefix = '{"title":"Macramé","description":"A path","lessons":['
  assert.equal(pathPreview('{"title":"Macra'), null)
  assert.deepEqual(pathPreview(prefix).lessons, [])
  const partial = prefix + JSON.stringify(lesson) + ',{"title":"Still writing'
  assert.deepEqual(pathPreview(partial).lessons, [lesson])
})

test('Gemini progress arrives before the final event and the full response is preserved', async () => {
  const text = JSON.stringify(draft)
  const split = text.indexOf(',{"title":"Finishing"')
  const updates = []
  const result = await readGeminiStream(streamText(sse([text.slice(0, split), text.slice(split)]), 3), preview => updates.push(preview))
  assert.deepEqual(updates.map(update => update.lessons.length), [1, 2])
  assert.deepEqual(JSON.parse(result.candidates[0].content.parts[0].text), draft)
  assert.equal(result.candidates[0].finishReason, 'STOP')
})

test('streamed generation produces the same editable blocks and rejects incomplete output', async () => {
  const updates = []
  const result = await generatePathDraft(input, {
    apiKey: 'test', model: 'gemini-test', onProgress: update => updates.push(update),
    fetchImpl: async (url, init) => {
      assert.match(url, /streamGenerateContent\?alt=sse$/)
      assert.equal(JSON.parse(init.body).generationConfig.responseMimeType, 'application/json')
      return new Response(streamText(sse([JSON.stringify(draft)])))
    },
  })
  assert.equal(result.lessons.length, 2)
  assert.ok(result.lessons.every(item => item.blocks.at(-1).type === 'video'))
  assert.deepEqual(updates[0].lessons, draft.lessons.map(item => ({ title: item.title })))
  await assert.rejects(generatePathDraft(input, {
    apiKey: 'test', model: 'gemini-test', onProgress() {},
    fetchImpl: async () => new Response(streamText(sse(['{"title":"Incomplete']))),
  }), /unreadable/)
})

const env = { VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'public', GEMINI_API_KEY: 'test', GEMINI_MODEL: 'gemini-test' }
const makeClient = () => ({ auth: { getUser: async () => ({ data: { user: { id: 'owner' } } }) } })
const request = () => new Request('http://localhost/api/generate-path', {
  method: 'POST', headers: { Authorization: 'Bearer test', Accept: 'application/x-ndjson' }, body: JSON.stringify(input),
})

test('API returns a loading event before generation completes and forwards progress', async () => {
  let finish
  const gate = new Promise(resolve => { finish = resolve })
  const response = await handlePathRequest(request(), {
    env, makeClient,
    generate: async (_, { onProgress }) => { await gate; onProgress({ ...draft, lessons: [lesson] }); return draft },
  })
  assert.match(response.headers.get('content-type'), /x-ndjson/)
  const lines = readLines(response.body)
  assert.deepEqual(JSON.parse((await lines.next()).value).lessons, [])
  finish()
  assert.equal(JSON.parse((await lines.next()).value).lessons.length, 1)
  assert.deepEqual(JSON.parse((await lines.next()).value), { type: 'complete', draft })
  assert.equal((await lines.next()).done, true)
})

test('a failure after streaming starts is sent as an error, not a completed draft', async () => {
  const response = await handlePathRequest(request(), { env, makeClient, generate: async () => { throw new Error('Timed out') } })
  const events = []
  for await (const line of readLines(response.body)) events.push(JSON.parse(line))
  assert.deepEqual(events.map(event => event.type), ['progress', 'error'])
  assert.equal(events[1].error, 'Timed out')
})

test('closing the response cancels generation immediately', async () => {
  let generationSignal
  const response = await handlePathRequest(request(), {
    env, makeClient,
    generate: async (_, { signal }) => {
      generationSignal = signal
      return new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }))
    },
  })
  await response.body.cancel()
  assert.equal(generationSignal.aborted, true)
})
