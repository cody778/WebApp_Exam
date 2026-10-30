import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import hintArrow from '../assets/onboarding/hint-arrow.svg'
import { useAuth } from '../user/AuthProvider.jsx'
import { completeOnboarding } from '../user/data.js'

/**
 * Each hint points at the element marked with the same `data-tour` value.
 * `waitForClick` hints move on only when that element is clicked; the others also offer Next.
 * `doneAt` moves on once the address starts with it, for actions that can fail, such as saving.
 * `resume` is where "Continue the tour" leads when the element is not on the current page.
 */
const tour = [
  { target: 'new-path', text: 'Click here to create your first learning path', waitForClick: true, resume: '/home' },
  { target: 'path-title', text: 'Click here to type your path name', resume: '/create-path' },
  { target: 'add-step', text: 'Click here to add more steps', resume: '/create-path' },
  { target: 'path-sections', text: 'Slide to the sides to see more', ignoreClicks: true, resume: '/create-path' },
  { target: 'step-content', text: 'Click here to add content to this step', resume: '/create-path' },
  { target: 'save-new-path', text: 'Click here to save your path', waitForClick: true, ignoreClicks: true, doneAt: '/my-path/', resume: '/create-path' },
  { target: 'crumb', text: 'Click here to return to your homepage', waitForClick: true, resume: '/create-path' },
  { target: 'explore', text: 'Click here to explore public paths', waitForClick: true, resume: '/home' },
  { target: 'explore-card', text: 'Click here to see this path', waitForClick: true, clickOn: 'a', resume: '/explore' },
  { target: 'save-path', text: 'Saving a path lets you open it from your homepage and follow its steps', side: 'left', resume: 'path' },
  { target: 'fork-path', text: 'Forking a path makes a copy that you own and can edit', side: 'left', resume: 'path' },
]

const gap = 12
const edge = 12

function readProgress(key) {
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) ?? 'null')
    if (Number.isInteger(saved?.step)) return saved
  } catch {
    // A damaged entry starts the tour from the beginning.
  }
  return { step: 0, path: null }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

/** Whether the element is inside the viewport and not cut off by a sideways-scrolling row, such as the path sections. */
function isShown(element, rect) {
  if (!rect.width || rect.bottom <= 0 || rect.top >= window.innerHeight) return false
  if (rect.left < 0 || rect.right > document.documentElement.clientWidth + 1) return false
  for (let node = element.parentElement; node; node = node.parentElement) {
    if (getComputedStyle(node).overflowX === 'visible') continue
    const box = node.getBoundingClientRect()
    if (rect.left < box.left - 1 || rect.right > box.right + 1) return false
  }
  return true
}

/** First-login tour across Home, creating a path, Explore, and a public path. Shows until the account completes or skips it. */
export default function Onboarding() {
  const { user } = useAuth()
  if (!user || user.user_metadata?.onboarding_completed) return null
  return <Tour key={user.id} storageKey={`pathify-tour:${user.id}`} />
}

