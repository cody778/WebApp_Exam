import { useRef, useState } from 'react'
import PathSections from './PathSections.jsx'
import { StepNav, StepProgress } from './PathSteps.jsx'
import StepBlockEditor, { GrowingText, blockHasContent, cleanBlocks, textBlock } from './StepBlockEditor.jsx'
import plusIcon from '../assets/create-path/plus.svg'
import removeIcon from '../assets/create-path/remove.svg'
import dragIcon from '../assets/create-path/drag.svg'
import stepDot from '../assets/public-path/step-dot.svg'

/** A new, untouched step. A null title shows its position as "Step N". */
export function newStep() {
  return { id: crypto.randomUUID(), title: null, blocks: [textBlock()] }
}

function stepTitle(step, index) {
  return step.title ?? `Step ${index + 1}`
}

const removeButton =
  '!m-0 flex !size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent !p-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-[#9e2020]/10 [@media(hover:none)]:opacity-100'

/**
 * Editable path: title, description, steps with block content, and materials. Used to create and to edit a path.
 * @param {{
 *   initial: { title: string, description: string, steps: Array<{ id: string, title: string | null, blocks: object[] }> },
 *   author: string,
 *   submitLabel: string,
 *   onSubmit: (path: { title: string, description: string, steps: Array<{ id: string, title: string, blocks: object[] }> }) => Promise<void>,
 *   secondary?: import('react').ReactNode,
 *   autoFocusTitle?: boolean,
 * }} props
 */
