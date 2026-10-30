import { Link } from 'react-router'
import RoadmapList from '../user/RoadmapList.jsx'
import { listPublishedRoadmaps } from '../user/data.js'

export default function BrowseRoadmaps() {
  return (
    <section className="flex flex-col gap-6 py-6 font-sans text-ink">
      <div>
        <h1 className="m-0 text-page-title">Browse paths</h1>
        <p className="mt-2 mb-0 text-quiet">Explore published paths.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link className="m-0 inline-flex h-11 items-center justify-center rounded-lg border-0 bg-brand px-5 text-sm text-on-brand no-underline" to="/create-path">Create a path</Link>
        <Link to="/create-path/youtube" className="m-0 inline-flex h-11 items-center justify-center rounded-lg border border-accent bg-white px-5 text-sm text-accent no-underline">Create from YouTube</Link>
      </div>
      <RoadmapList load={listPublishedRoadmaps} empty="No published paths yet." />
    </section>
  )
}

