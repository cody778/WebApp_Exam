import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import Button from './Button.jsx'
import iconClose from '../assets/public-path/icon-close.svg'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'

export default function SaveSignInPrompt({ onClose }) {
  const closeRef = useRef(null)
  const location = useLocation()
  const returnTo = { from: location.pathname + location.search }

  // Move focus into the dialog and close it with Escape.
  useEffect(() => {
    closeRef.current?.focus()
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-signin-prompt"
        className="flex w-[408px] max-w-full flex-col gap-4 rounded-lg border border-accent-muted bg-white p-4"
      >
        <div className="flex h-5 items-center justify-end">
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="min-w-0 cursor-pointer disabled:cursor-wait [font:inherit] m-0 flex size-5 items-center justify-center border-0 bg-transparent p-0"
          >
            <img src={iconClose} alt="" width="12" height="12" className="block max-w-none" />
          </button>
        </div>
        <p id="save-signin-prompt" className="m-0 text-sm leading-[1.5] font-normal text-ink">
          Log in to be able to save paths in your profile.
        </p>
        <div className="flex gap-3">
          <Button
            to="/sign-in"
            state={returnTo}
            className="h-[30px]! min-w-0 flex-1 rounded-lg! bg-[#e3e3e3]! px-2! font-sans! text-sm! leading-none! font-normal! text-ink!"
          >
            Sign in
          </Button>
          <Button
            to="/sign-up"
            state={returnTo}
            className="h-[30px]! min-w-0 flex-1 rounded-lg! bg-accent! px-2! font-sans! text-sm! leading-none! font-normal!"
          >
            Start your path
          </Button>
        </div>
      </div>
    </div>
  )
}

// Visitors see Sign In; members run the requested save action.
export function useSavePrompt() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  function saveOrPrompt(toggle) {
    if (!user && supabase) {
      setOpen(true)
      return
    }
    toggle()
  }

  const prompt = open ? <SaveSignInPrompt onClose={close} /> : null
  return { saveOrPrompt, prompt }
}
