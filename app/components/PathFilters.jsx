import searchIcon from '../assets/explore/search.svg'

const filters = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'My paths' },
  { id: 'saved', label: 'Saved paths' },
]

/**
 * Library chips and search. Saved paths stay empty until that collection exists.
 * @param {object} props
 * @param {'all' | 'mine' | 'saved'} props.value Active chip.
 * @param {(id: 'all' | 'mine' | 'saved') => void} props.onChange
 * @param {string} props.query
 * @param {(query: string) => void} props.onQuery
 */
export default function PathFilters({ value, onChange, query, onQuery }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto">
      {filters.map((filter) => {
        const selected = filter.id === value
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(filter.id)}
            className={`m-0 inline-flex h-10 shrink-0 cursor-pointer items-center rounded-full border-0 px-4 font-sans text-sm whitespace-nowrap ${
              selected ? 'bg-accent font-medium text-on-brand' : 'bg-accent-muted font-normal text-ink'
            }`}
          >
            {filter.label}
          </button>
        )
      })}
      <form
        className="m-0 flex h-10 min-w-28 shrink-0 items-center gap-2 rounded-full border border-surface-muted bg-white px-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <label htmlFor="library-search" className="sr-only">
          Search
        </label>
        <input
          id="library-search"
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search"
          className="m-0 w-16 min-w-0 flex-1 border-0 bg-transparent p-0 font-sans text-base leading-none text-ink outline-none placeholder:text-placeholder"
        />
        <img src={searchIcon} alt="" width="16" height="16" className="block max-w-none shrink-0" />
      </form>
    </div>
  )
}
