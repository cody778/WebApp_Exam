import ExplorePathsCard from '../components/ExplorePathsCard.jsx'
import HeroSection from '../components/HeroSection.jsx'
import HighlightsSection from '../components/HighlightsSection.jsx'

/** Mobile-first marketing page assembled from the Pathify landing frame. */
export default function Welcome() {
  return (
    <div className="landing-page box-border [&_*]:box-border mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 pt-4 pb-20 font-sans text-ink">
      <HeroSection />
      <HighlightsSection />
      <ExplorePathsCard />
    </div>
  )
}
