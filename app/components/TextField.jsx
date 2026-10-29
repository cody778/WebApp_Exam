/**
 * Labeled single-line field for account forms.
 * @param {object} props
 * @param {string} props.id Input id, also used by the label.
 * @param {string} props.name Form field name.
 * @param {string} props.label Visible label.
 * @param {string} [props.type] Input type. Defaults to text.
 * @param {string} [props.autoComplete] Browser autofill hint.
 * @param {string} [props.placeholder] Gray hint shown while the field is empty.
 * @param {number} [props.minLength] Minimum characters the browser should accept.
 * @param {boolean} [props.required] Block submit until the field has a value.
 */
export default function TextField({
  id,
  name,
  label,
  type = 'text',
  autoComplete,
  placeholder = '',
  minLength,
  required = false,
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className="font-sans text-base leading-body font-normal text-ink">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={minLength}
        required={required}
        className="m-0 h-10 w-full rounded-lg border border-surface-muted bg-white px-4 font-sans text-base leading-none font-normal text-ink outline-none placeholder:text-placeholder focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    </div>
  )
}
