import { Link } from 'react-router'

const card =
  '!m-0 !flex !h-[97px] !w-36 shrink-0 snap-start !flex-col !justify-between !rounded-lg !border !border-accent-muted !bg-white !p-2 !text-inherit !no-underline lg:!h-auto lg:min-h-[97px] lg:!w-full lg:shrink lg:snap-align-none'

export default function ShortcutCard({ title, path, step, to }) {
  const body = (
    <>
      <p className="m-0 line-clamp-2 min-h-[2.6em] font-sans text-[13px] leading-[1.3] font-semibold text-ink">{title}</p>
      <p className="m-0 truncate font-sans text-base leading-[1.4] text-accent">{path}</p>
      <p className="m-0 font-sans text-[11px] leading-[1.4] text-step">{step}</p>
    </>
  )

  if (to) {
    return (
      <Link to={to} draggable={false} className={card}>
        {body}
      </Link>
    )
  }

  return <article className={card}>{body}</article>
}
