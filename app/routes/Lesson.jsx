import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import BlockEditor from '../components/BlockEditor.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { getLesson, setLessonCompleted } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'
import { isUnavailableItem } from '../user/dataErrors.js'

export default function Lesson() { // displays lesson and allows user to mark as completed
  const { user } = useAuth()
  const { lessonId, roadmapId } = useParams()
  const { data, loading, error, reload } = useUserData(getLesson, lessonId)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function toggleCompleted() { // toggle for completed status 
    if (busy) return
    setBusy(true)
    setMessage('')
    try {
      await setLessonCompleted(user.id, data.id, !data.completed)
      reload()
    } catch {
      setMessage('Could not save your progress. Please try again.') // error handling
    } finally {
      setBusy(false)
    }
  }

  if (isUnavailableItem(error)) return <Navigate to="/404" replace />
  if (loading || error) return <DataState loading={loading} error={error} /> // shows loading or error state
  if (roadmapId && !data.roadmap_lessons.some(link => link.roadmap_id === roadmapId)) return <Navigate to="/404" replace /> // checks if lesson is part of the roadmap

  return (
    <>
      <h1>{data.title}</h1>
      <p>{data.completed ? 'Completed' : 'To do'}</p>
      <BlockEditor blocks={data.blocks} readOnly />
      <button className="min-w-0 p-3 [font:inherit] cursor-pointer disabled:cursor-wait" type="button" disabled={busy} onClick={toggleCompleted}>{busy ? 'Saving...' : data.completed ? 'Mark as incomplete' : 'Mark as completed'}</button>
      {message && <p className="text-[#9e2020]" role="alert">{message}</p>}
      {data.owner_id === user.id && <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to={`/edit-lesson/${data.id}${roadmapId ? `?path=${roadmapId}` : ''}`}>Edit lesson</Link>}
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to={roadmapId ? `/my-path/${roadmapId}` : '/browse-lessons'}>{roadmapId ? 'Back to path' : 'Back to lessons'}</Link>
    </>
  )
}
