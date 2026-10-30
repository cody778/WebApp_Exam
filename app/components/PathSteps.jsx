import iconNext from '../assets/public-path/icon-next.svg'

/**
 * "Step 2/6" with one bar segment per step.
 * @param {{ count: number, index: number, filled: (index: number) => boolean }} props
 */
export function StepProgress({ count, index, filled }) {
  return (
    <div className="flex items-center gap-2">
      <p className="m-0 shrink-0 text-sm leading-[1.4] font-normal whitespace-nowrap text-quiet">
        Step {index + 1}/{count}
      </p>
      <div className="flex min-w-0 flex-1 gap-px" aria-hidden="true">
        {Array.from({ length: count }, (_, segment) => (
          <span
            key={segment}
            className={`h-2 min-w-0 flex-1 first:rounded-l-lg last:rounded-r-lg ${filled(segment) ? 'bg-accent' : 'bg-[#cdcdcd]'}`}
          />
        ))}
      </div>
    </div>
  )
}

const navButton = '!m-0 flex min-w-0 cursor-pointer items-center gap-[9px] border-0 bg-transparent !p-0 text-sm leading-[1.4]'

/**
 * Previous and next step links. `end` replaces Next on the last step.
 * @param {{ previous?: { title: string, onClick: () => void }, next?: { title: string, onClick: () => void }, end?: import('react').ReactNode }} props
 */
export function StepNav({ previous, next, end }) {
  return (
    <div className="flex min-h-[27px] items-center justify-between gap-4">
      {previous ? (
        <button type="button" onClick={previous.onClick} className={`${navButton} text-left`}>
          <img src={iconNext} alt="" width="5" height="16" className="block max-w-none shrink-0" />
          <span className="min-w-0">
            <span className="block font-normal text-ink">Previous</span>
            <span className="block truncate font-normal text-[#b5b5b5]">{previous.title}</span>
          </span>
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button type="button" onClick={next.onClick} className={`${navButton} text-right`}>
          <span className="min-w-0">
            <span className="block font-normal text-ink">Next</span>
            <span className="block truncate font-normal text-[#b5b5b5]">{next.title}</span>
          </span>
          <img src={iconNext} alt="" width="5" height="16" className="block max-w-none shrink-0 rotate-180" />
        </button>
      ) : (
        end ?? <span />
      )}
    </div>
  )
}
