import { useEffect, useRef, useState } from 'react'
import Button from '../components/Button.jsx'
import { useSavePrompt } from '../components/SaveSignInPrompt.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import iconSave from '../assets/public-path/icon-save.svg'
import iconFork from '../assets/public-path/icon-fork.svg'
import iconShare from '../assets/public-path/icon-share.svg'
import countSave from '../assets/public-path/count-save.svg'
import countFork from '../assets/public-path/count-fork.svg'
import knittingDrawing from '../assets/public-path/knitting-drawing.svg'
import iconLock from '../assets/public-path/icon-lock.svg'
import stepDot from '../assets/public-path/step-dot.svg'
import castOn from '../assets/public-path/cast-on.png'
import iconNext from '../assets/public-path/icon-next.svg'
import iconCheck from '../assets/public-path/icon-check.svg'

const steps = [
  'Cast on',
  'Knit stich',
  'Purl stich',
  'Stockinette',
  'Increases',
  'Decreases',
  'Cast off',
]

const materials = [
  'Needles 4.5 mm',
  '“Sugar n\u2019 Cream” cotton yarn 100 g',
  'Darning needle',
  'Scissors',
]

const sectionLabel = 'm-0 min-w-0 flex-1 font-sans text-[32px] leading-[1.2] font-normal'
const sectionPipe = 'm-0 shrink-0 font-sans text-2xl leading-[1.2] font-normal whitespace-nowrap'
const pathButtonClass =
  'm-0 flex h-10 w-full min-w-0 cursor-pointer disabled:cursor-wait items-center justify-center rounded-2xl border-0 bg-accent px-4 py-0 font-sans text-base leading-none font-normal text-on-brand no-underline'

function pathRecordKey(userId) {
  return `pathify-public-path:${userId}`
}

function readPathRecord(userId) {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(pathRecordKey(userId)) ?? '')
    const completed = Array.isArray(parsed?.completed) ? parsed.completed.filter((step) => steps.includes(step)) : []
    return { visited: Boolean(parsed?.visited), completed }
  } catch {
    return { visited: false, completed: [] }
  }
}

function writePathRecord(userId, record) {
  window.localStorage.setItem(pathRecordKey(userId), JSON.stringify({ visited: record.visited, completed: record.completed }))
}

