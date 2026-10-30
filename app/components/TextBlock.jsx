export default function TextBlock({ text, number, onChange, onRemove }) {
  return (
    <div>
      <textarea
        aria-label={`Text block ${number}`}
        placeholder="Write something..."
        value={text}
        onChange={event => onChange(event.target.value)}
      />
      <button className="min-w-0 p-3 [font:inherit] cursor-pointer disabled:cursor-wait" type="button" onClick={onRemove} aria-label={`Remove text block ${number}`}>
        Remove
      </button>
    </div>
  )
}
