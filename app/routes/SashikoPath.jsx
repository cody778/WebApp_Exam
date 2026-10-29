import { useRef, useState } from 'react'
import { Link, Navigate } from 'react-router'
import EditLesson from './EditLesson.jsx'
import Button from '../components/Button.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import sashiko from '../assets/profile/sashiko.jpg'
import saveCount from '../assets/explore/save-count.svg'
import forkCount from '../assets/explore/fork-count.svg'
import iconSave from '../assets/public-path/icon-save.svg'
import iconFork from '../assets/public-path/icon-fork.svg'
import iconShare from '../assets/public-path/icon-share.svg'
import iconLock from '../assets/public-path/icon-lock.svg'
import stepDot from '../assets/public-path/step-dot.svg'
import iconCheck from '../assets/public-path/icon-check.svg'
import iconNext from '../assets/public-path/icon-next.svg'
import pattern from '../assets/sashiko/pattern.png'

const materials = ['Sashiko Needle', 'Sashiko Fabric', 'Sashiko Thread', 'Sashiko Pattern']

const steps = [
  { name: 'What is Sashiko', state: 'done' },
  { name: 'Transfer or Draw the Pattern', state: 'current' },
  { name: 'Purl stich', state: 'upcoming' },
  { name: 'Stockinette', state: 'upcoming' },
  { name: 'Increases', state: 'upcoming' },
  { name: 'Decreases', state: 'upcoming' },
  { name: 'Cast off', state: 'upcoming' },
]

function SectionHeader({ active }) {
  const slots = ['Overview', 'Steps', 'Materials']
  return (
    <div className="flex items-center gap-2 font-sans text-2xl leading-[1.2] font-normal text-ink">
      {slots.map((label) =>
        label === active ? (
          <p key={label} className="m-0 min-w-0 flex-1">
            | {label}
          </p>
        ) : (
          <p key={label} className="m-0 shrink-0 whitespace-nowrap">
            |
          </p>
        ),
      )}
    </div>
  )
}

