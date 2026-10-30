import { useState } from 'react'
import BlockEditor from '../components/BlockEditor.jsx'

export default function ProjectForm({ project, onSave }) {
  const [blocks, setBlocks] = useState(() => project?.blocks ?? [
    { id: crypto.randomUUID(), type: 'paragraph', content: { text: '' } },
  ])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const fields = new FormData(event.currentTarget)
    const title = fields.get('title').trim()
    if (!title) return setError('Give your project a title.')
    setBusy(true)
    setError('')

    try {
      await onSave({ title, description: fields.get('description').trim(), blocks })
    } catch {
      setError('Could not save your project. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <fieldset className="m-0 mb-4 grid min-w-0 gap-3 border-0 p-0 [&_input]:min-w-0 [&_input]:p-3 [&_input]:[font:inherit] [&_textarea]:min-w-0 [&_textarea]:p-3 [&_textarea]:[font:inherit]" disabled={busy}>
        <label htmlFor="project-title">Title</label>
        <input id="project-title" name="title" defaultValue={project?.title ?? ''} maxLength={200} required />
        <label htmlFor="project-description">Description</label>
        <textarea id="project-description" name="description" defaultValue={project?.description ?? ''} rows={3} />
        <BlockEditor label="Project content" blocks={blocks} onChange={setBlocks} readOnly={busy} />
        <button className="min-w-0 cursor-pointer p-3 [font:inherit] disabled:cursor-wait" type="submit">{busy ? 'Saving...' : 'Save project'}</button>
      </fieldset>
      {error && <p className="text-[#9e2020]" role="alert">{error}</p>}
    </form>
  )
}
