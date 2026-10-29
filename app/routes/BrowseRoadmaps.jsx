import { Link } from 'react-router'
import RoadmapList from '../user/RoadmapList.jsx'
import { listPublishedRoadmaps } from '../user/data.js'

export default function BrowseRoadmaps() {
  return (
    <>
      <h1>Browse paths</h1>
      <p>Explore published paths.</p>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/create-path">Create a path</Link>
      <Link to="/create-path/youtube" className="mb-4 block rounded-lg border border-accent bg-white px-4 py-3 text-center text-accent no-underline">Create a path from YouTube</Link>
      <RoadmapList load={listPublishedRoadmaps} empty="No published paths yet." />
    </>
  )
}

