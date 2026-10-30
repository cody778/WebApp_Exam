import iconCheck from '../assets/public-path/icon-check.svg'

export const httpsUrl = /^https:\/\/\S+$/

export const headingStyles = {
  1: 'text-[28px] leading-[1.2] font-bold tracking-[-0.56px]',
  2: 'text-[22px] leading-[1.25] font-semibold tracking-[-0.44px]',
  3: 'text-lg leading-[1.3] font-semibold',
  4: 'text-base leading-[1.4] font-semibold',
}

/** @param {{ type: string, content: object }} block */
export function headingLevel(block) {
  return block.type === 'heading' ? block.content.level ?? 2 : null
}

/** @param {string} url */
export function youTubeId(url) {
  return url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)?.[1] ?? null
}

/**
 * Image or video preview for a link. Nothing renders until the link is a full https address.
 * @param {{ type: 'image' | 'video', url: string }} props
 */
export function MediaPreview({ type, url }) {
  const link = url.trim()
  if (!httpsUrl.test(link)) return null
  if (type === 'image') return <img src={link} alt="" className="block max-h-80 w-full rounded-lg bg-surface-muted object-contain" />
  const videoId = youTubeId(link)
  return videoId ? (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
      title="Step video"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="block aspect-video w-full rounded-lg border-0"
    />
  ) : (
    <video src={link} controls className="block max-h-80 w-full rounded-lg bg-ink" />
  )
}

const text = 'm-0 whitespace-pre-wrap [overflow-wrap:anywhere] text-ink'

/** Read-only content of one block. */
export function StepBlock({ block }) {
  const { type, content } = block
  const level = headingLevel(block)
  if (level) {
    const Tag = `h${Math.min(level + 2, 6)}`
    return <Tag className={`${text} ${headingStyles[level]}`}>{content.text}</Tag>
  }
  if (type === 'image' || type === 'video') return <MediaPreview type={type} url={content.url ?? ''} />
  if (type === 'quote') return <blockquote className={`${text} mx-0 border-l-[3px] border-accent-muted pl-4 text-sm leading-[1.4]`}>{content.text}</blockquote>
  if (type === 'link') {
    return httpsUrl.test(content.url ?? '') ? (
      <a href={content.url} target="_blank" rel="noopener noreferrer" className="!m-0 !inline !border-0 !p-0 text-sm text-accent underline">
        {content.title || content.url}
      </a>
    ) : null
  }
  if (type === 'table') {
    return (
      <table className="w-full table-fixed border-collapse text-sm">
        <tbody>
          {content.rows.map((cells, row) => (
            <tr key={row}>
              {(Array.isArray(cells) ? cells : [cells]).map((cell, column) => (
                <td key={column} className="border border-accent-muted p-2 align-top whitespace-pre-wrap">
                  {String(cell ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
  return <p className={`${text} text-sm leading-[1.4]`}>{content.text}</p>
}

/**
 * Read-only step content. Neighbouring list items are grouped into one list.
 * @param {{ blocks: Array<{ id: string, type: string, content: object }>, emptyMessage?: string }} props
 */
export default function StepBlocks({ blocks, emptyMessage = 'This step has no content yet.' }) {
  const groups = []
  for (const block of blocks) {
    const list = block.type === 'paragraph' ? block.content.list : null
    const last = groups.at(-1)
    if (list && last?.list === list) last.items.push(block)
    else groups.push({ list, items: [block] })
  }

  if (!blocks.some((block) => (block.content.text ?? block.content.url ?? block.content.rows)?.length)) {
    return <p className="m-0 text-sm leading-[1.4] text-quiet">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map(({ list, items }) => {
        if (list === 'bulleted' || list === 'numbered') {
          const List = list === 'bulleted' ? 'ul' : 'ol'
          return (
            <List key={items[0].id} className={`m-0 flex flex-col gap-1 pl-5 text-sm leading-[1.4] text-ink ${list === 'bulleted' ? 'list-disc' : 'list-decimal'}`}>
              {items.map((item) => (
                <li key={item.id} className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                  {item.content.text}
                </li>
              ))}
            </List>
          )
        }
        if (list === 'todo') {
          return (
            <ul key={items[0].id} className="m-0 flex list-none flex-col gap-2 p-0">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-sm leading-[1.4]">
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-brand ${item.content.checked ? 'bg-brand' : ''}`}
                  >
                    {item.content.checked && <img src={iconCheck} alt="" width="12.2667" height="8.93333" className="block max-w-none" />}
                  </span>
                  <span className={`whitespace-pre-wrap [overflow-wrap:anywhere] ${item.content.checked ? 'text-quiet line-through' : 'text-ink'}`}>
                    {item.content.checked ? <span className="sr-only">Done: </span> : null}
                    {item.content.text}
                  </span>
                </li>
              ))}
            </ul>
          )
        }
        return <StepBlock key={items[0].id} block={items[0]} />
      })}
    </div>
  )
}
