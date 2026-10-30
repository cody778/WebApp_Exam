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
  if (!available.length) return <p className="m-0 text-sm text-quiet">No other lessons to link yet.</p>

  return (
    <form className="rounded-lg border border-accent-muted bg-white p-4 font-sans text-ink" onSubmit={submit}>
      <fieldset className="m-0 grid min-w-0 gap-3 border-0 p-0" disabled={busy}>
        <label className="text-sm font-medium" htmlFor="roadmap-lesson">Add an existing lesson</label>
        <select className="min-w-0 rounded-lg border border-accent-muted bg-white p-3 outline-none focus:border-accent" id="roadmap-lesson" name="lesson" required defaultValue="">
          <option value="" disabled>Choose a lesson</option>
          {available.map(lesson => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}
        </select>
        <button className="m-0 h-11 min-w-0 cursor-pointer rounded-lg border-0 bg-brand px-5 py-0 text-sm text-on-brand disabled:cursor-wait disabled:opacity-60" type="submit">{busy ? 'Adding...' : 'Add to path'}</button>
      </fieldset>
      {message && <p className="mt-3 mb-0 text-sm text-[#9e2020]" role="alert">{message}</p>}
    </form>
  )
}
