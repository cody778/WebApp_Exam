import { Link, useParams } from 'react-router'

export default function Project({ isPublic = false }) {
  const { projectId } = useParams()

  return (
    <>
      <h1>Project</h1>
      {!isPublic && <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to={`/profile/projects/${projectId}/edit`}>Edit project</Link>}
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to={isPublic ? '/profile/projects/public' : '/profile/projects'}>Back to projects</Link>
    </>
  )
}
