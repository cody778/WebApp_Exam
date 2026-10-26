import { Link } from 'react-router-dom'
import { listRoadmaps } from './data.js'
import useUserData from './useUserData.js'
import DataState from './DataState.jsx'

export default function RoadmapList() { // returns a list of roadmaps with links to each roadmap
  const { data, error, loading } = useUserData(listRoadmaps) // load roadmaps data

  if (loading || error) return <DataState loading={loading} error={error} /> 
  if (!data.length) return <p>No roadmaps yet. Create one to get started.</p>

    return (
        <ul>
            {data.map(roadmap => {
                const total = roadmap.lessons.length
        const completed = roadmap.lessons.filter(lesson => lesson.completed).length
        return (
          <li key={roadmap.id}>
            <Link to={`/my-roadmap/${roadmap.id}`}>{roadmap.title}</Link>
            <p>{roadmap.description}</p>
            <p>{completed} of {total} lessons completed</p>
            <progress aria-label={`${roadmap.title} progress`} value={completed} max={total || 1} />
          </li>
        )
        })}
        </ul>
    )
}

