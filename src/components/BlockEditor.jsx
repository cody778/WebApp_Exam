import { useState } from 'react'
import TextBlock from './TextBlock.jsx'

export default function BlockEditor() {
  const [blocks, setBlocks] = useState(() => [{ id: crypto.randomUUID(), text: '' }])

  function updateBlock(id, text) {
    setBlocks(current => current.map(block => block.id === id ? { ...block, text } : block))
  }

  function removeBlock(id) {
    setBlocks(current => current.filter(block => block.id !== id))
  }

  function addBlock() {
    const block = { id: crypto.randomUUID(), text: '' }
    setBlocks(current => [...current, block])
  }

  return (
    <section aria-label="Lesson content">
      {blocks.map((block, index) => (
        <TextBlock
          key={block.id}
          text={block.text}
          number={index + 1}
          onChange={text => updateBlock(block.id, text)}
          onRemove={() => removeBlock(block.id)}
        />
      ))}
      <button type="button" onClick={addBlock}>Add text block</button>
    </section>
  )
}
