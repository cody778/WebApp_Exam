export default function TextField({
  id,
  name,
  label,
  type = 'text',
  autoComplete,
  placeholder = '',
  minLength,
  required = false,
  value,
  readOnly = false,
  icon = null,
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={id} className="flex items-center gap-1 font-sans text-base leading-body font-normal text-ink">
        {icon}
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
        value={value}
        readOnly={readOnly}
        className="m-0 h-10 w-full rounded-lg border border-surface-muted bg-white px-4 font-sans text-base leading-none font-normal text-ink outline-none placeholder:text-placeholder focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
    </div>
  )
}
