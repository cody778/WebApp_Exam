import { useState } from 'react'
import { Navigate } from 'react-router'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import iconMenu from '../assets/account/icon-menu.svg'
import iconCheck from '../assets/appearance/icon-check.svg'
import spacingBar from '../assets/appearance/spacing-bar.svg'

const themes = [
  { id: 'paper', label: 'Paper', chip: 'bg-transparent text-ink' },
  { id: 'calm', label: 'Calm', chip: 'bg-[#efe6dd] text-[#6c5b5b]' },
  { id: 'stone', label: 'Stone', chip: 'bg-accent-muted text-ink' },
  { id: 'dark', label: 'Dark', chip: 'bg-[#756e66] text-[#efe6dd]' },
]

const titleFonts = [
  { id: 'opendyslexic', label: 'OpenDyslexic', font: 'font-logo' },
  { id: 'futura', label: 'Futura', font: 'font-display' },
]

const bodyFonts = [
  { id: 'opendyslexic', label: 'OpenDyslexic', font: 'font-logo' },
  { id: 'futura', label: 'Futura', font: 'font-display' },
  { id: 'bookerly', label: 'Bookerly', family: 'Bookerly, "Bookerly Display", serif' },
  { id: 'baskerville', label: 'Baskerville', family: 'Baskerville, Palatino, serif' },
  { id: 'helvetica', label: 'Helvetica', family: 'Helvetica, Arial, sans-serif' },
]

const themeGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px' }
const typeGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', columnGap: '20px', rowGap: '16px' }

const spacingStops = [42.5, 99.5, 143.5, 195.5, 247.5]

/** Theme, type, and line spacing opened from Appearance. */
export default function Appearance() {
  const { user, loading } = useAuth()
  const [theme, setTheme] = useState('paper')
  const [titleFont, setTitleFont] = useState(null)
  const [bodyFont, setBodyFont] = useState(null)
  const [spacing, setSpacing] = useState(2)

  if (supabase && !loading && !user) {
    return <Navigate to="/sign-in" state={{ from: '/appearance' }} replace />
  }

  return (
    <div className="appearance-page mx-auto flex min-h-screen w-full max-w-[440px] flex-col px-2 pt-4 pb-14 font-sans text-ink">
      <header className="flex h-12 items-center justify-between">
        <Logo variant="header" />
        <img src={iconMenu} alt="" width="32" height="32" className="block max-w-none shrink-0" />
      </header>

      <h1 className="m-0 mt-2 font-sans text-[32px] leading-heading font-normal">My Account</h1>

      <section className="mt-4 flex flex-col" aria-labelledby="themes">
        <h2 id="themes" className="m-0 font-sans text-[22px] leading-body font-normal">Themes</h2>
        <div className="mt-2" style={themeGrid}>
          {themes.map((item) => {
            const selected = theme === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setTheme(item.id)}
                className={`!m-0 flex !h-[51px] !items-center !justify-between !rounded-2xl !border !border-black !px-2 !py-0 ${item.chip}`}
              >
                <span className="font-sans text-sm leading-body font-normal">{item.label}</span>
                {selected ? <img src={iconCheck} alt="" width="24" height="24" className="block max-w-none shrink-0" /> : null}
              </button>
            )
          })}
        </div>
      </section>

      <section className="mt-5 flex flex-col" aria-labelledby="typography">
        <h2 id="typography" className="m-0 font-sans text-[22px] leading-body font-normal">Typography</h2>
        <div className="mt-1 items-center border-t border-black px-2 py-4" style={typeGrid}>
          <p className="m-0 font-sans text-[22px] leading-body font-normal">Titles</p>
          {titleFonts.map((item) => (
            <FontChoice
              key={item.id}
              label={item.label}
              font={item.font}
              selected={titleFont === item.id}
              onClick={() => setTitleFont(item.id)}
            />
          ))}
        </div>
        <div className="items-center border-t border-black px-2 py-4" style={typeGrid}>
          <p className="m-0 font-sans text-[22px] leading-body font-normal">Body Text</p>
          {bodyFonts.map((item) => (
            <FontChoice
              key={item.id}
              label={item.label}
              font={item.font}
              family={item.family}
              selected={bodyFont === item.id}
              onClick={() => setBodyFont(item.id)}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-black px-2 py-4" aria-labelledby="line-spacing">
        <h2 id="line-spacing" className="m-0 font-sans text-[22px] leading-body font-normal" style={{ width: 125 }}>Line Spacing</h2>
        <div className="mx-auto mt-4" style={{ position: 'relative', width: 284, height: 44.1145 }}>
          <img src={spacingBar} alt="" width="284" height="44.1145" className="block max-w-none" />
          {spacing !== 2 ? (
            <>
              <span className="pointer-events-none absolute rounded-full bg-ink" style={dotStyle(spacingStops[2])} />
              <span className="pointer-events-none absolute rounded-full" style={{ ...dotStyle(spacingStops[spacing]), background: '#0088ff' }} />
            </>
          ) : null}
          <button
            type="button"
            aria-label="Decrease line spacing"
            onClick={() => setSpacing((current) => Math.max(0, current - 1))}
            className="!m-0 !border-0 !bg-transparent !p-0"
            style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: 24 }}
          />
          <button
            type="button"
            aria-label="Increase line spacing"
            onClick={() => setSpacing((current) => Math.min(spacingStops.length - 1, current + 1))}
            className="!m-0 !border-0 !bg-transparent !p-0"
            style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: 24 }}
          />
          {spacingStops.map((stop, index) => (
            <button
              key={stop}
              type="button"
              aria-label={`Line spacing step ${index + 1}`}
              aria-pressed={spacing === index}
              onClick={() => setSpacing(index)}
              className="!m-0 !border-0 !bg-transparent !p-0"
              style={{ position: 'absolute', left: stop, top: 23.46, width: 24, height: 24, transform: 'translate(-50%, -50%)' }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function dotStyle(left) {
  return { left, top: 23.46, width: 11, height: 10, transform: 'translate(-50%, -50%)', pointerEvents: 'none', position: 'absolute' }
}

function FontChoice({ label, font, family, selected, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`!m-0 flex !h-10 !min-w-0 !items-center !justify-center !rounded-2xl !border !border-black !px-2 !py-0 ${selected ? '!bg-ink' : '!bg-transparent'}`}
    >
      <span className={`${font || ''} text-base leading-normal whitespace-nowrap ${selected ? 'text-on-brand' : 'text-ink'}`} style={family ? { fontFamily: family } : undefined}>{label}</span>
    </button>
  )
}
