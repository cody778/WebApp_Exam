import { Link } from 'react-router-dom'
import RoadmapList from '../user/RoadmapList.jsx'

export default function MyRoadmap() {
  return (
    <>
      <h1>My roadmaps</h1>
      <Link to="/create-roadmap">Create a roadmap</Link>
      <RoadmapList />
    </>
  )
}
