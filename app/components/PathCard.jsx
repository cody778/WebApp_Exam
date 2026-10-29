import { Link } from 'react-router'
import saveCount from '../assets/explore/save-count.svg'
import forkCount from '../assets/explore/fork-count.svg'

/**
 * One community path in the explore grid.
 * @param {object} props
 * @param {string} props.title Path name.
 * @param {string} props.author Creator shown after “By”.
 * @param {string} props.saves Save count, already formatted.
 * @param {string} props.forks Fork count, already formatted.
 * @param {string} props.image Cover image address.
 * @param {number} props.imageWidth Intrinsic cover width.
 * @param {number} props.imageHeight Intrinsic cover height.
 * @param {boolean} [props.cropped] Use the frame’s offset crop instead of a centered cover.
 * @param {boolean} [props.saved] Whether this path is marked saved.
 * @param {() => void} [props.onToggleSave] Called when the corner save control is pressed.
 * @param {string} [props.to] Path opened when the card is clicked. The save control stays separate.
 */
export default function PathCard({
  title,
  author,
  saves,
  forks,
  image,
  imageWidth,
  imageHeight,
  cropped = false,
  saved = false,
  onToggleSave,
  to,
}) {
  return (
    <article className="relative flex h-[141px] flex-col gap-2 overflow-hidden border border-[#bcbcbc] bg-white">
      <div className="relative flex min-h-0 w-full flex-1 flex-col items-end bg-[#dad6cd] px-[3px] py-[5px]">
        {cropped ? (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <img
              src={image}
              alt=""
              width={imageWidth}
              height={imageHeight}
              className="absolute top-[-64.87%] left-[0.1%] h-[292.29%] w-full max-w-none"
            />
          </div>
        ) : (
          <img
            src={image}
            alt=""
            width={imageWidth}
            height={imageHeight}
            className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover"
          />
        )}
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? `Unsave ${title}` : `Save ${title}`}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onToggleSave?.()
          }}
          className="relative z-20 m-0 border-0 bg-transparent p-0 leading-none"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={`block ${saved ? 'text-accent' : 'text-ink'}`}
          >
            <path
              d="M6.5 6.9148C6.5 5.89462 6.5 5.38453 6.69983 4.99468C6.8756 4.65191 7.15605 4.37323 7.501 4.19857C7.89333 4 8.40667 4 9.43333 4H14.5667C15.5933 4 16.1067 4 16.499 4.19857C16.8439 4.37323 17.1244 4.65191 17.3002 4.99468C17.5 5.38453 17.5 5.89462 17.5 6.9148V19.034C17.5 19.4767 17.5 19.698 17.4074 19.8192C17.3674 19.8719 17.3164 19.9153 17.2578 19.9464C17.1992 19.9776 17.1346 19.9957 17.0682 19.9995C16.9152 20.0086 16.73 19.8857 16.3597 19.6406L12 16.7523L7.64033 19.6397C7.27 19.8857 7.08483 20.0086 6.93083 19.9995C6.86468 19.9956 6.80019 19.9774 6.74179 19.9462C6.6834 19.9151 6.63249 19.8717 6.59258 19.8192C6.5 19.698 6.5 19.4767 6.5 19.034V6.9148Z"
              fill={saved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-1 p-2">
        <h2 className="m-0 text-card-title whitespace-nowrap text-black">
          {to ? (
            <Link
              to={to}
              className="m-0 border-0 p-0 text-inherit no-underline before:absolute before:inset-0 before:z-10 before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <div className="flex items-center justify-between">
          <p className="m-0 text-h5 whitespace-nowrap text-ink">By {author}</p>
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-0.5">
              <img src={saveCount} alt="" width="12" height="12" className="block" />
              <span className="text-h5 whitespace-nowrap text-ink">{saves}</span>
            </span>
            <span className="flex items-center gap-0.5">
              <img src={forkCount} alt="" width="12" height="12" className="block" />
              <span className="text-h5 whitespace-nowrap text-ink">{forks}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
