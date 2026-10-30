/**
 * Full-width account action. Stays a button so it can submit a form.
 * @param {object} props
 * @param {import('react').ReactNode} props.children Visible label.
 * @param {boolean} [props.busy] Disables the control while a request is in flight.
 */
export default function SubmitButton({ children, busy = false }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="min-w-0 py-3 m-0 flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border-0 bg-accent px-6 font-sans text-base leading-none font-semibold text-on-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-70"
    >
      {children}
    </button>
  )
}
