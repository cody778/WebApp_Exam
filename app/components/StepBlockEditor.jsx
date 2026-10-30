import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import gutterPlus from '../assets/create-path/plus.svg'
import removeIcon from '../assets/create-path/remove.svg'
import plusIcon from '../assets/create-path/blocks/plus.svg'
import imageIcon from '../assets/create-path/blocks/image.svg'
import videoIcon from '../assets/create-path/blocks/video.svg'
import listIcon from '../assets/create-path/blocks/list.svg'
import orderedIcon from '../assets/create-path/blocks/list-ordered.svg'
import todoIcon from '../assets/create-path/blocks/check-square.svg'
import iconCheck from '../assets/public-path/icon-check.svg'

/** @returns {{ id: string, type: string, content: object }} */
export function textBlock(content = {}) {
  return { id: crypto.randomUUID(), type: 'paragraph', content: { text: '', ...content } }
}

const httpsUrl = /^https:\/\/\S+$/

/** Trims blocks for saving and drops empty ones. A step always keeps at least one block. */
export function cleanBlocks(blocks) {
  const kept = blocks.flatMap((block) => {
    if (block.type === 'image' || block.type === 'video') {
      const url = block.content.url.trim()
      return httpsUrl.test(url) ? [{ ...block, content: { ...block.content, url } }] : []
    }
    const text = (block.content.text ?? '').trim()
    return text ? [{ ...block, content: { ...block.content, text } }] : []
  })
  return kept.length ? kept : [textBlock()]
}

/** @param {{ content: object, type: string }} block */
export function blockHasContent(block) {
  return Boolean((block.content.text ?? block.content.url ?? '').trim())
}

const heading = (level) => () => ({ type: 'heading', content: { text: '', level } })

// Headings keep the existing "heading" type with a level; lists are paragraphs with a list style.
const basicBlocks = [
  { label: 'Text', glyph: 'T', glyphClass: 'text-lg font-medium', make: () => ({ type: 'paragraph', content: { text: '' } }) },
  { label: 'Heading 1', glyph: 'H₁', make: heading(1) },
  { label: 'Heading 2', glyph: 'H₂', make: heading(2) },
  { label: 'Heading 3', glyph: 'H₃', make: heading(3) },
  { label: 'Heading 4', glyph: 'H₄', make: heading(4) },
  { label: 'Bulleted list', icon: listIcon, make: () => ({ type: 'paragraph', content: { text: '', list: 'bulleted' } }) },
  { label: 'Numbered list', icon: orderedIcon, make: () => ({ type: 'paragraph', content: { text: '', list: 'numbered' } }) },
  { label: 'To-do list', icon: todoIcon, make: () => ({ type: 'paragraph', content: { text: '', list: 'todo', checked: false } }) },
]

const mediaBlocks = {
  image: () => ({ type: 'image', content: { url: '' } }),
  video: () => ({ type: 'video', content: { url: '' } }),
}

const textStyles = {
  1: 'text-[28px] leading-[1.2] font-bold tracking-[-0.56px]',
  2: 'text-[22px] leading-[1.25] font-semibold tracking-[-0.44px]',
  3: 'text-lg leading-[1.3] font-semibold',
  4: 'text-base leading-[1.4] font-semibold',
}

// Lines the gutter plus up with the first line of each text size.
const gutterOffset = { 1: 'top-[7px]', 2: 'top-1', 3: 'top-0.5', 4: 'top-px' }

function headingLevel(block) {
  return block.type === 'heading' ? block.content.level ?? 2 : null
}

function youTubeId(url) {
  return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)?.[1] ?? null
}

/** Textarea that grows with its text. */
function GrowingText({ fieldRef, value, className, ...props }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const element = ref.current
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={(element) => {
        ref.current = element
        fieldRef(element)
      }}
      rows={1}
      value={value}
      className={`m-0 block w-full min-w-0 flex-1 resize-none overflow-hidden border-0 bg-transparent p-0 font-sans text-ink outline-none placeholder:text-[#c4c4c4] ${className}`}
      {...props}
    />
  )
}

