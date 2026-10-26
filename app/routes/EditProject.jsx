import { Link, useParams } from 'react-router'

export default function EditProject() {
  const { projectId } = useParams()

  return (
    <>
      <h1>{projectId ? 'Edit project' : 'Create project'}</h1>
      <div className="project-fields">
        <label htmlFor="project-title">Title</label>
        <input id="project-title" name="title" type="text" />
        <label htmlFor="project-description">Description</label>
        <textarea id="project-description" name="description" rows={8} />
      </div>
      <Link to={projectId ? `/profile/projects/${projectId}` : '/profile/projects'}>Back</Link>
    </>
  )
}
