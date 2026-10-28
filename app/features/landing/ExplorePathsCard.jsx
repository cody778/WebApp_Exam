import { Link } from 'react-router'

/**
 * Promo for community roadmaps. Opens the public explore screen.
 */
export default function ExplorePathsCard() {
  return (
    <Link
      to="/explore"
      className="relative m-0 flex w-full cursor-pointer flex-col items-start gap-4 rounded-2xl border-0 bg-accent p-4 text-left shadow-raised no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span className="absolute top-4 right-4 text-on-brand" aria-hidden="true">
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
      <h2 className="m-0 pr-12 text-h3 text-on-brand">
        Explore paths from the
        <br />
        community
      </h2>
      <p className="m-0 text-body text-accent-muted">
        Start learning right ready-to-follow paths created by Pathify’s amazing community.
      </p>
    </Link>
  )
}
