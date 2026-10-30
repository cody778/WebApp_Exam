import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import AppNav, { GuestNav } from '../components/AppNav.jsx'
import { useNotice } from '../components/Notice.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import PathCard from '../components/PathCard.jsx'
import { useSavePrompt } from '../components/SaveSignInPrompt.jsx'
import { supabase } from '../user/client.js'
import { forkPathById, listExplorePaths, setPathSaved } from '../user/data.js'
import DataState from '../user/DataState.jsx'
import searchIcon from '../assets/explore/search.svg'

/** Public paths from Pathify and the community. Anyone can browse; saving, forking, and buying need an account. */
export default function Explore() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [paths, setPaths] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [forkingId, setForkingId] = useState(null)
  const { saveOrPrompt, prompt } = useSavePrompt()
  const { notice, show } = useNotice()
  const authPending = Boolean(supabase) && loading && !user
  const signedIn = !supabase || Boolean(user)
  const userId = user?.id ?? null
  const needle = query.trim().toLowerCase()

  useEffect(() => {
    if (authPending || !supabase) return
    let active = true
    listExplorePaths(userId).then(
      (data) => active && setPaths(data),
      (error) => active && setLoadError(error),
    )
    return () => {
      active = false
    }
  }, [authPending, userId])

  function update(id, changes) {
    setPaths((current) => current.map((path) => (path.id === id ? { ...path, ...changes(path) } : path)))
  }

  async function toggleSave(path) {
    const saved = !path.saved
    update(path.id, (current) => ({ saved, saves: current.saves + (saved ? 1 : -1) }))
    try {
      await setPathSaved(userId, path.id, saved)
      show(saved ? 'Saved to your paths' : 'Removed from saved paths')
    } catch {
      update(path.id, (current) => ({ saved: !saved, saves: current.saves + (saved ? -1 : 1) }))
      show(saved ? 'Could not save this path' : 'Could not unsave this path')
    }
  }

  async function fork(path) {
    if (path.price && !path.purchased) {
      show('Buy this path to fork it')
      return
    }
    setForkingId(path.id)
    try {
      const id = await forkPathById(userId, path.id)
      navigate(`/my-path/${id}`, { state: { notice: 'This is your copy. Unlock it to edit.' } })
    } catch {
      setForkingId(null)
      show('Could not copy this path')
    }
  }

  const visible = (paths ?? []).filter(
    (path) =>
      needle === '' ||
      path.title.toLowerCase().includes(needle) ||
      path.author.toLowerCase().includes(needle),
  )
  const tourCardId = visible.find((path) => path.owner_id !== userId)?.id

  return (
    <div className="explore-page mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 pt-0 pb-4 font-sans text-ink lg:max-w-6xl lg:px-8">
      {authPending ? (
        <header className="h-[4.5rem] shrink-0" aria-busy="true" />
      ) : signedIn ? (
        <AppNav />
      ) : (
        <GuestNav />
      )}
      <h1 className="m-0 font-display text-xl leading-heading font-medium tracking-heading text-ink">
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
      {!paths || loadError ? (
        <DataState loading={!loadError} error={loadError} />
      ) : visible.length === 0 ? (
        <p className="m-0 text-body text-ink">{paths.length ? 'No paths match that search.' : 'No public paths yet.'}</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 pt-2 pb-12 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((path) => {
            const own = path.owner_id === userId
            return (
              <li key={path.id} data-tour={path.id === tourCardId ? 'explore-card' : undefined}>
                <PathCard
                  title={path.title}
                  to={own ? `/my-path/${path.id}` : `/path/${path.id}`}
                  cover={path.cover_url}
                  author={own ? 'you' : path.author}
                  saves={path.saves}
                  forks={path.forks}
                  saved={path.saved}
                  onToggleSave={own ? undefined : () => saveOrPrompt(() => toggleSave(path))}
                  onFork={own ? undefined : () => saveOrPrompt(() => fork(path))}
                  forking={forkingId === path.id}
                  price={path.price}
                  buyTo={own || path.purchased ? undefined : signedIn ? `/premium?path=${path.id}` : '/sign-in'}
                />
              </li>
            )
          })}
        </ul>
      )}
      {prompt}
      {notice}
    </div>
  )
}
