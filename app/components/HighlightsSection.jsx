import HighlightCard from './HighlightCard.jsx'
import jumpArrow from '../assets/landing/arrow-jump-down.png'
import iconLink from '../assets/landing/icon-link.svg'
import iconLayers from '../assets/landing/icon-layers.svg'
import iconCheck from '../assets/landing/icon-check.svg'

const highlights = [
  {
    icon: iconLink,
    title: 'Consolidate inspiration',
    body: 'Bring saved videos, articles, and bookmarks into one place.',
  },
  {
    icon: iconLayers,
    title: 'Turn links into lessons',
    body: 'AI helps organize your content into structured, bite-sized steps.',
  },
  {
    icon: iconCheck,
    title: 'Track and share progress',
    body: 'Create your own path, copy community paths, or share what you’ve built.',
  },
]

// Respect reduced-motion settings when skipping past the hero.
function skipOneScreen() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollBy({ top: window.innerHeight, behavior: reduceMotion ? 'auto' : 'smooth' })
}

export default function HighlightsSection() {
  return (
    <section className="flex w-full flex-col items-center gap-8 py-8 lg:grid lg:grid-cols-3 lg:items-stretch lg:gap-6 lg:pt-4 lg:pb-12">
      <button
        type="button"
        onClick={skipOneScreen}
        aria-label="Skip down one screen"
        className="min-w-0 disabled:cursor-wait [font:inherit] motion-safe:animate-arrow-bounce m-0 cursor-pointer border-0 bg-transparent p-0 lg:col-span-3 lg:mb-4 lg:justify-self-center"
      >
        <img src={jumpArrow} alt="" width="47" height="38" />
      </button>
      {highlights.map((item) => (
        <HighlightCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
      ))}
    </section>
  )
}
