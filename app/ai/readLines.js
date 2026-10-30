export async function* readLines(stream) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let pending = ''
  let finished = false
  try {
    while (true) {
      const { value, done } = await reader.read()
      pending += decoder.decode(value, { stream: !done })
      const lines = pending.split('\n')
      pending = lines.pop()
      for (const line of lines) yield line.replace(/\r$/, '')
      if (done) {
        finished = true
        if (pending) yield pending.replace(/\r$/, '')
        break
      }
    }
  } finally {
    if (!finished) await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}
