/**
 * Tells the reader that a confirmation message is waiting in their inbox.
 * @param {object} props
 * @param {string} props.email Address the verification message was sent to.
 */
export default function VerifyEmailNotice({ email }) {
  return (
    <p
      role="status"
      className="m-0 w-full rounded-lg border border-accent bg-white px-4 py-3 text-center font-sans text-sm leading-body font-normal text-ink"
    >
      We sent an email to <span className="font-semibold">{email}</span> so you can verify your email address.
      Open it, then sign in.
    </p>
  )
}
