import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import plusIcon from '../assets/create-path/plus.svg'
import removeIcon from '../assets/create-path/remove.svg'
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
  // A null title is an untouched step; it shows its position as "Step N".
  const [steps, setSteps] = useState(() => [{ id: crypto.randomUUID(), title: null }])
  const [confirmingId, setConfirmingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function grow(event) {
    const field = event.currentTarget
    field.style.height = 'auto'
    field.style.height = `${field.scrollHeight}px`
  }

  function addStep() {
    setSteps((current) => [...current, { id: crypto.randomUUID(), title: null }])
  }

  function removeStep(step) {
    if (steps.length <= 1) return
    if (step.title?.trim() && confirmingId !== step.id) {
      setConfirmingId(step.id)
      return
    }
    setSteps((current) => current.filter((item) => item.id !== step.id))
    setConfirmingId(null)
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
      for (const [index, step] of steps.entries()) {
        const stepTitle = (step.title ?? `Step ${index + 1}`).trim()
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
      className="create-path -mx-4 -mt-6 -mb-6 flex min-h-full flex-1 flex-col bg-white font-sans text-ink lg:mx-0"
    >
      <div className="h-40 shrink-0 bg-[#dad6cd]" />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-4 lg:max-w-6xl lg:px-8">
        <p className="m-0 text-[13px] leading-normal font-normal whitespace-nowrap text-quiet">
          <Link to="/home" className="!m-0 !inline !border-0 !bg-transparent !p-0 !text-[13px] !leading-normal !font-normal !text-quiet !underline">
            My paths
          </Link>
          <span> › New path</span>
        </p>
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
        <p className="m-0 text-[10px] leading-[1.4] font-normal whitespace-nowrap text-quiet">By {authorName(user)}</p>
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
              <li key={step.id} className="group flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <img src={stepDot} alt="" width="8" height="8" className="block max-w-none shrink-0" />
                  <input
                    value={step.title ?? `Step ${index + 1}`}
                    aria-label={`Step ${index + 1}`}
                    maxLength={200}
                    onChange={(event) => {
                      const title = event.target.value
                      setSteps((current) => current.map((item) => (item.id === step.id ? { ...item, title } : item)))
                    }}
                    className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-base leading-[1.4] font-normal text-ink outline-none"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove step ${index + 1}`}
                      onClick={() => removeStep(step)}
                      className="!m-0 flex !size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent !p-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-[#9e2020]/10 [@media(hover:none)]:opacity-100"
                    >
                      <img src={removeIcon} alt="" width="12" height="12" className="block max-w-none" />
                    </button>
                  )}
                </div>
                {confirmingId === step.id && (
                  <div role="alertdialog" aria-label="Remove step" className="flex flex-wrap items-center gap-2 rounded-lg bg-[#9e2020]/5 px-3 py-2 text-sm leading-[1.4]">
                    <p className="m-0 min-w-0 flex-1 text-ink">Remove “{step.title.trim()}”?</p>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="!m-0 cursor-pointer rounded-md border-0 bg-transparent !px-3 !py-1 font-sans text-sm text-ink"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      autoFocus
                      onClick={() => removeStep(step)}
                      className="!m-0 cursor-pointer rounded-md border-0 bg-[#9e2020] !px-3 !py-1 font-sans text-sm text-on-brand"
                    >
                      Remove
                    </button>
                  </div>
                )}
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
          <div className="mt-auto flex flex-col gap-3 pt-4 lg:flex-row-reverse">
            <button
              type="submit"
              className="m-0 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-brand px-4 py-0 font-sans text-base leading-none font-normal text-on-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-70 lg:flex-1"
            >
              {busy ? 'Saving...' : 'Create path'}
            </button>
            <Link
              to="/create-path/youtube"
              className="!m-0 !flex !h-12 w-full !items-center !justify-center !rounded-lg !border !border-ink !bg-white !px-4 !py-0 !text-center !font-sans !text-base !leading-none !font-normal !text-ink !no-underline lg:flex-1"
            >
              Create a path from YouTube
            </Link>
          </div>
        </fieldset>
      </div>
    </form>
  )
}
