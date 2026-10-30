import { useState } from 'react'
import { Link } from 'react-router'
import { listProjects } from './data.js'
import useUserData from './useUserData.js'
import DataState from './DataState.jsx'

export default function ProjectList() {
  const { data, loading, error } = useUserData(listProjects)
  const [query, setQuery] = useState('')
  const search = query.trim().toLowerCase()
  const projects = (data ?? []).filter(project =>
    `${project.title} ${project.description ?? ''}`.toLowerCase().includes(search),
  )

  if (loading || error) return <DataState loading={loading} error={error} />

  return (
    <section className="flex flex-col gap-4" aria-label="My projects">
      <label className="flex flex-col gap-2 text-sm">
        Search projects
        <input className="min-w-0 rounded-full border border-surface-muted bg-white px-4 py-2 font-[inherit]" type="search" value={query} onChange={event => setQuery(event.target.value)} />
      </label>
      {projects.length === 0 && <p className="m-0 text-sm text-quiet">{data.length ? 'No projects match your search.' : 'No projects yet. Create your first one.'}</p>}
      <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <li className="rounded-lg border border-surface-muted bg-white p-4 [overflow-wrap:anywhere]" key={project.id}>
            <h2 className="m-0 text-lg font-medium">
              <Link className="m-0 inline border-0 p-0 text-inherit no-underline hover:underline" to={`/profile/projects/${project.id}`}>{project.title}</Link>
            </h2>
            {project.description && <p className="mb-0 line-clamp-3 text-sm text-quiet">{project.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
