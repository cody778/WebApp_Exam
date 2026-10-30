import { Link } from 'react-router'

export default function Introduction() {
  return (
    <section className="flex flex-col gap-6 font-sans text-ink">
      <div className="space-y-2">
        <p className="m-0 text-sm text-quiet">Getting started</p>
        <h1 className="m-0 text-page-title">Introduction</h1>
        <p className="m-0 leading-body text-quiet">Pathify helps you organise a subject into paths and lessons you can work through at your own pace.</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link className="m-0 inline-flex h-11 items-center justify-center rounded-lg border border-accent-muted bg-white px-5 text-sm text-ink no-underline" to="/">Back</Link>
        <Link className="m-0 inline-flex h-11 items-center justify-center rounded-lg border-0 bg-brand px-5 text-sm text-on-brand no-underline" to="/get-started">Continue</Link>
      </div>
    </section>
  )
}

