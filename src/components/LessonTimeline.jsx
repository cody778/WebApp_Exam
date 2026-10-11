import { Link } from 'react-router-dom'

const lessons = [
  'Get the clay',
  'Wet it and form it',
  'Get the overall shape',
  'Make the hole in the cup',
  'Clean the edges',
  'Dry the cup',
  'Fire the cup in the kiln',
]

export default function LessonTimeline() {
  const completed = 3

  return (
    <section>
      <h3>Lessons</h3>
      <p>{completed} of {lessons.length} lessons completed</p>
      <progress aria-label="Roadmap progress" value={completed} max={lessons.length} />
      <ol>
        {lessons.map((lesson, index) => (
          <li key={lesson} aria-current={index === completed ? 'step' : undefined}>
            <Link to="lesson">
              {index === completed ? <strong>{lesson}</strong> : lesson}
              {' — '}{index < completed ? 'Completed' : index === completed ? 'Current' : 'Upcoming'}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
