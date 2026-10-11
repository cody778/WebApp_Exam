import { Link } from 'react-router-dom'

export default function Welcome() {
  return (
    <>
      <h1>Welcome.jsx</h1>
      <Link to="/introduction">Continue</Link>
    </>
  )
}

