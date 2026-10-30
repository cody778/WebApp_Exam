export default function Notifications() {
  return (
    <section className="flex flex-col gap-6 py-6 font-sans text-ink">
      <div>
        <h1 className="m-0 text-page-title">Notifications</h1>
        <p className="mt-2 mb-0 text-quiet">Updates about your paths and projects will appear here.</p>
      </div>
      <div className="rounded-lg border border-accent-muted bg-white p-6 text-center text-sm text-quiet">You have no notifications.</div>
    </section>
  )
}
