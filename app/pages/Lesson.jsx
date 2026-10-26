import { Link } from 'react-router-dom'
import BlockEditor from '../components/BlockEditor.jsx'

export default function Lesson() {
  return (
    <>
      <h1>Lesson</h1>
      <BlockEditor />
      <Link to="..">Back to roadmap</Link>
    </>
  )
}