/** Public path opened from the knitting card on explore. */
export default function PublicPath() {
  const { user, loading } = useAuth()
  const userId = user?.id ?? null
  const [saved, setSaved] = useState(false)
  const [visitedBefore, setVisitedBefore] = useState(false)
  const [completed, setCompleted] = useState(() => new Set())
  const { saveOrPrompt, prompt } = useSavePrompt()
  const authPending = Boolean(supabase) && loading && !user
  const scrollerRef = useRef(null)
  const dragRef = useRef(null)

  useEffect(() => {
    if (!userId) {
      setVisitedBefore(false)
      setCompleted(new Set())
      return undefined
    }

    const record = readPathRecord(userId)
    setVisitedBefore(record.visited || record.completed.length > 0)
    setCompleted(new Set(record.completed))
    if (record.visited) return undefined

    const timer = window.setTimeout(() => {
      const latest = readPathRecord(userId)
      writePathRecord(userId, { visited: true, completed: latest.completed })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [userId])

  function saveCompleted(next) {
    if (!user) return
    const record = readPathRecord(user.id)
    writePathRecord(user.id, { visited: record.visited, completed: [...next] })
  }

  function toggleStep(step) {
    setCompleted((current) => {
      const next = new Set(current)
      if (next.has(step)) next.delete(step)
      else next.add(step)
      saveCompleted(next)
      return next
    })
  }

  function startPath() {
    setCompleted((current) => {
      const next = new Set(current)
      next.add(steps[0])
      saveCompleted(next)
      return next
    })
  }

  let pathAction = 'Sign in to start your path'
  if (user) pathAction = visitedBefore || completed.size > 0 ? 'Continue your path' : 'Welcome, start your path'

  function onScrollerPointerDown(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    if (event.target.closest('button, a')) return
    const scroller = scrollerRef.current
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startScroll: scroller.scrollLeft, moved: false }
    try {
      scroller.setPointerCapture(event.pointerId)
    } catch {
      // Capture is only available while a real pointer is active.
    }
  }

  function onScrollerPointerMove(event) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const distance = event.clientX - drag.startX
    if (!drag.moved && Math.abs(distance) < 4) return
    drag.moved = true
    const scroller = scrollerRef.current
    scroller.style.scrollSnapType = 'none'
    scroller.scrollLeft = drag.startScroll - distance
  }

  function onScrollerPointerEnd(event) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    const scroller = scrollerRef.current
    if (scroller.hasPointerCapture?.(event.pointerId)) scroller.releasePointerCapture(event.pointerId)
    if (!drag.moved) return
    const index = Math.max(0, Math.min(2, Math.round(scroller.scrollLeft / scroller.clientWidth)))
    scroller.style.scrollSnapType = ''
    scroller.scrollTo({ left: index * scroller.clientWidth, behavior: 'smooth' })
  }

  return (
    <div className="public-path box-border [&_*]:box-border mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-white font-sans text-ink">
      <div className="relative flex h-40 shrink-0 items-start justify-end overflow-hidden p-4">
        <img
          src={knittingDrawing}
          alt=""
          width="198.545"
          height="76.9727"
          className="pointer-events-none absolute top-6 left-1/2 max-w-none -translate-x-1/2"
        />
        <div className="relative z-10 flex items-center gap-1">
          <span className="flex items-center gap-0.5">
            <img src={countSave} alt="" width="9" height="9" className="block max-w-none" />
            <span className="text-[10px] leading-[1.4] font-normal whitespace-nowrap text-ink">1.5 k</span>
          </span>
          <span className="flex items-center gap-0.5">
            <img src={countFork} alt="" width="10" height="10" className="block max-w-none" />
            <span className="text-[10px] leading-[1.4] font-normal whitespace-nowrap text-ink">208</span>
          </span>
        </div>
        <div className="relative z-10 flex w-6 flex-col gap-2">
          <button type="button" aria-label="Save Knitting" className="min-w-0 disabled:cursor-wait [font:inherit] m-0 h-6 w-full cursor-pointer border-0 bg-transparent p-0">
            <img src={iconSave} alt="" width="24" height="24" className="block max-w-none" />
          </button>
          <button type="button" aria-label="Fork Knitting" className="min-w-0 disabled:cursor-wait [font:inherit] m-0 h-6 w-full cursor-pointer border-0 bg-transparent p-0">
            <img src={iconFork} alt="" width="24" height="24" className="block max-w-none" />
          </button>
          <button
            type="button"
            aria-label="Share Knitting"
            className="min-w-0 disabled:cursor-wait [font:inherit] m-0 flex h-6 w-full -scale-y-100 rotate-180 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
          >
            <img src={iconShare} alt="" width="24" height="24" className="block max-w-none" />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex h-[58px] items-center justify-between">
          <h1 className="m-0 font-logo text-[48px] leading-none font-normal tracking-[-2.88px] whitespace-nowrap text-ink">
            Knitting
          </h1>
          <img src={iconLock} alt="" width="20" height="20" className="block max-w-none shrink-0" />
        </div>
        <div
          ref={scrollerRef}
          onPointerDown={onScrollerPointerDown}
          onPointerMove={onScrollerPointerMove}
          onPointerUp={onScrollerPointerEnd}
          onPointerCancel={onScrollerPointerEnd}
          className="flex min-w-0 cursor-grab snap-x snap-mandatory overflow-x-auto overscroll-x-contain select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          <section className="flex w-full min-w-full shrink-0 snap-start flex-col gap-4" aria-label="Overview">
            <div className="flex items-center gap-2 text-ink">
              <p className={sectionLabel}>| Overview</p>
              <p className={sectionPipe}>|</p>
              <p className={sectionPipe}>|</p>
            </div>
            <p className="m-0 text-sm leading-[1.4] font-medium text-quiet">
              Learn all the essential techniques to be a able to complete a knitting project from start to finish.
            </p>
            <p className="m-0 text-sm leading-[1.4] font-normal text-quiet">8 steps</p>
            <ol className="m-0 flex list-none flex-col gap-6 p-0 py-1.5">
              {steps.map((step, index) => (
                <li key={step} className="relative flex items-center gap-[14px]">
                  {index < steps.length - 1 ? (
                    <span aria-hidden="true" className="absolute top-1/2 left-[3px] h-[calc(100%+1.5rem)] w-0.5 bg-[#434343]" />
                  ) : null}
                  <img src={stepDot} alt="" width="8" height="8" className="relative z-10 block max-w-none shrink-0" />
                  <span className="min-w-0 flex-1 font-display text-[20px] leading-[1.4] font-medium text-ink">{step}</span>
                  <button
                    type="button"
                    aria-pressed={completed.has(step)}
                    aria-label={completed.has(step) ? `Mark ${step} incomplete` : `Mark ${step} completed`}
                    onClick={() => toggleStep(step)}
                    className={`min-w-0 cursor-pointer disabled:cursor-wait [font:inherit] m-0 flex size-4 shrink-0 items-center justify-center rounded border border-brand p-0 ${completed.has(step) ? 'bg-brand' : 'bg-transparent'}`}
                  >
                    {completed.has(step) ? (
                      <img src={iconCheck} alt="" width="12.2667" height="8.93333" className="block max-w-none" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ol>
            {authPending ? (
              <button type="button" disabled aria-busy="true" className={pathButtonClass} />
            ) : user ? (
              <button type="button" onClick={startPath} className={pathButtonClass}>
                {pathAction}
              </button>
            ) : (
              <Button to="/sign-in" className="h-12 w-full rounded-lg font-sans text-base leading-none font-normal">
                {pathAction}
              </Button>
            )}
          </section>
          <section className="flex w-full min-w-full shrink-0 snap-start flex-col gap-4" aria-label="Steps">
            <div className="flex items-center gap-2 text-ink">
              <p className={sectionPipe}>|</p>
              <p className={sectionLabel}>| Steps</p>
              <p className={sectionPipe}>|</p>
            </div>
            <h2 className="m-0 font-display text-[20px] leading-[1.4] font-medium text-ink">Cast on</h2>
            <div className="flex items-center gap-2">
              <p className="m-0 shrink-0 text-sm leading-[1.4] font-normal whitespace-nowrap text-quiet">Step 1/8</p>
              <div className="flex min-w-0 flex-1 gap-px" aria-hidden="true">
                <span className="h-2 min-w-0 flex-1 rounded-l-lg bg-ink" />
                {Array.from({ length: 6 }, (_, index) => (
                  <span key={index} className="h-2 min-w-0 flex-1 bg-[#b2b2b2]" />
                ))}
                <span className="h-2 min-w-0 flex-1 rounded-r-lg bg-[#b2b2b2]" />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <p className="m-0 text-sm leading-[1.4] font-medium text-quiet">
                Casting on means putting your first row of stitches onto a knitting needle to start a project.
              </p>
              <div className="relative aspect-[312/169] w-full">
                <img src={castOn} alt="" className="absolute inset-0 size-full object-cover" />
              </div>
            </div>
            <div className="flex h-[27px] items-center justify-end gap-[9px]">
              <span className="w-[62px] text-right text-sm leading-[1.4]">
                <span className="block font-sans font-normal text-ink">Next</span>
                <span className="block font-display font-medium text-[#b5b5b5]">Knit stich</span>
              </span>
              <span className="flex rotate-180 items-center justify-center">
                <img src={iconNext} alt="" width="5" height="16" className="block max-w-none" />
              </span>
            </div>
          </section>
          <section className="flex w-full min-w-full shrink-0 snap-start flex-col gap-4" aria-label="Materials">
            <div className="flex items-center gap-2 text-ink">
              <p className={sectionPipe}>|</p>
              <p className={sectionPipe}>|</p>
              <p className={sectionLabel}>| Materials</p>
            </div>
            <ul className="m-0 flex list-none flex-col gap-6 p-0">
              {materials.map((item) => (
                <li key={item} className="flex items-center gap-[14px]">
                  <span className="flex size-4 shrink-0 items-center justify-center rounded border border-brand bg-brand">
                    <img src={iconCheck} alt="" width="12.2667" height="8.93333" className="block max-w-none" />
                  </span>
                  <span className="min-w-0 flex-1 font-display text-[20px] leading-[1.4] font-medium text-ink">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      {prompt}
    </div>
  )
}
