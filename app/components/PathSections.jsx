import { useEffect, useRef, useState } from 'react'
import PathSectionHeader, { pathSections } from './PathSectionHeader.jsx'

// The three sections share a horizontal scroller and can be swiped between.
export default function PathSections({ render, initial = 0 }) {
  const scrollerRef = useRef(null)
  const [active, setActive] = useState(initial)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (scroller && initial) scroller.scrollLeft = initial * scroller.clientWidth
  }, [initial])

  // Match the row to the open section so content below does not jump.
  useEffect(() => {
    const scroller = scrollerRef.current
    const current = scroller?.children[active]
    if (!current) return
    const fit = () => {
      scroller.style.height = `${current.offsetHeight}px`
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(current)
    return () => observer.disconnect()
  }, [active])

  function showSection(index) {
    const scroller = scrollerRef.current
    if (scroller) scroller.scrollTo({ left: index * scroller.clientWidth, behavior: 'smooth' })
  }

  function onScroll() {
    const scroller = scrollerRef.current
    if (!scroller.clientWidth) return
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth)
    setActive(Math.max(0, Math.min(pathSections.length - 1, index)))
  }

  return (
    <div
      ref={scrollerRef}
      onScroll={onScroll}
      className="-mx-6 flex min-w-0 snap-x snap-mandatory items-start overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] lg:-mx-8 [&::-webkit-scrollbar]:hidden"
    >
      {pathSections.map((label, index) => (
        // Inner padding leaves space for the editor's add button.
        <section
          key={label}
          aria-label={label}
          inert={active !== index}
          className="flex w-full min-w-full shrink-0 snap-start snap-always flex-col gap-4 px-6 lg:px-8"
        >
          <PathSectionHeader active={label} onSelect={showSection} data-tour={index === 0 ? 'path-sections' : undefined} />
          {render(label, showSection)}
        </section>
      ))}
    </div>
  )
}
