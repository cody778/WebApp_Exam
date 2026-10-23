import { setTimeout } from 'node:timers/promises'
import { ImportError } from './errors.js'

export async function processNext({ store, extract, generate, report = console.error }) {
  const job = await store.claim()
  if (!job) return false
  try {
    const source = await extract(job.source_url)
    if (!await store.generating(job, source)) return true
    const lesson = await generate(source)
    await store.finish(job, lesson, source)
  } catch (error) {
    const known = error instanceof ImportError
    if (!known) report(`Import ${job.id} failed (${error.code ?? 'unexpected error'}).`)
    await store.fail(job, known ? error.message : 'The import could not be saved. Check the server and retry.', known ? error.retryable : true)
  }
  return true
}

export async function runWorker(options, signal) {
  while (!signal.aborted) {
    try {
      if (await processNext(options)) continue
    } catch { console.error('The import queue is unavailable. Retrying shortly.') }
    try { await setTimeout(2000, undefined, { signal }) } catch {}
  }
}
