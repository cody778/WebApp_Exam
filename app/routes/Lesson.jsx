import { Link, useParams } from 'react-router'
import BlockEditor from '../components/BlockEditor.jsx'

export default function Lesson() {
  const { roadmapId } = useParams()

  return (
    <>
      <h1>Lesson</h1>
      <BlockEditor />
      <Link to={`/my-roadmap/${roadmapId}`}>Back to roadmap</Link>
    </>
  )
}
