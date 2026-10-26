import { Link } from 'react-router-dom'

export default function MySkills() {
  return (
    <>
      <h1>My skills</h1>
      <Link to="/my-roadmap">View my roadmaps</Link>
      <Link to="/browse-lessons">View my lessons</Link>
    </>
  )
}