/** @param {{ storageKey: string }} props */
function Tour({ storageKey }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [progress, setProgress] = useState(() => readProgress(storageKey))
  const [lost, setLost] = useState(false)
  const [done, setDone] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const boxRef = useRef(null)
  const arrowRef = useRef(null)
  const ringRef = useRef(null)
  const step = tour[progress.step]

  const save = useCallback(
    (change) =>
      setProgress((current) => {
        const next = { ...current, ...change(current) }
        window.localStorage.setItem(storageKey, JSON.stringify(next))
        return next
      }),
    [storageKey],
  )
  const advance = useCallback((extra = {}) => save((current) => ({ ...extra, step: current.step + 1 })), [save])

  function finish() {
    setDone(true)
    window.localStorage.removeItem(storageKey)
    completeOnboarding().catch(() => {})
  }

  function resume() {
    setAttempt((count) => count + 1)
    if (step.resume !== 'path') return navigate(step.resume)
    if (progress.path) return navigate(progress.path)
    save(() => ({ step: tour.findIndex((item) => item.target === 'explore-card') }))
    navigate('/explore')
  }

  useEffect(() => {
    if (step?.doneAt && pathname.startsWith(step.doneAt)) advance()
  }, [step, pathname, advance])

  useEffect(() => {
    if (!step || done) return
    function onClick(event) {
      if (boxRef.current?.contains(event.target) || step.ignoreClicks) return
      if (!event.target.closest?.(`[data-tour="${step.target}"]`)) return
      const link = step.clickOn ? event.target.closest(step.clickOn) : null
      if (step.clickOn && !link) return
      advance(link ? { path: link.getAttribute('href') } : {})
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [step, done, advance])

  useEffect(() => {
    if (!step || done) return
    setLost(false)
    let frame = 0
    let scrolled = false
    let missingSince = performance.now()

    const tick = () => {
      frame = requestAnimationFrame(tick)
      const box = boxRef.current
      const arrow = arrowRef.current
      const ring = ringRef.current
      if (!box || !arrow || !ring) return
      const target = document.querySelector(`[data-tour="${step.target}"]`)
      const rect = target?.getBoundingClientRect()
      const width = document.documentElement.clientWidth
      const height = window.innerHeight
      const onScreen = Boolean(target) && isShown(target, rect)

      if (target && rect.width && !onScreen && !scrolled) {
        scrolled = true
        target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
      }
      if (!onScreen) {
        box.style.visibility = 'hidden'
        ring.style.visibility = 'hidden'
        if (performance.now() - missingSince > 2500) setLost(true)
        return
      }
      missingSince = performance.now()
      setLost(false)

      const w = box.offsetWidth
      const h = box.offsetHeight
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      let side = step.side ?? (rect.bottom + gap + h + edge < height ? 'bottom' : 'top')
      if (side === 'left' && rect.left - gap - w < edge) side = 'bottom'

      let left
      let top
      if (side === 'left') {
        left = rect.left - gap - w
        top = clamp(centerY - h / 2, edge, height - h - edge)
        Object.assign(arrow.style, { left: `${w}px`, top: `${clamp(centerY - top - 8, 8, h - 24)}px`, width: '8px', height: '16px' })
        arrow.firstChild.style.transform = 'rotate(180deg)'
      } else {
        left = clamp(centerX - w / 2, edge, width - w - edge)
        top = side === 'bottom' ? rect.bottom + gap : rect.top - gap - h
        Object.assign(arrow.style, { left: `${clamp(centerX - left - 8, 12, w - 28)}px`, top: side === 'bottom' ? '-8px' : `${h}px`, width: '16px', height: '8px' })
        arrow.firstChild.style.transform = side === 'bottom' ? 'rotate(90deg)' : 'rotate(-90deg)'
      }
      Object.assign(box.style, { left: `${left}px`, top: `${top}px`, visibility: 'visible' })
      Object.assign(ring.style, {
        left: `${rect.left - 4}px`,
        top: `${rect.top - 4}px`,
        width: `${rect.width + 8}px`,
        height: `${rect.height + 8}px`,
        visibility: 'visible',
      })
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [step, done, attempt])

  if (done) return null

  const hintText = 'm-0 font-sans text-[13px] leading-[1.3] font-medium text-[#f5f5f5]'
  const quietButton = '!m-0 cursor-pointer !border-0 !bg-transparent !p-0 font-sans text-xs leading-none !text-[#f5f5f5]/80 underline hover:!text-[#f5f5f5]'

  if (!step) {
    return (
      <div key="finish" className="pointer-events-none fixed inset-x-0 top-1/2 z-[60] flex justify-center px-4">
        <button
          type="button"
          onClick={finish}
          className="pointer-events-auto !m-0 cursor-pointer !rounded-lg !border-0 !bg-accent !p-4 font-sans text-[13px] leading-[1.3] font-medium !text-[#f5f5f5] shadow-[0_8px_24px_rgba(30,30,30,0.2)]"
        >
          Complete onboarding
        </button>
      </div>
    )
  }

  return (
    <>
      <div
        key="ring"
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed z-[59] rounded-[10px] border-2 border-solid border-accent"
        style={{ visibility: 'hidden' }}
      />
      <div
        key="hint"
        ref={boxRef}
        role="dialog"
        aria-label="App tour"
        className="fixed z-[60] flex w-max max-w-[min(18rem,calc(100vw-24px))] flex-col gap-3 rounded-lg bg-accent p-4 shadow-[0_8px_24px_rgba(30,30,30,0.2)]"
        style={{ visibility: 'hidden', left: 0, top: 0 }}
      >
        <span ref={arrowRef} aria-hidden="true" className="absolute flex items-center justify-center">
          <img src={hintArrow} alt="" width="8" height="16" className="block max-w-none" />
        </span>
        <p aria-live="polite" className={hintText}>
          {step.text}
        </p>
        <div className="flex items-center gap-3">
          <span className="font-sans text-xs leading-none text-[#f5f5f5]/80">
            {progress.step + 1} of {tour.length}
          </span>
          <button type="button" onClick={finish} className={`${quietButton} ml-auto`}>
            Skip tour
          </button>
          {!step.waitForClick && (
            <button
              type="button"
              onClick={() => advance()}
              className="!m-0 cursor-pointer !rounded-md !border-0 !bg-[#f5f5f5] !px-3 !py-1.5 font-sans text-xs leading-none font-medium !text-ink"
            >
              Next
            </button>
          )}
        </div>
      </div>
      {lost && (
        <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
          <div role="status" className="flex items-center gap-4 rounded-lg bg-accent px-4 py-3 shadow-[0_8px_24px_rgba(30,30,30,0.2)]">
            <button type="button" onClick={resume} className={`${hintText} !m-0 cursor-pointer !border-0 !bg-transparent !p-0 !text-[#f5f5f5] underline`}>
              Continue the tour
            </button>
            <button type="button" onClick={finish} className={quietButton}>
              Skip tour
            </button>
          </div>
        </div>
      )}
    </>
  )
}
