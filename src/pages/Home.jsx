import { Link } from 'react-router-dom'
import RoadmapProgress from '../components/RoadmapProgress.jsx'
import PopularRoadmaps from '../components/PopularRoadmaps.jsx'

export default function Home() {
  return (
    <>
      <h1>Home.jsx</h1>
      <Link to="/create-roadmap">Create a roadmap</Link>
      <RoadmapProgress />
      <PopularRoadmaps />
    </>
  )
}
