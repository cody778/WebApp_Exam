import { Link } from 'react-router'
import saveIcon from '../assets/home/save.svg'

/**
 * One path in the home grid. The cover is optional because saved paths may not have one yet.
 * @param {object} props
 * @param {string} props.to Path address.
 * @param {string} props.title
 * @param {string} props.progress Already formatted, such as “Not started”.
 * @param {string} [props.image] Cover address. Omitted paths keep the plain frame.
 * @param {boolean} [props.saved] Shows the bookmark when this path was saved from someone else.
 */
export default function LibraryPathCard({ to, title, progress, image, saved = false }) {
  return (
    <Link
      to={to}
      className="m-0 flex h-[152px] flex-col overflow-hidden rounded-sm border border-accent-muted bg-white p-0 text-inherit no-underline"
    >
      <span className="relative block h-24 w-full bg-accent-muted">
        {image ? (
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : null}
        {saved ? (
          <img src={saveIcon} alt="" width="24" height="24" className="absolute top-2 right-2 block max-w-none" />
        ) : null}
      </span>
      <span className="flex flex-col gap-1 p-2">
        <span className="truncate font-sans text-xs leading-[1.3] font-semibold text-ink">{title}</span>
        <span className="w-fit rounded bg-pill px-1.5 py-0.5 font-sans text-micro text-step">{progress}</span>
      </span>
    </Link>
  )
}
