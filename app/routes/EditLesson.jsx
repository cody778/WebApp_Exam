import { useState } from 'react'
import { Link, useParams } from 'react-router'
import BlockEditor from '../components/BlockEditor.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { getLesson, setLessonCompleted } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'

export default function Lesson() { // displays a lesson with optional roadmapId and allows the user to mark it as completed 
  const { user } = useAuth()
  const { lessonId, roadmapId } = useParams()
  const { data, loading, error, reload } = useUserData(getLesson, lessonId)
  const [busy, setBusy] = useState(false) // state to track if the toggleCompleted function is busy
  const [message, setMessage] = useState('')

  async function toggleCompleted() { //to toggle the completed status of the lesson
    if (busy) return
    setBusy(true)
    setMessage('')
    try { // try to set the lesson as completed or not completed
      await setLessonCompleted(user.id, data.id, !data.completed)
      reload()
    } catch {
      setMessage('Could not save your progress. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (loading || error) return <DataState loading={loading} error={error} /> 
  if (roadmapId && !data.roadmap_lessons.some(link => link.roadmap_id === roadmapId)) return <p role="alert">This lesson is not in this roadmap.</p>

  return (
    <>
      <h1>{data.title}</h1>
      <p>{data.completed ? 'Completed' : 'To do'}</p>
      <BlockEditor blocks={data.blocks} readOnly />
      <button type="button" disabled={busy} onClick={toggleCompleted}>{busy ? 'Saving...' : data.completed ? 'Mark as incomplete' : 'Mark as completed'}</button>
      {message && <p role="alert">{message}</p>}
      {data.owner_id === user.id && <Link to={`/edit-lesson/${data.id}${roadmapId ? `?roadmap=${roadmapId}` : ''}`}>Edit lesson</Link>}
      <Link to={roadmapId ? `/my-roadmap/${roadmapId}` : '/browse-lessons'}>{roadmapId ? 'Back to roadmap' : 'Back to lessons'}</Link>
    </>
  )
}
