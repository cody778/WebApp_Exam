import { useState } from 'react'
import { Link } from 'react-router'
import AppNav from '../components/AppNav.jsx'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { toggleSavedTitle, useSavedTitles } from '../user/savedTitles.js'
import PathCard from '../components/PathCard.jsx'
import { useSavePrompt } from '../components/SaveSignInPrompt.jsx'
import { supabase } from '../user/client.js'
import searchIcon from '../assets/explore/search.svg'
import knitting from '../assets/explore/knitting.png'
import crochet from '../assets/explore/crochet.png'
import oleo from '../assets/explore/oleo.png'
import sewing from '../assets/explore/sewing.png'
import digital from '../assets/explore/digital.png'
import watercolors from '../assets/explore/watercolors.jpg'
import robotics from '../assets/explore/robotics.png'
import plants from '../assets/explore/plants.jpg'
import landscape from '../assets/explore/landscape.jpg'
import blender from '../assets/explore/blender.jpg'

const paths = [
  { title: 'Knitting', author: 'Pathify', image: knitting, imageWidth: 1860, imageHeight: 850 },
  { title: 'Crochet', author: 'Pathify', image: crochet, imageWidth: 1860, imageHeight: 850 },
  { title: 'Oleo Painting', author: 'Pathify', image: oleo, imageWidth: 1860, imageHeight: 850 },
  { title: 'Sewing for begginers', author: 'Pathify', image: sewing, imageWidth: 1860, imageHeight: 850 },
  { title: 'Digital drawing', author: 'Pathify', image: digital, imageWidth: 1860, imageHeight: 850 },
  { title: 'Watercolors', author: 'Omar Caloca', image: watercolors, imageWidth: 748, imageHeight: 512 },
  { title: 'Introduction to Robotics', author: 'Teofil Corad', image: robotics, imageWidth: 996, imageHeight: 598 },
  { title: 'Plant care for begginers', author: 'Barbara Borini', image: plants, imageWidth: 678, imageHeight: 452 },
  {
    title: 'Landscape photography',
    author: 'Omar Caloca',
    image: landscape,
    imageWidth: 2048,
    imageHeight: 1373,
    cropped: true,
  },
  { title: '3d modeling with Blender', author: 'Blender Guru', image: blender, imageWidth: 1280, imageHeight: 720 },
]

/** Public catalog reached from the landing explore card. */
export default function Explore() {
  const { user, loading } = useAuth()
  const [query, setQuery] = useState('')
  const savedTitles = useSavedTitles(user?.id ?? null)
  const { saveOrPrompt, prompt } = useSavePrompt()
  const authPending = Boolean(supabase) && loading && !user
  const signedIn = !supabase || Boolean(user)
  const needle = query.trim().toLowerCase()

  function toggleSave(title) {
    toggleSavedTitle(user?.id ?? null, title)
  }
  const visible = paths.filter(
    (path) =>
      needle === '' ||
      path.title.toLowerCase().includes(needle) ||
      path.author.toLowerCase().includes(needle),
  )

  return (
    <div className="explore-page box-border [&_*]:box-border mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-4 font-sans text-ink">
      {authPending ? (
        <header className="flex h-8 items-center justify-between gap-3" aria-busy="true" />
      ) : signedIn ? (
        <AppNav />
      ) : (
        <header className="flex items-center justify-between gap-3">
          <Link to="/" className="m-0 inline-flex rounded border-0 p-0 text-inherit no-underline">
            <Logo variant="header" />
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/sign-in"
              className="m-0 flex h-8 items-center justify-center rounded-lg border border-black bg-[#e3e3e3] p-2 font-display text-base leading-none font-medium whitespace-nowrap text-ink no-underline"
            >
              Sign in
            </Link>
            <Link
              to="/sign-up"
              className="m-0 flex h-8 items-center justify-center rounded-lg border border-brand bg-accent p-2 font-display text-base leading-none font-medium whitespace-nowrap text-on-brand no-underline"
            >
              Start your path
            </Link>
          </div>
        </header>
      )}
      <h1 className="m-0 mt-4 font-display text-xl leading-heading font-medium tracking-heading whitespace-nowrap text-ink">
        Explore paths from the community
      </h1>
      <form
        className="flex items-center gap-2 rounded-full border border-surface-muted bg-white px-4 py-3"
        onSubmit={(event) => event.preventDefault()}
      >
        <label htmlFor="path-search" className="sr-only">
          Search paths
        </label>
        <input
          id="path-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search paths"
          className="m-0 min-w-0 flex-1 border-0 bg-transparent p-0 text-button text-ink outline-none placeholder:text-[#b3b3b3]"
        />
        <img src={searchIcon} alt="" width="16" height="16" className="block shrink-0" />
      </form>
      {visible.length === 0 ? (
        <p className="m-0 text-body text-ink">No paths match that search.</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 pt-2 pb-12">
          {visible.map((path) => (
            <li key={path.title}>
              <PathCard
                {...path}
                saves="1.5 k"
                forks="208"
                saved={savedTitles.has(path.title)}
                onToggleSave={() => saveOrPrompt(() => toggleSave(path.title))}
                to={
                  path.title === 'Knitting'
                    ? signedIn && savedTitles.has('Knitting')
                      ? '/saved-path'
                      : '/public-path'
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
      {prompt}
    </div>
  )
}
