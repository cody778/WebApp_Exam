import { Link } from 'react-router'

export default function LessonTimeline({ roadmapId, lessons }) {
  const completed = lessons.filter(lesson => lesson.completed).length

  return (
    <section>
      <h2>Lessons</h2>
      <p>{completed} of {lessons.length} lessons completed</p>
      <progress aria-label="Roadmap progress" value={completed} max={lessons.length || 1} />
      {!lessons.length && <p>No lessons linked yet.</p>}
      <ol>
        {lessons.map(lesson => (
          <li key={lesson.id}>
            {lesson.unavailable ? 'Lesson unavailable' : <>
              <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to={`/my-roadmap/${roadmapId}/lesson/${lesson.id}`}>{lesson.title}</Link>
              {lesson.completed ? 'Completed' : 'To do'}
            </>}
          </li>
        ))}
      </ol>
    </section>
  )
}
