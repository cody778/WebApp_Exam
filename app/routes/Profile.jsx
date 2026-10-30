import { useRef, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router'
import AppNav from '../components/AppNav.jsx'
import { useSavePrompt } from '../components/SaveSignInPrompt.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import { usePremiumUnlocked } from '../user/paymentMethods.js'
import { toggleSavedTitle, useSavedTitles } from '../user/savedTitles.js'
import searchIcon from '../assets/explore/search.svg'
import knitting from '../assets/explore/knitting.png'
import sewing from '../assets/explore/sewing.png'
import sashiko from '../assets/profile/sashiko.jpg'
import embroidery from '../assets/profile/embroidery.jpg'
import iconImage from '../assets/profile/icon-image.svg'
import iconMic from '../assets/profile/icon-mic.svg'
import iconArrowUp from '../assets/profile/icon-arrow-up.svg'
import PremiumBanner from '../components/PremiumBanner.jsx'

const headerButton =
  'm-0 flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg border p-2 font-display text-base leading-none font-medium whitespace-nowrap no-underline'

const filters = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'My paths' },
  { id: 'saved', label: 'Saved paths' },
]

const shortcuts = [
  { title: 'Transfer Your Pattern', path: 'Sashiko', step: 'Step 2/6' },
  { title: 'Cast on', path: 'Knitting', step: 'Step 1/8', to: '/public-path' },
  { title: 'Prepare Your Hoop', path: 'Embroidery', step: 'Step 1/12' },
]

const paths = [
  { title: 'Sashiko', status: 'Step 2/6', image: sashiko, imageWidth: 768, imageHeight: 1017 },
  {
    title: 'Knitting',
    status: 'Step 1/8',
    image: knitting,
    imageWidth: 1860,
    imageHeight: 850,
    save: true,
    to: '/public-path',
  },
  { title: 'Embroidery', status: 'Step 1/12', image: embroidery, imageWidth: 736, imageHeight: 981, savedPath: true, buy: true },
  { title: 'Sewing', status: 'Not started', image: sewing, imageWidth: 1860, imageHeight: 850, save: true },
]

