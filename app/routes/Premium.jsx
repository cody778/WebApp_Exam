import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { emmaPayment, savePaymentMethod, unlockPremium } from '../user/paymentMethods.js'

const methods = [
  { id: 'card', label: 'Card' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'mobilepay', label: 'MobilePay' },
]

const choiceClass =
  'm-0 flex h-8 items-center justify-center rounded-lg border px-3 font-display text-base leading-none font-medium whitespace-nowrap'

const fieldClass =
  'm-0 h-10 w-full rounded-lg border border-surface-muted bg-white px-3 font-sans text-base leading-none text-ink'

function detailsFor(method) {
  if (method === 'paypal') {
    return {
      method,
      holder: emmaPayment.holder,
      email: emmaPayment.paypal.email,
    }
  }
  if (method === 'mobilepay') {
    return {
      method,
      holder: emmaPayment.holder,
      phone: emmaPayment.mobilepay.phone,
    }
  }
  return {
    method: 'card',
    holder: emmaPayment.holder,
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
            className="m-0 h-[30px] min-w-0 flex-1 rounded-lg border-0 bg-[#e3e3e3] px-2 font-sans text-sm leading-none text-ink"
          >
            Skip
          </button>
          <button
            type="button"
            autoFocus
            onClick={onSave}
            className="m-0 h-[30px] min-w-0 flex-1 rounded-lg border-0 bg-accent px-2 font-sans text-sm leading-none text-on-brand"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

/** Mock checkout reached from the premium banner. */
export default function Premium() {
  const navigate = useNavigate()
  const [method, setMethod] = useState('card')
  const [promptOpen, setPromptOpen] = useState(false)

  function finish(save) {
    if (save) savePaymentMethod(detailsFor(method))
    unlockPremium()
    navigate('/profile')
  }

  return (
    <div className="premium-page mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 p-4 font-sans text-ink">
      <header className="flex flex-col items-start gap-4">
        <Link
          to="/profile"
          className="m-0 inline-flex h-8 items-center rounded-lg bg-accent-muted px-3 font-display text-base leading-none font-medium text-ink no-underline"
        >
          Profile
        </Link>
        <h1 className="m-0 font-display text-xl leading-heading font-medium tracking-heading">Payment details</h1>
      </header>

      <section className="flex items-center justify-between gap-3 rounded-2xl bg-accent-muted p-4">
        <div>
          <p className="m-0 font-sans text-sm leading-[1.4] text-accent">Premium AI assistant</p>
          <p className="m-0 mt-1 font-sans text-sm font-semibold text-ink">€5/month</p>
        </div>
        <p className="m-0 font-sans text-sm text-quiet">Paying as {emmaPayment.holder}</p>
      </section>

      <form
        className="m-0 flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault()
          setPromptOpen(true)
        }}
      >
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-3 font-sans text-sm font-semibold text-ink">Payment method</legend>
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
                      ? `${choiceClass} border-brand bg-accent text-on-brand`
                      : `${choiceClass} border-transparent bg-accent-muted text-ink`
                  }
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </fieldset>

        {method === 'card' ? (
          <div className="grid grid-cols-2 gap-3">
            <label className="col-span-2 flex flex-col gap-1 font-sans text-sm text-quiet">
              Name on card
              <input readOnly value={emmaPayment.holder} className={fieldClass} />
            </label>
            <label className="col-span-2 flex flex-col gap-1 font-sans text-sm text-quiet">
              Card number
              <input readOnly value={emmaPayment.card.number} autoComplete="off" className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1 font-sans text-sm text-quiet">
              Expiry
              <input readOnly value={emmaPayment.card.expiry} autoComplete="off" className={fieldClass} />
            </label>
            <label className="flex flex-col gap-1 font-sans text-sm text-quiet">
              CVC
              <input readOnly value={emmaPayment.card.cvc} autoComplete="off" className={fieldClass} />
            </label>
          </div>
        ) : null}

        {method === 'paypal' ? (
          <label className="flex flex-col gap-1 font-sans text-sm text-quiet">
            PayPal email
            <input readOnly type="email" value={emmaPayment.paypal.email} autoComplete="off" className={fieldClass} />
          </label>
        ) : null}

        {method === 'mobilepay' ? (
          <label className="flex flex-col gap-1 font-sans text-sm text-quiet">
            MobilePay number
            <input readOnly type="tel" value={emmaPayment.mobilepay.phone} autoComplete="off" className={fieldClass} />
          </label>
        ) : null}

        <p className="m-0 font-sans text-sm leading-[1.4] text-quiet">This is a mock purchase. Nothing is charged.</p>

        <button
          type="submit"
          className="m-0 flex h-10 items-center justify-center rounded-2xl border-0 bg-accent px-4 text-button text-on-brand"
        >
          Confirm purchase
        </button>
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
