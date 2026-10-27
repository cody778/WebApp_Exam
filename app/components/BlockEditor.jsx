const labels = { heading: 'Heading', paragraph: 'Paragraph', quote: 'Quote', table: 'Table', link: 'Link', image: 'Image', video: 'Video' }

export default function BlockEditor({ blocks, onChange, readOnly = false }) { // Content for a simple block editor
  function update(id, values) {
    onChange(blocks.map(block => block.id === id ? { ...block, content: { ...block.content, ...values } } : block))
  }

  return (
    <section className="lesson-editor" aria-label="Lesson content">
      {!readOnly && <select aria-label="Add block" value="" onChange={event => {
        const type = event.target.value // gets the selected block type
        const content = type === 'table' ? { rows: Array.from({ length: 3 }, () => ['', '', '']) } // initializes a table with 3 rows and 3 columns
          : ['link', 'image', 'video'].includes(type) ? { url: '' } : { text: '' }
        onChange([...blocks, { id: crypto.randomUUID(), type, content }])
      }}>
        <option value="" disabled>Add block</option> 
        {Object.entries(labels).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
      </select>}
      <div className="lesson-paper">
        {blocks.map((block, index) => {
          const { id, type, content } = block
          const label = `${labels[type]} ${index + 1}`
          if (['link', 'image', 'video'].includes(type)) { // handles link, image, and video blocks
            if (!readOnly) return <label key={id}>{label}
              <input type="url" value={content.url} pattern="https://[^\s]+" placeholder="https://" required onChange={event => update(id, { url: event.target.value })} />
            </label>
            return /^https:\/\/\S+$/.test(content.url) ? <p key={id}><a href={content.url} target="_blank" rel="noopener noreferrer">{content.title || `${labels[type]}: ${content.url}`}</a></p> : <p key={id}>This {labels[type].toLowerCase()} is unavailable.</p>
          }
          if (type === 'table') return ( // handles table blocks
            <table key={id} aria-label={label}><tbody>
              {content.rows.map((cells, row) => (
                <tr key={row}>{(Array.isArray(cells) ? cells : [cells]).map((cell, column) => (
                  <td key={column} contentEditable={readOnly ? false : 'plaintext-only'} suppressContentEditableWarning
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
          return <Tag key={id} contentEditable={readOnly ? false : 'plaintext-only'} suppressContentEditableWarning
            role={readOnly ? undefined : 'textbox'} aria-multiline={readOnly ? undefined : true}
            aria-label={label}
            onBlur={event => { if (!readOnly) update(id, { text: event.currentTarget.innerText }) }}>{String(content.text ?? '')}</Tag>
        })}
      </div>
    </section>
  )
}
