import { Link } from 'react-router'
import RoadmapList from '../user/RoadmapList.jsx'
import { listPublishedRoadmaps } from '../user/data.js'

export default function BrowseRoadmaps() {
  return (
    <>
      <h1>Browse roadmaps</h1>
      <p>Explore published roadmaps.</p>
      <Link to="/create-roadmap">Create a roadmap</Link>
      <RoadmapList load={listPublishedRoadmaps} empty="No published roadmaps yet." />
    </>
  )
}

