import { Link } from 'react-router'

export default function BrowseLessons() {
  return (
    <>
      <h1>BrowseLessons.jsx</h1>
      <Link to="/edit-lesson">Edit lesson</Link>
      <Link to="/create-roadmap">Back to create roadmap</Link>
    </>
  )
}
