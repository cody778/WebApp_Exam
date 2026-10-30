import { Link } from 'react-router'

/**
 * Promo for community roadmaps. Opens the public explore screen.
 */
export default function ExplorePathsCard() {
  return (
    <Link
      to="/explore"
      className="relative !m-0 !flex w-full cursor-pointer flex-col items-start gap-4 !rounded-2xl !border-0 bg-accent !p-4 text-left text-inherit shadow-raised no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:gap-5 lg:!p-10"
    >
      <span className="absolute top-4 right-4 text-on-brand lg:top-10 lg:right-10" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="block">
          <circle cx="16" cy="16" r="15.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M10 16h12M17 11l5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {/* The forced line break only suits the narrow mobile card. Desktop keeps the title on one line. */}
      <h2 className="m-0 pr-12 text-h3 text-on-brand lg:text-[2rem]">
        Explore paths from the{' '}
        <br className="lg:hidden" />
        community
      </h2>
      <p className="m-0 max-w-xl text-body text-accent-muted">
        Start learning right ready-to-follow paths created by Pathify’s amazing community.
      </p>
    </Link>
  )
}
