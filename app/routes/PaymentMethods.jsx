import { Link, Navigate } from 'react-router'
import AppNav from '../components/AppNav.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import { emmaPayment } from '../user/paymentMethods.js'
import anna from '../assets/explore/avatar-anna.png'
import iconPlus from '../assets/account/icon-plus.svg'

/** Saved payment options opened from the account payment methods row. */
export default function PaymentMethods() {
  const { user, loading } = useAuth()
  const authPending = Boolean(supabase) && loading && !user

  if (supabase && !loading && !user) {
    return <Navigate to="/sign-in" state={{ from: '/payment-methods' }} replace />
  }

  return (
    <div className="payment-methods-page mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-2 pt-4 pb-14 font-sans text-ink">
      {authPending ? <header className="flex h-10 items-center" aria-busy="true" /> : <AppNav showHome={false} avatarSrc={anna} />}

      <h1 className="font-display text-xl leading-heading font-medium tracking-heading" style={{ margin: '2rem 0 0' }}>
        <Link to="/account" className="!m-0 !inline !border-0 !bg-transparent !p-0 !text-inherit !no-underline">
          {'My Account >'}
        </Link>
        {' '}
        <span className="underline">Payment Options</span>
      </h1>
      <h2 className="m-0 mt-4 font-sans text-[22px] leading-body font-normal">Your saved payment methods</h2>

      <section className="mt-2 flex flex-col gap-4 border border-black p-4" aria-labelledby="saved-options">
        <h3 id="saved-options" className="m-0 font-sans text-sm leading-body font-normal">Your card</h3>
        <div
          className="mx-auto flex flex-col justify-end gap-1 border border-black px-2.5 pt-5 pb-2.5"
          style={{ width: 228, minHeight: 136, borderRadius: 11 }}
        >
          <span className="block bg-surface-muted" style={{ height: 29, marginRight: -10, marginLeft: -10 }} />
          <p className="m-0 mt-1 font-sans text-sm leading-body font-normal">{emmaPayment.card.number}</p>
          <p className="m-0 flex gap-4 font-sans text-sm leading-body font-normal">
            <span>{emmaPayment.card.expiry}</span>
            <span>{emmaPayment.card.cvc}</span>
          </p>
          <p className="m-0 font-sans text-sm leading-body font-normal">{emmaPayment.holder}</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="m-0 font-sans text-sm leading-body font-normal">Other Options</h3>
          <p className="m-0 flex items-center gap-3 font-sans text-base leading-body font-normal">
            <span>PayPal:</span>
            <span className="inline-flex items-center rounded-full bg-accent-muted px-3.5 py-1 text-base leading-body text-ink">
              {emmaPayment.paypal.email}
            </span>
          </p>
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="m-0 font-sans text-[22px] leading-body font-normal">Add a new payment method</p>
        <img src={iconPlus} alt="" width="24" height="24" className="block max-w-none shrink-0" />
      </div>
    </div>
  )
}
