import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import PathEditor from '../components/PathEditor.jsx'
import PathSections from '../components/PathSections.jsx'
import PathShell, { authorName } from '../components/PathShell.jsx'
import { StepNav, StepProgress } from '../components/PathSteps.jsx'
import StepBlocks from '../components/StepBlocks.jsx'
import iconSave from '../assets/public-path/icon-save.svg'
import iconSaveFilled from '../assets/public-path/icon-save-filled.svg'
import iconFork from '../assets/public-path/icon-fork.svg'
import iconShare from '../assets/public-path/icon-share.svg'
import iconLock from '../assets/public-path/icon-lock.svg'
import iconEdit from '../assets/create-path/edit.svg'
import stepDot from '../assets/public-path/step-dot.svg'
import { useAuth } from '../user/AuthProvider.jsx'
import saveCount from '../assets/explore/save-count.svg'
import forkCount from '../assets/explore/fork-count.svg'
import { forkPath, getPath, setLessonCompleted, setPathSaved, updatePath } from '../user/data.js'
import DataState from '../user/DataState.jsx'
import useUserData from '../user/useUserData.js'
import { isUnavailableItem } from '../user/dataErrors.js'

const coverButton =
  '!m-0 flex size-8 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent !p-0 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white disabled:cursor-wait disabled:opacity-60'
const headerButton =
  '!m-0 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent !p-0 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-accent'
const mainButton =
  '!m-0 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border-0 !px-4 !py-0 font-sans text-base leading-none font-normal disabled:cursor-wait disabled:opacity-70'

/** 1500 becomes "1.5 k", like the counts on path cards. */
function formatCount(count) {
  return count >= 1000 ? `${Number((count / 1000).toFixed(1))} k` : String(count)
}

/** Path page. Owners can unlock it to edit; other people can save, fork, and share it. */
export default function Roadmap() {
  const { roadmapId } = useParams()
  const { data, loading, error, reload } = useUserData(getPath, roadmapId)

  if (isUnavailableItem(error)) return <Navigate to="/404" replace />
  if (loading || error) {
    return (
      <div className="py-6">
        <DataState loading={loading} error={error} />
      </div>
    )
  }
  return <PathPage key={data.id} path={data} onSaved={reload} />
}

/**
 * @param {{ path: Awaited<ReturnType<typeof getPath>>, onSaved: () => void }} props
 */
