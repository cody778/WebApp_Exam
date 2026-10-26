export default function TextBlock({ text, number, onChange, onRemove }) {
  return (
    <div>
      <textarea
        aria-label={`Text block ${number}`}
        placeholder="Write something..."
        value={text}
        onChange={event => onChange(event.target.value)}
      />
      <button type="button" onClick={onRemove} aria-label={`Remove text block ${number}`}>
        Remove
      </button>
    </div>
  )
}
