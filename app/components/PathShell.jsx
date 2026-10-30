import { Link } from 'react-router'

/**
 * Full name from the account, then the email name.
 * @param {object | null | undefined} user
 */
export function authorName(user) {
  const fullName = user?.user_metadata?.full_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  const emailName = user?.email?.split('@')[0]
  return emailName || 'you'
}

/**
 * Page frame shared by creating, viewing, and editing a path: the full-width cover, then a breadcrumb row.
 * @param {{ crumb: { to: string, label: string }, current: string, cover?: string | null, coverActions?: import('react').ReactNode, headerAction?: import('react').ReactNode, children: import('react').ReactNode }} props
 */
export default function PathShell({ crumb, current, cover, coverActions, headerAction, children }) {
  return (
    <div className="path-page -mx-4 -mt-6 -mb-6 flex min-h-full flex-1 flex-col bg-white font-sans text-ink lg:mx-0">
      <div className="relative h-40 shrink-0 bg-[#dad6cd]">
        {cover ? <img src={cover} alt="" className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover" /> : null}
        {coverActions && (
          <div className="relative mx-auto flex h-full w-full max-w-md justify-end px-4 py-4 lg:max-w-6xl lg:px-8">
            <div className="relative flex h-fit flex-col gap-2 rounded-full bg-ink/35 p-1.5">{coverActions}</div>
          </div>
        )}
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-4 pb-12 lg:max-w-6xl lg:px-8">
        <div className="flex min-h-5 items-center justify-between gap-4">
          <p className="m-0 min-w-0 truncate text-[13px] leading-normal font-normal text-quiet">
            <Link to={crumb.to} className="!m-0 !inline !border-0 !bg-transparent !p-0 !text-[13px] !leading-normal !font-normal !text-quiet !underline">
              {crumb.label}
            </Link>
            <span> › {current}</span>
          </p>
          {headerAction}
        </div>
        {children}
      </div>
    </div>
  )
}
