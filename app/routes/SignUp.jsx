import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import Logo from '../components/Logo.jsx'
import SubmitButton from '../components/SubmitButton.jsx'
import TextField from '../components/TextField.jsx'
import VerifyEmailNotice from '../components/VerifyEmailNotice.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import useSignUp from '../user/useSignUp.js'

/** Create-account screen: collects a new profile and asks the user to confirm their email. */
export default function SignUp() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { busy, error, sentTo, register, configured } = useSignUp()
  const [mismatch, setMismatch] = useState('')
  const from = location.state?.from
  const destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/home'
  const alertMessage = mismatch || error

  function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const fullName = String(form.get('fullName') || '').trim()
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '')
    const repeatPassword = String(form.get('repeatPassword') || '')

    if (password !== repeatPassword) {
      setMismatch('Passwords do not match.')
      return
    }

    setMismatch('')
    register({ fullName, email, password })
  }

  if (loading) return <p role="status">Loading your account...</p>
  if (user) return <Navigate to={destination} replace />

  return (
    <div className="register-page box-border [&_*]:box-border mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-12 font-sans text-ink">
      <div className="flex w-full flex-col items-center gap-8">
        <Link to="/" className="m-0 inline-flex border-0 p-0 no-underline">
          <Logo />
        </Link>
        <h1 className="m-0 text-center text-page-title text-ink">Start your path.</h1>
        {sentTo && <VerifyEmailNotice email={sentTo} />}
        {!configured && <p role="alert" className="text-[#9e2020] m-0 text-center text-sm leading-body">Sign in is not configured yet.</p>}
        <form
          className="flex w-full flex-col gap-4 rounded-lg border border-accent-muted bg-white p-6"
          onSubmit={submit}
        >
          <fieldset className="m-0 flex flex-col gap-4 border-0 p-0" disabled={busy || !configured}>
            <TextField id="full-name" name="fullName" label="Full name" autoComplete="name" required />
            <TextField id="email" name="email" label="Email" type="email" autoComplete="email" required />
            <TextField
              id="password"
              name="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <TextField
              id="repeat-password"
              name="repeatPassword"
              label="Repeat password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <SubmitButton busy={busy}>{busy ? 'Please wait...' : 'Register'}</SubmitButton>
          </fieldset>
        </form>
        {alertMessage && (
          <p role="alert" className="text-[#9e2020] m-0 text-center text-sm leading-body">
            {alertMessage}
          </p>
        )}
        <p className="m-0 text-center font-sans text-sm leading-body font-normal text-quiet">
          Already have an account?{' '}
          <Link
            to="/sign-in"
            state={location.state}
            className="m-0 inline border-0 p-0 text-sm leading-body font-normal text-accent underline"
          >
            Sign In.
          </Link>
        </p>
      </div>
    </div>
  )
}