function PathPage({ path, onSaved }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const owned = path.owner_id === user.id
  const steps = path.lessons.filter((lesson) => !lesson.unavailable)

  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(path.saved)
  const [saves, setSaves] = useState(path.saves)
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(() => new Set(steps.filter((step) => step.completed).map((step) => step.id)))
  const [openId, setOpenId] = useState(null)
  const [busyStep, setBusyStep] = useState(null)
  const [forking, setForking] = useState(false)
  const [confirmUnsave, setConfirmUnsave] = useState(false)
  const [notice, setNotice] = useState(location.state?.notice ?? '')

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(''), 2800)
    return () => clearTimeout(timer)
  }, [notice])

  const currentIndex = steps.findIndex((step) => !completed.has(step.id))
  const openStep = steps.find((step) => step.id === openId) ?? steps[currentIndex] ?? steps[0]
  const openIndex = steps.indexOf(openStep)

  const crumb = owned
    ? { to: '/home?filter=mine', label: 'My paths' }
    : saved
      ? { to: '/home?filter=saved', label: 'Saved paths' }
      : { to: '/browse-paths', label: 'Paths' }

  async function share() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/my-path/${path.id}`)
      setNotice('Link copied')
    } catch {
      setNotice('Could not copy the link')
    }
  }

  async function changeSaved(value) {
    if (saving) return
    setSaving(true)
    try {
      await setPathSaved(user.id, path.id, value)
      setSaved(value)
      setSaves((count) => count + (value ? 1 : -1))
      setNotice(value ? 'Saved to your paths' : 'Removed from saved paths')
    } catch {
      setNotice(value ? 'Could not save this path' : 'Could not unsave this path')
    } finally {
      setSaving(false)
    }
  }

  function save() {
    if (saved) setConfirmUnsave(true)
    else changeSaved(true)
  }

  async function fork() {
    if (forking) return
    setForking(true)
    try {
      const id = await forkPath(user.id, path)
      navigate(`/my-path/${id}`, { state: { notice: 'This is your copy. Unlock it to edit.' } })
    } catch {
      setNotice('Could not copy this path')
      setForking(false)
    }
  }

  async function markStep(step, done) {
    if (busyStep) return
    setBusyStep(step.id)
    try {
      await setLessonCompleted(user.id, step.id, done)
      setCompleted((current) => {
        const next = new Set(current)
        if (done) next.add(step.id)
        else next.delete(step.id)
        return next
      })
      const index = steps.indexOf(step)
      if (done && steps[index + 1]) setOpenId(steps[index + 1].id)
    } catch {
      setNotice('Could not save your progress')
    } finally {
      setBusyStep(null)
    }
  }

  const coverActions = (
    <>
      {!owned && (
        <>
          <button type="button" aria-label={saved ? 'Unsave path' : 'Save path'} aria-pressed={saved} disabled={saving} onClick={save} className={coverButton}>
            <img src={saved ? iconSaveFilled : iconSave} alt="" width="24" height="24" className="block max-w-none" />
          </button>
          <button type="button" aria-label="Fork path to your paths" disabled={forking} onClick={fork} className={coverButton}>
            <img src={iconFork} alt="" width="24" height="24" className="block max-w-none" />
          </button>
        </>
      )}
      <button type="button" aria-label="Copy link to this path" onClick={share} className={coverButton}>
        <img src={iconShare} alt="" width="24" height="24" className="block max-w-none -scale-y-100 rotate-180" />
      </button>
      {confirmUnsave && (
        <div
          role="alertdialog"
          aria-label="Unsave path"
          className="absolute top-0 right-full mr-2 flex w-60 flex-col gap-3 rounded-lg bg-white p-3 text-sm leading-[1.4] text-ink shadow-[0_8px_24px_rgba(30,30,30,0.2)]"
        >
          <p className="m-0">Remove this path from your saved paths?</p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmUnsave(false)}
              className="!m-0 cursor-pointer rounded-md border-0 bg-transparent !px-3 !py-1 font-sans text-sm text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => {
                setConfirmUnsave(false)
                changeSaved(false)
              }}
              className="!m-0 cursor-pointer rounded-md border-0 bg-[#9e2020] !px-3 !py-1 font-sans text-sm text-on-brand"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </>
  )

  const headerAction = owned ? (
    editing ? (
      <button type="button" aria-label="Stop editing without saving" title="Stop editing" onClick={() => setEditing(false)} className={headerButton}>
        <img src={iconEdit} alt="" width="20" height="20" className="block max-w-none" />
      </button>
    ) : (
      <button type="button" aria-label="Unlock to edit" title="Locked. Click to edit" onClick={() => setEditing(true)} className={headerButton}>
        <img src={iconLock} alt="" width="20" height="20" className="block max-w-none" />
      </button>
    )
  ) : null

  const toast = notice ? (
    <p
      role="status"
      className="fixed bottom-6 left-1/2 z-[60] m-0 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-sm leading-[1.4] whitespace-nowrap text-on-brand shadow-[0_8px_24px_rgba(30,30,30,0.25)]"
    >
      {notice}
    </p>
  ) : null

  if (editing) {
    return (
      <PathShell crumb={crumb} current={path.title} coverActions={coverActions} headerAction={headerAction}>
        <PathEditor
          initial={{
            title: path.title,
            description: path.description ?? '',
            materials: path.materials ?? [],
            steps: steps.map((step) => ({ id: step.id, title: step.title, blocks: step.blocks })),
          }}
          author={authorName(user)}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            await updatePath(user.id, path, values)
            onSaved()
          }}
          secondary={
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="!m-0 !flex !h-12 w-full !items-center !justify-center !rounded-lg !border !border-ink !bg-white !px-4 !py-0 font-sans !text-base !leading-none !font-normal !text-ink lg:flex-1"
            >
              Cancel
            </button>
          }
        />
        {toast}
      </PathShell>
    )
  }

  function renderSection(label, showSection) {
    if (label === 'Overview') {
      return (
        <>
          {path.description && <p className="m-0 text-sm leading-[1.4] font-normal whitespace-pre-wrap text-quiet">{path.description}</p>}
          <p className="m-0 text-sm leading-[1.4] font-normal text-quiet">
            {steps.length} {steps.length === 1 ? 'step' : 'steps'}, {completed.size} completed
          </p>
          {steps.length > 0 && (
            <ol className="relative m-0 flex list-none flex-col gap-6 p-0 py-2">
              {steps.length > 1 && <span aria-hidden="true" className="absolute top-4 bottom-4 left-[11px] w-0.5 bg-brand" />}
              {steps.map((step, index) => {
                const done = completed.has(step.id)
                const current = index === currentIndex
                return (
                  <li key={step.id} className="relative z-10 flex">
                    <button
                      type="button"
                      aria-current={current ? 'step' : undefined}
                      onClick={() => {
                        setOpenId(step.id)
                        showSection(1)
                      }}
                      className={`!m-0 flex min-w-0 cursor-pointer items-center gap-2 border-0 text-left font-sans text-base leading-[1.4] ${
                        current ? 'rounded-2xl bg-accent !px-2 !py-1.5 text-on-brand' : 'bg-transparent !px-2 !py-0 hover:underline'
                      } ${done ? 'text-placeholder' : current ? '' : 'text-ink'}`}
                    >
                      {done ? (
                        <span className="size-2 shrink-0 rounded-full bg-placeholder" />
                      ) : current ? (
                        <span className="size-2 shrink-0 rounded-full bg-on-brand" />
                      ) : (
                        <img src={stepDot} alt="" width="8" height="8" className="block max-w-none shrink-0" />
                      )}
                      <span className="min-w-0 [overflow-wrap:anywhere]">
                        {done && <span className="sr-only">Completed: </span>}
                        {step.title}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          )}
          {steps.length === 0 ? (
            <p className="m-0 text-sm leading-[1.4] text-quiet">This path has no steps yet.</p>
          ) : currentIndex === -1 ? (
            <p className="m-0 text-sm leading-[1.4] text-ink">You completed every step of this path.</p>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpenId(steps[currentIndex].id)
                showSection(1)
              }}
              className={`${mainButton} bg-ink text-on-brand`}
            >
              {completed.size ? 'Continue path' : 'Start path'}
            </button>
          )}
        </>
      )
    }

    if (label === 'Steps') {
      if (!openStep) return <p className="m-0 text-sm leading-[1.4] text-quiet">This path has no steps yet.</p>
      const done = completed.has(openStep.id)
      return (
        <>
          <h2 className="m-0 font-sans text-2xl leading-[1.2] font-semibold tracking-[-0.48px] text-ink [overflow-wrap:anywhere]">{openStep.title}</h2>
          <StepProgress count={steps.length} index={openIndex} filled={(index) => completed.has(steps[index].id)} />
          <StepBlocks blocks={openStep.blocks} />
          <StepNav
            previous={openIndex > 0 ? { title: steps[openIndex - 1].title, onClick: () => setOpenId(steps[openIndex - 1].id) } : null}
            next={openIndex < steps.length - 1 ? { title: steps[openIndex + 1].title, onClick: () => setOpenId(steps[openIndex + 1].id) } : null}
          />
          <button
            type="button"
            disabled={busyStep === openStep.id}
            onClick={() => markStep(openStep, !done)}
            className={done ? `${mainButton} !border !border-solid !border-ink bg-white text-ink` : `${mainButton} bg-accent text-on-brand`}
          >
            {busyStep === openStep.id ? 'Saving...' : done ? 'Mark as not completed' : 'Complete step'}
          </button>
        </>
      )
    }

    if (!path.materials?.length) return <p className="m-0 text-sm leading-[1.4] text-quiet">No materials listed for this path yet.</p>
    return (
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {path.materials.map((name, index) => (
          <li key={index} className="flex items-center gap-3">
            <span className="size-4 shrink-0 rounded border border-brand" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-base leading-[1.4] font-normal text-ink [overflow-wrap:anywhere]">{name}</span>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <PathShell crumb={crumb} current={path.title} coverActions={coverActions} headerAction={headerAction}>
      <h1 className="m-0 text-[36px] leading-[1.15] font-bold tracking-[-0.72px] text-ink [overflow-wrap:anywhere]">{path.title}</h1>
      <div className="flex items-center gap-3">
        {owned && <p className="m-0 text-[10px] leading-[1.4] font-normal whitespace-nowrap text-quiet">By {authorName(user)}</p>}
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-0.5" aria-label={`Saved ${saves} ${saves === 1 ? 'time' : 'times'}`}>
            <img src={saveCount} alt="" width="12" height="12" className="block max-w-none" />
            <span aria-hidden="true" className="text-[10px] leading-[1.4] whitespace-nowrap text-[#5a5a5a]">{formatCount(saves)}</span>
          </span>
          <span className="flex items-center gap-0.5" aria-label={`Forked ${path.forks} ${path.forks === 1 ? 'time' : 'times'}`}>
            <img src={forkCount} alt="" width="12" height="12" className="block max-w-none" />
            <span aria-hidden="true" className="text-[10px] leading-[1.4] whitespace-nowrap text-[#5a5a5a]">{formatCount(path.forks)}</span>
          </span>
        </div>
      </div>
      <PathSections render={renderSection} />
      {toast}
    </PathShell>
  )
}
