const labels = { heading: 'Heading', paragraph: 'Paragraph', quote: 'Quote', table: 'Table', link: 'Link', image: 'Image', video: 'Video' }

export default function BlockEditor({ blocks, onChange, readOnly = false, label = 'Lesson content' }) {
  function update(id, values) {
    onChange(blocks.map(block => block.id === id ? { ...block, content: { ...block.content, ...values } } : block))
  }

  return (
    <section className="min-w-0" aria-label={label}>
      {!readOnly && <select className="mb-4 w-full rounded-lg border border-accent-muted bg-white p-3 text-ink outline-none focus:border-accent" aria-label="Add block" value="" onChange={event => {
        const type = event.target.value
        const content = type === 'table' ? { rows: Array.from({ length: 3 }, () => ['', '', '']) }
          : ['link', 'image', 'video'].includes(type) ? { url: '' } : { text: '' }
        onChange([...blocks, { id: crypto.randomUUID(), type, content }])
      }}>
        <option value="" disabled>Add block</option> 
        {Object.entries(labels).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
      </select>}
      <div className="min-h-64 space-y-4 rounded-lg border border-accent-muted bg-white p-[clamp(1rem,4vw,2rem)] leading-body whitespace-pre-wrap text-ink [overflow-wrap:anywhere]">
        {blocks.map((block, index) => {
          const { id, type, content } = block
          const label = `${labels[type]} ${index + 1}`
          if (['link', 'image', 'video'].includes(type)) {
            if (!readOnly) return <label className="grid gap-2 text-sm font-medium" key={id}>{label}
              <input className="min-w-0 rounded-lg border border-accent-muted px-3 py-2 font-normal outline-none focus:border-accent" type="url" value={content.url} pattern="https://[^\s]+" placeholder="https://" required onChange={event => update(id, { url: event.target.value })} />
            </label>
            return /^https:\/\/\S+$/.test(content.url) ? <p className="m-0" key={id}><a className="m-0 text-accent underline" href={content.url} target="_blank" rel="noopener noreferrer">{content.title || `${labels[type]}: ${content.url}`}</a></p> : <p className="m-0 text-quiet" key={id}>This {labels[type].toLowerCase()} is unavailable.</p>
          }
          if (type === 'table') return (
            <table className="my-4 w-full table-fixed border-collapse" key={id} aria-label={label}><tbody>
              {content.rows.map((cells, row) => (
                <tr key={row}>{(Array.isArray(cells) ? cells : [cells]).map((cell, column) => (
                  <td className="h-8 min-h-[1.5em] whitespace-pre-wrap [overflow-wrap:anywhere] border border-[#ccc] p-2 focus:outline focus:outline-[#ddd]" key={column} contentEditable={readOnly ? false : 'plaintext-only'} suppressContentEditableWarning
                    aria-label={`${label}, row ${row + 1}, column ${column + 1}`} onBlur={event => {
                      if (readOnly) return 
                      const rows = content.rows.map(cells => Array.isArray(cells) ? [...cells] : [cells])
                      rows[row][column] = event.currentTarget.innerText
                      update(id, { rows })
                    }}>{String(cell ?? '')}</td> 
                ))}</tr>
              ))}
            </tbody></table>
          )
          const Tag = { heading: 'h2', paragraph: 'p', quote: 'blockquote' }[type] ?? 'p'
          return <Tag className={`min-h-[1.5em] whitespace-pre-wrap [overflow-wrap:anywhere] focus:rounded focus:outline-2 focus:outline-accent ${type === 'heading' ? 'mt-6 mb-2 text-xl font-semibold' : type === 'quote' ? 'mx-0 my-4 border-l-[3px] border-l-accent pl-4 text-quiet' : 'my-3'}`} key={id} contentEditable={readOnly ? false : 'plaintext-only'} suppressContentEditableWarning
            role={readOnly ? undefined : 'textbox'} aria-multiline={readOnly ? undefined : true}
            aria-label={label}
            onBlur={event => { if (!readOnly) update(id, { text: event.currentTarget.innerText }) }}>{String(content.text ?? '')}</Tag>
        })}
      </div>
    </section>
  )
}
