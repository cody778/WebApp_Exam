import { NavLink } from 'react-router'
import avatar from '../assets/home/avatar.jpg'
import exploreIcon from '../assets/home/explore.svg'
import homeIcon from '../assets/home/home.svg'
import plusIcon from '../assets/home/plus.svg'
import { useAuth } from '../user/AuthProvider.jsx'

/**
 * First name from the account, then the email name, then a plain fallback.
 * @param {object | null | undefined} user
 */
function accountLabel(user) {
  const fullName = user?.user_metadata?.full_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim().split(/\s+/)[0]
  const emailName = user?.email?.split('@')[0]
  return emailName || 'Anna'
}

const idleChip = '!m-0 !inline-flex !h-10 shrink-0 !items-center !rounded-full !border-0 !no-underline'
const selectedChip = 'bg-accent !text-on-brand'
const restingChip = 'bg-accent-muted text-ink'
/** Home and Explore icons are drawn dark. This turns them light on the blue chip. */
const lightIcon = '[&_img]:brightness-0 [&_img]:invert'

/**
 * Top bar for signed-in screens: home, account, explore, and a new path.
 * The item for the current page uses the blue selected chip.
 * `notification` is reserved for the inbox control. Leave it empty until that control is ready.
 * @param {object} props
 * @param {import('react').ReactNode} [props.notification]
 * @param {boolean} [props.showHome] Home chip. The signed-in explore and account frames leave it out.
 * @param {string} [props.avatarSrc] Account photo. Defaults to the shared portrait.
 */
export default function AppNav({ notification = null, showHome = true, avatarSrc = avatar }) {
  const { user } = useAuth()
  const label = showHome
    ? 'font-sans text-sm whitespace-nowrap'
    : 'font-sans text-[15px] leading-none font-normal whitespace-nowrap'

  return (
    <header className="flex items-center gap-2">
      {showHome ? (
        <NavLink
          to="/profile"
          end
          aria-label="Home"
          className={({ isActive }) =>
            `${idleChip} !justify-center !px-4 ${isActive ? `${selectedChip} ${lightIcon}` : restingChip}`
          }
        >
          <img src={homeIcon} alt="" width="16" height="16" className="block max-w-none shrink-0" />
        </NavLink>
      ) : null}
      <NavLink
        to="/account"
        end
        className={({ isActive }) => `${idleChip} !gap-2 overflow-hidden !py-0 !pr-4 !pl-0 ${isActive ? selectedChip : restingChip}`}
      >
        <img src={avatarSrc} alt="" width="40" height="40" className="size-10 rounded-full object-cover" />
        <span className={`${label} ${showHome ? 'font-medium' : ''}`}>{accountLabel(user)}</span>
      </NavLink>
      <div className="ml-auto flex items-center gap-2">
        {notification}
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `${idleChip} !gap-2 !px-4 ${isActive ? `${selectedChip} ${lightIcon}` : restingChip}`
          }
        >
          <img src={exploreIcon} alt="" width="16" height="16" className="block max-w-none shrink-0" />
          <span className={label}>Explore</span>
        </NavLink>
        <NavLink
          to="/create-roadmap"
          className={({ isActive }) =>
            `${idleChip} !gap-2 !px-4 !text-on-brand ${isActive ? 'bg-accent' : '!bg-ink'}`
          }
        >
          <img src={plusIcon} alt="" width="16" height="16" className="block max-w-none shrink-0" />
          <span className={`${label} ${showHome ? 'font-medium' : ''}`}>New Path</span>
        </NavLink>
      </div>
    </header>
  )
}
