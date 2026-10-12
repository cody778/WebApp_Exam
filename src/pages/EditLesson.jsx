import { Link } from 'react-router-dom'
import BlockEditor from '../components/BlockEditor.jsx'

export default function EditLesson() {
  return (
    <>
      <h1>Edit lesson</h1>
      <BlockEditor />
      <Link to="/create-roadmap">Back to create roadmap</Link>
    </>
  )
}
