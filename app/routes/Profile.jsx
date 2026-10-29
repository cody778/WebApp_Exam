import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { useSavePrompt } from '../components/SaveSignInPrompt.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import { usePremiumUnlocked } from '../user/paymentMethods.js'
import searchIcon from '../assets/explore/search.svg'
import iconNewPath from '../assets/explore/icon-new-path.svg'
import avatarAnna from '../assets/explore/avatar-anna.png'
import knitting from '../assets/explore/knitting.png'
import sewing from '../assets/explore/sewing.png'
import sashiko from '../assets/profile/sashiko.jpg'
import embroidery from '../assets/profile/embroidery.jpg'
import iconExploreInk from '../assets/profile/icon-explore-ink.svg'
import iconImage from '../assets/profile/icon-image.svg'
import iconMic from '../assets/profile/icon-mic.svg'
import iconArrowUp from '../assets/profile/icon-arrow-up.svg'
import iconPremium from '../assets/profile/icon-premium.svg'

const headerButton =
  'm-0 flex h-8 shrink-0 items-center justify-center gap-2 rounded-lg border p-2 font-display text-base leading-none font-medium whitespace-nowrap no-underline'

const filters = [
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'My paths' },
  { id: 'saved', label: 'Saved paths' },
]

const shortcuts = [
  { title: 'Transfer Your Pattern', path: 'Sashiko', step: 'Step 2/6' },
  { title: 'Cast on', path: 'Knitting', step: 'Step 1/8', to: '/public-path' },
  { title: 'Prepare Your Hoop', path: 'Embroidery', step: 'Step 1/12' },
]

const paths = [
  { title: 'Sashiko', status: 'Step 2/6', image: sashiko, imageWidth: 768, imageHeight: 1017 },
  {
    title: 'Knitting',
    status: 'Step 1/8',
    image: knitting,
    imageWidth: 1860,
    imageHeight: 850,
    save: true,
    to: '/public-path',
  },
  { title: 'Embroidery', status: 'Step 1/12', image: embroidery, imageWidth: 736, imageHeight: 981 },
  { title: 'Sewing', status: 'Not started', image: sewing, imageWidth: 1860, imageHeight: 850, save: true },
]

function accountName(user) {
  const fullName = String(user.user_metadata?.full_name || '').trim()
  if (fullName) return fullName.split(/\s+/)[0]
  const local = String(user.email || '').split('@')[0]
  return local || 'You'
}

function accountPhoto(user) {
  return user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
}

/** Shown only while Supabase is not configured, so this page can be reviewed from Explore. */
const previewAccount = {
  user_metadata: { full_name: 'Emma', avatar_url: avatarAnna },
}

function SaveMark({ saved, title, onToggleSave }) {
  return (
    <>
      <h1>Profile</h1>
      <p>{user.email}</p>
      <button type="button" onClick={signOut} disabled={busy}>{busy ? 'Signing out...' : 'Sign out'}</button>
      {error && <p role="alert">{error}</p>}
      <Link to="/profile/projects">My projects</Link>
      <Link to="/profile/projects/public">Browse public projects</Link>
      <Link to="/">Back to welcome</Link>
    </>
  )
}