/**
 * Block picker. A sheet fixed to the bottom on small screens; a menu next to the plus on desktop.
 * @param {{ anchor: DOMRect, onChoose: (make: () => object) => void, onClose: () => void }} props
 */
function BlockMenu({ anchor, onChoose, onClose }) {
  const menuRef = useRef(null)
  const [place, setPlace] = useState(null)

  useLayoutEffect(() => {
    const { offsetHeight: height, offsetWidth: width } = menuRef.current
    let top = anchor.bottom + 6
    if (top + height > window.innerHeight - 8) top = Math.max(8, anchor.top - height - 6)
    const left = Math.min(Math.max(8, anchor.left), window.innerWidth - width - 8)
    setPlace({ top, left })
  }, [anchor])

  useEffect(() => {
    if (place) menuRef.current.querySelector('[data-first]')?.focus()
  }, [place])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const tool =
    '!m-0 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent !p-0 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-accent'

  return createPortal(
    <div className="box-border [&_*]:box-border fixed inset-0 z-[60] font-sans">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close block menu"
        onClick={onClose}
        className="!m-0 absolute inset-0 cursor-default border-0 bg-ink/30 !p-0 lg:bg-transparent"
      />
      <div
        ref={menuRef}
        role="dialog"
        aria-label="Add a block"
        style={{ '--menu-top': `${place?.top ?? 0}px`, '--menu-left': `${place?.left ?? 0}px` }}
        className={`absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-ink pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,0,0,0.25)] lg:inset-x-auto lg:top-[var(--menu-top)] lg:bottom-auto lg:left-[var(--menu-left)] lg:w-[442px] lg:rounded-xl lg:pb-0 lg:shadow-[0_12px_32px_rgba(0,0,0,0.3)] ${place ? '' : 'lg:invisible'}`}
      >
        <div className="flex h-[52px] items-center gap-2 border-b border-white/10 px-4 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent" title="Basic blocks">
            <img src={plusIcon} alt="" width="20" height="20" className="block max-w-none" />
          </span>
          <button type="button" aria-label="Add an image" onClick={() => onChoose(mediaBlocks.image)} className={tool}>
            <img src={imageIcon} alt="" width="20" height="20" className="block max-w-none" />
          </button>
          <button type="button" aria-label="Add a video" onClick={() => onChoose(mediaBlocks.video)} className={tool}>
            <img src={videoIcon} alt="" width="22" height="18" className="block max-w-none" />
          </button>
        </div>
        <p className="m-0 px-4 pt-4 pb-1 text-[11px] leading-normal font-medium text-[#6b7280] uppercase">Basic blocks</p>
        <div className="grid grid-cols-2 px-2 pt-1 pb-4">
          {basicBlocks.map((option, index) => (
            <button
              key={option.label}
              type="button"
              data-first={index === 0 || undefined}
              onClick={() => onChoose(option.make)}
              className="!m-0 flex h-12 min-w-0 cursor-pointer items-center gap-3 rounded-md border-0 bg-transparent !px-2 !py-0 text-left hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none"
            >
              <span className="flex size-8 shrink-0 items-center justify-center text-[#9ca3af]">
                {option.icon ? (
                  <img src={option.icon} alt="" width="20" height="20" className="block max-w-none" />
                ) : (
                  <span className={`leading-normal ${option.glyphClass ?? 'text-sm font-semibold'}`}>{option.glyph}</span>
                )}
              </span>
              <span className="truncate text-[15px] leading-normal font-normal text-[#e5e7eb]">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}

/**
 * Notion-style editor for one step. Each line is a block; the plus beside a block opens the block picker.
 * Enter starts a new block, Backspace on an empty block removes it, and "/" on an empty block opens the picker.
 * @param {{ blocks: Array<{ id: string, type: string, content: object }>, onChange: (blocks: object[]) => void, label: string }} props
 */
export default function StepBlockEditor({ blocks, onChange, label }) {
  const fields = useRef(new Map())
  const pendingFocus = useRef(null)
  const [menu, setMenu] = useState(null)

  useEffect(() => {
    const target = pendingFocus.current
    const element = target && fields.current.get(target.id)
    if (!element) return
    pendingFocus.current = null
    element.focus()
    if (target.atEnd && element.setSelectionRange) element.setSelectionRange(element.value.length, element.value.length)
  })

  function fieldRef(id) {
    return (element) => {
      if (element) fields.current.set(id, element)
      else fields.current.delete(id)
    }
  }

  function replace(id, block) {
    onChange(blocks.map((item) => (item.id === id ? block : item)))
  }

  function patch(id, values) {
    onChange(blocks.map((item) => (item.id === id ? { ...item, content: { ...item.content, ...values } } : item)))
  }

  function insertAfter(id, block) {
    const index = blocks.findIndex((item) => item.id === id)
    const next = [...blocks]
    next.splice(index + 1, 0, block)
    onChange(next)
    pendingFocus.current = { id: block.id }
  }

  function remove(id) {
    const index = blocks.findIndex((item) => item.id === id)
    if (blocks.length === 1) {
      const block = textBlock()
      onChange([block])
      pendingFocus.current = { id: block.id }
      return
    }
    onChange(blocks.filter((item) => item.id !== id))
    const previous = blocks[index - 1] ?? blocks[index + 1]
    pendingFocus.current = { id: previous.id, atEnd: true }
  }

  function openMenu(element, blockId) {
    setMenu({ blockId, anchor: element.getBoundingClientRect() })
  }

  function choose(make) {
    const anchor = blocks.find((item) => item.id === menu.blockId)
    setMenu(null)
    const block = { id: crypto.randomUUID(), ...make() }
    const emptyText = anchor && (anchor.type === 'paragraph' || anchor.type === 'heading') && !blockHasContent(anchor)
    if (emptyText) {
      replace(anchor.id, { ...block, id: anchor.id })
      pendingFocus.current = { id: anchor.id }
      return
    }
    insertAfter(anchor?.id ?? blocks.at(-1).id, block)
  }

  function onTextKeyDown(event, block) {
    const text = block.content.text ?? ''
    const { list } = block.content
    const atStart = event.currentTarget.selectionStart === 0 && event.currentTarget.selectionEnd === 0

    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      if (list && !text.trim()) {
        replace(block.id, { id: block.id, type: 'paragraph', content: { text: '' } })
        return
      }
      insertAfter(block.id, textBlock(list ? { list, ...(list === 'todo' ? { checked: false } : {}) } : {}))
      return
    }
    if (event.key === 'Backspace' && atStart) {
      if (block.type === 'heading' || list) {
        event.preventDefault()
        replace(block.id, { id: block.id, type: 'paragraph', content: { text } })
        pendingFocus.current = { id: block.id }
        return
      }
      if (!text && blocks.length > 1) {
        event.preventDefault()
        remove(block.id)
      }
      return
    }
    if (event.key === '/' && !text) {
      event.preventDefault()
      openMenu(event.currentTarget, block.id)
    }
  }

  function focusLast(event) {
    if (event.target !== event.currentTarget) return
    fields.current.get(blocks.at(-1)?.id)?.focus()
  }

  let number = 0

  return (
    <div role="group" aria-label={label} onClick={focusLast} className="flex min-h-32 cursor-text flex-col gap-2">
      {blocks.map((block, index) => {
        const level = headingLevel(block)
        const { list } = block.content
        number = list === 'numbered' ? number + 1 : 0
        const isMedia = block.type === 'image' || block.type === 'video'
        const url = isMedia ? block.content.url : ''
        const validUrl = httpsUrl.test(url.trim())
        const videoId = block.type === 'video' && validUrl ? youTubeId(url) : null

        return (
          <div key={block.id} className="group/block relative flex cursor-auto items-start gap-2">
            <button
              type="button"
              aria-label="Add a block"
              aria-haspopup="dialog"
              onClick={(event) => openMenu(event.currentTarget, block.id)}
              className={`!m-0 absolute -left-6 flex size-5 cursor-pointer items-center justify-center rounded border-0 bg-transparent !p-0 opacity-0 transition-opacity group-focus-within/block:opacity-100 group-hover/block:opacity-100 hover:bg-black/5 focus-visible:opacity-100 lg:-left-7 lg:size-6 ${
                level ? gutterOffset[level] : isMedia ? 'top-2' : 'top-0'
              } ${menu?.blockId === block.id ? 'opacity-100' : ''}`}
            >
              <img src={gutterPlus} alt="" width="11.3333" height="11.3333" className="block max-w-none" />
            </button>

            {list === 'bulleted' && <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full bg-ink" />}
            {list === 'numbered' && (
              <span aria-hidden="true" className="min-w-4 shrink-0 text-sm leading-[1.4] text-ink tabular-nums">
                {number}.
              </span>
            )}
            {list === 'todo' && (
              <button
                type="button"
                role="checkbox"
                aria-checked={Boolean(block.content.checked)}
                aria-label="Done"
                onClick={() => patch(block.id, { checked: !block.content.checked })}
                className={`!m-0 mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded border border-brand !p-0 ${
                  block.content.checked ? 'bg-brand' : 'bg-transparent'
                }`}
              >
                {block.content.checked && <img src={iconCheck} alt="" width="12.2667" height="8.93333" className="block max-w-none" />}
              </button>
            )}

            {isMedia ? (
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    ref={fieldRef(block.id)}
                    type="url"
                    value={url}
                    placeholder={block.type === 'image' ? 'Paste an image link (https://...)' : 'Paste a YouTube or video link (https://...)'}
                    aria-label={block.type === 'image' ? 'Image link' : 'Video link'}
                    onChange={(event) => patch(block.id, { url: event.target.value })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        insertAfter(block.id, textBlock())
                      }
                      if (event.key === 'Backspace' && !url) {
                        event.preventDefault()
                        remove(block.id)
                      }
                    }}
                    className="m-0 min-w-0 flex-1 rounded-md border border-accent-muted bg-white px-3 py-2 font-sans text-sm leading-[1.4] text-ink outline-none placeholder:text-placeholder focus:border-accent"
                  />
                  <button
                    type="button"
                    aria-label={block.type === 'image' ? 'Remove image' : 'Remove video'}
                    onClick={() => remove(block.id)}
                    className="!m-0 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent !p-0 hover:bg-[#9e2020]/10"
                  >
                    <img src={removeIcon} alt="" width="12" height="12" className="block max-w-none" />
                  </button>
                </div>
                {validUrl && block.type === 'image' && (
                  <img src={url.trim()} alt="" className="block max-h-80 w-full rounded-lg bg-surface-muted object-contain" />
                )}
                {validUrl && block.type === 'video' &&
                  (videoId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                      title="Step video"
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="block aspect-video w-full rounded-lg border-0"
                    />
                  ) : (
                    <video src={url.trim()} controls className="block max-h-80 w-full rounded-lg bg-ink" />
                  ))}
              </div>
            ) : (
              <GrowingText
                fieldRef={fieldRef(block.id)}
                value={block.content.text ?? ''}
                aria-label={level ? `Heading ${level}` : list ? `${list} item` : 'Text'}
                placeholder={blocks.length === 1 && index === 0 && !list && !level ? 'Describe this step, or press + to add blocks' : level ? `Heading ${level}` : 'Write something'}
                onChange={(event) => patch(block.id, { text: event.target.value })}
                onKeyDown={(event) => onTextKeyDown(event, block)}
                className={`${level ? textStyles[level] : 'text-sm leading-[1.4] font-normal'} ${
                  list === 'todo' && block.content.checked ? 'text-quiet line-through' : ''
                } ${blocks.length === 1 ? '' : 'placeholder:opacity-0 focus:placeholder:opacity-100'}`}
              />
            )}
          </div>
        )
      })}
      {menu && (
        <BlockMenu
          anchor={menu.anchor}
          onChoose={choose}
          onClose={() => {
            pendingFocus.current = { id: menu.blockId, atEnd: true }
            setMenu(null)
          }}
        />
      )}
    </div>
  )
}
