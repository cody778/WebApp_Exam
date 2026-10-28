import ExplorePathsCard from './ExplorePathsCard.jsx'
import HeroSection from './HeroSection.jsx'
import HighlightsSection from './HighlightsSection.jsx'

/** Mobile-first marketing page assembled from the Pathify landing frame. */
export default function LandingPage() {
  return (
    <div className="landing-page mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 pt-4 pb-20 font-sans text-ink">
      <HeroSection />
      <HighlightsSection />
      <ExplorePathsCard />
    </div>
  )
}
