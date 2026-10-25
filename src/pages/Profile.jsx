import { Link } from 'react-router-dom'
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
      <button type="button" onClick={signOut} disabled={busy}>{busy ? 'Signing out...' : 'Sign out'}</button>
      {error && <p role="alert">{error}</p>}
      <Link to="/profile/projects">My projects</Link>
      <Link to="/profile/projects/public">Browse public projects</Link>
      <Link to="/">Back to welcome</Link>
    </>
  )
}

