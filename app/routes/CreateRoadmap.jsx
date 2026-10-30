import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import editIcon from '../assets/create-path/edit.svg'
import plusIcon from '../assets/create-path/plus.svg'
import iconForkCount from '../assets/public-path/icon-fork-count.svg'
import iconSaveCount from '../assets/public-path/icon-save-count.svg'
import iconShare from '../assets/public-path/icon-share.svg'
import stepDot from '../assets/public-path/step-dot.svg'
import { useAuth } from '../user/AuthProvider.jsx'
import { createRoadmap, saveLesson } from '../user/data.js'

/**
 * Full name from the account, then the email name.
 * @param {object | null | undefined} user
 */
function authorName(user) {
  const fullName = user?.user_metadata?.full_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  const emailName = user?.email?.split('@')[0]
  return emailName || 'you'
}

/** Create-path screen. The title, description, and steps are saved together. */
export default function CreateRoadmap() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const titleRef = useRef(null)
  const savedStepIds = useRef(new Set())
  const [id] = useState(() => crypto.randomUUID())
  const [steps, setSteps] = useState(() => [{ id: crypto.randomUUID(), title: 'Step 1' }])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function grow(event) {
    const field = event.currentTarget
    field.style.height = 'auto'
    field.style.height = `${field.scrollHeight}px`
  }

  function addStep() {
    setSteps((current) => [...current, { id: crypto.randomUUID(), title: `Step ${current.length + 1}` }])
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    const form = new FormData(event.currentTarget)
    const title = String(form.get('title') || '').trim()
    const description = String(form.get('description') || '').trim()
    if (!title) {
      setError('Give your path a title.')
      titleRef.current?.focus()
      return
    }

    setBusy(true)
    setError('')

    try {
      const roadmap = await createRoadmap(user.id, id, title, description)
      for (const step of steps) {
        const stepTitle = step.title.trim()
        if (!stepTitle || savedStepIds.current.has(step.id)) continue
        await saveLesson(step.id, roadmap.id, stepTitle, [
          { id: crypto.randomUUID(), type: 'paragraph', content: { text: '' } },
        ])
        savedStepIds.current.add(step.id)
      }
      navigate(`/my-path/${roadmap.id}`)
    } catch {
      setError('Could not save your path. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="-mx-4 -mt-6 -mb-6 flex flex-1 flex-col bg-white font-sans text-ink"
    >
      <div className="flex h-40 shrink-0 items-start justify-end overflow-hidden bg-[#dad6cd] p-4">
        <div className="flex w-6 flex-col">
          <button
            type="button"
            aria-label="Share"
            className="m-0 flex h-6 w-full -scale-y-100 rotate-180 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
          >
            <img src={iconShare} alt="" width="24" height="24" className="block max-w-none" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="m-0 text-[13px] leading-normal font-normal whitespace-nowrap text-quiet">
            <Link to="/home" className="m-0 border-0 p-0 text-quiet underline">
              My paths
            </Link>
            <span> › New path</span>
          </p>
          <button
            type="button"
            aria-label="Edit title"
            onClick={() => titleRef.current?.focus()}
            className="m-0 size-5 shrink-0 cursor-pointer border-0 bg-transparent p-0"
          >
            <img src={editIcon} alt="" width="20" height="20" className="block max-w-none" />
          </button>
        </div>
        <textarea
          ref={titleRef}
          name="title"
          rows={1}
          maxLength={200}
          required
          autoFocus
          disabled={busy}
          placeholder="New path"
          aria-label="Path title"
          onInput={grow}
          className="m-0 w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-sans text-[36px] leading-[1.15] font-bold tracking-[-0.72px] text-ink outline-none placeholder:text-[#e3e3e3]"
        />
        <div className="flex items-center justify-between">
          <p className="m-0 text-[10px] leading-[1.4] font-normal whitespace-nowrap text-quiet">By {authorName(user)}</p>
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-0.5">
              <img src={iconSaveCount} alt="" width="12" height="12" className="block max-w-none" />
              <span className="text-[10px] leading-[1.4] font-normal whitespace-nowrap text-quiet">0 k</span>
            </span>
            <span className="flex items-center gap-0.5">
              <img src={iconForkCount} alt="" width="12" height="12" className="block max-w-none" />
              <span className="text-[10px] leading-[1.4] font-normal whitespace-nowrap text-quiet">0</span>
            </span>
          </div>
        </div>
        <fieldset className="m-0 flex w-full min-w-0 flex-1 flex-col gap-4 border-0 p-0 pb-12" disabled={busy}>
          <div className="flex items-center gap-2 text-2xl leading-[1.2] text-ink">
            <p className="m-0 min-w-0 flex-1 font-semibold">| Overview</p>
            <p className="m-0 font-normal">|</p>
            <p className="m-0 font-normal">|</p>
          </div>
          <textarea
            name="description"
            rows={1}
            maxLength={5000}
            placeholder="Path description"
            aria-label="Path description"
            onInput={grow}
            className="m-0 w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-sans text-sm leading-[1.4] font-normal text-quiet outline-none placeholder:text-[#e3e3e3]"
          />
          <p className="m-0 text-sm leading-[1.4] font-normal text-quiet">{steps.length} steps</p>
          <ol className="m-0 flex list-none flex-col gap-4 p-0 py-2">
            {steps.map((step, index) => (
              <li key={step.id} className="flex items-center gap-2">
                <img src={stepDot} alt="" width="8" height="8" className="block max-w-none shrink-0" />
                <input
                  value={step.title}
                  aria-label={`Step ${index + 1}`}
                  maxLength={200}
                  onChange={(event) => {
                    const title = event.target.value
                    setSteps((current) => current.map((item) => (item.id === step.id ? { ...item, title } : item)))
                  }}
                  className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-base leading-[1.4] font-normal text-ink outline-none"
                />
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={addStep}
            className="m-0 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-[#b2b2b2] px-4 py-3 font-sans text-base leading-none font-normal text-ink"
          >
            <span className="flex size-4 shrink-0 items-center justify-center">
              <img src={plusIcon} alt="" width="11.3333" height="11.3333" className="block max-w-none" />
            </span>
            Add step
          </button>
          {error && <p role="alert" className="m-0 text-sm leading-[1.4]">{error}</p>}
          <Link to="/create-path/youtube" className="m-0 border-0 p-0 text-center text-sm leading-[1.4] text-accent underline">
            Create a path from YouTube
          </Link>
          <div className="mt-auto pt-4">
            <button
              type="submit"
              className="m-0 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-brand px-4 py-0 font-sans text-base leading-none font-normal text-on-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-70"
            >
              {busy ? 'Saving...' : 'Continue path'}
            </button>
          </div>
        </fieldset>
      </div>
    </form>
  )
}
