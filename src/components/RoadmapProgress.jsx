import { Link } from 'react-router-dom'

export default function RoadmapProgress() {
  return (
    <section>
      <h2>Your progress</h2>
      <p>You have just completed <strong>Lesson 3</strong>!</p>
      <progress aria-label="Roadmap progress" value={3} max={7} />
      <Link to="/my-roadmap">Keep going</Link>
    </section>
  )
}
