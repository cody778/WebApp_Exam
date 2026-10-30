import { Link } from 'react-router'

/**
 * Current lesson in one path, shown in the horizontal “Jump back in” row.
 * @param {object} props
 * @param {string} props.to Lesson address.
 * @param {string} props.lessonTitle
 * @param {string} props.pathTitle
 * @param {string} props.progress Already formatted, such as “Step 2/6”.
 */
export default function JumpBackCard({ to, lessonTitle, pathTitle, progress }) {
  return (
    <Link
      to={to}
      className="m-0 flex h-[97px] w-36 shrink-0 flex-col gap-1 overflow-hidden rounded-lg border border-accent-muted bg-white p-2 text-inherit no-underline"
    >
      <span className="line-clamp-2 font-sans text-label font-semibold text-ink">{lessonTitle}</span>
      <span className="truncate font-sans text-base leading-body font-normal text-accent">{pathTitle}</span>
      <span className="font-sans text-micro text-step">{progress}</span>
    </Link>
  )
}
