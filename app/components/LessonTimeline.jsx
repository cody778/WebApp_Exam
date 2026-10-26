import { Link } from 'react-router-dom'

export default function LessonTimeline({ roadmapId, lessons }) { 
  const completed = lessons.filter(lesson => lesson.completed).length 

  return (
    <section>
      <h2>Lessons</h2>
      <p>{completed} of {lessons.length} lessons completed</p>
      <progress aria-label="Roadmap progress" value={completed} max={lessons.length || 1} /> 
      {!lessons.length && <p>Add your first lesson below.</p>} 
      <ol>
        {lessons.map(lesson => (
          <li key={lesson.id}>
            {lesson.unavailable ? 'Lesson unavailable' : <>
              <Link to={`/my-roadmap/${roadmapId}/lesson/${lesson.id}`}>{lesson.title}</Link> 
              {lesson.completed ? 'Completed' : 'To do'}
            </>}
          </li>
        ))}
      </ol>
    </section>
  )
}
