import { Link } from 'react-router'

export default function MySkills() {
  return (
    <section className="flex flex-col gap-6 py-6 font-sans text-ink">
      <div>
        <h1 className="m-0 text-page-title">My skills</h1>
        <p className="mt-2 mb-0 text-quiet">Your completed paths and lessons will build your skills overview.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link className="m-0 flex min-h-24 flex-col justify-between rounded-lg border border-accent-muted bg-white p-4 text-ink no-underline hover:border-accent" to="/my-path"><span className="font-semibold">My paths</span><span className="text-sm text-quiet">View your learning paths</span></Link>
        <Link className="m-0 flex min-h-24 flex-col justify-between rounded-lg border border-accent-muted bg-white p-4 text-ink no-underline hover:border-accent" to="/browse-lessons"><span className="font-semibold">My lessons</span><span className="text-sm text-quiet">View individual lessons</span></Link>
      </div>
    </section>
  )
}
