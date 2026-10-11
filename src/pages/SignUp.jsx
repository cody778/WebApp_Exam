import { Link } from 'react-router-dom'

export default function SignUp() {
  return (
    <>
      <h1>SignUp.jsx</h1>
      <Link to="/home">Go to home</Link>
      <Link to="/sign-in">Sign in</Link>
      <Link to="/get-started">Back</Link>
    </>
  )
}
