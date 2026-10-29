import { Link } from 'react-router'

export default function MySkills() {
  return (
    <>
      <h1>My skills</h1>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/my-roadmap">View my roadmaps</Link>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/browse-lessons">View my lessons</Link>
    </>
  )
}
