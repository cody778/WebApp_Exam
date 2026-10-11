import { Link } from 'react-router-dom'

export default function Roadmap() {
  return (
    <>
      <h1>Roadmap.jsx</h1>
      <Link to="lesson">Open lesson</Link>
      <Link to="/browse-roadmaps">Back to roadmaps</Link>
    </>
  )
}
