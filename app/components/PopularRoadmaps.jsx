import { Link } from 'react-router'

export default function PopularRoadmaps() {
  return (
    <section>
      <h2>This week's popular paths</h2>
      <ul>
        {Array.from({ length: 6 }, (_, index) => (
          <li key={index}><Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/browse-paths">Watercolor</Link></li>
        ))}
      </ul>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/browse-paths">Browse paths</Link>
    </section>
  )
}
