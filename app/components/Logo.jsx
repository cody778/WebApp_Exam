import logoMark from '../assets/landing/logo-mark.svg'

/** Wordmark used in the landing header. The page title lives in the hero, so this stays a label. */
export default function Logo() {
  return (
    <div className="flex items-end gap-1">
      <img src={logoMark} alt="" width="29.3659" height="30.2917" />
      <p className="m-0 text-2xl leading-heading font-semibold tracking-heading text-ink">Pathify</p>
    </div>
  )
}
