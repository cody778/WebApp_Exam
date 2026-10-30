import { useEffect, useSyncExternalStore } from 'react'
import { supabase } from './client.js'

const BUCKET = 'avatars'
const CHANGE_EVENT = 'pathify-avatar'
const AVATAR_SIZE = 400

/** Avatar URL per user id. `null` means the profile has no photo yet. */
const avatarUrls = new Map()
const loading = new Set()

/**
 * First name from the account, then the email name. Empty when nobody is signed in.
 * @param {object | null | undefined} user
 */
export function firstName(user) {
  const fullName = user?.user_metadata?.full_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim().split(/\s+/)[0]
  return user?.email?.split('@')[0] || ''
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

function subscribe(onChange) {
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => window.removeEventListener(CHANGE_EVENT, onChange)
}

/** Fetches a user's photo URL once and caches it, so the nav does not refetch on every page. */
async function loadAvatar(userId) {
  if (!supabase || !userId || avatarUrls.has(userId) || loading.has(userId)) return
  loading.add(userId)
  const { data } = await supabase.from('profiles').select('avatar_url').eq('id', userId).maybeSingle()
  loading.delete(userId)
  avatarUrls.set(userId, data?.avatar_url ?? null)
  notify()
}

/**
 * The saved profile photo for this user, or `null` until one is uploaded.
 * @param {string | null | undefined} userId
 */
export function useAvatarUrl(userId) {
  useEffect(() => {
    loadAvatar(userId)
  }, [userId])
  return useSyncExternalStore(subscribe, () => (userId ? avatarUrls.get(userId) ?? null : null), () => null)
}

/** Center-crops the image to a square JPEG so every avatar is small and fills the round frame. */
async function squareJpeg(file) {
  const bitmap = await createImageBitmap(file)
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = AVATAR_SIZE
  canvas.height = AVATAR_SIZE
  canvas
    .getContext('2d')
    .drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not read this image.'))), 'image/jpeg', 0.85)
  })
}

/**
 * Uploads a new profile photo to the user's own folder and saves its URL on their profile.
 * @param {string} userId
 * @param {File} file
 */
export async function uploadAvatar(userId, file) {
  if (!supabase || !userId) throw new Error('Sign in to change your photo.')
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Choose an image under 10 MB.')

  const image = await squareJpeg(file)
  const path = `${userId}/avatar-${Date.now()}.jpg`
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, image, { contentType: 'image/jpeg' })
  if (uploadError) throw uploadError

  const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  const { data: rows, error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', userId).select('id')
  if (error) throw error
  if (!rows?.length) throw new Error('Your profile could not be found.')

  avatarUrls.set(userId, url)
  notify()

  const { data: files } = await supabase.storage.from(BUCKET).list(userId)
  const old = (files ?? []).map((item) => `${userId}/${item.name}`).filter((name) => name !== path)
  if (old.length) await supabase.storage.from(BUCKET).remove(old)

  return url
}
