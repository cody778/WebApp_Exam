import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import BlockEditor from '../components/BlockEditor.jsx'
import { saveLesson } from './data.js'

export default function LessonForm({ lesson, roadmapId }) {
  const navigate = useNavigate()
  const [id] = useState(() => lesson?.id ?? crypto.randomUUID())
  const [blocks, setBlocks] = useState(() => lesson?.blocks ?? [{ id: crypto.randomUUID(), type: 'paragraph', content: { text: '' } }])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const title = new FormData(event.currentTarget).get('title').trim()
    if (!title) return setError('Give your lesson a title.')
    setBusy(true)
    setError('')

    try {
      await saveLesson(id, roadmapId, title, blocks)
      navigate(roadmapId ? `/my-path/${roadmapId}/lesson/${id}` : `/lesson/${id}`)
    } catch {
      setError('Could not save your lesson. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-6 py-6 font-sans text-ink">
      <div>
        <p className="m-0 text-sm text-quiet">Lesson editor</p>
        <h1 className="mt-1 mb-0 text-page-title">{lesson ? 'Edit lesson' : 'Add a lesson'}</h1>
      </div>
      <form className="rounded-xl border border-accent-muted bg-white p-4 sm:p-6" onSubmit={submit}>
        <fieldset className="m-0 grid min-w-0 gap-4 border-0 p-0" disabled={busy}>
          <label className="text-sm font-medium" htmlFor="lesson-title">Title</label>
          <input className="min-w-0 rounded-lg border border-accent-muted bg-white px-3 py-3 text-ink outline-none focus:border-accent" id="lesson-title" name="title" defaultValue={lesson?.title ?? ''} maxLength={200} required />
          <BlockEditor blocks={blocks} onChange={setBlocks} readOnly={busy} />
          <button className="m-0 h-11 min-w-0 cursor-pointer rounded-lg border-0 bg-brand px-5 py-0 text-sm text-on-brand disabled:cursor-wait disabled:opacity-60" type="submit">{busy ? 'Saving...' : 'Save lesson'}</button>
        </fieldset>
      </form>
      {error && <p className="m-0 rounded-lg border border-[#9e2020]/25 bg-[#9e2020]/5 p-3 text-sm text-[#9e2020]" role="alert">{error}</p>}
      <Link className="m-0 inline-flex h-11 w-fit items-center justify-center rounded-lg border border-accent-muted bg-white px-5 text-sm text-ink no-underline" to={roadmapId ? `/my-path/${roadmapId}` : '/browse-lessons'}>{roadmapId ? 'Back to path' : 'Back to lessons'}</Link>
    </section>
  )
}
