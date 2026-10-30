import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAuth } from '../user/AuthProvider.jsx'
import { getOwnedProject, saveProject } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'
import ProjectForm from '../user/ProjectForm.jsx'

function Editor({ project }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [id] = useState(() => project?.id ?? crypto.randomUUID())

  async function save(values) {
    await saveProject(user.id, id, values)
    navigate(`/profile/projects/${id}`)
  }

  return <ProjectForm project={project} onSave={save} />
}

function ExistingProject({ projectId }) {
  const { data, loading, error } = useUserData(getOwnedProject, projectId)
  if (loading || error) return <DataState loading={loading} error={error} />
  return <Editor key={data.id} project={data} />
}

export default function EditProject() {
  const { projectId } = useParams()
  const backTo = projectId ? `/profile/projects/${projectId}` : '/profile/projects'
  const backLabel = projectId ? 'Back to project' : 'Back to projects'

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-10">
      <header className="flex flex-col gap-3">
        <Link className="!m-0 self-start !border-0 !p-0 text-sm text-accent underline" to={backTo}>{backLabel}</Link>
        <h1 className="m-0 text-page-title">{projectId ? 'Edit project' : 'Create a project'}</h1>
      </header>
      {projectId ? <ExistingProject projectId={projectId} /> : <Editor />}
    </div>
  )
}
