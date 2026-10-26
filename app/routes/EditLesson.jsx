import { Link, useSearchParams } from 'react-router'
import BlockEditor from '../components/BlockEditor.jsx'

export default function EditLesson() {
  const [searchParams] = useSearchParams()
  const roadmapId = searchParams.get('roadmap')

  return (
    <>
      <h1>Edit lesson</h1>
      <BlockEditor />
      <Link to={roadmapId ? `/my-roadmap/${encodeURIComponent(roadmapId)}` : '/browse-lessons'}>
        {roadmapId ? 'Back to roadmap' : 'Back to lessons'}
      </Link>
    </>
  )
}
