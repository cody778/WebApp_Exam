import { useState } from 'react'
import { useAuth } from './AuthProvider.jsx'
import { linkLesson, listLessons } from './data.js'
import useUserData from './useUserData.js'
import DataState from './DataState.jsx'

export default function RoadmapLessons({ roadmap, onLinked }) {
  const { user } = useAuth()
  const { data, loading, error } = useUserData(listLessons)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const available = data?.filter(lesson => !roadmap.lessons.some(link => link.id === lesson.id)) ?? []

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const lessonId = new FormData(event.currentTarget).get('lesson')
    if (!lessonId) return
    setBusy(true)
    setMessage('')
    try {
      await linkLesson(user.id, roadmap.id, lessonId)
      onLinked()
    } catch {
      setMessage('Could not link this lesson. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (loading || error) return <DataState loading={loading} error={error} />
  if (!available.length) return <p>No other lessons to link yet.</p>

  return (
    <form onSubmit={submit}>
      <fieldset className="user-fields" disabled={busy}>
        <label htmlFor="roadmap-lesson">Add an existing lesson</label>
        <select id="roadmap-lesson" name="lesson" required defaultValue="">
          <option value="" disabled>Choose a lesson</option>
          {available.map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
        </select>
        <button type="submit">{busy ? 'Adding...' : 'Add to roadmap'}</button>
      </fieldset>
      {message && <p role="alert">{message}</p>}
    </form>
  )
}
