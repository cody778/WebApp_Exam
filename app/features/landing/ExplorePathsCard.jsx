import { Link } from 'react-router'
import exploreDrawing from '../../assets/landing/explore-drawing.svg'

/**
 * Promo for community roadmaps. The browse screen is signed-in only;
 * guests are sent through sign-in and returned to it.
 */
export default function ExplorePathsCard() {
  return (
    <Link
      to="/browse-roadmaps"
      className="m-0 flex w-full flex-col items-start gap-4 rounded-2xl border-0 bg-accent px-4 pt-4 pb-8 text-left shadow-raised no-underline"
    >
      <h2 className="m-0 text-2xl leading-heading font-semibold tracking-heading text-ink">
        Explore paths from the
        <br />
        community
      </h2>
      <p className="m-0 text-base leading-body text-accent-muted">
        Start learning right ready-to-follow paths created by Pathify’s amazing community.
      </p>
      <img
        src={exploreDrawing}
        alt=""
        width="375.641"
        height="187.63"
        className="h-auto w-full"
      />
    </Link>
  )
}
