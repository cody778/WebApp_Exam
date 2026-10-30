import { Link, useParams } from 'react-router'
import StepBlocks from '../components/StepBlocks.jsx'
import { getOwnedProject } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'

function ProjectContent({ projectId }) {
  const { data, loading, error } = useUserData(getOwnedProject, projectId)
  if (loading || error) return <DataState loading={loading} error={error} />

  return (
    <>
      <h1 className="m-0 text-page-title [overflow-wrap:anywhere]">{data.title}</h1>
      {data.description && <p className="m-0 whitespace-pre-wrap text-quiet [overflow-wrap:anywhere]">{data.description}</p>}
      <section aria-label="Project content" className="rounded-2xl border border-accent-muted bg-white px-6 py-6 shadow-[0_1px_3px_rgba(30,30,30,0.06)]">
        <StepBlocks blocks={data.blocks ?? []} emptyMessage="This project has no content yet." />
      </section>
      <Link className="!m-0 self-start rounded-full !border-0 bg-accent !px-4 !py-2 text-sm text-on-brand no-underline" to={`/profile/projects/${projectId}/edit`}>Edit project</Link>
    </>
  )
}

export default function Project({ isPublic = false }) {
  const { projectId } = useParams()

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-10">
      {isPublic ? <p className="m-0 text-sm text-quiet">Public projects are not available yet.</p> : <ProjectContent projectId={projectId} />}
      <Link className="!m-0 self-start !border-0 !p-0 text-sm text-accent underline" to={isPublic ? '/profile/projects/public' : '/profile/projects'}>Back to projects</Link>
    </div>
  )
}
