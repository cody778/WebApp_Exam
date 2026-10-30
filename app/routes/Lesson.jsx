import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import BlockEditor from '../components/BlockEditor.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { getLesson, setLessonCompleted } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'
import { isUnavailableItem } from '../user/dataErrors.js'

export default function Lesson() {
  const { user } = useAuth()
  const { lessonId, roadmapId } = useParams()
  const { data, loading, error, reload } = useUserData(getLesson, lessonId)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function toggleCompleted() {
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      await setLessonCompleted(user.id, data.id, !data.completed)
      reload()
    } catch {
      setMessage('Could not save your progress. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (isUnavailableItem(error)) return <Navigate to="/404" replace />
  if (loading || error) return <DataState loading={loading} error={error} />
  // Reject lesson URLs that do not belong to the path in the address.
  if (roadmapId && !data.roadmap_lessons.some(link => link.roadmap_id === roadmapId)) return <Navigate to="/404" replace />

  return (
    <section className="flex flex-col gap-6 py-6 font-sans text-ink">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="m-0 text-sm text-quiet">Lesson</p>
          <h1 className="mt-1 mb-0 text-page-title">{data.title}</h1>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs ${data.completed ? 'bg-accent text-on-brand' : 'bg-accent-muted text-ink'}`}>{data.completed ? 'Completed' : 'To do'}</span>
      </div>
      <BlockEditor blocks={data.blocks} readOnly />
      <button className="m-0 h-11 min-w-0 cursor-pointer rounded-lg border-0 bg-brand px-5 py-0 text-sm text-on-brand disabled:cursor-wait disabled:opacity-60" type="button" disabled={busy} onClick={toggleCompleted}>{busy ? 'Saving...' : data.completed ? 'Mark as incomplete' : 'Mark as completed'}</button>
      {message && <p className="m-0 rounded-lg border border-[#9e2020]/25 bg-[#9e2020]/5 p-3 text-sm text-[#9e2020]" role="alert">{message}</p>}
      <div className="flex flex-col gap-3 sm:flex-row">
        {data.owner_id === user.id && <Link className="m-0 inline-flex h-11 items-center justify-center rounded-lg border border-accent bg-white px-5 text-sm text-accent no-underline" to={`/edit-lesson/${data.id}${roadmapId ? `?path=${roadmapId}` : ''}`}>Edit lesson</Link>}
        <Link className="m-0 inline-flex h-11 items-center justify-center rounded-lg border border-accent-muted bg-white px-5 text-sm text-ink no-underline" to={roadmapId ? `/my-path/${roadmapId}` : '/browse-lessons'}>{roadmapId ? 'Back to path' : 'Back to lessons'}</Link>
      </div>
    </section>
  )
}
