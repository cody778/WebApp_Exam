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
      className={`m-0 flex h-10 items-center justify-center rounded-2xl border-0 bg-accent px-4 py-0 text-button text-on-brand no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      {children}
    </Link>
  )
}
