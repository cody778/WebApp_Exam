import { useSyncExternalStore } from 'react'

const METHODS_KEY = 'pathify-payment-methods'
const PREMIUM_KEY = 'pathify-premium'
const CHANGE_EVENT = 'pathify-premium'

// Mock checkout details used when no account is signed in.
export const emmaPayment = {
  holder: 'Emma',
  card: {
    brand: 'Visa',
    number: '4242 4242 4242 4242',
    last4: '4242',
    expiry: '12/28',
    cvc: '123',
  },
  paypal: {
    email: 'emma@example.com',
  },
  mobilepay: {
    phone: '+45 12 34 56 78',
  },
}

function readJson(key, fallback) {
  if (typeof localStorage === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function readPaymentMethods() {
  const value = readJson(METHODS_KEY, [])
  return Array.isArray(value) ? value : []
}

// Keep one method per type and never store the card security code.
export function savePaymentMethod(entry) {
  const next = readPaymentMethods().filter((item) => item.method !== entry.method)
  next.push({ ...entry, savedAt: new Date().toISOString() })
  localStorage.setItem(METHODS_KEY, JSON.stringify(next))
  notify()
}

export function readPremiumUnlocked() {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem(PREMIUM_KEY) === '1'
}

// Notify every open component when Premium changes on this device.
export function unlockPremium() {
  localStorage.setItem(PREMIUM_KEY, '1')
  notify()
}

function subscribe(onChange) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

export function usePremiumUnlocked() {
  return useSyncExternalStore(subscribe, readPremiumUnlocked, () => false)
}
