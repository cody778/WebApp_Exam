import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** "0" stores the session until the browser closes. Anything else keeps the current persistent login. */
export const rememberKey = 'pathify-remember'

const authStorage = {
  getItem(key) {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key)
  },
  setItem(key, value) {
    if (typeof window === 'undefined') return
    const remember = window.localStorage.getItem(rememberKey) !== '0'
    const keep = remember ? window.localStorage : window.sessionStorage
    const drop = remember ? window.sessionStorage : window.localStorage
    drop.removeItem(key)
    keep.setItem(key, value)
  },
  removeItem(key) {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  },
}

export const supabase = url && key
  ? createClient(url, key, { auth: { storage: authStorage, persistSession: true } })
  : null
