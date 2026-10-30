import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// "Remember me" chooses persistent or session-only storage.
export const rememberKey = 'pathify-remember'

// Supabase uses this adapter to store the same session in the chosen browser storage.
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

// The publishable key identifies the project; RLS policies still decide which rows each user can access.
export const supabase = url && key
  ? createClient(url, key, { auth: { storage: authStorage, persistSession: true } })
  : null
