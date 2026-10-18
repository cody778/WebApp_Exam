import { Link } from 'react-router-dom'

export default function Profile() {
  return (
    <>
      <h1>Profile.jsx</h1>
      <Link to="/profile/projects">My projects</Link>
      <Link to="/profile/projects/public">Browse public projects</Link>
      <Link to="/">Back to welcome</Link>
    </>
  )
}
