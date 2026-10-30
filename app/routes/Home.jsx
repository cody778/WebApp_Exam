import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import PathCard from '../components/PathCard.jsx'
import PathFilters from '../components/PathFilters.jsx'
import ShortcutCard from '../components/ShortcutCard.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { listProjects, listRoadmaps, listSavedRoadmaps, setPathSaved } from '../user/data.js'
import useUserData from '../user/useUserData.js'
import DataState from '../user/DataState.jsx'
import { usePremiumUnlocked } from '../user/paymentMethods.js'
import iconArrowUp from '../assets/profile/icon-arrow-up.svg'
import plusIcon from '../assets/home/plus.svg'
import exploreIcon from '../assets/home/explore.svg'
import PremiumBanner from '../components/PremiumBanner.jsx'

function pathProgress(path) {
  const lessons = (path.lessons ?? []).filter(lesson => lesson?.title)
  if (lessons.length === 0) return { label: 'Not started', lesson: null }
  const index = lessons.findIndex(lesson => !lesson.completed)
  if (index === -1) return { label: 'Completed', lesson: lessons.at(-1) }
  if (!lessons.some(lesson => lesson.completed)) return { label: 'Not started', lesson: lessons[0] }
  return { label: `Step ${index + 1}/${lessons.length}`, lesson: lessons[index] }
}

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, error, loading } = useUserData(listRoadmaps)
  const projects = useUserData(listProjects)
  const savedPaths = useUserData(listSavedRoadmaps)
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedFilter = searchParams.get('filter')
  const filter = requestedFilter === 'saved' || requestedFilter === 'mine' ? requestedFilter : 'all'
  const [query, setQuery] = useState('')
  const [prompt, setPrompt] = useState('')
  const [unsaved, setUnsaved] = useState(() => new Set())
  const premium = usePremiumUnlocked()
  const owned = (data ?? []).map(path => ({ ...path, owned: true, to: `/my-path/${path.id}` }))
  const saved = (savedPaths.data ?? [])
    .filter(path => path.owner_id !== user.id && !unsaved.has(path.id))
    .map(path => ({ ...path, owned: false, to: `/path/${path.id}` }))
  const shortcuts = [...owned, ...saved].flatMap(path => {
    const { lesson, label } = pathProgress(path)
    return lesson && !lesson.completed ? [{ id: path.id, title: lesson.title, path: path.title, step: label, to: `${path.to}?step=${lesson.id}` }] : []
  })
  const needle = query.trim().toLowerCase()
  const visible = [...owned, ...saved].filter(path => {
    if (filter === 'mine' && !path.owned) return false
    if (filter === 'saved' && path.owned) return false
    return needle === '' || path.title.toLowerCase().includes(needle)
  })

  function setFilter(value) {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      if (value === 'all') next.delete('filter')
      else next.set('filter', value)
      return next
    }, { replace: true })
  }

  async function unsave(path) {
    setUnsaved(current => new Set(current).add(path.id))
    try {
      await setPathSaved(user.id, path.id, false)
    } catch {
      setUnsaved(current => {
        const next = new Set(current)
        next.delete(path.id)
        return next
      })
    }
  }

  function createFromPrompt(event) {
    event.preventDefault()
    const value = prompt.trim()
    if (!value) return
    navigate('/create-path/generate', { state: { prompt: value } })
  }

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-8">
      {loading || error ? <DataState loading={loading} error={error} /> : null}

      <section className="flex flex-col gap-3" aria-labelledby="jump-back">
        <h1 id="jump-back" className="m-0 font-display text-[15px] leading-none font-normal">
          Jump back in
        </h1>
        <div className="flex w-full min-w-0 justify-start gap-2 overflow-x-auto overscroll-x-contain [overflow-anchor:none] [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {shortcuts.map((shortcut) => (
            <ShortcutCard key={shortcut.id} {...shortcut} />
          ))}
        </div>
        {shortcuts.length === 0 && !loading && !savedPaths.loading ? (
          <p className="m-0 font-sans text-sm leading-[1.4] text-quiet">
            Nothing to continue yet. <Link to="/explore" className="!m-0 !inline !border-0 !bg-transparent !p-0 !text-accent !underline">Explore paths</Link> or create your own.
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-4" aria-label="Your paths">
        <PathFilters value={filter} onChange={setFilter} query={query} onQuery={setQuery} />

        {visible.length === 0 ? (
          <p className="m-0 font-sans text-sm leading-[1.4] text-quiet">
            {filter === 'saved' && needle === '' ? 'No saved paths yet.' : 'No paths match your search.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((path) => (
              <PathCard
                key={path.id}
                title={path.title}
                to={path.to}
                cover={path.cover_url}
                status={pathProgress(path).label}
                badge={path.owned ? (path.is_published ? 'Public' : 'Private') : undefined}
                saved={!path.owned}
                onToggleSave={path.owned ? undefined : () => unsave(path)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="home-projects">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="home-projects" className="m-0 font-display text-[15px] leading-none font-normal">Your projects</h2>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Link className="!m-0 !inline-flex !h-10 items-center justify-center gap-2 !rounded-full !border-0 !bg-ink !px-3 !py-0 font-sans text-sm leading-none whitespace-nowrap !text-on-brand !no-underline hover:!bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:!px-4" to="/profile/projects/new">
              <img src={plusIcon} alt="" width="16" height="16" className="hidden shrink-0 sm:block" />
              Create project
            </Link>
            <Link className="!m-0 !inline-flex !h-10 items-center justify-center gap-2 !rounded-full !border-0 !bg-accent-muted !px-3 !py-0 font-sans text-sm leading-none whitespace-nowrap !text-ink !no-underline hover:!bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:!px-4" to="/profile/projects">
              <img src={exploreIcon} alt="" width="16" height="16" className="hidden shrink-0 sm:block" />
              Browse projects
            </Link>
          </div>
        </div>
        {projects.loading || projects.error ? <DataState loading={projects.loading} error={projects.error} /> : projects.data.length === 0 ? (
          <p className="m-0 font-sans text-sm leading-[1.4] text-quiet">No projects yet. Create your first one.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {projects.data.map(project => (
              <PathCard key={project.id} title={project.title} to={`/profile/projects/${project.id}`} status="My project" />
            ))}
          </div>
        )}
      </section>

      {premium ? (
        <form
          className="flex items-center gap-3 rounded-full border border-surface-muted bg-white p-2 pl-5"
          onSubmit={createFromPrompt}
        >
          <label className="m-0 min-w-0 flex-1">
            <span className="sr-only">Create a path</span>
            <input
              name="prompt"
              value={prompt}
              maxLength={2000}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="What do you want to learn or build?"
              className="m-0 w-full border-0 bg-transparent p-0 font-sans text-base leading-[1.4] text-ink outline-none placeholder:text-placeholder"
            />
          </label>
          <button
            type="submit"
            aria-label="Create path"
            disabled={!prompt.trim()}
            className="group !m-0 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-ink !p-0 disabled:cursor-default disabled:bg-surface-muted"
          >
            <img src={iconArrowUp} alt="" width="20" height="20" className="block brightness-0 invert group-disabled:brightness-100 group-disabled:invert-0" />
          </button>
        </form>
      ) : <PremiumBanner />}
    </div>
  )
}
