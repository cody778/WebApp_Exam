import { Link, useParams } from 'react-router'

export default function Project({ isPublic = false }) {
  const { projectId } = useParams()

  return (
    <>
      <h1>Project</h1>
      {!isPublic && <Link to={`/profile/projects/${projectId}/edit`}>Edit project</Link>}
      <Link to={isPublic ? '/profile/projects/public' : '/profile/projects'}>Back to projects</Link>
    </>
  )
}
