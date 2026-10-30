import { useRef, useState } from 'react'
import StepBlockEditor, { GrowingText, cleanBlocks, textBlock } from '../components/StepBlockEditor.jsx'

export default function ProjectForm({ project, onSave }) {
  const [title, setTitle] = useState(project?.title ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [blocks, setBlocks] = useState(() => project?.blocks?.length ? project.blocks : [textBlock()])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const titleRef = useRef(null)

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    if (!title.trim()) {
      setError('Give your project a title.')
      titleRef.current?.focus()
      return
    }
    setBusy(true)
    setError('')

    try {
      await onSave({ title: title.trim(), description: description.trim(), blocks: cleanBlocks(blocks) })
    } catch {
      setError('Could not save your project. Please try again.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <fieldset className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0" disabled={busy}>
        <div className="flex flex-col gap-3">
          <label htmlFor="project-title" className="text-xs font-medium tracking-[0.08em] text-quiet uppercase">Project title</label>
          <GrowingText
            id="project-title"
            fieldRef={(element) => {
              titleRef.current = element
            }}
            value={title}
            maxLength={200}
            autoFocus={!project}
            placeholder="Untitled project"
            onChange={(event) => setTitle(event.target.value)}
            className="!flex-none text-[32px] leading-[1.15] font-bold tracking-[-0.64px] placeholder:!text-[#d3d3d3]"
          />
          <GrowingText
            id="project-description"
            value={description}
            maxLength={2000}
            placeholder="Add a short description"
            aria-label="Project description"
            onChange={(event) => setDescription(event.target.value)}
            className="text-sm leading-[1.4] font-normal !text-quiet placeholder:!text-[#c4c4c4]"
          />
        </div>

        <section className="flex min-w-0 flex-col gap-5 rounded-2xl border border-accent-muted bg-white px-8 py-6 shadow-[0_1px_3px_rgba(30,30,30,0.06)]">
          <div className="flex flex-col gap-1">
            <h2 className="m-0 text-base font-semibold text-ink">Project content</h2>
            <p className="m-0 text-sm leading-[1.4] text-quiet">Use the plus beside a block to add headings, lists, images, or video.</p>
          </div>
          <StepBlockEditor
            label="Project content"
            blocks={blocks}
            onChange={setBlocks}
            placeholder="Start writing, or press + to add blocks"
          />
        </section>

        {error && <p className="m-0 text-sm text-[#9e2020]" role="alert">{error}</p>}
        <button
          className="!m-0 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-brand !px-4 !py-0 font-sans text-base leading-none text-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-70"
          type="submit"
        >
          {busy ? 'Saving...' : 'Save project'}
        </button>
      </fieldset>
    </form>
  )
}
