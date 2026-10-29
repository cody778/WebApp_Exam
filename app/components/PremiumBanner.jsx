import { useNavigate } from 'react-router'
import premiumIcon from '../assets/home/premium.svg'

/** Premium offer under the library. Checkout from here is what unlocks the AI assistant. */
export default function PremiumBanner() {
  const navigate = useNavigate()

  return (
    <section className="mt-auto flex flex-col gap-3 rounded-2xl border border-accent-muted bg-accent-muted p-4">
      <div className="flex items-center gap-3">
        <img src={premiumIcon} alt="" width="40" height="40" className="block max-w-none shrink-0" />
        <p className="m-0 font-sans text-sm leading-body font-normal text-accent">
          Upgrade to Premium to unlock the AI assistant and get personalized help with your paths.
        </p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 font-sans text-sm font-semibold whitespace-nowrap text-ink">€5/month</p>
        <button
          type="button"
          onClick={() => navigate('/premium?unlock=ai')}
          className="min-w-0 disabled:cursor-wait py-3 m-0 inline-flex h-10 shrink-0 cursor-pointer items-center rounded-full border-0 bg-ink px-4 font-sans text-sm font-semibold whitespace-nowrap text-white"
        >
          Upgrade to Premium
        </button>
      </div>
    </section>
  )
}
