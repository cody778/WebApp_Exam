export const pathSections = ['Overview', 'Steps', 'Materials']

/**
 * Path section title. The open section shows its name; each other section is a bar that opens it.
 * @param {{ active: string, onSelect?: (index: number) => void }} props
 */
export default function PathSectionHeader({ active, onSelect, ...props }) {
  return (
    <div className="flex items-center gap-2 font-sans text-2xl leading-[1.2] text-ink" {...props}>
      {pathSections.map((label, index) =>
        label === active ? (
          <h2 key={label} className="m-0 min-w-0 flex-1 text-2xl leading-[1.2] font-semibold">
            | {label}
          </h2>
        ) : (
          <button
            key={label}
            type="button"
            aria-label={`Show ${label}`}
            onClick={() => onSelect?.(index)}
            className="!m-0 shrink-0 cursor-pointer rounded border-0 bg-transparent !px-1 !py-0 font-sans text-2xl leading-[1.2] font-normal whitespace-nowrap text-ink hover:text-accent"
          >
            |
          </button>
        ),
      )}
    </div>
  )
}
