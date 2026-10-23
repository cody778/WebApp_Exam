export class ImportError extends Error {
  constructor(message, retryable = false) {
    super(message)
    this.retryable = retryable
  }
}

export async function readJson(response, limit = 2000000) {
  const reader = response.body.getReader()
  const chunks = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > limit) throw new ImportError('The provider returned too much data.')
      chunks.push(value)
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } finally {
    await reader.cancel().catch(() => {})
  }
}
