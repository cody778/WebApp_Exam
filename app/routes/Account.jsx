import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import AppNav from '../components/AppNav.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import { usePremiumUnlocked } from '../user/paymentMethods.js'
import { uploadAvatar, useAvatarUrl } from '../user/profile.js'
import defaultAvatar from '../assets/home/avatar.jpg'
import iconPlus from '../assets/account/icon-plus.svg'
import iconMenu from '../assets/account/icon-menu.svg'
import toggleOn from '../assets/account/toggle-on.svg'
import toggleOff from '../assets/account/toggle-off.svg'
import iconCheck from '../assets/public-path/icon-check.svg'
import iconChevron from '../assets/account/icon-chevron.svg'

const preferences = [
  { id: 'notifications', title: 'Email notifications', detail: 'Receive updates and reminders' },
  { id: 'sync', title: 'Sync Across Devices', detail: 'Keep your paths up to date' },
]

const breakOptions = [
  { id: '30', label: '30 min' },
  { id: '45', label: '45 min' },
  { id: '60', label: '1 hr' },
  { id: '120', label: '2 hours' },
]

export default function Account() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const premium = usePremiumUnlocked()
  const authPending = Boolean(supabase) && loading && !user
  const [prefs, setPrefs] = useState({ notifications: true, sync: true, twoFactor: false })
  const [breakEvery, setBreakEvery] = useState('45')
  const [confirmDelete, setConfirmDelete] = useState(true)
  const fullName = user?.user_metadata?.full_name?.trim() || 'Anna Liu'
  const email = user?.email || 'anna.Liu@pathify.com'
  const avatar = useAvatarUrl(user?.id) || defaultAvatar
  const photoInput = useRef(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState('')

  if (supabase && !loading && !user) {
    return <Navigate to="/sign-in" state={{ from: '/account' }} replace />
  }

  function toggle(id) {
    setPrefs((current) => ({ ...current, [id]: !current[id] }))
  }

  // The current delete flow clears local Pathify settings only.
  function deleteAccount() {
    if (!confirmDelete) return
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('pathify-')) localStorage.removeItem(key)
    }
    window.dispatchEvent(new Event('pathify-premium'))
    window.dispatchEvent(new Event('pathify-saved-titles'))
    navigate('/')
  }

  async function changePhoto(event) {
    const file = event.target.files?.[0]
    // Clearing the input lets the same file be picked again after an error.
    event.target.value = ''
    if (!file || !user) return
    setPhotoBusy(true)
    setPhotoError('')
    try {
      await uploadAvatar(user.id, file)
    } catch (uploadError) {
      setPhotoError(uploadError.message || 'Could not save your photo. Please try again.')
    } finally {
      setPhotoBusy(false)
    }
  }

  async function signOff() {
    // Leave first so the signed-out guard above does not bounce to /sign-in.
    navigate('/', { replace: true })
    if (supabase) await supabase.auth.signOut()
  }

  return (
    <div className="account-page mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-4 pt-0 pb-4 font-sans text-ink lg:max-w-6xl lg:px-8 lg:pb-14">
      {authPending ? <header className="flex h-16 items-center" aria-busy="true" /> : <AppNav />}

      <section className="flex flex-col gap-4" aria-labelledby="account-settings">
        <h1 id="account-settings" className="m-0 font-display text-xl leading-heading font-medium tracking-heading">
          Account Settings
        </h1>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="flex flex-col gap-4 rounded-2xl border border-accent-muted bg-white p-4">
              <div className="flex items-center gap-3">
                {user ? (
                  <button
                    type="button"
                    aria-label="Change profile photo"
                    aria-busy={photoBusy}
                    disabled={photoBusy}
                    onClick={() => photoInput.current?.click()}
                    className="!relative !m-0 !size-16 shrink-0 !rounded-full !border-0 !bg-transparent !p-0 disabled:cursor-wait"
                  >
                    <img
                      src={avatar}
                      alt=""
                      width="64"
                      height="64"
                      className={`block size-16 rounded-full object-cover ${photoBusy ? 'opacity-50' : ''}`}
                    />
                    <span className="absolute -right-0.5 -bottom-0.5 flex size-6 items-center justify-center rounded-full border border-accent-muted bg-white">
                      <img src={iconPlus} alt="" width="16" height="16" className="block max-w-none" />
                    </span>
                  </button>
                ) : (
                  <img src={avatar} alt="" width="64" height="64" className="size-16 shrink-0 rounded-full object-cover" />
                )}
                <input ref={photoInput} type="file" accept="image/*" hidden onChange={changePhoto} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="m-0 font-display text-body whitespace-nowrap">{fullName}</p>
                  <p className="m-0 font-sans text-sm leading-body font-normal whitespace-nowrap text-quiet">{email}</p>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-lg bg-accent-muted px-2 py-1 text-h5 text-accent">
                  {premium ? 'Premium' : 'Free'}
                </span>
              </div>
              {photoError ? (
                <p role="alert" className="m-0 font-sans text-sm leading-body text-[#9e2020]">
                  {photoError}
                </p>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <button type="button" className="!m-0 flex !items-center !gap-2 !border-0 !bg-transparent !p-0 text-left">
                  <img src={iconMenu} alt="" width="32" height="32" className="block max-w-none shrink-0" />
                  <span className="font-sans text-sm leading-body font-medium text-accent">Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={signOff}
                  className="!m-0 !inline-flex !h-8 !items-center !rounded-full !border !border-accent-muted !bg-transparent !px-3 !py-0 hover:!bg-accent-muted"
                >
                  <span className="font-sans text-sm leading-none font-medium text-ink">Sign off</span>
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-accent-muted bg-white">
              <div className="border-b border-accent-muted">
                <Link
                  to="/commissions"
                  className="!m-0 !flex !items-center !justify-between gap-3 !border-0 !bg-transparent !p-4 !text-inherit !no-underline"
                >
                  <h2 className="m-0 font-display text-body">My commissions</h2>
                  <img src={iconChevron} alt="" width="24" height="24" className="block max-w-none shrink-0" />
                </Link>
              </div>
              <Link
                to="/payment-methods"
                className="!m-0 !flex !items-center !justify-between gap-3 !border-0 !bg-transparent !p-4 !text-inherit !no-underline"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <h2 className="m-0 font-display text-body">Payment methods</h2>
                  <p className="m-0 font-sans text-sm leading-body font-normal text-quiet">
                    Add your preferred payment methods to pay and get paid for your paths
                  </p>
                </span>
                <img src={iconChevron} alt="" width="24" height="24" className="block max-w-none shrink-0" />
              </Link>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-ink p-4 text-on-brand">
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <p className="m-0 font-sans text-base leading-body font-semibold whitespace-nowrap text-on-brand">Upgrade to Premium</p>
                  <p className="m-0 font-sans text-sm leading-body font-normal whitespace-nowrap text-placeholder">AI assistant • €5/month</p>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-lg bg-brand px-2 py-1 text-h5 text-on-brand">
                  €5/mo
                </span>
              </div>
              <p className="m-0 font-sans text-sm leading-body font-normal text-placeholder">
                Unlock the AI assistant on your homepage and inside paths.
              </p>
              <Link
                to="/premium?unlock=ai"
                className="!m-0 !flex !h-10 !w-full !items-center !justify-center !rounded-lg !border-0 !bg-white !px-4 !no-underline"
              >
                <span className="font-sans text-sm leading-none font-semibold text-ink">Upgrade to Premium</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-2xl border border-accent-muted bg-white">
              {preferences.map((item, index) => (
                <div key={item.id}>
                  <div className={`flex items-center justify-between gap-3 p-4 ${index < preferences.length - 1 ? 'border-b border-accent-muted' : ''}`}>
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <p className="m-0 font-sans text-base leading-body font-medium">{item.title}</p>
                      <p className="m-0 font-sans text-sm leading-body font-normal text-quiet">{item.detail}</p>
                    </div>
                    <button
                      type="button"
                      aria-pressed={prefs[item.id]}
                      aria-label={item.title}
                      onClick={() => toggle(item.id)}
                      className="!m-0 !size-6 shrink-0 !border-0 !bg-transparent !p-0"
                    >
                      <img src={prefs[item.id] ? toggleOn : toggleOff} alt="" width="24" height="24" className="block max-w-none" />
                    </button>
                  </div>
                  {item.id === 'notifications' ? (
                    <div className="flex flex-col gap-0.5 border-b border-accent-muted p-4">
                      <div className="flex flex-nowrap items-center justify-between gap-3">
                        <p id="break-reminders" className="m-0 shrink-0 font-sans text-base leading-body font-medium">Break reminders</p>
                        <div role="group" aria-labelledby="break-reminders" className="flex shrink-0 gap-1">
                          {breakOptions.map((option) => {
                            const selected = breakEvery === option.id
                            return (
                              <button
                                key={option.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => setBreakEvery(option.id)}
                                className={`!m-0 !inline-flex !items-center !rounded-full !border-0 !px-2 !py-1 ${selected ? '!bg-accent !text-on-brand' : 'bg-accent-muted text-ink'}`}
                              >
                                <span className="font-sans text-sm leading-none whitespace-nowrap">{option.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <p className="m-0 font-sans text-sm leading-body font-normal text-quiet">During lessons</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-accent-muted bg-white p-4">
              <Link
                to="/appearance"
                className="!m-0 !flex !items-center !justify-between gap-3 !border-0 !bg-transparent !p-0 !text-inherit !no-underline"
              >
                <h2 className="m-0 font-display text-body">Appearance</h2>
                <img src={iconChevron} alt="" width="24" height="24" className="block max-w-none shrink-0" />
              </Link>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-accent-muted bg-white p-4">
              <h2 className="m-0 font-display text-body">Security</h2>
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="m-0 font-sans text-base leading-body font-medium">Two-Factor Authentication</p>
                  <p className="m-0 font-sans text-sm leading-body font-normal text-quiet">Add an extra layer of security</p>
                </div>
                <button
                  type="button"
                  aria-pressed={prefs.twoFactor}
                  aria-label="Two-Factor Authentication"
                  onClick={() => toggle('twoFactor')}
                  className="!m-0 !size-6 shrink-0 !border-0 !bg-transparent !p-0"
                >
                  <img src={prefs.twoFactor ? toggleOn : toggleOff} alt="" width="24" height="24" className="block max-w-none" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-accent-muted bg-white p-4">
              <h2 className="m-0 font-display text-body text-[#9e2020]">Danger Zone</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-pressed={confirmDelete}
                  aria-label="Confirm account deletion"
                  onClick={() => setConfirmDelete((current) => !current)}
                  className={`!m-0 flex !size-4 shrink-0 !items-center !justify-center !rounded !p-0 ${confirmDelete ? '!border-0 !bg-brand' : '!border !border-brand !bg-transparent'}`}
                >
                  {confirmDelete ? <img src={iconCheck} alt="" width="12.2667" height="8.93333" className="block max-w-none" /> : null}
                </button>
                <p className="m-0 flex-1 font-sans text-sm leading-body font-normal text-[#9e2020]">
                  I understand that deleting my account will remove all my paths permanently.
                </p>
              </div>
              <button
                type="button"
                disabled={!confirmDelete}
                onClick={deleteAccount}
                className="!m-0 !flex !h-10 !w-full !items-center !justify-center !rounded-lg !border-0 !bg-[#9e2020] !px-4 disabled:opacity-40 lg:!w-auto lg:self-start lg:!px-8"
              >
                <span className="font-sans text-sm leading-none font-semibold text-on-brand">Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
