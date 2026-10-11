import { Link } from 'react-router-dom'
import SkillOverview from '../components/SkillOverview.jsx'

export default function MySkills() {
  return (
    <>
      <h1>MySkills.jsx</h1>
      <h2>Pottery</h2>
      <SkillOverview />
      <Link to="/my-roadmap">View my roadmap</Link>
    </>
  )
}
