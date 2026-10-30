import { Link } from 'react-router'

export default function Introduction() {
  return (
    <>
      <h1>Introduction.jsx</h1>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/">Back</Link>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/get-started">Continue</Link>
    </>
  )
}

