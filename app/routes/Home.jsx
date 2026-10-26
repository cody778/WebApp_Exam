import { Link } from 'react-router'
import RoadmapProgress from '../components/RoadmapProgress.jsx'

export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <Link to="/create-roadmap">Create a roadmap</Link>
      <RoadmapProgress />
    </>
  )
}