/** Sashiko path opened from the profile card while signed in. */
export default function SashikoPath() {
  const { user, loading } = useAuth()
  const scrollerRef = useRef(null)
  const dragRef = useRef(null)
  const [checked, setChecked] = useState(() => new Set(['Sashiko Needle', 'Sashiko Fabric', 'Sashiko Thread']))
  const [editing, setEditing] = useState(false)

  function toggleMaterial(name) {
    setChecked((current) => {
      const next = new Set(current)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

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

  if (supabase && !loading && !user) {
    return <Navigate to="/sign-in" state={{ from: '/sashiko' }} replace />
  }

  if (editing) return <EditLesson />

  return (
    <div className="sashiko-path mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-white font-sans text-ink">
      <div className="relative h-40 shrink-0 bg-[#dad6cd]">
        <img
          src={sashiko}
          alt=""
          width="768"
          height="1017"
          className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover"
        />
        <div className="absolute top-4 right-4 z-10 flex w-6 flex-col gap-2">
          <button type="button" aria-label="Save Sashiko" className="m-0 h-6 w-full cursor-pointer border-0 bg-transparent p-0">
            <img src={iconSave} alt="" width="24" height="24" className="block max-w-none" />
          </button>
          <button type="button" aria-label="Fork Sashiko" className="m-0 h-6 w-full cursor-pointer border-0 bg-transparent p-0">
            <img src={iconFork} alt="" width="24" height="24" className="block max-w-none" />
          </button>
          <button
            type="button"
            aria-label="Share Sashiko"
            className="m-0 flex h-6 w-full -scale-y-100 rotate-180 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
          >
            <img src={iconShare} alt="" width="24" height="24" className="block max-w-none" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 py-4 pb-12">
        <div className="flex items-center justify-between">
          <Link
            to="/profile?filter=mine"
            className="!m-0 w-fit !border-0 !p-0 font-sans text-sm leading-[1.4] font-normal !text-quiet no-underline"
          >
            <span className="underline">My paths</span>
            <span>{` >`}</span>
          </Link>
          <button
            type="button"
            aria-label="Edit Sashiko"
            onClick={() => setEditing(true)}
            className="!m-0 !h-5 !w-5 shrink-0 cursor-pointer !border-0 !bg-transparent !p-0"
          >
            <img src={iconLock} alt="" width="20" height="20" className="block max-w-none" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-sans text-[48px] leading-[1.2] font-bold tracking-[-0.96px] text-ink">Sashiko</h1>
          <div className="flex items-center justify-between">
            <p className="m-0 font-sans text-[10px] leading-[1.4] font-normal whitespace-nowrap text-[#444]">By Anna Liu</p>
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-0.5">
                <img src={saveCount} alt="" width="12" height="12" className="block max-w-none" />
                <span className="font-sans text-[10px] leading-[1.4] whitespace-nowrap text-[#5a5a5a]">1.5 k</span>
              </span>
              <span className="flex items-center gap-0.5">
                <img src={forkCount} alt="" width="12" height="12" className="block max-w-none" />
                <span className="font-sans text-[10px] leading-[1.4] whitespace-nowrap text-[#5a5a5a]">208</span>
              </span>
            </div>
          </div>
        </div>

        <div
          ref={scrollerRef}
          onPointerDown={onScrollerPointerDown}
          onPointerMove={onScrollerPointerMove}
          onPointerUp={onScrollerPointerEnd}
          onPointerCancel={onScrollerPointerEnd}
          className="flex min-w-0 flex-1 cursor-grab snap-x snap-mandatory overflow-x-auto overscroll-x-contain select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          <section className="flex w-full min-w-full shrink-0 snap-start flex-col gap-4" aria-label="Overview">
            <SectionHeader active="Overview" />
            <p className="m-0 font-sans text-sm leading-[1.4] font-normal text-quiet">
              Sashiko is a traditional Japanese hand-stitching technique that uses repeated running stitches for reinforcement, patching, and decoration.
            </p>
            <p className="m-0 font-sans text-sm leading-[1.4] font-normal text-quiet">6 steps, 1 completed</p>
            <ol className="relative m-0 flex list-none flex-col gap-6 p-0 py-2">
              <span aria-hidden="true" className="absolute top-4 bottom-4 left-[11px] w-0.5 bg-brand" />
              {steps.map((step) => (
                <li
                  key={step.name}
                  className={
                    step.state === 'current'
                      ? 'relative z-10 flex w-fit items-center gap-2 rounded-2xl bg-accent px-2 py-1.5'
                      : 'relative z-10 flex items-center gap-2 px-2'
                  }
                >
                  {step.state === 'done' ? (
                    <span className="size-2 shrink-0 rounded-full bg-placeholder" />
                  ) : step.state === 'current' ? (
                    <span className="size-2 shrink-0 rounded-full bg-on-brand" />
                  ) : (
                    <img src={stepDot} alt="" width="8" height="8" className="block max-w-none shrink-0" />
                  )}
                  <span
                    className={`font-sans text-base leading-[1.4] ${
                      step.state === 'current' ? 'text-on-brand' : step.state === 'done' ? 'text-placeholder' : 'text-ink'
                    }`}
                  >
                    {step.name}
                  </span>
                </li>
              ))}
            </ol>
            <Button
              to="/sashiko"
              className="mt-auto !flex !h-12 w-full !items-center !justify-center !rounded-lg !border-0 !bg-ink !text-on-brand font-sans text-base leading-none font-normal"
            >
              Continue path
            </Button>
          </section>

          <section className="flex w-full min-w-full shrink-0 snap-start flex-col gap-4" aria-label="Steps">
            <SectionHeader active="Steps" />
            <h2 className="m-0 font-sans text-2xl leading-[1.2] font-semibold tracking-[-0.48px] text-ink">
              Transfer or Draw the Pattern
            </h2>
            <div className="flex items-center gap-2">
              <p className="m-0 shrink-0 font-sans text-sm leading-[1.4] font-normal whitespace-nowrap text-quiet">Step 2/6</p>
              <div className="flex min-w-0 flex-1 gap-px" aria-hidden="true">
                <span className="h-2 min-w-0 flex-1 rounded-l-lg bg-accent" />
                <span className="h-2 min-w-0 flex-1 bg-accent" />
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index} className="h-2 min-w-0 flex-1 bg-[#cdcdcd]" />
                ))}
                <span className="h-2 min-w-0 flex-1 rounded-r-lg bg-[#cdcdcd]" />
              </div>
            </div>
            <p className="m-0 font-sans text-sm leading-[1.4] font-normal text-quiet">
              With Sashiko you trace the pattern onto your fabric using white transfer paper or fusible interfacing:
            </p>
            <ul className="m-0 flex list-disc flex-col gap-4 pl-5 font-sans text-sm leading-[1.4] font-normal text-quiet">
              <li>Draw your grid or geometric design onto the right side of the fabric using a washable marker or chalk.</li>
              <li>For mending a hole, place a backing patch on the reverse side of the garment and pin it in place.</li>
            </ul>
            <div className="relative aspect-[392/283] w-full overflow-hidden">
              <img
                src={pattern}
                alt=""
                width="450"
                height="450"
                className="absolute top-[-31.74%] left-0 h-[138.52%] w-full max-w-none"
              />
            </div>
            <div className="flex h-[27px] items-center justify-between">
              <span className="flex items-center gap-[9px]">
                <img src={iconNext} alt="" width="5" height="16" className="block max-w-none" />
                <span className="text-sm leading-[1.4]">
                  <span className="block font-sans font-normal text-ink">Previous</span>
                  <span className="block font-sans font-normal text-[#b5b5b5]">What is Sashiko</span>
                </span>
              </span>
              <span className="flex items-center gap-[9px]">
                <span className="w-[62px] text-right text-sm leading-[1.4]">
                  <span className="block font-sans font-normal text-ink">Next</span>
                  <span className="block font-sans font-normal text-[#b5b5b5]">Knit stich</span>
                </span>
                <span className="flex rotate-180 items-center justify-center">
                  <img src={iconNext} alt="" width="5" height="16" className="block max-w-none" />
                </span>
              </span>
            </div>
            <button
              type="button"
              className="m-0 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-accent px-4 font-sans text-base leading-none font-normal text-on-brand"
            >
              Complete step
            </button>
          </section>

          <section className="flex w-full min-w-full shrink-0 snap-start flex-col gap-4" aria-label="Materials">
            <SectionHeader active="Materials" />
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {materials.map((name) => {
                const on = checked.has(name)
                return (
                  <li key={name}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleMaterial(name)}
                      className="m-0 flex items-center gap-3 border-0 bg-transparent p-0 text-left"
                    >
                      <span
                        className={`flex size-4 shrink-0 items-center justify-center rounded border border-brand ${on ? 'bg-brand' : 'bg-transparent'}`}
                      >
                        {on ? <img src={iconCheck} alt="" width="12.2667" height="8.93333" className="block max-w-none" /> : null}
                      </span>
                      <span className="font-sans text-base leading-[1.4] font-normal text-ink">{name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
