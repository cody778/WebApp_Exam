import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import AppNav from '../components/AppNav.jsx'
import PathCard from '../components/PathCard.jsx'
import { useSavePrompt } from '../components/SaveSignInPrompt.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import { toggleSavedTitle, useSavedTitles } from '../user/savedTitles.js'
import anna from '../assets/explore/avatar-anna.png'
import searchIcon from '../assets/explore/search.svg'
import plants from '../assets/explore/plants.jpg'
import landscape from '../assets/explore/landscape.jpg'
import blender from '../assets/explore/blender.jpg'
import sashiko from '../assets/profile/sashiko.jpg'
import watercolors from '../assets/explore/watercolors.jpg'
import robotics from '../assets/explore/robotics.png'
import embroidery from '../assets/profile/embroidery.jpg'

const filters = [
  { id: 'listed', label: 'Listed' },
  { id: 'sold', label: 'Sold' },
  { id: 'purchased', label: 'Purchased' },
]

const commissions = [
  { title: 'Plant care for begginers', listing: 'sold', soldCount: 20, progress: 'Not started', image: plants, imageWidth: 678, imageHeight: 452 },
  { title: 'Landscape photography', listing: 'listed', progress: 'Not started', image: landscape, imageWidth: 2048, imageHeight: 1373, cropped: true },
  { title: '3d modeling with Blender', listing: 'listed', progress: 'Step 4/10', image: blender, imageWidth: 1280, imageHeight: 720 },
  { title: 'Sashiko', listing: 'listed', progress: 'Step 2/6', image: sashiko, imageWidth: 768, imageHeight: 1017 },
  { title: 'Watercolors', listing: 'purchased', progress: 'Not started', image: watercolors, imageWidth: 748, imageHeight: 512 },
  { title: 'Introduction to Robotics', listing: 'purchased', progress: 'Step 1/12', image: robotics, imageWidth: 996, imageHeight: 598 },
  { title: 'Embroidery', listing: 'purchased', progress: 'Step 1/12', image: embroidery, imageWidth: 736, imageHeight: 981 },
]

/** Paths listed, sold, and purchased, opened from My commissions. */
export default function Commissions() {
  const { user, loading } = useAuth()
  const authPending = Boolean(supabase) && loading && !user
  const savedTitles = useSavedTitles(user?.id ?? null)
  const { saveOrPrompt, prompt } = useSavePrompt()
  const [status, setStatus] = useState('sold')
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const visible = commissions.filter(
    (item) => item.listing === status && (needle === '' || item.title.toLowerCase().includes(needle)),
  )

  function toggleSave(title) {
    toggleSavedTitle(user?.id ?? null, title)
  }

  if (supabase && !loading && !user) {
    return <Navigate to="/sign-in" state={{ from: '/commissions' }} replace />
  }

  return (
    <div className="commissions-page mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-2 pt-4 pb-14 font-sans text-ink">
      {authPending ? <header className="flex h-10 items-center" aria-busy="true" /> : <AppNav showHome={false} avatarSrc={anna} />}

      <h1 className="font-display text-xl leading-heading font-medium tracking-heading" style={{ margin: '2rem 0 0' }}>
        <Link to="/account" className="!m-0 !inline !border-0 !bg-transparent !p-0 !text-inherit !no-underline">
          {'My Account >'}
        </Link>
        {' '}
        <span className="underline">My Commissions</span>
      </h1>

      <div className="mt-4 flex items-center gap-2 overflow-x-auto" role="group" aria-label="Commission filters">
        {filters.map((filter) => {
          const selected = status === filter.id
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setStatus(filter.id)}
              className={`!m-0 !inline-flex !h-10 shrink-0 !items-center !rounded-full !border-0 !px-4 !py-0 ${selected ? '!bg-accent !text-on-brand' : '!bg-accent-muted !text-ink'}`}
            >
              <span className="font-sans leading-none whitespace-nowrap" style={{ fontSize: 15 }}>
                {filter.label}
              </span>
            </button>
          )
        })}
        <label className="!m-0 inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-surface-muted bg-white px-4">
          <span className="sr-only">Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            className="m-0 w-16 border-0 bg-transparent p-0 font-sans text-base leading-none text-ink outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden"
          />
          <img src={searchIcon} alt="" width="16" height="16" className="block size-4 max-w-none shrink-0" />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="m-0 mt-6 font-sans text-sm leading-body text-quiet">No commissions match that search.</p>
      ) : (
        <ul className="m-0 mt-6 grid list-none grid-cols-2 gap-4 p-0">
          {visible.map((item) => (
            <li key={item.title}>
              <PathCard
                title={item.title}
                image={item.image}
                imageWidth={item.imageWidth}
                imageHeight={item.imageHeight}
                cropped={item.cropped}
                status={item.progress}
                soldCount={item.listing === 'sold' ? item.soldCount : undefined}
                saved={savedTitles.has(item.title)}
                onToggleSave={() => saveOrPrompt(() => toggleSave(item.title))}
                to={item.title === 'Sashiko' ? '/sashiko' : undefined}
              />
            </li>
          ))}
        </ul>
      )}
      {prompt}
    </div>
  )
}
