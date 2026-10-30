import { Link } from 'react-router'

export default function Button({ to, children, className = '', state }) {
  return (
    <Link
      to={to}
      state={state}
      className={`m-0 !flex h-10 items-center justify-center rounded-2xl border-0 bg-accent px-4 py-0 text-button text-on-brand no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
    >
      {children}
    </Link>
  )
}
