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
      <Link to="/edit-lesson">Add a lesson</Link>
      {data?.length === 0 && <p>No lessons yet. Add your first one.</p>}
      <ul>
        {data?.map(lesson => (
          <li key={lesson.id}>
            <Link to={`/lesson/${lesson.id}`}>{lesson.title}</Link>
            {lesson.completed ? 'Completed' : 'To do'}
          </li>
        ))}
      </ul>
      <Link to="/my-roadmap">My roadmaps</Link>
    </>
  )
}
