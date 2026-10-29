import { useParams, useSearchParams } from 'react-router'
import LessonForm from '../user/LessonForm.jsx'
import { getOwnedLesson } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'

function ExistingLesson({ lessonId, roadmapId }) {
  const { data, loading, error } = useUserData(getOwnedLesson, lessonId)

  if (loading || error) return <DataState loading={loading} error={error} />

  return <LessonForm key={data.id} lesson={data} roadmapId={roadmapId} />
}

export default function EditLesson() {
  const { lessonId } = useParams()
  const [searchParams] = useSearchParams()
  const roadmapId = searchParams.get('roadmap') || undefined

  return lessonId
    ? <ExistingLesson lessonId={lessonId} roadmapId={roadmapId} />
    : <LessonForm roadmapId={roadmapId} />
}
