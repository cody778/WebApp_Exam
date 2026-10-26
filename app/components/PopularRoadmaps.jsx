import { Link } from 'react-router-dom'

export default function PopularRoadmaps() {
  return (
    <section>
      <h2>This week's popular roadmaps</h2>
      <ul>
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index}><Link to="/roadmap">Watercolor</Link></li>
        ))}
      </ul>
      <Link to="/browse-roadmaps">Browse roadmaps</Link>
    </section>
  )
}
