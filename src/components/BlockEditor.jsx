import { useState } from 'react'

export default function BlockEditor() {
  const [blocks, setBlocks] = useState(() => [{ id: crypto.randomUUID(), type: 'p' }])

  return (
    <section className="lesson-editor" aria-label="Lesson content">
      <select aria-label="Add block" value="" onChange={event => {
        const block = { id: crypto.randomUUID(), type: event.target.value }
        setBlocks(current => [...current, block])
      }}>
        <option value="" disabled>Add block</option>
        <option value="h2">Heading</option>
        <option value="p">Paragraph</option>
        <option value="blockquote">Quote</option>
        <option value="table">Table</option>
      </select>
      <div className="lesson-paper">
        {blocks.map(({ id, type }, index) => {
          if (type === 'table') return (
            <table key={id} aria-label={`Table ${index + 1}`}><tbody>
              {Array.from({ length: 3 }, (_, row) => (
                <tr key={row}>{Array.from({ length: 3 }, (_, column) => (
                  <td key={column} contentEditable="plaintext-only" suppressContentEditableWarning aria-label={`Row ${row + 1}, column ${column + 1}`} />
                ))}</tr>
              ))}
            </tbody></table>
          )
          const Tag = type
          return <Tag key={id} contentEditable="plaintext-only" suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label={`${type === 'h2' ? 'Heading' : type === 'blockquote' ? 'Quote' : 'Paragraph'} ${index + 1}`} />
        })}
      </div>
    </section>
  )
}
