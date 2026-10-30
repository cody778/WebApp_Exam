import { Link } from 'react-router'

export default function LessonTimeline({ roadmapId, lessons }) {
  const completed = lessons.filter(lesson => lesson.completed).length

  return (
    <section>
      <h2>Lessons</h2>
      <p>{completed} of {lessons.length} lessons completed</p>
      <progress aria-label="Path progress" value={completed} max={lessons.length || 1} />
      {!lessons.length && <p>No lessons linked yet.</p>}
      <ol>
        {lessons.map(lesson => (
          <li key={lesson.id}>
            {lesson.unavailable ? 'Lesson unavailable' : <>
              <Link className="m-0 text-sm font-medium text-ink no-underline hover:text-accent" to={`/my-path/${roadmapId}/lesson/${lesson.id}`}>{lesson.title}</Link>
              {lesson.completed ? 'Completed' : 'To do'}
            </>}
          </li>
        ))}
      </ol>
    </section>
  )
}
