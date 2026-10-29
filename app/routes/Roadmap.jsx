import { Link, useParams } from 'react-router'
import LessonTimeline from '../components/LessonTimeline.jsx'
import { getRoadmap } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'
import RoadmapLessons from '../user/RoadmapLessons.jsx'
import { useAuth } from '../user/AuthProvider.jsx'

export default function Roadmap() { // displays a specific roadmap and its lessons
  const { user } = useAuth()
  const { roadmapId } = useParams()
  const { data, loading, error, reload } = useUserData(getRoadmap, roadmapId)

  if (loading || error) return <DataState loading={loading} error={error} /> 

  return (
    <>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <LessonTimeline roadmapId={data.id} lessons={data.lessons} />
      {data.owner_id === user.id && <>
        <RoadmapLessons roadmap={data} onLinked={reload} />
        <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to={`/edit-lesson?roadmap=${data.id}`}>Add a lesson</Link>
      </>}
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to={data.owner_id === user.id ? '/my-roadmap' : '/browse-roadmaps'}>Back to roadmaps</Link>
    </>
  )
}
