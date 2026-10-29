import { useState } from 'react'
import { supabase } from './client.js'

/**
 * Creates an account and records when Supabase asks the user to confirm their email.
 */
export default function useSignUp() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sentTo, setSentTo] = useState('')

  async function register({ fullName, email, password }) {
    if (busy || !supabase) return
    setBusy(true)
    setError('')
    setSentTo('')

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/sign-in`,
          data: { full_name: fullName },
        },
      })
      if (signUpError) throw signUpError
      // A missing session means the project requires the inbox link before sign-in.
      if (!data.session) setSentTo(email)
    } catch (signUpError) {
      setError(signUpError.message || 'Could not create your account. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, sentTo, register, configured: Boolean(supabase) }
}
