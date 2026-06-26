'use client'

import { Fragment, type ReactNode, type ElementType } from 'react'
import { cn } from '@/lib/utils'

/**
 * Lightweight markdown renderer for assistant answers. A line-oriented parser
 * handles the subset the model produces — headings, bullet/numbered lists
 * (including a lead-in sentence before them), GFM tables, blockquotes and
 * paragraphs — plus inline **bold**, *italic*, `code`, [text](links) and the
 * [n] citation chips wired to the sources panel. Underscore emphasis is left
 * untouched so field names like permit_status are not mangled.
 */

const INLINE_PATTERN =
  /(\*\*[^*]+\*\*|\*(?!\s)[^*\n]+(?<!\s)\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\[\d+(?:\s*,\s*\d+)*\])/g

// As above, plus document references (POL-UD-002, §10.1, SOP §10.1) which the
// parent resolves and renders as links. Only used when a resolver is supplied.
const INLINE_PATTERN_WITH_REFS =
  /(\*\*[^*]+\*\*|\*(?!\s)[^*\n]+(?<!\s)\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\)|\[\d+(?:\s*,\s*\d+)*\]|POL-UD-\d+(?:\s+§\s?\d+(?:\.\d+)*)?|SOP-UD-\d+(?:\s+§\s?\d+(?:\.\d+)*)?|(?:SOP|Policy|POL)\s+§\s?\d+(?:\.\d+)*|§\s?\d+(?:\.\d+)*)/gi

const REFERENCE_PART =
  /^(?:POL-UD-\d+(?:\s+§\s?\d+(?:\.\d+)*)?|SOP-UD-\d+(?:\s+§\s?\d+(?:\.\d+)*)?|(?:SOP|Policy|POL)\s+§\s?\d+(?:\.\d+)*|§\s?\d+(?:\.\d+)*)$/i

type InlineOptions = {
  onCitation?: (ref: number) => void
  renderReference?: (raw: string, key: string) => ReactNode | null
}

function renderInline(
  text: string,
  keyPrefix: string,
  options: InlineOptions,
): ReactNode[] {
  const { onCitation, renderReference } = options
  const nodes: ReactNode[] = []
  const parts = text.split(
    renderReference ? INLINE_PATTERN_WITH_REFS : INLINE_PATTERN,
  )

  parts.forEach((part, index) => {
    if (!part) return
    const key = `${keyPrefix}-${index}`

    if (part.startsWith('**') && part.endsWith('**')) {
      nodes.push(
        <strong key={key} className="font-bold text-ink-700">
          {part.slice(2, -2)}
        </strong>,
      )
      return
    }
    if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
      nodes.push(
        <em key={key} className="italic">
          {part.slice(1, -1)}
        </em>,
      )
      return
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-muted px-1.5 py-0.5 text-[0.9em] text-ink-700"
        >
          {part.slice(1, -1)}
        </code>,
      )
      return
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
    if (link) {
      nodes.push(
        <a
          key={key}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-link-blue underline underline-offset-2 hover:text-teal-600"
        >
          {link[1]}
        </a>,
      )
      return
    }
    const citation = part.match(/^\[(\d+(?:\s*,\s*\d+)*)\]$/)
    if (citation) {
      const refs = citation[1].split(',').map((n) => parseInt(n.trim(), 10))
      nodes.push(
        <span key={key} className="ml-0.5 inline-flex gap-0.5 align-middle">
          {refs.map((ref) => (
            <button
              key={`${key}-${ref}`}
              type="button"
              onClick={() => onCitation?.(ref)}
              className="inline-flex size-5 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold leading-none text-teal-700 transition-colors hover:bg-teal-600 hover:text-primary-foreground"
              aria-label={`Show source ${ref}`}
            >
              {ref}
            </button>
          ))}
        </span>,
      )
      return
    }
    if (renderReference && REFERENCE_PART.test(part)) {
      const node = renderReference(part, key)
      if (node) {
        nodes.push(node)
        return
      }
    }
    nodes.push(<Fragment key={key}>{part}</Fragment>)
  })

  return nodes
}

const HEADING_CLASS: Record<number, string> = {
  1: 'text-xl font-bold leading-snug text-ink-700',
  2: 'text-lg font-bold leading-snug text-ink-700',
  3: 'text-base font-bold leading-snug text-ink-700',
}

const isBullet = (line: string) => /^\s*[-*]\s+/.test(line)
const isNumbered = (line: string) => /^\s*\d+\.\s+/.test(line)
const isHeading = (line: string) => /^#{1,6}\s+/.test(line)
const isQuote = (line: string) => /^\s*>\s?/.test(line)
const isRule = (line: string) => /^\s*([-*_])\1{2,}\s*$/.test(line)
const isTableRow = (line: string) => /^\s*\|.*\|\s*$/.test(line)
const isTableDivider = (line: string) =>
  /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(line) && line.includes('-')

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim())
}

