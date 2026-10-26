import { Link } from 'react-router-dom'

export default function Introduction() {
  return (
    <>
      <h1>Introduction.jsx</h1>
      <Link to="/">Back</Link>
      <Link to="/get-started">Continue</Link>
    </>
  )
}

