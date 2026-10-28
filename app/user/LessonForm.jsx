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
      navigate(roadmapId ? `/my-roadmap/${roadmapId}/lesson/${id}` : `/lesson/${id}`)
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
        <fieldset className="user-fields" disabled={busy}>
          <label htmlFor="lesson-title">Title</label>
          <input id="lesson-title" name="title" defaultValue={lesson?.title ?? ''} maxLength={200} required />
          <BlockEditor blocks={blocks} onChange={setBlocks} readOnly={busy} />
          <button type="submit">{busy ? 'Saving...' : 'Save lesson'}</button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      <Link to={roadmapId ? `/my-roadmap/${roadmapId}` : '/browse-lessons'}>{roadmapId ? 'Back to roadmap' : 'Back to lessons'}</Link>
    </>
  )
}