function SaveMark({ saved, title, onToggleSave }) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Unsave ${title}` : `Save ${title}`}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onToggleSave()
      }}
      className="relative z-20 m-0 border-0 bg-transparent p-0 leading-none"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={`block ${saved ? 'text-accent' : 'text-ink'}`}
      >
        <path
          d="M6.5 6.9148C6.5 5.89462 6.5 5.38453 6.69983 4.99468C6.8756 4.65191 7.15605 4.37323 7.501 4.19857C7.89333 4 8.40667 4 9.43333 4H14.5667C15.5933 4 16.1067 4 16.499 4.19857C16.8439 4.37323 17.1244 4.65191 17.3002 4.99468C17.5 5.38453 17.5 5.89462 17.5 6.9148V19.034C17.5 19.4767 17.5 19.698 17.4074 19.8192C17.3674 19.8719 17.3164 19.9153 17.2578 19.9464C17.1992 19.9776 17.1346 19.9957 17.0682 19.9995C16.9152 20.0086 16.73 19.8857 16.3597 19.6406L12 16.7523L7.64033 19.6397C7.27 19.8857 7.08483 20.0086 6.93083 19.9995C6.86468 19.9956 6.80019 19.9774 6.74179 19.9462C6.6834 19.9151 6.63249 19.8717 6.59258 19.8192C6.5 19.698 6.5 19.4767 6.5 19.034V6.9148Z"
          fill={saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

function ShortcutCard({ title, path, step, to }) {
  const body = (
    <>
      <p className="m-0 flex min-h-11 items-start font-display text-base leading-[1.4] font-medium text-quiet">{title}</p>
      <p className="m-0 font-display text-base leading-[1.4] font-normal text-placeholder">{path}</p>
      <p className="m-0 text-h5 text-placeholder">{step}</p>
    </>
  )
  const className =
    'm-0 flex h-[102px] w-[140px] shrink-0 snap-start flex-col rounded-none border border-[#bcbcbc] bg-white p-2 no-underline'

  if (to) {
    return (
      <Link
        to={to}
        draggable={false}
        className="!m-0 !flex !h-[102px] !w-[140px] shrink-0 snap-start !flex-col !rounded-none !border !border-[#bcbcbc] !bg-white !p-2 !text-inherit !no-underline"
      >
        {body}
      </Link>
    )
  }

  return <article className={className}>{body}</article>
}

function ProgressCard({ path, saved, onToggleSave }) {
  return (
    <article className="relative flex h-36 flex-col gap-2 overflow-hidden border border-[#bcbcbc] bg-white">
      <div className="relative flex min-h-0 w-full flex-1 items-start justify-end bg-[#dad6cd] px-[3px] py-[5px]">
        <img
          src={path.image}
          alt=""
          width={path.imageWidth}
          height={path.imageHeight}
          className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover"
        />
        {path.save ? <SaveMark saved={saved} title={path.title} onToggleSave={onToggleSave} /> : null}
      </div>
      <div className="flex items-end justify-between gap-2 p-2">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="m-0 text-card-title whitespace-nowrap text-black">
            {path.to ? (
              <Link
                to={path.to}
                className="!m-0 !inline !rounded-none !border-0 !bg-transparent !p-0 font-[inherit] text-inherit no-underline before:absolute before:inset-0 before:z-10 before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {path.title}
              </Link>
            ) : (
              path.title
            )}
          </h2>
          <p className="m-0">
            <span className="inline-flex items-center rounded-lg bg-accent-muted px-2 py-1 text-h5 text-quiet">{path.status}</span>
          </p>
        </div>
        {path.buy ? (
          <Link
            to="/premium"
            className="relative z-20 !m-0 inline-flex shrink-0 items-center !rounded-lg !border-0 bg-accent !px-2 !py-1 text-h5 !text-on-brand no-underline"
          >
            Buy
          </Link>
        ) : null}
      </div>
    </article>
  )
}

/** Profile opened from the account chip. */
export default function Profile() {
  const { user, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const initialFilter = searchParams.get('filter')
  const [filter, setFilter] = useState(initialFilter === 'saved' || initialFilter === 'mine' ? initialFilter : 'all')
  const [query, setQuery] = useState('')
  const jumpBackRef = useRef(null)
  const jumpDragRef = useRef(null)
  const jumpDraggedRef = useRef(false)
  const savedTitles = useSavedTitles(user?.id ?? null)
  const { saveOrPrompt, prompt } = useSavePrompt()
  const premium = usePremiumUnlocked()
  const authPending = Boolean(supabase) && loading && !user
  const signedIn = Boolean(user) || !supabase

  if (supabase && !loading && !user) {
    return <Navigate to="/sign-in" state={{ from: '/profile' }} replace />
  }

  const needle = query.trim().toLowerCase()
  const visible = paths.filter((path) => {
    if (filter === 'mine' && (path.savedPath || path.status === 'Not started')) return false
    if (filter === 'saved' && !path.savedPath && !savedTitles.has(path.title)) return false
    return needle === '' || path.title.toLowerCase().includes(needle)
  })

  function toggleSave(title) {
    toggleSavedTitle(user?.id ?? null, title)
  }

  function onJumpPointerDown(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const scroller = jumpBackRef.current
    jumpDragRef.current = { pointerId: event.pointerId, startX: event.clientX, startScroll: scroller.scrollLeft, moved: false }
  }

  function onJumpPointerMove(event) {
    const drag = jumpDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const distance = event.clientX - drag.startX
    if (!drag.moved && Math.abs(distance) < 16) return
    if (!drag.moved) {
      drag.moved = true
      jumpDraggedRef.current = true
      const scroller = jumpBackRef.current
      try {
        scroller.setPointerCapture(event.pointerId)
      } catch {
        // Capture is only available while a real pointer is active.
      }
      scroller.style.scrollSnapType = 'none'
    }
    jumpBackRef.current.scrollLeft = drag.startScroll - distance
  }

  function onJumpPointerEnd(event) {
    const drag = jumpDragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    jumpDragRef.current = null
    const scroller = jumpBackRef.current
    if (scroller.hasPointerCapture?.(event.pointerId)) scroller.releasePointerCapture(event.pointerId)
    if (!drag.moved) return
    const first = scroller.firstElementChild
    const gap = Number.parseFloat(getComputedStyle(scroller).columnGap) || 0
    const step = (first?.getBoundingClientRect().width ?? 0) + gap
    const max = scroller.scrollWidth - scroller.clientWidth
    const left = step > 0 ? Math.max(0, Math.min(max, Math.round(scroller.scrollLeft / step) * step)) : scroller.scrollLeft
    scroller.style.scrollSnapType = ''
    scroller.scrollTo({ left, behavior: 'smooth' })
  }

  function onJumpClickCapture(event) {
    if (!jumpDraggedRef.current) return
    jumpDraggedRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div className="profile-page mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-4 pt-0 pb-4 font-sans text-ink lg:max-w-6xl lg:px-8">
      {authPending ? <header className="flex h-16 items-center" aria-busy="true" /> : <AppNav />}

      <section className="flex flex-col gap-3" aria-labelledby="jump-back">
        <h1 id="jump-back" className="m-0 font-display text-[15px] leading-none font-normal">
          Jump back in
        </h1>
        <div
          ref={jumpBackRef}
          onPointerDown={onJumpPointerDown}
          onPointerMove={onJumpPointerMove}
          onPointerUp={onJumpPointerEnd}
          onPointerCancel={onJumpPointerEnd}
          onClickCapture={onJumpClickCapture}
          className="flex w-full min-w-0 cursor-grab gap-2.5 snap-x overflow-x-auto overscroll-x-contain select-none [-ms-overflow-style:none] [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          {shortcuts.map((shortcut) => (
            <ShortcutCard
              key={shortcut.title}
              {...shortcut}
              to={
                shortcut.path === 'Sashiko' && signedIn
                  ? '/sashiko'
                  : shortcut.path === 'Knitting' && signedIn && savedTitles.has('Knitting')
                    ? '/saved-path'
                    : shortcut.to
              }
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-label="Your paths">
        <div className="flex w-full min-w-0 items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div role="radiogroup" aria-label="Path filters" className="flex shrink-0 items-center gap-2">
            {filters.map((item) => {
              const selected = filter === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setFilter(item.id)}
                  className={
                    selected
                      ? `${headerButton} border-brand bg-accent text-on-brand`
                      : `${headerButton} border-transparent bg-accent-muted text-ink`
                  }
                >
                  {item.label}
                </button>
              )
            })}
          </div>
          <form className="m-0 shrink-0" role="search" onSubmit={(event) => event.preventDefault()}>
            <label className="m-0 flex h-8 items-center gap-2 rounded-lg border border-surface-muted bg-white px-4">
              <span className="sr-only">Search paths</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="m-0 w-16 border-0 bg-transparent p-0 font-sans text-base leading-none text-ink outline-none placeholder:text-placeholder"
              />
              <img src={searchIcon} alt="" width="16" height="16" className="block shrink-0" />
            </label>
          </form>
        </div>

        {visible.length === 0 ? (
          <p className="m-0 font-sans text-sm leading-[1.4] text-quiet">
            {filter === 'saved' && needle === '' ? 'No saved paths yet.' : 'No paths match your search.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((path) => (
              <ProgressCard
                key={path.title}
                path={{
                  ...path,
                  to:
                    path.title === 'Sashiko' && signedIn
                      ? '/sashiko'
                      : path.title === 'Knitting' && signedIn && savedTitles.has('Knitting')
                        ? '/saved-path'
                        : path.to,
                }}
                saved={savedTitles.has(path.title)}
                onToggleSave={() => saveOrPrompt(() => toggleSave(path.title))}
              />
            ))}
          </div>
        )}
      </section>

      {premium ? (
        <form
          className="flex flex-col gap-6 rounded-[2rem] border border-surface-muted bg-white p-4"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="m-0">
            <span className="sr-only">Ask Pathify</span>
            <input
              name="prompt"
              placeholder="What do you want to learn/ build?"
              className="m-0 w-full border-0 bg-transparent p-0 font-sans text-base leading-[1.4] text-ink outline-none placeholder:text-placeholder"
            />
          </label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Add an image" className="m-0 flex size-9 items-center justify-center border-0 bg-transparent p-0">
                <img src={iconImage} alt="" width="20" height="20" className="block" />
              </button>
              <button type="button" aria-label="Use the microphone" className="m-0 flex size-9 items-center justify-center border-0 bg-transparent p-0">
                <img src={iconMic} alt="" width="20" height="20" className="block" />
              </button>
            </div>
            <button
              type="submit"
              aria-label="Send"
              disabled
              className="m-0 flex size-9 items-center justify-center rounded-full border-0 bg-surface-muted p-0"
            >
              <img src={iconArrowUp} alt="" width="20" height="20" className="block" />
            </button>
          </div>
        </form>
      ) : signedIn ? (
        <PremiumBanner />
      ) : null}
      {prompt}
    </div>
  )
}
