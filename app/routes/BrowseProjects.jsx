import { Link } from 'react-router'
import { listLessons } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'

export default function BrowseLessons() { 
  const { data, loading, error } = useUserData(listLessons) // gets the user lessons from the backend

  return (
    <>
      <h1>My lessons</h1>
      <DataState loading={loading} error={error} />
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/edit-lesson">Add a lesson</Link>
      {data?.length === 0 && <p>No lessons yet. Add your first one.</p>}
      <ul>
        {data?.map(lesson => (
          <li key={lesson.id}>
            <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to={`/lesson/${lesson.id}`}>{lesson.title}</Link>
            {lesson.completed ? 'Completed' : 'To do'}
          </li>
        ))}
      </ul>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/my-path">My paths</Link>
    </>
  )
}
