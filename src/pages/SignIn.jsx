import { Link } from 'react-router-dom'

export default function SignIn() {
  return (
    <>
      <h1>SignIn.jsx</h1>
      <Link to="/home">Go to home</Link>
      <Link to="/sign-up">Sign up</Link>
      <Link to="/get-started">Back</Link>
    </>
  )
}
