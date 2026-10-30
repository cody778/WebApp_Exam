import { Link } from 'react-router'
import Logo from '../components/Logo.jsx'

const actionClass =
  '!m-0 !flex h-10 w-full items-center justify-center !rounded-2xl !border px-4 py-0 text-button !no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export function meta() {
  return [{ title: 'Page not found | Pathify' }]
}

export default function NotFound() {
  return (
    <div className="landing-page box-border [&_*]:box-border mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-4 pb-10 font-sans text-ink">
      <header>
        <Link
          to="/"
          aria-label="Pathify home"
          className="!m-0 inline-flex !border-0 !bg-transparent !p-0 no-underline"
        >
          <Logo variant="header" />
        </Link>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="w-full rounded-3xl border border-accent-muted bg-white/80 px-6 py-10">
          <p className="m-0 font-logo text-[4.5rem] leading-none font-bold text-accent" aria-hidden="true">
            404
          </p>
          <h1 className="mt-5 mb-0 font-display text-3xl leading-heading font-medium tracking-heading">
            This path ends here
          </h1>
          <p className="mx-auto mt-4 mb-0 max-w-xs text-base leading-body text-quiet">
            We couldn&apos;t find the page you were looking for. It may have moved, or the link might be outdated.
          </p>

          <div className="mx-auto mt-8 grid w-full max-w-xs grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to="/"
              className={`${actionClass} !border-accent !bg-accent !text-on-brand hover:!bg-brand`}
            >
              Back home
            </Link>
            <Link
              to="/explore"
              className={`${actionClass} !border-brand !bg-transparent !text-ink hover:!bg-accent-muted`}
            >
              Explore paths
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
