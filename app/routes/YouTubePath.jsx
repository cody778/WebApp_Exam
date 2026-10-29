import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import BlockEditor from '../components/BlockEditor.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import { createRoadmap, saveLesson } from '../user/data.js'
import { saveGeneratedPath } from '../user/generatedPath.js'
import { generationRequestTimeoutMs } from '../ai/generationLimits.js'
import { readLines } from '../ai/readLines.js'
import PathGenerationLoading from '../components/PathGenerationLoading.jsx'

const buttonClass = 'min-w-0 cursor-pointer rounded-lg border-0 bg-accent px-4 py-3 font-sans text-base text-white disabled:cursor-wait disabled:opacity-60'

export default function YouTubePath() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const working = useRef(false)
  const [draft, setDraft] = useState(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(0)
  const [saveStarted, setSaveStarted] = useState(false)
  const [preview, setPreview] = useState(null)
  const [generated, setGenerated] = useState(null)
  const [source, setSource] = useState({ youtubeUrl: '', transcript: '' })
  const generation = useRef(null)
  useEffect(() => () => generation.current?.abort(), [])

  const finishGeneration = useCallback(() => {
    setDraft(generated)
    setBusy('')
    working.current = false
  }, [generated])

  async function generate(event) {
    event.preventDefault()
    if (working.current) return
    const form = new FormData(event.currentTarget)
    const input = { youtubeUrl: form.get('youtubeUrl').trim(), transcript: form.get('transcript').trim() }
    setSource(input)
    working.current = true
    setBusy('generating')
    setError('')
    setPreview(null)
    setGenerated(null)
    generation.current = new AbortController()
    try {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !data.session) throw new Error('Please sign in again to create a path.')
      const response = await fetch('/api/generate-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson', Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify(input),
        signal: AbortSignal.any([generation.current.signal, AbortSignal.timeout(generationRequestTimeoutMs)]),
      })
      if (response.ok && response.headers.get('content-type')?.includes('application/x-ndjson')) {
        let result
        for await (const line of readLines(response.body)) {
          if (!line.trim()) continue
          const event = JSON.parse(line)
          if (event.type === 'error') throw new Error(event.error)
          if (event.type === 'progress') setPreview(event)
          if (event.type === 'complete') result = event.draft
        }
        if (!result) throw new Error('The connection ended before your path was ready. Please try again.')
        setGenerated(result)
        return
      }
      if (!response.headers.get('content-type')?.includes('application/json')) {
        throw new Error('YouTube path creation is unavailable right now. Please try again later.')
      }
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not generate the lessons. Please try again.')
      setGenerated(result)
    } catch (error) {
      if (error.name === 'AbortError') return
      setError(error.name === 'TimeoutError' ? 'The server did not respond in time. Please try again or paste the video transcript.' : error.message)
      working.current = false
      setBusy('')
    }
  }

  async function save() {
    if (working.current) return
    working.current = true
    setBusy('saving')
    setError('')
    setSaveStarted(true)
    try {
      const id = await saveGeneratedPath(user.id, draft, {
        createPath: createRoadmap,
        saveLesson,
        onProgress: setSaved,
      })
      navigate(`/my-path/${id}`)
    } catch {
      setError('Could not save the whole path. Some lessons may already be saved. Retry to finish saving this same path.')
    } finally {
      working.current = false
      setBusy('')
    }
  }

  if (busy === 'generating') return <PathGenerationLoading
    preview={generated ?? preview}
    complete={Boolean(generated)}
    name={typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim().split(/\s+/)[0] : ''}
    onComplete={finishGeneration}
  />

  return (
    <section className="flex min-w-0 flex-col gap-5" aria-busy={Boolean(busy)}>
      <h1 className="m-0 text-page-title text-ink">Create a path from YouTube</h1>
      {!draft ? <>
        <p className="m-0 text-sm leading-body text-quiet">Paste a public YouTube video link. Gemini will turn it into a short path with lessons you can review before saving.</p>
        <form onSubmit={generate}>
          <fieldset disabled={Boolean(busy)} className="m-0 grid min-w-0 gap-3 border-0 p-0">
            <label htmlFor="youtube-url" className="text-sm font-semibold">YouTube link</label>
            <input id="youtube-url" name="youtubeUrl" type="url" defaultValue={source.youtubeUrl} required maxLength={2048} placeholder="https://www.youtube.com/watch?v=..."
              className="min-w-0 rounded-lg border border-accent-muted bg-white p-3 font-sans text-base" />
            <details className="rounded-lg border border-accent-muted p-3">
              <summary className="cursor-pointer text-sm">Add a transcript (optional)</summary>
              <label htmlFor="video-transcript" className="my-3 block text-sm leading-body">If the video cannot be read, paste its transcript here.</label>
              <textarea id="video-transcript" name="transcript" defaultValue={source.transcript} maxLength={60000} rows={6}
                className="w-full min-w-0 rounded-lg border border-accent-muted bg-white p-3 font-sans text-sm" />
            </details>
            <button type="submit" className={buttonClass}>{busy ? 'Creating lessons...' : 'Generate lessons'}</button>
          </fieldset>
        </form>
      </> : <>
        <div className="rounded-lg border border-accent-muted bg-white p-4">
          <h2 className="mt-0 text-xl font-semibold">{draft.title}</h2>
          <p className="mb-0 text-sm leading-body">{draft.description}</p>
        </div>
        <p className="m-0 text-sm text-quiet">Review these {draft.lessons.length} lessons. You can edit them after saving.</p>
        <ol className="m-0 grid list-none gap-3 p-0">
          {draft.lessons.map((lesson, index) => <li key={lesson.id}>
            <details className="overflow-hidden rounded-lg border border-accent-muted bg-white">
              <summary className="cursor-pointer p-4 font-semibold">{index + 1}. {lesson.title}</summary>
              <BlockEditor blocks={lesson.blocks} readOnly />
            </details>
          </li>)}
        </ol>
        <button type="button" disabled={Boolean(busy)} onClick={save} className={buttonClass}>
          {busy === 'saving' ? `Saving ${saved} of ${draft.lessons.length} lessons...` : saveStarted ? 'Retry saving path' : 'Save path'}
        </button>
        {!saveStarted && <button type="button" disabled={Boolean(busy)} className="cursor-pointer border-0 bg-transparent p-0 text-sm text-accent underline" onClick={() => { setDraft(null); setError('') }}>Use a different video</button>}
      </>}
      {error && <p role="alert" className="m-0 text-sm text-[#9e2020]">{error}</p>}
      <Link to="/create-path" className="text-sm text-accent underline">Back to create a path</Link>
    </section>
  )
}
