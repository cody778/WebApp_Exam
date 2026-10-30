export default function HighlightCard({ icon, title, body }) {
  return (
    <article className="flex w-full items-center gap-3 rounded-2xl bg-surface-muted p-4 lg:h-full lg:items-start lg:p-6">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-accent">
        <img src={icon} alt="" width="16" height="16" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="m-0 text-card-title tracking-widest text-ink">{title}</h3>
        <p className="m-0 text-h4 text-ink-neutral">{body}</p>
      </div>
    </article>
  )
}