export default function PathEditor({ initial, author, submitLabel, onSubmit, secondary, autoFocusTitle = false }) {
  const titleRef = useRef(null)
  const listRef = useRef(null)
  const [title, setTitle] = useState(initial.title)
  const [description, setDescription] = useState(initial.description)
  const [steps, setSteps] = useState(() =>
    initial.steps.length ? initial.steps.map((step) => ({ ...step, blocks: step.blocks.length ? step.blocks : [textBlock()] })) : [newStep()],
  )
  const [materials, setMaterials] = useState([])
  const [material, setMaterial] = useState('')
  const [openId, setOpenId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [confirmingId, setConfirmingId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const openStep = steps.find((step) => step.id === openId) ?? steps[0]
  const openIndex = steps.indexOf(openStep)

  function updateStep(stepId, changes) {
    setSteps((current) => current.map((item) => (item.id === stepId ? { ...item, ...changes } : item)))
  }

  function addStep() {
    const step = newStep()
    setSteps((current) => [...current, step])
    return step
  }

  function moveStep(stepId, to) {
    setSteps((current) => {
      const from = current.findIndex((item) => item.id === stepId)
      if (from === -1 || to < 0 || to >= current.length || from === to) return current
      const next = [...current]
      next.splice(to, 0, ...next.splice(from, 1))
      return next
    })
  }

  function startDrag(event, stepId) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    event.preventDefault()
    setDraggingId(stepId)
    const onMove = (moveEvent) => {
      const items = [...listRef.current.children]
      const from = items.findIndex((item) => item.dataset.stepId === stepId)
      let to = from
      items.forEach((item, index) => {
        const box = item.getBoundingClientRect()
        const middle = box.top + box.height / 2
        if (index < from && moveEvent.clientY < middle) to = Math.min(to, index)
        if (index > from && moveEvent.clientY > middle) to = Math.max(to, index)
      })
      moveStep(stepId, to)
    }
    const onEnd = () => {
      setDraggingId(null)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('pointercancel', onEnd)
  }

  function onHandleKeyDown(event, stepId, index) {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    moveStep(stepId, index + (event.key === 'ArrowUp' ? -1 : 1))
    requestAnimationFrame(() => event.target.focus())
  }

  function removeStep(step) {
    if (steps.length <= 1) return
    const hasContent = step.title?.trim() || step.blocks.some(blockHasContent)
    if (hasContent && confirmingId !== step.id) {
      setConfirmingId(step.id)
      return
    }
    if (step.id === openStep.id) {
      const index = steps.indexOf(step)
      setOpenId((steps[index + 1] ?? steps[index - 1]).id)
    }
    setSteps((current) => current.filter((item) => item.id !== step.id))
    setConfirmingId(null)
  }

  function addMaterial() {
    const name = material.trim()
    if (!name) return
    setMaterials((current) => [...current, { id: crypto.randomUUID(), name }])
    setMaterial('')
  }

  async function submit(event) {
    event.preventDefault()
    if (busy) return
    if (!title.trim()) {
      setError('Give your path a title.')
      titleRef.current?.focus()
      return
    }

    setBusy(true)
    setError('')
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        steps: steps.flatMap((step, index) => {
          const name = stepTitle(step, index).trim()
          return name ? [{ id: step.id, title: name, blocks: cleanBlocks(step.blocks) }] : []
        }),
      })
    } catch {
      setError('Could not save your path. Please try again.')
      setBusy(false)
    }
  }

  function renderSection(label, showSection) {
    if (label === 'Overview') {
      return (
        <>
          <GrowingText
            value={description}
            maxLength={5000}
            placeholder="Path description"
            aria-label="Path description"
            onChange={(event) => setDescription(event.target.value)}
            className="text-sm leading-[1.4] font-normal !text-quiet placeholder:!text-[#e3e3e3]"
          />
          <p className="m-0 text-sm leading-[1.4] font-normal text-quiet">{steps.length} {steps.length === 1 ? 'step' : 'steps'}</p>
          <ol ref={listRef} className="m-0 flex list-none flex-col gap-4 p-0 py-2">
            {steps.map((step, index) => (
              <li
                key={step.id}
                data-step-id={step.id}
                className={`group relative flex flex-col gap-2 rounded-lg ${draggingId === step.id ? 'z-20 bg-white shadow-[0_2px_12px_rgba(30,30,30,0.15)]' : ''}`}
              >
                {index < steps.length - 1 && <span aria-hidden="true" className="absolute top-3 -bottom-7 left-[3px] w-0.5 bg-brand" />}
                <div className="flex items-center gap-2">
                  <img src={stepDot} alt="" width="8" height="8" className="relative z-10 block max-w-none shrink-0" />
                  <input
                    value={stepTitle(step, index)}
                    aria-label={`Step ${index + 1}`}
                    maxLength={200}
                    onChange={(event) => updateStep(step.id, { title: event.target.value })}
                    className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-base leading-[1.4] font-normal text-ink outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(step.id)
                      showSection(1)
                    }}
                    className="!m-0 shrink-0 cursor-pointer rounded border-0 bg-transparent !px-1 !py-0 font-sans text-sm leading-[1.4] text-quiet underline opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100"
                  >
                    Edit
                  </button>
                  {steps.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label={`Move step ${index + 1}`}
                        title="Drag to reorder, or use the arrow keys"
                        onPointerDown={(event) => startDrag(event, step.id)}
                        onKeyDown={(event) => onHandleKeyDown(event, step.id, index)}
                        className={`${removeButton} touch-none !cursor-grab hover:!bg-black/5 active:!cursor-grabbing ${draggingId === step.id ? '!opacity-100' : ''}`}
                      >
                        <img src={dragIcon} alt="" width="10" height="16" className="pointer-events-none block max-w-none" />
                      </button>
                      <button type="button" aria-label={`Remove step ${index + 1}`} onClick={() => removeStep(step)} className={removeButton}>
                        <img src={removeIcon} alt="" width="12" height="12" className="block max-w-none" />
                      </button>
                    </>
                  )}
                </div>
                {confirmingId === step.id && (
                  <div role="alertdialog" aria-label="Remove step" className="flex flex-wrap items-center gap-2 rounded-lg bg-[#9e2020]/5 px-3 py-2 text-sm leading-[1.4]">
                    <p className="m-0 min-w-0 flex-1 text-ink">Remove “{stepTitle(step, index).trim() || `Step ${index + 1}`}”?</p>
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
        </>
      )
    }

    if (label === 'Steps') {
      return (
        <>
          <input
            value={stepTitle(openStep, openIndex)}
            aria-label={`Step ${openIndex + 1} title`}
            maxLength={200}
            onChange={(event) => updateStep(openStep.id, { title: event.target.value })}
            className="m-0 w-full border-0 bg-transparent p-0 font-sans text-2xl leading-[1.2] font-semibold tracking-[-0.48px] text-ink outline-none"
          />
          <StepProgress count={steps.length} index={openIndex} filled={(index) => index <= openIndex} />
          <StepBlockEditor
            key={openStep.id}
            blocks={openStep.blocks}
            label={`Step ${openIndex + 1} content`}
            onChange={(blocks) => updateStep(openStep.id, { blocks })}
          />
          <StepNav
            previous={openIndex > 0 ? { title: stepTitle(steps[openIndex - 1], openIndex - 1), onClick: () => setOpenId(steps[openIndex - 1].id) } : null}
            next={openIndex < steps.length - 1 ? { title: stepTitle(steps[openIndex + 1], openIndex + 1), onClick: () => setOpenId(steps[openIndex + 1].id) } : null}
            end={
              <button
                type="button"
                onClick={() => setOpenId(addStep().id)}
                className="!m-0 flex cursor-pointer items-center gap-2 border-0 bg-transparent !p-0 text-sm leading-[1.4] text-ink"
              >
                <img src={plusIcon} alt="" width="11.3333" height="11.3333" className="block max-w-none" />
                Add step
              </button>
            }
          />
        </>
      )
    }

    return (
      <>
        {materials.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {materials.map((item) => (
              <li key={item.id} className="group flex items-center gap-3">
                <span className="size-4 shrink-0 rounded border border-brand" aria-hidden="true" />
                <span className="min-w-0 flex-1 text-base leading-[1.4] font-normal text-ink">{item.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => setMaterials((current) => current.filter((entry) => entry.id !== item.id))}
                  className={removeButton}
                >
                  <img src={removeIcon} alt="" width="12" height="12" className="block max-w-none" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-3">
          <span className="size-4 shrink-0 rounded border border-dashed border-quiet" aria-hidden="true" />
          <input
            value={material}
            maxLength={200}
            placeholder="Add a material"
            aria-label="New material"
            onChange={(event) => setMaterial(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return
              event.preventDefault()
              addMaterial()
            }}
            className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-base leading-[1.4] font-normal text-ink outline-none placeholder:text-placeholder"
          />
          <button
            type="button"
            onClick={addMaterial}
            disabled={!material.trim()}
            className="!m-0 shrink-0 cursor-pointer rounded-md border-0 bg-transparent !px-2 !py-1 font-sans text-sm text-accent disabled:cursor-default disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-4">
      <GrowingText
        fieldRef={(element) => {
          titleRef.current = element
        }}
        value={title}
        maxLength={200}
        autoFocus={autoFocusTitle}
        disabled={busy}
        placeholder="New path"
        aria-label="Path title"
        onChange={(event) => setTitle(event.target.value)}
        className="!flex-none text-[36px] leading-[1.15] font-bold tracking-[-0.72px] placeholder:!text-[#e3e3e3]"
      />
      <p className="m-0 text-[10px] leading-[1.4] font-normal whitespace-nowrap text-quiet">By {author}</p>

      <fieldset className="m-0 flex w-full min-w-0 flex-1 flex-col gap-4 border-0 p-0" disabled={busy}>
        <PathSections render={renderSection} />
        {error && <p role="alert" className="m-0 text-sm leading-[1.4]">{error}</p>}
        <div className="mt-auto flex flex-col gap-3 pt-4 lg:flex-row-reverse">
          <button
            type="submit"
            className="m-0 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-brand px-4 py-0 font-sans text-base leading-none font-normal text-on-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-70 lg:flex-1"
          >
            {busy ? 'Saving...' : submitLabel}
          </button>
          {secondary}
        </div>
      </fieldset>
    </form>
  )
}

/** Outlined secondary action that sits beside the main path button. */
export const secondaryButton =
  '!m-0 !flex !h-12 w-full !items-center !justify-center !rounded-lg !border !border-ink !bg-white !px-4 !py-0 !text-center !font-sans !text-base !leading-none !font-normal !text-ink !no-underline lg:flex-1'
