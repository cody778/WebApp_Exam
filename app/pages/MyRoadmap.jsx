import { Link } from 'react-router'
import RoadmapList from '../user/RoadmapList.jsx'

export default function MyRoadmap() { // displays a list of the user's roadmaps
  return (
    <>
      <h1>My roadmaps</h1>
      <Link to="/create-roadmap">Create a roadmap</Link>
      <RoadmapList />
    </>
  )
}
