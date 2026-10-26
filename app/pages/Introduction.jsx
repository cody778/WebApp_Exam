import { Link } from 'react-router'

export default function Introduction() {
  return (
    <>
      <h1>Introduction.jsx</h1>
      <Link to="/">Back</Link>
      <Link to="/get-started">Continue</Link>
    </>
  )
}