export function Markdown({
  content,
  onCitation,
  renderReference,
  className,
}: {
  content: string
  onCitation?: (ref: number) => void
  renderReference?: (raw: string, key: string) => ReactNode | null
  className?: string
}) {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let index = 0
  let blockKey = 0
  // Ordered-list numbering continues across groups split only by their nested
  // bullets (the model emits "1." per item with sub-bullets between), and
  // resets on any real separator block below so independent lists restart.
  let orderedNext = 1
  const cite = (text: string, prefix: string) =>
    renderInline(text, `${prefix}-${blockKey}`, { onCitation, renderReference })

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index++
      continue
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/)
    if (heading) {
      orderedNext = 1
      const level = heading[1].length
      const Tag = `h${Math.min(level + 1, 6)}` as ElementType
      blocks.push(
        <Tag key={blockKey} className={HEADING_CLASS[Math.min(level, 3)]}>
          {cite(heading[2], 'h')}
        </Tag>,
      )
      blockKey++
      index++
      continue
    }

    if (isRule(line)) {
      orderedNext = 1
      blocks.push(<hr key={blockKey} className="border-border" />)
      blockKey++
      index++
      continue
    }

    if (
      isTableRow(line) &&
      index + 1 < lines.length &&
      isTableDivider(lines[index + 1])
    ) {
      orderedNext = 1
      const header = splitTableRow(line)
      index += 2
      const rows: string[][] = []
      while (index < lines.length && isTableRow(lines[index])) {
        rows.push(splitTableRow(lines[index]))
        index++
      }
      blocks.push(
        <div
          key={blockKey}
          className="overflow-x-auto rounded-lg border border-border"
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {header.map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    className="border-b border-border bg-muted px-3 py-2 text-left font-semibold text-ink-700"
                  >
                    {cite(cell, `th-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border/60 last:border-0"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-3 py-2 align-top text-ink-600"
                    >
                      {cite(cell, `td-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      blockKey++
      continue
    }

    if (isQuote(line)) {
      orderedNext = 1
      const quoted: string[] = []
      while (index < lines.length && isQuote(lines[index])) {
        quoted.push(lines[index].replace(/^\s*>\s?/, ''))
        index++
      }
      blocks.push(
        <blockquote
          key={blockKey}
          className="border-l-2 border-border pl-4 text-ink-600"
        >
          {quoted.map((quoteLine, quoteIndex) => (
            <Fragment key={quoteIndex}>
              {quoteIndex > 0 && <br />}
              {cite(quoteLine, `quote-${quoteIndex}`)}
            </Fragment>
          ))}
        </blockquote>,
      )
      blockKey++
      continue
    }

    if (isBullet(line) || isNumbered(line)) {
      const numbered = isNumbered(line)
      const matches = numbered ? isNumbered : isBullet
      const items: string[] = []
      while (index < lines.length && matches(lines[index])) {
        items.push(lines[index].replace(/^\s*(?:[-*]|\d+\.)\s+/, ''))
        index++
      }
      const listItems = items.map((item, itemIndex) => (
        <li key={itemIndex} className="pl-1 marker:text-ink-500">
          {cite(item, `li-${itemIndex}`)}
        </li>
      ))
      if (numbered) {
        const start = orderedNext
        orderedNext += items.length
        blocks.push(
          <ol
            key={blockKey}
            start={start}
            className="flex list-decimal flex-col gap-1.5 pl-5"
          >
            {listItems}
          </ol>,
        )
      } else {
        // Bullets that follow a numbered item are its sub-points — indent them
        // so they read as nested under it (the model emits them flat).
        const nested = orderedNext > 1
        blocks.push(
          <ul
            key={blockKey}
            className={cn(
              'flex list-disc flex-col gap-1.5',
              nested ? 'pl-10' : 'pl-5',
            )}
          >
            {listItems}
          </ul>,
        )
      }
      blockKey++
      continue
    }

    orderedNext = 1
    const paragraph: string[] = []
    while (
      index < lines.length &&
      lines[index].trim() &&
      !isBullet(lines[index]) &&
      !isNumbered(lines[index]) &&
      !isHeading(lines[index]) &&
      !isQuote(lines[index]) &&
      !isTableRow(lines[index])
    ) {
      paragraph.push(lines[index])
      index++
    }
    blocks.push(
      <p key={blockKey}>
        {paragraph.map((paragraphLine, lineIndex) => (
          <Fragment key={lineIndex}>
            {lineIndex > 0 && <br />}
            {cite(paragraphLine, `p-${lineIndex}`)}
          </Fragment>
        ))}
      </p>,
    )
    blockKey++
  }

  return (
    <div className={cn('flex flex-col gap-3 text-base leading-7', className)}>
      {blocks}
    </div>
  )
}
