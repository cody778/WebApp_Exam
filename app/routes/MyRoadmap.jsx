import { Link } from 'react-router'
import RoadmapList from '../user/RoadmapList.jsx'

export default function MyRoadmap() { // displays a list of the user's roadmaps
  return (
    <>
      <h1>My roadmaps</h1>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to="/create-roadmap">Create a roadmap</Link>
      <RoadmapList />
    </>
  )
}
