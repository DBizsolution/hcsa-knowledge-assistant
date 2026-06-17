'use client'

import { Fragment, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Lightweight markdown renderer for assistant answers. Handles the subset the
 * model produces — paragraphs, bullet/numbered lists, headings, bold, inline
 * code — plus inline [n] citation chips wired to the sources panel.
 */

function renderInline(
  text: string,
  keyPrefix: string,
  onCitation?: (ref: number) => void,
): ReactNode[] {
  const nodes: ReactNode[] = []
  // Matches **bold**, `code`, or [1] / [1, 2] citations.
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[\d+(?:\s*,\s*\d+)*\])/g
  const parts = text.split(pattern)

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
    const citation = part.match(/^\[(\d+(?:\s*,\s*\d+)*)\]$/)
    if (citation) {
      const refs = citation[1].split(',').map((n) => parseInt(n.trim(), 10))
      nodes.push(
        <span key={key} className="inline-flex gap-0.5 align-baseline">
          {refs.map((ref, refIndex) => (
            <button
              key={`${key}-${ref}`}
              type="button"
              onClick={() => onCitation?.(ref)}
              className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded bg-teal-50 px-1 text-xs font-bold text-teal-800 align-super leading-none transition-colors hover:bg-teal-600 hover:text-white"
              aria-label={`Show source ${ref}`}
            >
              {ref}
              {refIndex < refs.length - 1 ? '' : ''}
            </button>
          ))}
        </span>,
      )
      return
    }
    nodes.push(<Fragment key={key}>{part}</Fragment>)
  })

  return nodes
}

export function Markdown({
  content,
  onCitation,
  className,
}: {
  content: string
  onCitation?: (ref: number) => void
  className?: string
}) {
  const blocks = content.split(/\n{2,}/)

  return (
    <div className={cn('flex max-w-prose flex-col gap-3 text-base leading-7', className)}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').filter((line) => line.trim())
        if (!lines.length) return null

        const isBullet = lines.every((line) => /^\s*[-*]\s+/.test(line))
        const isNumbered = lines.every((line) => /^\s*\d+\.\s+/.test(line))
        const heading = lines.length === 1 && lines[0].match(/^(#{1,3})\s+(.*)$/)

        if (heading) {
          const text = heading[2]
          return (
            <h3
              key={blockIndex}
              className="text-lg font-bold leading-snug text-ink-700"
            >
              {renderInline(text, `h-${blockIndex}`, onCitation)}
            </h3>
          )
        }

        if (isBullet || isNumbered) {
          const Tag = isNumbered ? 'ol' : 'ul'
          return (
            <Tag
              key={blockIndex}
              className={cn(
                'flex flex-col gap-1.5 pl-5',
                isNumbered ? 'list-decimal' : 'list-disc',
              )}
            >
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="pl-1 marker:text-ink-500">
                  {renderInline(
                    line.replace(/^\s*(?:[-*]|\d+\.)\s+/, ''),
                    `li-${blockIndex}-${lineIndex}`,
                    onCitation,
                  )}
                </li>
              ))}
            </Tag>
          )
        }

        return (
          <p key={blockIndex}>
            {lines.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {renderInline(line, `p-${blockIndex}-${lineIndex}`, onCitation)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
