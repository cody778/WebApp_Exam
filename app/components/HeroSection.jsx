import { Link } from 'react-router'
import Button from './Button.jsx'
import Logo from './Logo.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import heroDrawing from '../assets/landing/hero-drawing.svg'

/** Opening pitch: logo, headline, illustration, and the account actions. */
export default function HeroSection() {
  const { user } = useAuth()
  const signedIn = Boolean(user) || !supabase

  return (
    <section className="flex w-full flex-col items-center gap-16 py-16">
      <Logo />
      <div className="flex w-full max-w-88 flex-col items-center gap-4 text-center">
        <h1 className="m-0 text-hero-title text-ink">
          <span className="block">Turn scatter into</span>
          <span className="block text-[2.75rem]"><span className="font-bold">learning paths</span><span>.</span></span>
        </h1>
        <p className="m-0 w-full text-body text-black">
          Stop getting lost in open tabs, saved videos, and bookmarks, start learning now.
        </p>
      </div>
      <img
        src={heroDrawing}
        alt=""
        width="361.649"
        height="179.603"
        className="h-auto w-full max-w-88"
      />
      <div className="flex w-full max-w-88 flex-col items-center gap-2">
        {/* New visitors create an account. Returning visitors use the sign-in line below. */}
        <Button
          to="/sign-up"
          className="!m-0 !flex !h-10 w-full !items-center !justify-center !rounded-2xl !border-0 !bg-accent !px-4 !py-0 !text-button !text-on-brand !no-underline"
        >
          Start your path
        </Button>
        {signedIn ? null : (
          <p className="m-0 text-center text-body text-ink">
            Already have an account?{' '}
            <Link to="/sign-in" className="m-0 inline border-0 p-0 text-body text-ink underline">
              Sign In.
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
