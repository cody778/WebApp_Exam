import { Link } from 'react-router'
import ProjectList from '../user/ProjectList.jsx'

export default function BrowseProjects({ isPublic = false }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="m-0 text-page-title">{isPublic ? 'Public projects' : 'My projects'}</h1>
        <Link className="m-0 rounded-full border-0 bg-accent px-4 py-2 text-sm text-on-brand no-underline" to="/profile/projects/new">Create a project</Link>
      </div>
      {isPublic ? <p className="m-0 text-sm text-quiet">Public projects are not available yet.</p> : <ProjectList />}
      <Link className="m-0 self-start border-0 p-0 text-sm text-accent underline" to={isPublic ? '/profile/projects' : '/home'}>{isPublic ? 'My projects' : 'Back to paths'}</Link>
    </div>
  )
}
