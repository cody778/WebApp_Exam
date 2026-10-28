import { Link } from 'react-router'

/**
 * Primary brand button that navigates with the client router.
 * @param {object} props
 * @param {string} props.to Destination path.
 * @param {import('react').ReactNode} props.children Visible label.
 * @param {string} [props.className] Extra layout classes, such as width.
 */
export default function Button({ to, children, className = '' }) {
  return (
    <Link
      to={to}
      className={`m-0 flex h-10 items-center justify-center rounded-lg border-0 bg-brand px-4 py-0 text-base leading-none font-normal text-on-brand no-underline hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${className}`}
    >
      {children}
    </Link>
  )
}
