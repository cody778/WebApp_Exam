import { Link } from 'react-router'
import { listLessons } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'

export default function BrowseLessons() {
  const { data, loading, error } = useUserData(listLessons)
  return (
    <section className="flex flex-col gap-6 py-6 font-sans text-ink">
      <div>
        <h1 className="m-0 text-page-title">My lessons</h1>
        <p className="mt-2 mb-0 text-quiet">Open a lesson or return to your paths.</p>
      </div>
      <DataState loading={loading} error={error} />
      {data?.length === 0 && <p className="m-0 rounded-lg border border-accent-muted bg-white p-4 text-quiet">No lessons yet.</p>}
      <ul className="m-0 grid list-none gap-3 p-0">
        {data?.map(lesson => (
          <li className="flex items-center justify-between gap-4 rounded-lg border border-accent-muted bg-white p-4" key={lesson.id}>
            <Link className="m-0 min-w-0 font-medium text-ink no-underline hover:text-accent" to={`/lesson/${lesson.id}`}>{lesson.title}</Link>
            <span className="shrink-0 text-sm text-quiet">{lesson.completed ? 'Completed' : 'To do'}</span>
          </li>
        ))}
      </ul>
      <Link className="m-0 inline-flex h-11 w-fit items-center justify-center rounded-lg border border-accent bg-white px-5 text-sm text-accent no-underline" to="/my-path">Back to my paths</Link>
    </section>
  )
}
