export default function TextBlock({ text, number, onChange, onRemove }) {
  return (
    <div className="grid gap-2">
      <textarea
        className="min-h-32 w-full resize-y rounded-lg border border-accent-muted bg-white p-3 text-ink outline-none focus:border-accent"
        aria-label={`Text block ${number}`}
        placeholder="Write something..."
        value={text}
        onChange={event => onChange(event.target.value)}
      />
      <button className="m-0 w-fit min-w-0 cursor-pointer rounded-lg border border-[#9e2020]/30 bg-transparent px-3 py-2 text-sm text-[#9e2020]" type="button" onClick={onRemove} aria-label={`Remove text block ${number}`}>
        Remove
      </button>
    </div>
  )
}
