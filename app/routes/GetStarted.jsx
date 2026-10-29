import { Link } from 'react-router'

export default function GetStarted() {
  return (
    <>
      <h1>GetStarted.jsx</h1>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/introduction">Back</Link>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/sign-up">Sign up</Link>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/sign-in">Sign in</Link>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/browse-paths">Browse paths</Link>
    </>
  )
}

