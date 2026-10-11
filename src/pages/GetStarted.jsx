import { Link } from 'react-router-dom'

export default function GetStarted() {
  return (
    <>
      <h1>GetStarted.jsx</h1>
      <Link to="/sign-up">Sign up</Link>
      <Link to="/sign-in">Sign in</Link>
      <Link to="/browse-roadmaps">Browse roadmaps</Link>
    </>
  )
}

