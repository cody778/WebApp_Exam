import HighlightCard from '../../components/HighlightCard.jsx'
import sectionArrow from '../../assets/landing/section-arrow.svg'
import iconLink from '../../assets/landing/icon-link.svg'
import iconLayers from '../../assets/landing/icon-layers.svg'
import iconCheck from '../../assets/landing/icon-check.svg'

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
    body: 'Create your own path, copy community roadmaps, or share what you’ve built.',
  },
]

/** Three product points that sit under the hero. Copy is static marketing text. */
export default function HighlightsSection() {
  return (
    <section className="flex w-full flex-col items-center gap-8 py-8">
      <img src={sectionArrow} alt="" width="14.9477" height="32.7613" />
      {highlights.map((item) => (
        <HighlightCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
      ))}
    </section>
  )
}
