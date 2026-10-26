import { Link, useParams } from 'react-router'
import LessonTimeline from '../components/LessonTimeline.jsx'
import { getRoadmap } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'

export default function Roadmap() { // displays a specific roadmap and its lessons
  const { roadmapId } = useParams()
  const { data, loading, error } = useUserData(getRoadmap, roadmapId) // get the roadmap data using the custom hook

  if (loading || error) return <DataState loading={loading} error={error} /> 

  return (
    <>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <LessonTimeline roadmapId={data.id} lessons={data.lessons} />
      <Link to={`/edit-lesson?roadmap=${data.id}`}>Add a lesson</Link>
      <Link to="/my-roadmap">Back to roadmaps</Link>
    </>
  )
}
