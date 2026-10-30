import { Navigate, useParams, useSearchParams } from 'react-router'
import LessonForm from '../user/LessonForm.jsx'
import { getOwnedLesson } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'
import { isUnavailableItem } from '../user/dataErrors.js'

function ExistingLesson({ lessonId, roadmapId }) {
  const { data, loading, error } = useUserData(getOwnedLesson, lessonId)

  if (isUnavailableItem(error)) return <Navigate to="/404" replace />
  if (loading || error) return <DataState loading={loading} error={error} />

  return <LessonForm key={data.id} lesson={data} roadmapId={roadmapId} />
}

export default function EditLesson() {
  const { lessonId } = useParams()
  const [searchParams] = useSearchParams()
  const roadmapId = (searchParams.get('path') || searchParams.get('roadmap')) || undefined

  return lessonId
    ? <ExistingLesson lessonId={lessonId} roadmapId={roadmapId} />
    : <LessonForm roadmapId={roadmapId} />
}
