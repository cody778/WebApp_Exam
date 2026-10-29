import { NavLink } from 'react-router'
import avatar from '../assets/home/avatar.jpg'
import exploreIcon from '../assets/home/explore.svg'
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

/**
 * Top bar for signed-in screens: account, explore, and a new path.
 * `notification` is reserved for the inbox control. Leave it empty until that control is ready.
 * @param {object} props
 * @param {import('react').ReactNode} [props.notification]
 */
export default function AppNav({ notification = null }) {
  const { user } = useAuth()

  return (
    <header className="flex items-center justify-between gap-2">
      <NavLink
        to="/profile"
        className="m-0 inline-flex h-10 items-center gap-2 overflow-hidden rounded-full border-0 bg-accent-muted pr-4 no-underline"
      >
        <img src={avatar} alt="" width="40" height="40" className="size-10 rounded-full object-cover" />
        <span className="font-sans text-sm font-medium whitespace-nowrap text-ink">{accountLabel(user)}</span>
      </NavLink>
      <div className="flex items-center gap-2">
        {notification}
        <NavLink
          to="/explore"
          className="m-0 inline-flex h-10 items-center gap-2 rounded-full border-0 bg-accent-muted px-4 no-underline"
        >
          <img src={exploreIcon} alt="" width="16" height="16" className="block max-w-none shrink-0" />
          <span className="font-sans text-sm font-normal whitespace-nowrap text-ink">Explore</span>
        </NavLink>
        <NavLink
          to="/create-roadmap"
          className="m-0 inline-flex h-10 items-center gap-2 rounded-full border-0 bg-ink px-4 no-underline"
        >
          <img src={plusIcon} alt="" width="16" height="16" className="block max-w-none shrink-0" />
          <span className="font-sans text-sm font-medium whitespace-nowrap text-white">New Path</span>
        </NavLink>
      </div>
    </header>
  )
}
