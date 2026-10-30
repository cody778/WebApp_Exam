import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import BlockEditor from '../components/BlockEditor.jsx'
import { saveLesson } from './data.js'

export default function LessonForm({ lesson, roadmapId }) { //creating or editing a lesson with optional roadmapId
  const navigate = useNavigate()
  const [id] = useState(() => lesson?.id ?? crypto.randomUUID())
  const [blocks, setBlocks] = useState(() => lesson?.blocks ?? [{ id: crypto.randomUUID(), type: 'paragraph', content: { text: '' } }])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) { // handles the form submission
    event.preventDefault()
    if (busy) return
    const title = new FormData(event.currentTarget).get('title').trim()
    if (!title) return setError('Give your lesson a title.')
    setBusy(true)
    setError('')

    try { // saves the lesson and navigates to the correct page
      await saveLesson(id, roadmapId, title, blocks)
      navigate(roadmapId ? `/my-path/${roadmapId}/lesson/${id}` : `/lesson/${id}`)
    } catch {
      setError('Could not save your lesson. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1>{lesson ? 'Edit lesson' : 'Add a lesson'}</h1>
      <form onSubmit={submit}>
        <fieldset className="grid min-w-0 gap-3 m-0 mb-4 border-0 p-0 [&_input]:min-w-0 [&_input]:p-3 [&_input]:[font:inherit] [&_textarea]:min-w-0 [&_textarea]:p-3 [&_textarea]:[font:inherit]" disabled={busy}>
          <label htmlFor="lesson-title">Title</label>
          <input id="lesson-title" name="title" defaultValue={lesson?.title ?? ''} maxLength={200} required />
          <BlockEditor blocks={blocks} onChange={setBlocks} readOnly={busy} />
          <button className="min-w-0 p-3 [font:inherit] cursor-pointer disabled:cursor-wait" type="submit">{busy ? 'Saving...' : 'Save lesson'}</button>
        </fieldset>
      </form>
      {error && <p className="text-[#9e2020]" role="alert">{error}</p>}
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to={roadmapId ? `/my-path/${roadmapId}` : '/browse-lessons'}>{roadmapId ? 'Back to path' : 'Back to lessons'}</Link>
    </>
  )
}
