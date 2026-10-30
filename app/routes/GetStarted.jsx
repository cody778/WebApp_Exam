import { Link } from 'react-router'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'

export default function GetStarted() {
  const { user } = useAuth()
  const signedIn = Boolean(user) || !supabase

  return (
    <section className="flex flex-col gap-6 font-sans text-ink">
      <div className="space-y-2">
        <p className="m-0 text-sm text-quiet">Getting started</p>
        <h1 className="m-0 text-page-title">Choose where to begin</h1>
        <p className="m-0 leading-body text-quiet">Create an account to save your progress, or look through the available paths first.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
      <Link className="m-0 inline-flex h-11 items-center justify-center rounded-lg border border-accent-muted bg-white px-5 text-sm text-ink no-underline" to="/introduction">Back</Link>
      <Link className="m-0 inline-flex h-11 items-center justify-center rounded-lg border-0 bg-brand px-5 text-sm text-on-brand no-underline" to="/sign-up">Sign up</Link>
      {signedIn ? null : (
        <Link className="m-0 inline-flex h-11 items-center justify-center rounded-lg border border-accent-muted bg-white px-5 text-sm text-ink no-underline" to="/sign-in">Sign in</Link>
      )}
      <Link className="m-0 inline-flex h-11 items-center justify-center rounded-lg border border-accent bg-transparent px-5 text-sm text-accent no-underline" to="/browse-paths">Browse paths</Link>
      </div>
    </section>
  )
}

