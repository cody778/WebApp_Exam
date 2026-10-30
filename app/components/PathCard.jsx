import { useState } from 'react'
import { Link } from 'react-router'
import saveCount from '../assets/explore/save-count.svg'
import forkCount from '../assets/explore/fork-count.svg'

/** 1500 becomes "1.5 k". */
export function formatCount(count) {
  return count >= 1000 ? `${Number((count / 1000).toFixed(1))} k` : String(count)
}

/** 4.5 becomes "€4.50". */
export function formatPrice(price) {
  return `€${Number(price).toFixed(2)}`
}

const iconButton =
  '!m-0 flex size-7 cursor-pointer items-center justify-center rounded-full !border-0 !bg-transparent !p-0 text-ink [filter:drop-shadow(0_0_1px_white)_drop-shadow(0_0_1px_white)_drop-shadow(0_0_4px_white)] hover:!bg-white/60 focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60'

const smallButton = '!m-0 inline-flex shrink-0 cursor-pointer items-center !rounded-lg !border-0 !px-2 !py-1 text-h5 !no-underline'

/**
 * One path in a grid: Home, Explore, and Commissions.
 * @param {object} props
 * @param {string} props.title Path name.
 * @param {string} props.to Path page opened when the card is clicked. The buttons on the card stay separate.
 * @param {string | null} [props.cover] Cover image address. A plain cover shows without one.
 * @param {string} [props.status] Progress label, such as "Step 2/5". Replaces the author row.
 * @param {string} [props.author] Creator shown after "By".
 * @param {number} [props.saves] Save count.
 * @param {number} [props.forks] Fork count.
 * @param {boolean} [props.saved] Whether the user saved this path.
 * @param {() => void} [props.onToggleSave] Shows the save control. Unsaving asks first.
 * @param {() => void} [props.onFork] Shows the fork control.
 * @param {boolean} [props.forking] Disables the fork control while a copy is made.
 * @param {number | null} [props.price] Price of a paid path.
 * @param {string} [props.buyTo] Checkout page. Shows a Buy button for a paid path.
 * @param {string} [props.badge] Short label beside the status, such as "Public".
 * @param {number} [props.soldCount] Times this path sold.
 */
export default function PathCard({
  title,
  to,
  cover,
  status,
  author,
  saves = 0,
  forks = 0,
  saved = false,
  onToggleSave,
  onFork,
  forking = false,
  price,
  buyTo,
  badge,
  soldCount,
}) {
  const [confirming, setConfirming] = useState(false)

  function stop(event) {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <article className="relative flex h-36 flex-col overflow-hidden border border-[#bcbcbc] bg-white">
      <div className="relative flex min-h-0 w-full flex-1 flex-col items-end bg-[#dad6cd] px-[3px] py-[3px]">
        {cover ? <img src={cover} alt="" className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover" /> : null}
        {soldCount != null ? (
          <span className={`${smallButton} absolute bottom-1.5 left-1.5 z-20 cursor-default bg-accent text-on-brand`}>{soldCount} sold</span>
        ) : price && buyTo ? (
          <Link to={buyTo} className={`${smallButton} absolute bottom-1.5 left-1.5 z-20 !bg-accent !text-on-brand`}>
            Buy {formatPrice(price)}
          </Link>
        ) : null}
        {onToggleSave || onFork ? (
          <div className="relative z-20 flex flex-col">
            {onToggleSave ? (
              <button
                type="button"
                aria-pressed={saved}
                aria-label={saved ? `Unsave ${title}` : `Save ${title}`}
                onClick={(event) => {
                  stop(event)
                  if (saved) setConfirming(true)
                  else onToggleSave()
                }}
                className={iconButton}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`block ${saved ? 'text-accent' : 'text-ink'}`}>
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
            ) : null}
            {onFork ? (
              <button
                type="button"
                aria-label={`Fork ${title} to your paths`}
                disabled={forking}
                onClick={(event) => {
                  stop(event)
                  onFork()
                }}
                className={iconButton}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="block">
                  <path
                    d="M6.66667 9.33333V14.6667M6.66667 9.33333C8.13942 9.33333 9.33333 8.13942 9.33333 6.66667C9.33333 5.19391 8.13942 4 6.66667 4C5.19391 4 4 5.19391 4 6.66667C4 8.13942 5.19391 9.33333 6.66667 9.33333ZM6.66667 14.6667C6.66667 13.1939 7.86058 12 9.33333 12H14.6667C16.1394 12 17.3333 10.8061 17.3333 9.33333M6.66667 14.6667C8.13942 14.6667 9.33333 15.8605 9.33333 17.3333C9.33333 18.8061 8.13942 20 6.66667 20C5.19391 20 4 18.8061 4 17.3333C4 15.8605 5.19391 14.6667 6.66667 14.6667ZM17.3333 9.33333C18.8061 9.33333 20 8.13942 20 6.66667C20 5.19391 18.8061 4 17.3333 4C15.8605 4 14.6667 5.19391 14.6667 6.66667C14.6667 8.13942 15.8605 9.33333 17.3333 9.33333Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex items-end justify-between gap-2 p-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="m-0 truncate text-card-title text-black">
            <Link
              to={to}
              className="!m-0 !inline !rounded-none !border-0 !bg-transparent !p-0 font-[inherit] text-inherit no-underline before:absolute before:inset-0 before:z-10 before:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {title}
            </Link>
          </h2>
          {status ? (
            <p className="m-0 flex flex-wrap gap-1">
              <span className="inline-flex items-center rounded-lg bg-accent-muted px-2 py-1 text-h5 text-quiet">{status}</span>
              {badge ? <span className="inline-flex items-center rounded-lg border border-accent-muted px-2 py-1 text-h5 text-quiet">{badge}</span> : null}
            </p>
          ) : (
            <div className="flex min-w-0 items-center justify-between gap-2">
              <p className="m-0 min-w-0 truncate text-h5 text-ink">By {author}</p>
              <div className="flex shrink-0 items-center gap-1">
                <span className="flex items-center gap-0.5" aria-label={`Saved ${saves} ${saves === 1 ? 'time' : 'times'}`}>
                  <img src={saveCount} alt="" width="12" height="12" className="block" />
                  <span aria-hidden="true" className="text-h5 whitespace-nowrap text-ink">{formatCount(saves)}</span>
                </span>
                <span className="flex items-center gap-0.5" aria-label={`Forked ${forks} ${forks === 1 ? 'time' : 'times'}`}>
                  <img src={forkCount} alt="" width="12" height="12" className="block" />
                  <span aria-hidden="true" className="text-h5 whitespace-nowrap text-ink">{formatCount(forks)}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      {confirming ? (
        <div
          role="alertdialog"
          aria-label={`Unsave ${title}`}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white/95 p-3 text-center"
        >
          <p className="m-0 text-sm leading-[1.4] text-ink">Remove {title} from your saved paths?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="!m-0 cursor-pointer rounded-md border-0 bg-transparent !px-3 !py-1 font-sans text-sm text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => {
                setConfirming(false)
                onToggleSave()
              }}
              className="!m-0 cursor-pointer rounded-md border-0 bg-[#9e2020] !px-3 !py-1 font-sans text-sm text-on-brand"
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}
    </article>
  )
}
