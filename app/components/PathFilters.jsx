import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import closeIcon from '../assets/home/close.svg'
import searchIcon from '../assets/explore/search.svg'

const filters = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'My paths' },
  { id: 'saved', label: 'Saved paths' },
]

export default function PathFilters({ value, onChange, query, onQuery }) {
  const [open, setOpen] = useState(false)
  const [chipWidth, setChipWidth] = useState(0)
  const inputRef = useRef(null)
  const probeRef = useRef(null)

  useLayoutEffect(() => {
    const node = probeRef.current
    if (!node) return undefined
    const measure = () => setChipWidth(node.offsetWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true })
  }, [open])

  function closeSearch() {
    setOpen(false)
    onQuery('')
    inputRef.current?.blur()
  }

  return (
    <div className="relative h-10 w-full min-w-0">
      <div
        ref={probeRef}
        aria-hidden="true"
        className="invisible absolute flex h-10 w-max items-center rounded-full border border-surface-muted px-3 font-sans text-base leading-none md:gap-2 md:px-4"
      >
        <span className="hidden whitespace-nowrap md:inline">Search</span>
        <span className="size-4 shrink-0" />
      </div>
      <div
        aria-hidden={open || undefined}
        className={`flex h-10 items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${open ? 'pointer-events-none invisible' : ''}`}
        style={{ paddingRight: chipWidth + 8 }}
      >
        {filters.map((filter) => {
          const selected = filter.id === value
          return (
            <button
              key={filter.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(filter.id)}
              className={`!m-0 !inline-flex !h-10 shrink-0 !cursor-pointer !items-center !rounded-full !border-0 !px-4 !py-0 font-sans text-sm whitespace-nowrap ${
                selected ? '!bg-accent font-medium !text-on-brand' : '!bg-accent-muted font-normal !text-ink'
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>
      <form
        className={`absolute inset-y-0 right-0 z-10 !m-0 flex cursor-text items-center overflow-hidden rounded-full border border-surface-muted bg-white transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? 'gap-2 px-4' : 'justify-center gap-0 px-3 md:justify-start md:gap-2 md:px-4'
        }`}
        style={{ width: open ? '100%' : chipWidth || undefined }}
        onSubmit={(event) => event.preventDefault()}
        onClick={() => {
          if (!open) setOpen(true)
        }}
      >
        <label htmlFor="library-search" className="sr-only">
          Search
        </label>
        <input
          ref={inputRef}
          id="library-search"
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closeSearch()
          }}
          placeholder="Search"
          className={`!m-0 !border-0 !bg-transparent !p-0 font-sans text-base leading-none text-ink outline-none placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden ${
            open ? 'min-w-0 flex-1' : 'w-0 min-w-0 flex-none opacity-0 md:w-auto md:min-w-0 md:flex-1 md:opacity-100'
          }`}
        />
        <button
          type="button"
          aria-label="Close search"
          tabIndex={open ? 0 : -1}
          aria-hidden={open ? undefined : true}
          onClick={(event) => {
            if (!open) return
            event.stopPropagation()
            closeSearch()
          }}
          className="relative !m-0 !size-4 shrink-0 !border-0 !bg-transparent !p-0"
        >
          <img
            src={searchIcon}
            alt=""
            width="16"
            height="16"
            className={`absolute top-0 left-0 block size-4 max-w-none transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              open ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <img
            src={closeIcon}
            alt=""
            width="9.6"
            height="9.6"
            className={`absolute top-1/2 left-1/2 block max-w-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>
      </form>
    </div>
  )
}
