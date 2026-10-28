import '@fontsource/opendyslexic/700.css'
import blob from '../assets/landing/logo/blob.svg'
import vector62 from '../assets/landing/logo/vector-62.svg'
import vector64 from '../assets/landing/logo/vector-64.svg'
import vector65 from '../assets/landing/logo/vector-65.svg'
import vector66 from '../assets/landing/logo/vector-66.svg'
import vector70 from '../assets/landing/logo/vector-70.svg'
import vector71 from '../assets/landing/logo/vector-71.svg'

/**
 * Wordmark. The hero uses the bold 32px name. The explore header uses regular 30px.
 * @param {object} props
 * @param {'hero' | 'header'} [props.variant]
 */
export default function Logo({ variant = 'hero' }) {
  const header = variant === 'header'
  return (
    <div className={header ? 'flex items-start gap-1' : 'flex items-center gap-1 px-0.5'}>
      <LogoMark />
      <p
        className={
          header
            ? 'm-0 font-logo text-[1.875rem] leading-none font-normal tracking-[-1.8px] whitespace-nowrap text-ink'
            : 'm-0 font-logo text-logo leading-heading font-bold tracking-heading whitespace-nowrap text-ink'
        }
      >
        Pathify
      </p>
    </div>
  )
}

function LogoMark() {
  return (
    <span className="relative h-[27px] w-[32.545px] shrink-0" aria-hidden="true">
      <span className="absolute top-[3.13px] left-[7.8px] flex h-[22.261px] w-[17.754px] items-center justify-center">
        <img src={vector64} alt="" width="7.60101" height="22.9354" className="max-w-none rotate-[33.35deg]" />
      </span>
      <span className="absolute top-[12.22px] left-0 flex h-[12.546px] w-[10.81px] items-center justify-center">
        <img src={vector65} alt="" width="6.3556" height="12.5436" className="max-w-none -scale-y-100 rotate-[146.65deg]" />
      </span>
      <span className="absolute top-[19.17px] left-[1.45px] flex h-[7.827px] w-[6.942px] items-center justify-center">
        <img src={vector66} alt="" width="7.26399" height="8.49708" className="max-w-none -scale-y-100 rotate-[-1.59deg]" />
      </span>
      <span className="absolute top-[19.17px] left-[10.78px] flex h-[7.827px] w-[6.942px] items-center justify-center">
        <img src={vector70} alt="" width="7.26399" height="8.49708" className="max-w-none rotate-[-178.41deg]" />
      </span>
      <span className="absolute top-[20.47px] left-[5.45px] flex h-[3.618px] w-[3.209px] items-center justify-center">
        <img src={vector62} alt="" width="3.3779" height="3.96877" className="max-w-none -scale-y-100 rotate-[-1.59deg]" />
      </span>
      <span className="absolute top-[20.47px] left-[10.52px] flex h-[3.618px] w-[3.209px] items-center justify-center">
        <img src={vector71} alt="" width="3.3779" height="3.96877" className="max-w-none rotate-[-178.41deg]" />
      </span>
      <img src={blob} alt="" width="7.77263" height="7.77265" className="absolute top-0 left-[24.77px] max-w-none" />
    </span>
  )
}
