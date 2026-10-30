import { Link } from 'react-router'
import { listRoadmaps } from './data.js'
import useUserData from './useUserData.js'
import DataState from './DataState.jsx'

export default function RoadmapList({ load = listRoadmaps, empty = 'No paths yet. Create one to get started.' }) {
  const { data, error, loading } = useUserData(load)

  if (loading || error) return <DataState loading={loading} error={error} /> 
  if (!data.length) return <p>{empty}</p>

    return (
        <ul className="grid gap-4 p-0 list-none">
            {data.map(roadmap => {
                const total = roadmap.lessons.length
        const completed = roadmap.lessons.filter(lesson => lesson.completed).length
        return (
          <li className="rounded-lg border border-[#ddd] bg-white p-4 [overflow-wrap:anywhere]" key={roadmap.id}>
            <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to={`/my-path/${roadmap.id}`}>{roadmap.title}</Link>
            <p>{roadmap.description}</p>
            <p>{completed} of {total} lessons completed</p>
            <progress aria-label={`${roadmap.title} progress`} value={completed} max={total || 1} />
          </li>
        )
        })}
        </ul>
    )
}

