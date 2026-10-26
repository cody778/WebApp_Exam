import { Link } from 'react-router-dom'

export default function BrowseProjects({ isPublic = false }) {
  return (
    <>
      <h1>{isPublic ? 'Public projects' : 'My projects'}</h1>
      <Link to={isPublic ? '/profile/projects/public/example' : '/profile/projects/example'}>View project</Link>
      {!isPublic && <Link to="/profile/projects/new">Create project</Link>}
      <Link to={isPublic ? '/profile/projects' : '/profile/projects/public'}>
        {isPublic ? 'My projects' : 'Browse public projects'}
      </Link>
      <Link to="/profile">Back to profile</Link>
    </>
  )
}
