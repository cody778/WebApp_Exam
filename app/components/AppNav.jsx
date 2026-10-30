import { Link, NavLink } from 'react-router'
import Logo from './Logo.jsx'
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
  return emailName || 'Account'
}

const chip = '!m-0 !inline-flex !h-10 !items-center !gap-1.5 !rounded-full !border-0 !no-underline font-sans text-sm leading-none whitespace-nowrap sm:!gap-2'
const restingChip = '!bg-accent-muted !text-ink'
const selectedChip = '!bg-accent !text-on-brand'
/** Home and Explore icons are drawn dark. This turns them light on the blue chip. */
const lightIcon = '[&_img]:brightness-0 [&_img]:invert'

/**
 * Top bar for signed-in screens. It stays fixed to the viewport.
 * Options are home, account, explore, and a new path. The current page uses the blue chip.
 * `notification` is reserved for the inbox control. Leave it empty until that control is ready.
 * @param {object} props
 * @param {import('react').ReactNode} [props.notification]
 */
export default function AppNav({ notification = null }) {
  const { user } = useAuth()
  const name = accountLabel(user)

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 bg-[#f7f4ee]/95"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
      >
        <div className="mx-auto flex h-[4.5rem] w-full min-w-0 max-w-6xl items-center gap-1.5 px-4 sm:gap-2 lg:px-8">
          <NavLink
            to="/home"
            end
            aria-label="Home"
            className={({ isActive }) =>
              `${chip} shrink-0 !px-2.5 sm:!px-4 ${isActive ? `${selectedChip} ${lightIcon}` : restingChip}`
            }
          >
            <img src={homeIcon} alt="" width="16" height="16" className="block max-w-none shrink-0" />
          </NavLink>
          <NavLink
            to="/account"
            end
            className={({ isActive }) =>
              `${chip} min-w-0 overflow-hidden !py-0 !pr-2.5 !pl-0 sm:!pr-4 ${isActive ? selectedChip : restingChip}`
            }
          >
            <img src={avatar} alt="" width="40" height="40" className="size-10 shrink-0 rounded-full object-cover" />
            <span className="min-w-0 truncate font-medium">{name}</span>
          </NavLink>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {notification}
            <NavLink
              to="/explore"
              data-tour="explore"
              className={({ isActive }) =>
                `${chip} !px-2.5 sm:!px-4 ${isActive ? `${selectedChip} ${lightIcon}` : restingChip}`
              }
            >
              <img src={exploreIcon} alt="" width="16" height="16" className="block max-w-none shrink-0" />
              Explore
            </NavLink>
            <NavLink
              to="/create-roadmap"
              data-tour="new-path"
              className={({ isActive }) =>
                `${chip} !px-2.5 !text-on-brand sm:!px-4 ${isActive ? '!bg-accent' : '!bg-ink'}`
              }
            >
              <img src={plusIcon} alt="" width="16" height="16" className="block max-w-none shrink-0" />
              New Path
            </NavLink>
          </div>
        </div>
      </header>
      <div className="h-[4.5rem] shrink-0" aria-hidden="true" />
    </>
  )
}

/** Top bar for signed-out visitors, matching AppNav: the logo leads home, then sign in and sign up. */
export function GuestNav() {
  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 bg-[#f7f4ee]/95"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
      >
        <div className="mx-auto flex h-[4.5rem] w-full min-w-0 max-w-6xl items-center gap-1.5 px-4 sm:gap-2 lg:px-8">
          <Link to="/" aria-label="Pathify home" className="!m-0 !inline-flex shrink-0 !border-0 !bg-transparent !p-0 !no-underline">
            <Logo variant="header" />
          </Link>
          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link to="/sign-in" className={`${chip} !px-3 sm:!px-4 ${restingChip}`}>
              Sign in
            </Link>
            <Link to="/sign-up" className={`${chip} !bg-ink !px-3 !text-on-brand sm:!px-4`}>
              Sign up
            </Link>
          </div>
        </div>
      </header>
      <div className="h-[4.5rem] shrink-0" aria-hidden="true" />
    </>
  )
}
