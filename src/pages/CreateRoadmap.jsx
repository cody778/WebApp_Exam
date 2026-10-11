import { Link } from 'react-router-dom'

export default function CreateRoadmap() {
  return (
    <>
      <h1>CreateRoadmap.jsx</h1>
      <Link to="/edit-lesson">Edit lesson</Link>
      <Link to="/browse-lessons">Browse lessons</Link>
    </>
  )
}
