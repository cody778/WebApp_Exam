import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <h1>Home.jsx</h1>
      <Link to="/create-roadmap">Create a roadmap</Link>
      <Link to="/my-roadmap">My roadmap</Link>
      <Link to="/browse-roadmaps">Browse roadmaps</Link>
    </>
  )
}
