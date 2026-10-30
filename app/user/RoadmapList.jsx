import { Link } from 'react-router'
import { listRoadmaps } from './data.js'
import useUserData from './useUserData.js'
import DataState from './DataState.jsx'

export default function RoadmapList({ load = listRoadmaps, empty = 'No paths yet. Create one to get started.' }) {
  const { data, error, loading } = useUserData(load)

  if (loading || error) return <DataState loading={loading} error={error} /> 
  if (!data.length) return <p className="m-0 rounded-lg border border-accent-muted bg-white p-4 text-quiet">{empty}</p>

    return (
        <ul className="m-0 grid list-none gap-4 p-0">
            {data.map(roadmap => {
                const total = roadmap.lessons.length
        const completed = roadmap.lessons.filter(lesson => lesson.completed).length
        return (
          <li className="rounded-lg border border-accent-muted bg-white p-4 font-sans text-ink [overflow-wrap:anywhere]" key={roadmap.id}>
            <Link className="m-0 text-lg font-semibold text-ink no-underline hover:text-accent" to={`/my-path/${roadmap.id}`}>{roadmap.title}</Link>
            <p className="my-2 text-sm leading-body text-quiet">{roadmap.description}</p>
            <div className="flex items-center gap-3">
              <progress className="h-2 min-w-0 flex-1 accent-accent" aria-label={`${roadmap.title} progress`} value={completed} max={total || 1} />
              <span className="shrink-0 text-xs text-quiet">{completed} of {total} lessons</span>
            </div>
          </li>
        )
        })}
        </ul>
    )
}

