import { Link } from 'react-router'
import RoadmapList from '../user/RoadmapList.jsx'

export default function MyRoadmap() { // displays a list of the user's roadmaps
  return (
    <>
      <h1>My paths</h1>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/create-path">Create a path</Link>
      <Link to="/create-path/youtube" className="mb-4 block rounded-lg border border-accent bg-white px-4 py-3 text-center text-accent no-underline">Create a path from YouTube</Link>
      <RoadmapList />
    </>
  )
}
