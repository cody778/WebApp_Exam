import { useEffect, useRef, useState } from 'react'
import PathSectionHeader, { pathSections } from './PathSectionHeader.jsx'

/**
 * Overview, Steps, and Materials side by side. Swipe between them, or tap the bars in each header.
 * @param {{ render: (label: string, showSection: (index: number) => void) => import('react').ReactNode }} props
 */
export default function PathSections({ render }) {
  const scrollerRef = useRef(null)
  const [active, setActive] = useState(0)

  // The row is as tall as its tallest section, so match the open one to keep what follows close.
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
        // Sections carry the page padding so the editor's gutter plus has room inside the scroller.
        <section
          key={label}
          aria-label={label}
          inert={active !== index}
          className="flex w-full min-w-full shrink-0 snap-start snap-always flex-col gap-4 px-6 lg:px-8"
        >
          <PathSectionHeader active={label} onSelect={showSection} />
          {render(label, showSection)}
        </section>
      ))}
    </div>
  )
}
