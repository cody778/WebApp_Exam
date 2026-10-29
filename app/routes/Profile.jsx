import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useSavePrompt } from '../components/SaveSignInPrompt.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import { usePremiumUnlocked } from '../user/paymentMethods.js'
import searchIcon from '../assets/explore/search.svg'
import iconNewPath from '../assets/explore/icon-new-path.svg'
import avatarAnna from '../assets/explore/avatar-anna.png'
import knitting from '../assets/explore/knitting.png'
import sewing from '../assets/explore/sewing.png'
import sashiko from '../assets/profile/sashiko.jpg'
import embroidery from '../assets/profile/embroidery.jpg'
import iconExploreInk from '../assets/profile/icon-explore-ink.svg'
import iconImage from '../assets/profile/icon-image.svg'
import iconMic from '../assets/profile/icon-mic.svg'
import iconArrowUp from '../assets/profile/icon-arrow-up.svg'
import iconPremium from '../assets/profile/icon-premium.svg'

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
  { title: 'Embroidery', status: 'Step 1/12', image: embroidery, imageWidth: 736, imageHeight: 981 },
  { title: 'Sewing', status: 'Not started', image: sewing, imageWidth: 1860, imageHeight: 850, save: true },
]

function accountName(user) {
  const fullName = String(user.user_metadata?.full_name || '').trim()
  if (fullName) return fullName.split(/\s+/)[0]
  const local = String(user.email || '').split('@')[0]
  return local || 'You'
}

function accountPhoto(user) {
  return user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
}

/** Shown only while Supabase is not configured, so this page can be reviewed from Explore. */
const previewAccount = {
  user_metadata: { full_name: 'Emma', avatar_url: avatarAnna },
}

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
      <p className="m-0 flex h-11 items-center font-sans text-base leading-[1.4] font-semibold text-quiet">{title}</p>
      <p className="m-0 font-sans text-base leading-[1.4] text-placeholder">{path}</p>
      <p className="m-0 text-h5 text-placeholder">{step}</p>
    </>
  )
  const className = 'flex h-[102px] w-[140px] shrink-0 snap-start flex-col border border-[#bcbcbc] bg-white p-2 no-underline'

  if (to) {
    return (
      <Link to={to} className={className}>
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
      <div className="flex flex-col gap-1 p-2">
        <h2 className="m-0 text-card-title whitespace-nowrap text-black">
          {path.to ? (
            <Link
              to={path.to}
              className="m-0 border-0 p-0 text-inherit no-underline before:absolute before:inset-0 before:z-10 before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
    </article>
  )
}

/** Profile opened from the signed-in name on Explore. */
export default function Profile() {
  const { user, loading } = useAuth()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [savedTitles, setSavedTitles] = useState(() => new Set())
  const { saveOrPrompt, prompt } = useSavePrompt()
  const premium = usePremiumUnlocked()
  const authPending = Boolean(supabase) && loading && !user
  const viewer = user ?? (supabase ? null : previewAccount)

  if (supabase && !loading && !user) {
    return <Navigate to="/sign-in" state={{ from: '/profile' }} replace />
  }

  const name = viewer ? accountName(viewer) : ''
  const photo = viewer ? accountPhoto(viewer) : ''
  const needle = query.trim().toLowerCase()
  const visible = paths.filter((path) => {
    if (filter === 'mine' && path.status === 'Not started') return false
    if (filter === 'saved' && !savedTitles.has(path.title)) return false
    return needle === '' || path.title.toLowerCase().includes(needle)
  })

  function toggleSave(title) {
    setSavedTitles((current) => {
      const next = new Set(current)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  return (
    <div className="profile-page mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 p-4 font-sans text-ink">
      {authPending ? (
        <header className="flex h-8 items-center justify-between gap-3" aria-busy="true" />
      ) : (
        <header className="flex items-center justify-between gap-3">
          <Link
            to="/profile"
            aria-current="page"
            className="m-0 flex h-8 min-w-0 items-center gap-2 rounded-lg bg-accent pr-3 no-underline"
          >
            {photo ? (
              <img src={photo} alt="" width="32" height="32" className="size-8 shrink-0 rounded-full object-cover" />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white font-display text-base leading-none font-medium text-ink"
              >
                {name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="truncate font-display text-base leading-none font-medium text-on-brand">{name}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <Link to="/explore" className={`${headerButton} border-transparent bg-accent-muted text-ink`}>
              <img src={iconExploreInk} alt="" width="16" height="16" className="block max-w-none shrink-0" />
              Explore
            </Link>
            <Link to="/create-roadmap" className={`${headerButton} border-ink bg-ink text-on-brand`}>
              <img src={iconNewPath} alt="" width="16" height="16" className="block max-w-none shrink-0" />
              New Path
            </Link>
          </div>
        </header>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="jump-back">
        <h1 id="jump-back" className="m-0 font-sans text-[15px] leading-none font-normal">
          Jump back in
        </h1>
        <div className="flex gap-2.5 overflow-x-auto overscroll-x-contain snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {shortcuts.map((shortcut) => (
            <ShortcutCard key={shortcut.title} {...shortcut} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-label="Your paths">
        <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <form
            className="m-0 shrink-0"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
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
          <div className="grid grid-cols-2 gap-4">
            {visible.map((path) => (
              <ProgressCard
                key={path.title}
                path={path}
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
      ) : (
        <section className="flex flex-col gap-3 rounded-2xl border border-accent-muted bg-accent-muted p-4" aria-label="Premium AI">
          <div className="flex items-center gap-3">
            <img src={iconPremium} alt="" width="40" height="40" className="block shrink-0" />
            <p className="m-0 font-sans text-sm leading-[1.4] text-accent">
              Upgrade to Premium to unlock the AI assistant and get personalized help with your paths.
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="m-0 font-sans text-sm font-semibold whitespace-nowrap text-ink">€5/month</p>
            <Link
              to="/premium"
              className="m-0 flex h-10 items-center rounded-full bg-ink px-4 font-sans text-sm leading-none font-semibold whitespace-nowrap text-on-brand no-underline"
            >
              Upgrade to Premium
            </Link>
          </div>
        </section>
      )}
      {prompt}
    </div>
  )
}
