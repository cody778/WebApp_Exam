import { Link, useParams } from 'react-router'

export default function EditProject() {
  const { projectId } = useParams()

  return (
    <>
      <h1>{projectId ? 'Edit project' : 'Create project'}</h1>
      <div className="grid gap-3 mb-4 [&_input]:min-w-0 [&_input]:p-3 [&_input]:[font:inherit] [&_textarea]:min-w-0 [&_textarea]:p-3 [&_textarea]:[font:inherit]">
        <label htmlFor="project-title">Title</label>
        <input id="project-title" name="title" type="text" />
        <label htmlFor="project-description">Description</label>
        <textarea id="project-description" name="description" rows={8} />
      </div>
      <Link className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" to={projectId ? `/profile/projects/${projectId}` : '/profile/projects'}>Back</Link>
    </>
  )
}
