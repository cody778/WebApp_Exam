import { Link, Navigate } from 'react-router'
import Button from '../components/Button.jsx'
import { useAuth } from '../user/AuthProvider.jsx'
import { supabase } from '../user/client.js'
import knitting from '../assets/explore/knitting.png'
import saveCount from '../assets/explore/save-count.svg'
import forkCount from '../assets/explore/fork-count.svg'
import iconSave from '../assets/public-path/icon-save.svg'
import iconFork from '../assets/public-path/icon-fork.svg'
import iconShare from '../assets/public-path/icon-share.svg'
import stepDot from '../assets/public-path/step-dot.svg'

const steps = ['Cast on', 'Knit stich', 'Purl stich', 'Stockinette', 'Increases', 'Decreases', 'Cast off']

/**
 * Saved knitting path. Opened when a signed-in user clicks a saved Knitting card.
 */
export default function SavedPath() {
  const { user, loading } = useAuth()

  if (supabase && !loading && !user) {
    return <Navigate to="/sign-in" state={{ from: '/saved-path' }} replace />
  }

  return (
    <div className="saved-path box-border [&_*]:box-border mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-white font-sans text-ink">
      <div className="relative h-40 shrink-0 bg-[#dad6cd]">
        <img
          src={knitting}
          alt=""
          width="1860"
          height="850"
          className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover"
        />
        <div className="absolute top-4 right-4 z-10 flex w-6 flex-col gap-2">
          <button type="button" aria-label="Save Knitting" className="min-w-0 disabled:cursor-wait [font:inherit] m-0 h-6 w-full cursor-pointer border-0 bg-transparent p-0">
            <img src={iconSave} alt="" width="24" height="24" className="block max-w-none" />
          </button>
          <button type="button" aria-label="Fork Knitting" className="min-w-0 disabled:cursor-wait [font:inherit] m-0 h-6 w-full cursor-pointer border-0 bg-transparent p-0">
            <img src={iconFork} alt="" width="24" height="24" className="block max-w-none" />
          </button>
          <button
            type="button"
            aria-label="Share Knitting"
            className="min-w-0 disabled:cursor-wait [font:inherit] m-0 flex h-6 w-full -scale-y-100 rotate-180 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
          >
            <img src={iconShare} alt="" width="24" height="24" className="block max-w-none" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 py-4 pb-12">
        <Link
          to="/home?filter=saved"
          className="!m-0 inline-block w-fit rounded !border-0 !p-0 font-sans text-sm leading-[1.4] font-normal !text-quiet no-underline"
        >
          <span className="underline">Saved paths</span>
          <span>{` >`}</span>
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-sans text-[48px] leading-[1.2] font-bold tracking-[-0.96px] text-ink">Knitting</h1>
          <div className="flex items-center justify-between">
            <p className="m-0 font-sans text-[10px] leading-[1.4] font-normal whitespace-nowrap text-[#444]">By Pathify</p>
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-0.5">
                <img src={saveCount} alt="" width="12" height="12" className="block max-w-none" />
                <span className="font-sans text-[10px] leading-[1.4] whitespace-nowrap text-[#5a5a5a]">1.5 k</span>
              </span>
              <span className="flex items-center gap-0.5">
                <img src={forkCount} alt="" width="12" height="12" className="block max-w-none" />
                <span className="font-sans text-[10px] leading-[1.4] whitespace-nowrap text-[#5a5a5a]">208</span>
              </span>
            </div>
          </div>
        </div>

        <section className="flex flex-1 flex-col gap-4" aria-label="Overview">
          <div className="flex items-center gap-2 font-sans text-2xl leading-[1.2] font-normal text-ink">
            <p className="m-0 min-w-0 flex-1">| Overview</p>
            <p className="m-0 shrink-0 whitespace-nowrap">|</p>
            <p className="m-0 shrink-0 whitespace-nowrap">|</p>
          </div>
          <p className="m-0 font-sans text-sm leading-[1.4] font-normal text-quiet">
            Learn all the essential techniques to be a able to complete a knitting project from start to finish.
          </p>
          <p className="m-0 font-sans text-sm leading-[1.4] font-normal text-quiet">8 steps, 0 completed</p>
          <ol className="relative m-0 flex list-none flex-col gap-6 p-0 py-2">
            <span aria-hidden="true" className="absolute top-4 bottom-4 left-[11px] w-0.5 bg-brand" />
            {steps.map((step, index) => {
              const current = index === 0
              return (
                <li
                  key={step}
                  className={
                    current
                      ? 'relative z-10 flex w-fit items-center gap-2 rounded-2xl bg-accent px-2 py-1.5'
                      : 'relative z-10 flex items-center gap-2 px-2'
                  }
                >
                  {current ? (
                    <span className="size-2 shrink-0 rounded-full bg-on-brand" />
                  ) : (
                    <img src={stepDot} alt="" width="8" height="8" className="block max-w-none shrink-0" />
                  )}
                  <span className={`font-sans text-base leading-[1.4] ${current ? 'text-on-brand' : 'text-ink'}`}>{step}</span>
                </li>
              )
            })}
          </ol>
          <Button to="/public-path" className="mt-auto !flex !h-12 w-full !items-center !justify-center !rounded-lg !border-0 !bg-ink !text-on-brand font-sans text-base leading-none font-normal">
            Continue path
          </Button>
        </section>
      </div>
    </div>
  )
}
