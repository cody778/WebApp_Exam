import { Link } from 'react-router'
import Button from '../components/Button.jsx'
import cover from '../assets/public-path/cover.png'
import iconSave from '../assets/public-path/icon-save.svg'
import iconFork from '../assets/public-path/icon-fork.svg'
import iconShare from '../assets/public-path/icon-share.svg'
import iconSaveCount from '../assets/public-path/icon-save-count.svg'
import iconForkCount from '../assets/public-path/icon-fork-count.svg'
import stepDot from '../assets/public-path/step-dot.svg'

const steps = [
  'Cast on',
  'Knit stich',
  'Purl stich',
  'Stockinette',
  'Increases',
  'Decreases',
  'Cast off',
]

/** Public path opened from the knitting card on explore. */
export default function PublicPath() {
  return (
    <div className="public-path box-border [&_*]:box-border mx-auto flex min-h-screen w-full max-w-[440px] flex-col bg-white font-sans text-ink">
      <div className="relative flex h-40 shrink-0 items-start justify-end overflow-hidden p-4">
        <img
          src={cover}
          alt=""
          width="1860"
          height="850"
          className="pointer-events-none absolute inset-0 h-full w-full max-w-none object-cover"
        />
        <div className="relative z-10 flex w-6 flex-col gap-2">
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
      <div className="flex flex-1 flex-col gap-4 px-6 py-4">
        <p className="m-0 text-[13px] leading-[1.4] font-normal whitespace-nowrap text-quiet">
          <Link to="/explore" className="m-0 border-0 p-0 text-quiet underline">
            Explore
          </Link>
          <span> › Knitting</span>
        </p>
        <h1 className="m-0 text-[36px] leading-[1.15] font-bold tracking-[-0.72px] text-ink">Knitting</h1>
        <div className="flex items-center justify-between">
          <p className="m-0 text-[10px] leading-[1.4] font-normal whitespace-nowrap text-quiet">By Author name</p>
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-0.5">
              <img src={iconSaveCount} alt="" width="12" height="12" className="block max-w-none" />
              <span className="text-[10px] leading-[1.4] font-normal whitespace-nowrap text-quiet">1.5 k</span>
            </span>
            <span className="flex items-center gap-0.5">
              <img src={iconForkCount} alt="" width="12" height="12" className="block max-w-none" />
              <span className="text-[10px] leading-[1.4] font-normal whitespace-nowrap text-quiet">208</span>
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 pb-12">
          <div className="flex items-center gap-2 text-2xl leading-[1.2] text-ink">
            <p className="m-0 min-w-0 flex-1 font-semibold">| Overview</p>
            <p className="m-0 font-normal">|</p>
            <p className="m-0 font-normal">|</p>
          </div>
          <p className="m-0 text-sm leading-[1.4] font-normal text-quiet">
            Learn all the essential techniques to be a able to complete a knitting project from start to finish.
          </p>
          <p className="m-0 text-sm leading-[1.4] font-normal text-quiet">8 steps</p>
          <ol className="m-0 flex list-none flex-col gap-6 p-0 py-2">
            {steps.map((step, index) => (
              <li key={step} className="relative flex items-center gap-2">
                {index < steps.length - 1 ? (
                  <span aria-hidden="true" className="absolute top-1/2 left-[3px] h-[calc(100%+1.5rem)] w-0.5 bg-brand" />
                ) : null}
                <img src={stepDot} alt="" width="8" height="8" className="relative z-10 block max-w-none shrink-0" />
                <span className="text-base leading-[1.4] font-normal text-ink">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-auto">
            <Button to="/sign-in" className="h-12! w-full rounded-lg! bg-brand! font-sans! text-base! leading-none! font-normal!">
              Sign in to start your path
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
