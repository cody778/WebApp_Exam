import { Link } from 'react-router'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'

export default function GetStarted() {
  const { user } = useAuth()
  const signedIn = Boolean(user) || !supabase

  return (
    <>
      <h1>GetStarted.jsx</h1>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/introduction">Back</Link>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/sign-up">Sign up</Link>
      {signedIn ? null : (
        <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/sign-in">Sign in</Link>
      )}
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/browse-roadmaps">Browse roadmaps</Link>
    </>
  )
}

