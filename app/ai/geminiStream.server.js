import { readLines } from './readLines.js'

// Only expose complete JSON values. A half-written lesson stays a placeholder.
export function pathPreview(text) {
  const match = /"lessons"\s*:\s*\[/.exec(text)
  if (!match) return null
  let header
  try { header = JSON.parse(text.slice(0, match.index) + '"lessons": []}') } catch { return null }
  const lessons = []
  let depth = 0
  let start = -1
  let quoted = false
  let escaped = false
  for (let index = match.index + match[0].length; index < text.length; index++) {
    const char = text[index]
    if (quoted) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') quoted = false
      continue
    }
    if (char === '"') quoted = true
    else if (char === '{') { if (depth++ === 0) start = index }
    else if (char === '}') {
      if (--depth === 0 && start !== -1) {
        try { lessons.push(JSON.parse(text.slice(start, index + 1))) } catch { return null }
      }
    } else if (char === ']' && depth === 0) break
  }
  return { title: header.title, description: header.description, lessons }
}

export async function readGeminiStream(stream, onProgress) {
  let text = ''
  let finishReason
  let promptFeedback
  let event = []
  let previousPreview = ''

  // A blank SSE line ends one event; only complete lessons reach the preview.
  function consume() {
    if (!event.length) return
    const data = JSON.parse(event.join('\n'))
    event = []
    if (data.error) throw new Error('Gemini could not finish this request.')
    const candidate = data.candidates?.[0]
    promptFeedback = data.promptFeedback ?? promptFeedback
    finishReason = candidate?.finishReason ?? finishReason
    text += (candidate?.content?.parts ?? []).filter(part => !part.thought && typeof part.text === 'string').map(part => part.text).join('')
    if (text.length > 1000000) throw new Error('The generated path is too large.')
    const preview = pathPreview(text)
    if (preview) {
      const next = JSON.stringify(preview)
      if (next !== previousPreview) { onProgress(preview); previousPreview = next }
    }
  }

  for await (const line of readLines(stream)) {
    if (line.startsWith('data:')) event.push(line.slice(5).trimStart())
    else if (!line.trim()) consume()
  }
  consume()
  return { promptFeedback, candidates: [{ finishReason, content: { parts: [{ text }] } }] }
}
