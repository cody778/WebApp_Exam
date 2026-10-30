import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router'
import AppNav from '../components/AppNav.jsx'
import PathCard, { formatPrice } from '../components/PathCard.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import { listCommissions } from '../user/data.js'
import DataState from '../user/DataState.jsx'
import searchIcon from '../assets/explore/search.svg'

const filters = [
  { id: 'listed', label: 'Listed' },
  { id: 'sold', label: 'Sold' },
  { id: 'purchased', label: 'Purchased' },
]

/**
 * Status pill for a bought path: "Not started" until a step is done, then the first unfinished step, then "Completed".
 * @param {{ lessons: Array<{ title?: string, completed?: boolean }> }} path
 */
function progress(path) {
  const lessons = path.lessons.filter((lesson) => lesson?.title)
  const index = lessons.findIndex((lesson) => !lesson.completed)
  if (!lessons.length || !lessons.some((lesson) => lesson.completed)) return 'Not started'
  return index === -1 ? 'Completed' : `Step ${index + 1}/${lessons.length}`
}

/** Paid paths the user listed, how often they sold, and the paths the user bought. */
export default function Commissions() {
  const { user, loading } = useAuth()
  const authPending = Boolean(supabase) && loading && !user
  const [status, setStatus] = useState('listed')
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const needle = query.trim().toLowerCase()

  // Loads listed and purchased paths once the user is known. `active` drops results that arrive after leaving the page.
  useEffect(() => {
    if (!user) return
    let active = true
    listCommissions(user.id).then(
      (result) => active && setData(result),
      (error) => active && setLoadError(error),
    )
    return () => {
      active = false
    }
  }, [user])

  // Purchased shows progress. Listed shows every paid path with its price. Sold keeps only paths with sales and adds the sold badge.
  const items =
    status === 'purchased'
      ? (data?.purchased ?? []).map((path) => ({ ...path, to: `/path/${path.id}`, label: progress(path) }))
      : (data?.listed ?? [])
          .filter((path) => status === 'listed' || path.sales > 0)
          .map((path) => ({
            ...path,
            to: `/my-path/${path.id}`,
            label: `${formatPrice(path.price)}${path.is_published ? '' : ', private'}`,
            soldCount: status === 'sold' ? path.sales : undefined,
          }))
  const visible = items.filter((item) => needle === '' || item.title.toLowerCase().includes(needle))

  if (supabase && !loading && !user) {
    return <Navigate to="/sign-in" state={{ from: '/commissions' }} replace />
  }

  return (
    <div className="commissions-page mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-0 pb-14 font-sans text-ink lg:max-w-6xl lg:px-8">
      {authPending ? <header className="flex h-16 items-center" aria-busy="true" /> : <AppNav />}

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

      {!data || loadError ? (
        <div className="mt-6">
          <DataState loading={!loadError} error={loadError} />
        </div>
      ) : visible.length === 0 ? (
        <p className="m-0 mt-6 font-sans text-sm leading-body text-quiet">
          {needle
            ? 'No commissions match that search.'
            : status === 'purchased'
              ? 'You have not bought any paths yet.'
              : status === 'sold'
                ? 'None of your paths have sold yet.'
                : 'You have no paid paths listed yet.'}
        </p>
      ) : (
        <ul className="m-0 mt-6 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((item) => (
            <li key={item.id}>
              <PathCard title={item.title} to={item.to} cover={item.cover_url} status={item.label} soldCount={item.soldCount} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
