import { Link, Navigate, useLocation } from 'react-router'
import lockIcon from '../assets/sign-in/lock.svg'
import Logo from '../components/Logo.jsx'
import RememberMe from '../components/RememberMe.jsx'
import SubmitButton from '../components/SubmitButton.jsx'
import TextField from '../components/TextField.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import useSignIn from '../user/useSignIn.js'

/** Returning-user screen: email, password, and a choice to keep the session. */
export default function SignIn() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { busy, error, resetSentTo, signIn, sendReset, configured } = useSignIn()
  // Return to the page that asked for sign-in. Only same-site paths are accepted, so a crafted link cannot send people elsewhere.
  const from = location.state?.from
  const destination = typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/home'

  function submit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    signIn({
      email: String(form.get('email') || '').trim(),
      password: String(form.get('password') || ''),
      keepLoggedIn: form.get('remember') === 'on',
    })
  }

  function forgot(event) {
    const email = String(new FormData(event.currentTarget.form).get('email') || '').trim()
    sendReset(email)
  }

  if (loading) return <p role="status">Loading your account...</p>
  if (user) return <Navigate to={destination} replace />

  return (
    <div className="sign-in-page box-border [&_*]:box-border mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-12 font-sans text-ink">
      <div className="flex w-full flex-col items-center gap-8">
        {/* The logo leads home. The ! classes beat the old global link frame, so the logo never shows a border. */}
        <Link to="/" aria-label="Pathify home" className="!m-0 !inline-flex !border-0 !bg-transparent !p-0 !text-inherit !no-underline">
          <Logo />
        </Link>
        <h1 className="m-0 text-center text-welcome text-ink">Welcome back.</h1>
        {resetSentTo && (
          <p role="status" className="m-0 w-full rounded-lg border border-accent bg-white px-4 py-3 text-center font-sans text-sm leading-body font-normal text-ink">
            We sent a password reset email to <span className="font-semibold">{resetSentTo}</span>.
          </p>
        )}
        {!configured && <p role="alert" className="text-[#9e2020] m-0 text-center text-sm leading-body">Sign in is not configured yet.</p>}
        <form className="flex w-full flex-col gap-4 rounded-lg border border-accent-muted bg-white p-6" onSubmit={submit}>
          <fieldset className="m-0 flex flex-col gap-4 border-0 p-0" disabled={busy || !configured}>
            <TextField id="email" name="email" label="Email" type="email" autoComplete="email" required />
            <TextField
              id="password"
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              icon={<img src={lockIcon} alt="" width="20" height="20" className="block max-w-none shrink-0" />}
            />
            <RememberMe />
            <SubmitButton busy={busy}>{busy ? 'Please wait...' : 'Sign In'}</SubmitButton>
            <button
              type="button"
              onClick={forgot}
              className="min-w-0 disabled:cursor-wait m-0 w-fit cursor-pointer border-0 bg-transparent p-0 text-left font-sans text-base leading-body font-normal text-ink underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Forgot password?
            </button>
          </fieldset>
        </form>
        {error && (
          <p role="alert" className="text-[#9e2020] m-0 text-center text-sm leading-body">
            {error}
          </p>
        )}
        <p className="m-0 text-center font-sans text-sm leading-body font-normal text-quiet">
          Don&apos;t have an account yet?{' '}
          <Link
            to="/sign-up"
            state={location.state}
            className="m-0 inline rounded border-0 p-0 text-sm leading-body font-normal text-accent underline"
          >
            Register here.
          </Link>
        </p>
      </div>
    </div>
  )
}
