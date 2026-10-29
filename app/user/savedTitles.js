import { useSyncExternalStore } from 'react'

const EVENT = 'pathify-saved-titles'
const EMPTY = new Set()

let cache = { key: '', raw: '[]', value: EMPTY }

function storageKey(userId) {
  return `pathify-saved-titles:${userId ?? 'preview'}`
}

/** Titles bookmarked on the knitting cards. Shared across Explore and Profile. */
export function readSavedTitles(userId) {
  const key = storageKey(userId)
  const raw = typeof localStorage === 'undefined' ? '[]' : (localStorage.getItem(key) ?? '[]')
  if (cache.key === key && cache.raw === raw) return cache.value
  let titles = []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) titles = parsed.filter((title) => typeof title === 'string')
  } catch {
    titles = []
  }
  const value = titles.length === 0 ? EMPTY : new Set(titles)
  cache = { key, raw, value }
  return value
}

export function toggleSavedTitle(userId, title) {
  const next = new Set(readSavedTitles(userId))
  if (next.has(title)) next.delete(title)
  else next.add(title)
  const raw = JSON.stringify([...next])
  localStorage.setItem(storageKey(userId), raw)
  cache = { key: storageKey(userId), raw, value: next.size === 0 ? EMPTY : next }
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

export function useSavedTitles(userId) {
  return useSyncExternalStore(subscribe, () => readSavedTitles(userId), () => EMPTY)
}
