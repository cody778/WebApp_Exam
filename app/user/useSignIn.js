import { useState } from 'react'
import { rememberKey, supabase } from './client.js'

/**
 * Signs in with email and password, and can email a reset link to that same address.
 */
export default function useSignIn() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [resetSentTo, setResetSentTo] = useState('')

  async function signIn({ email, password, keepLoggedIn }) {
    if (busy || !supabase) return
    setBusy(true)
    setError('')
    setResetSentTo('')
    // The storage adapter reads this when it saves the new session.
    window.localStorage.setItem(rememberKey, keepLoggedIn ? '1' : '0')

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
    } catch (signInError) {
      setError(signInError.message || 'Could not sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function sendReset(email) {
    if (busy || !supabase) return
    if (!email) {
      setError('Enter your email so we can send a reset link.')
      return
    }

    setBusy(true)
    setError('')
    setResetSentTo('')

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/sign-in`,
      })
      if (resetError) throw resetError
      setResetSentTo(email)
    } catch (resetError) {
      setError(resetError.message || 'Could not send a reset email. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, resetSentTo, signIn, sendReset, configured: Boolean(supabase) }
}
