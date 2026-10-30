import { Link, Navigate } from 'react-router'
import ExplorePathsCard from '../components/ExplorePathsCard.jsx'
import HeroSection from '../components/HeroSection.jsx'
import HighlightsSection from '../components/HighlightsSection.jsx'
import { useAuth } from '../user/AuthProvider.jsx'

/** Mobile-first marketing page. A signed-in visit goes straight to the library. */
export default function Welcome() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="landing-page mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-4 font-sans text-ink">
        <p role="status">Loading your account...</p>
      </div>
    )
  }
  if (user) return <Navigate to="/home" replace />

  return (
    <div className="landing-page box-border [&_*]:box-border mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 pt-4 pb-20 font-sans text-ink lg:max-w-6xl lg:gap-8 lg:px-8 lg:pb-24">
      {/* Story order: promise, what you get, an invitation to browse, then the team's mission. */}
      <HeroSection />
      <HighlightsSection />
      <ExplorePathsCard />
      {/* A plain underlined text link. The ! classes remove the old global link frame. */}
      <Link
        to="/about"
        className="!m-0 self-center !inline !border-0 !bg-transparent !p-0 text-center font-display text-base leading-body text-ink !underline"
      >
        Our Mission
      </Link>
    </div>
  )
}
