import { Link } from 'react-router'
import Button from '../../components/Button.jsx'
import Logo from '../../components/Logo.jsx'
import heroDrawing from '../../assets/landing/hero-drawing.svg'

/** Opening pitch: logo, headline, illustration, and the account actions. */
export default function HeroSection() {
  return (
    <section className="flex w-full flex-col items-center gap-16 py-16">
      <Logo />
      <div className="flex w-full max-w-90 flex-col items-center gap-6 text-center">
        <h1 className="m-0 text-5xl leading-heading font-normal tracking-heading text-ink">
          <span className="block">Turn scatter into</span>
          <span className="block"><span className="font-bold">learning paths</span><span>.</span></span>
        </h1>
        <p className="m-0 w-full px-1 text-sm leading-body text-black">
          Stop getting lost in open tabs, saved videos, and bookmarks, start learning now.
        </p>
      </div>
      <img
        src={heroDrawing}
        alt=""
        width="361.649"
        height="179.603"
        className="h-auto w-full max-w-90"
      />
      <div className="flex w-full max-w-90 flex-col items-center gap-2">
        {/* New visitors create an account. Returning visitors use the sign-in line below. */}
        <Button to="/sign-up" className="w-full">
          Start your path
        </Button>
        <p className="m-0 text-center text-base leading-body text-ink">
          Already have an account?{' '}
          <Link to="/sign-in" className="m-0 inline border-0 p-0 text-ink underline">
            Sign In.
          </Link>
        </p>
      </div>
    </section>
  )
}
