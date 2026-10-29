import { useState } from 'react'
import JumpBackCard from '../components/JumpBackCard.jsx'
import LibraryPathCard from '../components/LibraryPathCard.jsx'
import PathFilters from '../components/PathFilters.jsx'
import PremiumBanner from '../components/PremiumBanner.jsx'
import { listRoadmaps } from '../user/data.js'
import DataState from '../user/DataState.jsx'
import useUserData from '../user/useUserData.js'

/**
 * First unfinished lesson, or a “not started” path when it has no lessons yet.
 * @param {object} roadmap
 */
function pathProgress(roadmap) {
  const lessons = (roadmap.lessons ?? []).filter((lesson) => lesson?.title)
  if (lessons.length === 0) return { label: 'Not started', lesson: null }
  const index = lessons.findIndex((lesson) => !lesson.completed)
  const current = index === -1 ? lessons.length - 1 : index
  return { label: `Step ${current + 1}/${lessons.length}`, lesson: lessons[current] }
}

/** Library home. An empty account shows the empty message. Paths replace that with the grid. */
export default function Home() {
  const { data, error, loading } = useUserData(listRoadmaps)
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const owned = data ?? []
  const needle = query.trim().toLowerCase()
  // Saved paths are not stored yet, so that chip stays an empty collection.
  const source = filter === 'saved' ? [] : owned
  const visible = source.filter((roadmap) => roadmap.title.toLowerCase().includes(needle))
  const shortcuts = owned.flatMap((roadmap) => {
    const progress = pathProgress(roadmap)
    if (!progress.lesson) return []
    return [{ roadmap, ...progress }]
  })
  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      {loading || error ? <DataState loading={loading} error={error} /> : null}
      {!loading && !error && shortcuts.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="m-0 font-sans text-label font-medium text-quiet">Jump back in</h2>
          <ul className="m-0 flex list-none gap-2 overflow-x-auto p-0">
            {shortcuts.map(({ roadmap, lesson, label }) => (
              <li key={roadmap.id}>
                <JumpBackCard
                  to={`/my-roadmap/${roadmap.id}/lesson/${lesson.id}`}
                  lessonTitle={lesson.title}
                  pathTitle={roadmap.title}
                  progress={label}
                />
              </li>
            ))}
          </ul>
        </section>
      )}
      {!loading && !error && (
        <section className="flex flex-col gap-4">
          <PathFilters value={filter} onChange={setFilter} query={query} onQuery={setQuery} />
          {visible.length === 0 ? (
            <p className="m-0 font-sans text-2xl leading-heading font-semibold text-quiet">Nothing here yet :)</p>
          ) : (
            <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0">
              {visible.map((roadmap) => (
                <li key={roadmap.id}>
                  <LibraryPathCard
                    to={`/my-roadmap/${roadmap.id}`}
                    title={roadmap.title}
                    progress={pathProgress(roadmap).label}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      <PremiumBanner />
    </div>
  )
}
