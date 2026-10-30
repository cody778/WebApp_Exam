import checkIcon from '../assets/sign-in/check.svg'

export default function RememberMe() {
  return (
    <label className="flex items-center gap-3 font-sans text-base leading-body font-normal text-ink">
      <input type="checkbox" name="remember" defaultChecked className="peer sr-only" />
      <span
        aria-hidden="true"
        className="flex size-4 shrink-0 items-center justify-center overflow-hidden rounded bg-white ring-1 ring-surface-muted ring-inset peer-checked:bg-brand peer-checked:ring-brand peer-checked:[&_img]:visible peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2"
      >
        <img src={checkIcon} alt="" width="16" height="16" className="invisible block max-w-none" />
      </span>
      Keep me logged in.
    </label>
  )
}
