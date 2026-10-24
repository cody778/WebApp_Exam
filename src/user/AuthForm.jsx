import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './client.js'
import { useAuth } from './AuthProvider.jsx'

export default function AuthForm({ signUp = false }) { // This component is used to sign in or sign up
  const { user, loading } = useAuth()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const from = location.state?.from
  const destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/home'

  async function submit(event) { // Take care of the form submission - call the supabase 
    event.preventDefault()
    if (busy || !supabase) return
    const form = new FormData(event.currentTarget)
    const credentials = { email: form.get('email').trim(), password: form.get('password') }
    setBusy(true)
    setError('')
    setMessage('')

    try { // Sign in or up options
      const { data, error } = signUp
        ? await supabase.auth.signUp({ ...credentials, options: { emailRedirectTo: `${window.location.origin}/sign-in` } })
        : await supabase.auth.signInWithPassword(credentials)
      if (error) throw error
      if (signUp && !data.session) setMessage('Check your email to confirm your account, then sign in.')
    } catch (error) {
      setError(error.message || 'Could not sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p role="status">Loading your account...</p>
  if (user) return <Navigate to={destination} replace />

  return (
    <>
      <h1>{signUp ? 'Create an account' : 'Sign in'}</h1>
      {!supabase && <p role="alert">Sign in is not configured yet.</p>}
      <form onSubmit={submit}>
        <fieldset className="user-fields" disabled={busy || !supabase}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete={signUp ? 'new-password' : 'current-password'} minLength={signUp ? 8 : undefined} required />
          <button type="submit">{busy ? 'Please wait...' : signUp ? 'Sign up' : 'Sign in'}</button>
        </fieldset>
      </form>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <Link to={signUp ? '/sign-in' : '/sign-up'} state={location.state}>{signUp ? 'Sign in' : 'Create an account'}</Link>
      <Link to="/get-started">Back</Link>
    </>
  )
}