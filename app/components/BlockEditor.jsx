const labels = { heading: 'Heading', paragraph: 'Paragraph', quote: 'Quote', table: 'Table', link: 'Link', image: 'Image', video: 'Video' }

export default function BlockEditor({ blocks, onChange, readOnly = false }) { // Content for a simple block editor
  function update(id, values) {
    onChange(blocks.map(block => block.id === id ? { ...block, content: { ...block.content, ...values } } : block))
  }

  return (
    <section aria-label="Lesson content">
      {!readOnly && <select className="mb-4 p-2 [font:inherit]" aria-label="Add block" value="" onChange={event => {
        const type = event.target.value // gets the selected block type
        const content = type === 'table' ? { rows: Array.from({ length: 3 }, () => ['', '', '']) } // initializes a table with 3 rows and 3 columns
          : ['link', 'image', 'video'].includes(type) ? { url: '' } : { text: '' }
        onChange([...blocks, { id: crypto.randomUUID(), type, content }])
      }}>
        <option value="" disabled>Add block</option> 
        {Object.entries(labels).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
      </select>}
      <div className="min-h-[65vh] whitespace-pre-wrap [overflow-wrap:anywhere] bg-white p-[clamp(1rem,4vw,3rem)]">
        {blocks.map((block, index) => {
          const { id, type, content } = block
          const label = `${labels[type]} ${index + 1}`
          if (['link', 'image', 'video'].includes(type)) { // handles link, image, and video blocks
            if (!readOnly) return <label key={id}>{label}
              <input type="url" value={content.url} pattern="https://[^\s]+" placeholder="https://" required onChange={event => update(id, { url: event.target.value })} />
            </label>
            return /^https:\/\/\S+$/.test(content.url) ? <p key={id}><a className="inline-block m-1 rounded border border-current px-3 py-2 text-inherit no-underline" href={content.url} target="_blank" rel="noopener noreferrer">{content.title || `${labels[type]}: ${content.url}`}</a></p> : <p key={id}>This {labels[type].toLowerCase()} is unavailable.</p>
          }
          if (type === 'table') return ( // handles table blocks
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
          return <Tag className={`min-h-[1.5em] whitespace-pre-wrap [overflow-wrap:anywhere] focus:outline focus:outline-[#ddd] ${type === 'quote' ? 'mx-0 my-4 border-l-[3px] border-l-[#aaa] pl-4' : ''}`} key={id} contentEditable={readOnly ? false : 'plaintext-only'} suppressContentEditableWarning
            role={readOnly ? undefined : 'textbox'} aria-multiline={readOnly ? undefined : true}
            aria-label={label}
            onBlur={event => { if (!readOnly) update(id, { text: event.currentTarget.innerText }) }}>{String(content.text ?? '')}</Tag>
        })}
      </div>
    </section>
  )
}
