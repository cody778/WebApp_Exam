import { useEffect, useState } from 'react'

const shimmer = 'relative overflow-hidden bg-[#e6e6e6] after:absolute after:inset-0 after:bg-linear-to-r after:from-transparent after:via-white/80 after:to-transparent after:content-[\'\'] motion-safe:after:animate-loader-shimmer motion-reduce:after:hidden'

function LoadingDots() {
  return <span className="ml-1 inline-flex gap-1" aria-hidden="true">
    {['[animation-delay:0ms]', '[animation-delay:160ms]', '[animation-delay:320ms]'].map(delay => (
      <span key={delay} className={`size-1 rounded-full bg-current motion-safe:animate-bounce ${delay}`} />
    ))}
  </span>
}

export default function PathGenerationLoading({ preview, complete, name, onComplete }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [progress, setProgress] = useState(0)
  const lessons = preview?.lessons ?? []
  const revealed = lessons.slice(0, visibleCount)
  const ready = complete && visibleCount === lessons.length
  // Gemini has no completion percentage. Keep this estimate below completion until the draft is ready.
  const target = complete ? 96 : Math.min(92, Math.max(
    88 * (1 - Math.exp(-elapsed / 150)),
    preview?.title ? 60 : 0,
    visibleCount ? 68 + visibleCount * 4 : 0,
  ))
  const percentage = ready ? 100 : Math.floor(progress)

  useEffect(() => {
    const timer = setInterval(() => setProgress(value => Math.max(value, Math.min(target, value + 0.2))), 100)
    return () => clearInterval(timer)
  }, [target])

  useEffect(() => {
    if (ready) return
    const timer = setInterval(() => setElapsed(seconds => seconds + 1), 1000)
    return () => clearInterval(timer)
  }, [ready])

  useEffect(() => {
    if (visibleCount < lessons.length) {
      const timer = setTimeout(() => setVisibleCount(count => count + 1), 550)
      return () => clearTimeout(timer)
    }
    if (complete) {
      const timer = setTimeout(onComplete, 800)
      return () => clearTimeout(timer)
    }
  }, [visibleCount, lessons.length, complete, onComplete])

  return (
    <section className="path-generation flex min-w-0 flex-col gap-8 pt-20 pb-8 font-sans text-ink sm:pt-24" aria-labelledby="generation-title">
      <div className="flex flex-col items-center gap-4 text-center" role="status" aria-live="polite">
        <div className="relative size-20" aria-hidden="true">
          <svg viewBox="0 0 80 80" className="block size-20 -rotate-90">
            <circle cx="40" cy="40" r="37" fill="none" stroke="#e5e5e5" strokeWidth="3.5" />
            <circle cx="40" cy="40" r="37" pathLength="100" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-700 ease-linear motion-reduce:transition-none"
              strokeDasharray="100" strokeDashoffset={100 - (ready ? 100 : progress)} />
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center text-sm font-semibold tabular-nums">
            {percentage}%
            {!ready && <span className="text-[9px] leading-3 font-normal text-quiet">estimated</span>}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <h1 id="generation-title" className="m-0 text-xl leading-7 font-semibold tracking-heading">{ready ? 'Your path is ready' : <>Creating your path<LoadingDots /></>}</h1>
          <p className="m-0 text-sm leading-5 text-[#92929a]">
            {ready ? 'Your lessons are ready to review.' : name ? `Putting your lessons together for ${name}` : 'Turning your video into lessons'}
          </p>
          <span className="sr-only">{revealed.length ? `${revealed.length} lessons ready.` : 'Reading your video.'}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e5e5e5] bg-[#f8f8f8] px-6 pt-6 pb-7">
        <span className="inline-block rounded bg-accent-muted px-2.5 py-1 text-xs leading-4 font-semibold">AI-GENERATED</span>
        {preview?.title ? <h2 className="m-0 mt-2 text-2xl leading-8 font-bold tracking-heading motion-safe:animate-loader-appear">{preview.title}</h2>
          : <div className={`mt-3 h-7 w-3/5 rounded ${shimmer}`} aria-hidden="true" />}
        {preview?.description ? <p className="m-0 mt-1 text-sm leading-5 text-[#92929a]">{preview.description}</p>
          : <p className="m-0 mt-2 text-sm leading-5 text-[#92929a]">Finding the key ideas<LoadingDots /></p>}

        <ol className="m-0 mt-5 grid list-none gap-4 p-0" aria-label="Lessons being created">
          {revealed.map((lesson, index) => <li key={index} className="flex items-center gap-3 motion-safe:animate-loader-appear">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">{index + 1}</span>
            <span className="text-sm leading-5">{lesson.title}</span>
          </li>)}
        </ol>
        {!ready && <div className={`grid gap-4 ${revealed.length ? 'mt-4' : ''}`} aria-hidden="true">
          {Array.from({ length: revealed.length ? 1 : 3 }, (_, index) => <div key={index} className="flex items-center gap-3">
            <span className={`size-6 shrink-0 rounded-full ${shimmer}`} />
            <span className={`h-3 rounded-full ${shimmer} ${index === 1 ? 'w-2/5' : 'w-3/5'}`} />
          </div>)}
        </div>}
      </div>
      <p className="m-0 text-center text-xs leading-5 text-[#92929a]">Longer videos can take a few minutes. Keep this page open.</p>
    </section>
  )
}
