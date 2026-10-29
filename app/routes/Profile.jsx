import { Link } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'

export default function Profile() { //Placeholder
  const { user } = useAuth()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function signOut() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' }) // Sign out from local session only
      if (error) throw error
    } catch {
      setError('Could not sign out. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h1>Profile</h1>
      <p>{user.email}</p>
      <button className="min-w-0 p-3 [font:inherit] cursor-pointer disabled:cursor-wait" type="button" onClick={signOut} disabled={busy}>{busy ? 'Signing out...' : 'Sign out'}</button>
      {error && <p className="text-[#9e2020]" role="alert">{error}</p>}
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/profile/projects">My projects</Link>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/profile/projects/public">Browse public projects</Link>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/">Back to welcome</Link>
    </>
  )
}

