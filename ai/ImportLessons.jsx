import { useEffect, useState } from 'react'

const labels = { queued: 'Queued', extracting: 'Reading captions', generating: 'Writing lesson', completed: 'Ready to review', failed: 'Needs attention' }

async function request(token, path = '', options = {}) {
  const response = await fetch(`/api/ai/jobs${path}`, {
    ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok || !body) throw new Error(body?.error || 'Could not reach the import service.')
  return body
}

function Block({ block }) {
  const content = block.content
  if (block.type === 'heading') return <h3>{content.text}</h3>
  if (block.type === 'quote') return <blockquote>{content.text}</blockquote>
  if (['video', 'link'].includes(block.type)) {
    let url
    try { url = new URL(content.url) } catch { return null }
    if (url.protocol !== 'https:') return null
    return <p className="source"><a href={url.href} target="_blank" rel="noreferrer">{content.title || 'View source'} <span aria-hidden="true">↗</span></a></p>
  }
  return <p>{content.text}</p>
}

export default function ImportLessons() {
  const [token, setToken] = useState(() => sessionStorage.getItem('lesson-import-token') || '')
  const [key, setKey] = useState('')
  const [url, setUrl] = useState('')
  const [jobs, setJobs] = useState([])
  const [selected, setSelected] = useState(null)
  const [lesson, setLesson] = useState(null)
  const [error, setError] = useState('')
  const [connectionError, setConnectionError] = useState('')
  const [previewError, setPreviewError] = useState('')
  const [busy, setBusy] = useState(false)
  const job = jobs.find(item => item.id === selected)

  useEffect(() => {
    if (!token) return
    let stopped = false
    let timeout
    async function refresh() {
      try {
        const result = await request(token, selected ? `?selected=${selected}` : '')
        if (!stopped) { setJobs(result); setSelected(current => current || result[0]?.id); setConnectionError('') }
      } catch (error) { if (!stopped) setConnectionError(error.message) }
      if (!stopped) timeout = setTimeout(refresh, 2500)
    }
    refresh()
    return () => { stopped = true; clearTimeout(timeout) }
  }, [token, selected])

  useEffect(() => {
    let stopped = false
    setLesson(null)
    setPreviewError('')
    if (token && job?.status === 'completed') {
      request(token, `/${selected}/lesson`).then(result => { if (!stopped) setLesson(result) }).catch(error => { if (!stopped) setPreviewError(error.message) })
    }
    return () => { stopped = true }
  }, [token, selected, job?.status])

  async function connect(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await request(key.trim())
      sessionStorage.setItem('lesson-import-token', key.trim())
      setJobs(result)
      setToken(key.trim())
      setKey('')
    } catch (error) { setError(error.message) }
    finally { setBusy(false) }
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await request(token, '', { method: 'POST', body: JSON.stringify({ url }) })
      setJobs(current => [result, ...current.filter(item => item.id !== result.id)])
      setSelected(result.id)
      setUrl('')
    } catch (error) { setError(error.message) }
    finally { setBusy(false) }
  }

  async function retry() {
    setBusy(true)
    setError('')
    try {
      const result = await request(token, `/${selected}/retry`, { method: 'POST' })
      setJobs(current => current.map(item => item.id === result.id ? result : item))
    } catch (error) { setError(error.message) }
    finally { setBusy(false) }
  }

  function disconnect() {
    sessionStorage.removeItem('lesson-import-token')
    setToken('')
    setJobs([])
    setSelected(null)
    setLesson(null)
    setError('')
    setConnectionError('')
  }

  function download() {
    const file = URL.createObjectURL(new Blob([JSON.stringify(lesson, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = file
    link.download = `lesson-${lesson.id}.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(file), 1000)
  }

  return <main className="importer">
    <header>
      <div><p className="eyebrow">CONTENT STUDIO</p><h1>From video to lesson.</h1><p className="intro">Turn a YouTube video into a lesson draft, with source links and questions.</p></div>
      {token && <button className="quiet" onClick={disconnect}>Lock importer</button>}
    </header>
    {error && <p className="error" role="alert">{error}</p>}
    {connectionError && <p className="error" role="alert">{connectionError}</p>}
    {!token ? <form className="panel access" onSubmit={connect}>
      <h2>Open the importer</h2><p>Use the team’s import access key.</p>
      <label htmlFor="access-key">Import access key</label>
      <input id="access-key" type="password" autoComplete="off" value={key} onChange={event => setKey(event.target.value)} required />
      <button disabled={busy}>{busy ? 'Connecting…' : 'Connect'}</button>
    </form> : <>
      <form className="panel submit" onSubmit={submit}>
        <label htmlFor="video-url">YouTube video link</label>
        <div className="input-row"><input id="video-url" type="url" placeholder="https://www.youtube.com/watch?v=…" value={url} onChange={event => setUrl(event.target.value)} required maxLength={2000} /><button disabled={busy}>{busy ? 'Working…' : 'Create lesson'}</button></div>
        <p className="hint">Captioned videos up to 60 minutes. You can leave this page while the server works.</p>
      </form>
      <div className="workspace">
        <section className="panel queue" aria-label="Recent imports">
          <div className="section-heading"><h2>Recent imports</h2><span>{jobs.length}</span></div>
          {!jobs.length && <p className="empty">Your first lesson starts with a link.</p>}
          {jobs.map(item => <button className={`job ${selected === item.id ? 'selected' : ''}`} key={item.id} onClick={() => setSelected(item.id)} aria-pressed={selected === item.id}>
            <strong>{item.source_title || `Video ${item.video_id}`}</strong><span className={`status ${item.status}`}>{labels[item.status]}</span>
          </button>)}
        </section>
        <section className="panel preview" aria-label="Lesson preview">
          {!job ? <div className="empty"><h2>A lesson, ready for your eye.</h2><p>Choose an import to see its progress and read the draft here.</p></div> : <>
            <div className="section-heading"><span className={`status ${job.status}`} role="status">{labels[job.status]}</span><a href={job.source_url} target="_blank" rel="noreferrer">Original video ↗</a></div>
            {job.status !== 'completed' && <div className="progress"><h2>{job.source_title || 'Preparing your lesson'}</h2><p>{job.status === 'failed' ? job.error : job.status === 'queued' && job.error ? `${job.error} Retrying shortly.` : 'The draft will appear here when it is ready.'}</p>{job.status === 'failed' && <button onClick={retry} disabled={busy}>Retry import</button>}</div>}
            {previewError && <p className="error" role="alert">{previewError}</p>}
            {job.status === 'completed' && !lesson && !previewError && <p>Loading lesson…</p>}
            {lesson && <article><div className="review-note">{lesson.needs_review || !lesson.is_published ? 'Draft · Review the wording and source before publishing.' : 'Published lesson'}</div><h2 className="lesson-title">{lesson.title}</h2>{lesson.blocks.map(block => <Block key={block.id} block={block} />)}<button className="quiet" onClick={download}>Download lesson JSON</button></article>}
          </>}
        </section>
      </div>
    </>}
  </main>
}
