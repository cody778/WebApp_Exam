import { useSyncExternalStore } from 'react'

const EVENT = 'pathify-saved-titles'
const EMPTY = new Set()

const caches = new Map()

function storageKey(prefix, userId) {
  return `${prefix}:${userId ?? 'preview'}`
}

function readSet(prefix, userId) {
  const key = storageKey(prefix, userId)
  const raw = typeof localStorage === 'undefined' ? '[]' : (localStorage.getItem(key) ?? '[]')
  const cache = caches.get(key)
  if (cache?.raw === raw) return cache.value
  let values = []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) values = parsed.filter((value) => typeof value === 'string')
  } catch {
    values = []
  }
  const value = values.length === 0 ? EMPTY : new Set(values)
  caches.set(key, { raw, value })
  return value
}

function toggle(prefix, userId, value) {
  const next = new Set(readSet(prefix, userId))
  if (next.has(value)) next.delete(value)
  else next.add(value)
  const key = storageKey(prefix, userId)
  const raw = JSON.stringify([...next])
  localStorage.setItem(key, raw)
  caches.set(key, { raw, value: next.size === 0 ? EMPTY : next })
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(onChange) {
  window.addEventListener(EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

const TITLES = 'pathify-saved-titles'

/** Titles bookmarked on the sample cards. Shared across Explore and Home. */
export function readSavedTitles(userId) {
  return readSet(TITLES, userId)
}

export function toggleSavedTitle(userId, title) {
  toggle(TITLES, userId, title)
}

export function useSavedTitles(userId) {
  return useSyncExternalStore(subscribe, () => readSet(TITLES, userId), () => EMPTY)
}