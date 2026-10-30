import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import AppNav from '../components/AppNav.jsx'
import { formatPrice } from '../components/PathCard.jsx'
import SubmitButton from '../components/SubmitButton.jsx'
import TextField from '../components/TextField.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { buyPath, getPath } from '../user/data.js'
import { emmaPayment, savePaymentMethod, unlockPremium } from '../user/paymentMethods.js'
import { firstName } from '../user/profile.js'

const methods = [
  { id: 'card', label: 'Card' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'mobilepay', label: 'MobilePay' },
]

const choiceClass =
  'm-0 inline-flex h-10 min-w-0 shrink-0 disabled:cursor-wait py-3 cursor-pointer items-center rounded-full border-0 px-4 font-sans text-sm whitespace-nowrap'

// Save display details only; the full card number and CVC are discarded.
function detailsFor(method, payer) {
  if (method === 'paypal') {
    return {
      method,
      holder: payer.holder,
      email: payer.email,
    }
  }
  if (method === 'mobilepay') {
    return {
      method,
      holder: payer.holder,
      phone: emmaPayment.mobilepay.phone,
    }
  }
  return {
    method: 'card',
    holder: payer.holder,
    brand: emmaPayment.card.brand,
    last4: emmaPayment.card.last4,
    expiry: emmaPayment.card.expiry,
  }
}

function SaveDetailsPrompt({ method, onSave, onSkip, onDismiss }) {
  const card = method === 'card'

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onDismiss()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-payment-prompt"
        className="flex w-[408px] max-w-full flex-col gap-4 rounded-lg border border-accent-muted bg-white p-4"
      >
        <p id="save-payment-prompt" className="m-0 font-sans text-sm leading-[1.5] text-ink">
          {card
            ? 'Save this card for next time? You can always save it later in Settings.'
            : 'Save these payment details for next time? You can always save them later in Settings.'}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="m-0 h-[30px] min-w-0 flex-1 cursor-pointer py-3 font-[weight:inherit] disabled:cursor-wait rounded-lg border-0 bg-[#e3e3e3] px-2 font-sans text-sm leading-none text-ink"
          >
            Skip
          </button>
          <button
            type="button"
            autoFocus
            onClick={onSave}
            className="m-0 h-[30px] min-w-0 flex-1 cursor-pointer py-3 font-[weight:inherit] disabled:cursor-wait rounded-lg border-0 bg-accent px-2 font-sans text-sm leading-none text-on-brand"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// The same mock checkout handles paid paths and the Premium assistant.
export default function Premium() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const unlockAi = searchParams.get('unlock') === 'ai'
  const pathId = searchParams.get('path')
  const [method, setMethod] = useState('card')
  const [promptOpen, setPromptOpen] = useState(false)
  const [path, setPath] = useState(null)
  const [error, setError] = useState('')
  // Signed-out previews use the mock payer details.
  const payer = {
    holder: firstName(user) || emmaPayment.holder,
    email: user?.email || emmaPayment.paypal.email,
  }

  useEffect(() => {
    if (!pathId || !user) return
    let active = true
    getPath(user.id, pathId).then(
      (data) => active && setPath(data),
      () => active && setError('Could not load this path.'),
    )
    return () => {
      active = false
    }
  }, [pathId, user])

  if (pathId && !loading && !user) {
    return <Navigate to="/sign-in" state={{ from: `/premium?path=${pathId}` }} replace />
  }

  // Path purchases are stored in Supabase; Premium is unlocked on this device.
  async function finish(save) {
    if (save) savePaymentMethod(detailsFor(method, payer))
    if (pathId) {
      try {
        await buyPath(user.id, pathId)
        navigate(`/path/${pathId}`, { state: { notice: 'Purchased. The steps are open now.' } })
      } catch {
        setPromptOpen(false)
        setError('Could not complete the purchase. Please try again.')
      }
      return
    }
    if (unlockAi) unlockPremium()
    navigate('/home')
  }

  return (
    <div className="premium-page box-border [&_*]:box-border mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-4 pt-0 pb-4 font-sans text-ink lg:max-w-2xl lg:px-8">
      <AppNav />
      <h1 className="m-0 font-display text-xl leading-heading font-medium tracking-heading">Payment details</h1>

      <section className="flex items-center justify-between gap-3 rounded-2xl bg-accent-muted p-4">
        {pathId ? (
          <div>
            <p className="m-0 font-sans text-sm leading-body text-accent">{path ? path.title : 'Path'}</p>
            <p className="m-0 mt-1 font-sans text-sm font-semibold text-ink">{path?.price ? formatPrice(path.price) : '…'}</p>
          </div>
        ) : (
          <div>
            <p className="m-0 font-sans text-sm leading-body text-accent">Premium AI assistant</p>
            <p className="m-0 mt-1 font-sans text-sm font-semibold text-ink">€5/month</p>
          </div>
        )}
        <p className="m-0 font-sans text-sm leading-body text-quiet">Paying as {payer.holder}</p>
      </section>

      <form
        className="m-0 flex flex-col gap-4 rounded-lg border border-accent-muted bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault()
          setPromptOpen(true)
        }}
      >
        <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
          <p className="m-0 font-sans text-base leading-body text-ink">Payment method</p>
          <div role="radiogroup" aria-label="Payment method" className="flex flex-wrap gap-2">
            {methods.map((item) => {
              const selected = method === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setMethod(item.id)}
                  className={
                    selected
                      ? `${choiceClass} bg-accent font-medium text-on-brand`
                      : `${choiceClass} bg-accent-muted font-normal text-ink`
                  }
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {method === 'card' ? (
            <>
              <TextField id="card-name" name="card-name" label="Name on card" value={payer.holder} readOnly />
              <TextField
                id="card-number"
                name="card-number"
                label="Card number"
                autoComplete="off"
                value={emmaPayment.card.number}
                readOnly
              />
              <div className="grid grid-cols-2 gap-4">
                <TextField id="card-expiry" name="card-expiry" label="Expiry" autoComplete="off" value={emmaPayment.card.expiry} readOnly />
                <TextField id="card-cvc" name="card-cvc" label="CVC" autoComplete="off" value={emmaPayment.card.cvc} readOnly />
              </div>
            </>
          ) : null}

          {method === 'paypal' ? (
            <TextField
              id="paypal-email"
              name="paypal-email"
              label="PayPal email"
              type="email"
              autoComplete="off"
              value={payer.email}
              readOnly
            />
          ) : null}

          {method === 'mobilepay' ? (
            <TextField
              id="mobilepay-phone"
              name="mobilepay-phone"
              label="MobilePay number"
              type="tel"
              autoComplete="off"
              value={emmaPayment.mobilepay.phone}
              readOnly
            />
          ) : null}

          <p className="m-0 font-sans text-sm leading-body text-quiet">This is a mock purchase. Nothing is charged.</p>
          {error ? <p role="alert" className="m-0 font-sans text-sm leading-body text-ink">{error}</p> : null}
          <SubmitButton>Confirm purchase</SubmitButton>
        </fieldset>
      </form>

      {promptOpen ? (
        <SaveDetailsPrompt
          method={method}
          onSave={() => finish(true)}
          onSkip={() => finish(false)}
          onDismiss={() => setPromptOpen(false)}
        />
      ) : null}
    </div>
  )
}
