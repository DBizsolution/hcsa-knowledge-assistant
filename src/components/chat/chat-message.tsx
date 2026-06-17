'use client'

import { useRef, useState } from 'react'
import { Search, Loader2, Sparkles, BookOpen, ChevronDown } from 'lucide-react'
import type { UIMessage } from 'ai'
import { cn } from '@/lib/utils'
import { BrandMark } from '@/components/shell/brand'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Markdown } from './markdown'
import { SourceCard } from './source-card'
import { extractMessageMeta } from './types'

/** Collect the source numbers referenced by [n] / [n, m] markers in the answer. */
function citedRefs(text: string): Set<number> {
  const refs = new Set<number>()
  const pattern = /\[(\d+(?:\s*,\s*\d+)*)\]/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text))) {
    match[1].split(',').forEach((value) => refs.add(parseInt(value.trim(), 10)))
  }
  return refs
}

export function ChatMessage({
  message,
  isStreaming,
}: {
  message: UIMessage
  isStreaming?: boolean
}) {
  const [highlighted, setHighlighted] = useState<number | null>(null)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const sourceRefs = useRef<Record<number, HTMLDivElement | null>>({})

  if (message.role === 'user') {
    const text = message.parts
      .filter((part) => part.type === 'text')
      .map((part) => (part.type === 'text' ? part.text : ''))
      .join('')
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-teal-800 px-4 py-2.5 text-base leading-7 text-white">
          {text}
        </div>
      </div>
    )
  }

  const { text, sources, searching, queries } = extractMessageMeta(message)
  const showCursor = isStreaming && text.length === 0 && !searching

  // The model retrieves more chunks than it cites. Show only the sources the
  // answer actually references (matching [n] markers), so the count is honest;
  // fall back to all retrieved sources if the answer cited none.
  const cited = citedRefs(text)
  const visibleSources = cited.size
    ? sources.filter((source) => cited.has(source.ref))
    : sources

  function handleCitation(ref: number) {
    setSourcesOpen(true)
    setHighlighted(ref)
    requestAnimationFrame(() => {
      sourceRefs.current[ref]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
    window.setTimeout(() => setHighlighted((cur) => (cur === ref ? null : cur)), 2200)
  }

  return (
    <div className="flex gap-3">
      <BrandMark className="mt-0.5 size-8 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-3">
        {(searching || queries.length > 0) && (
          <div
            className="flex flex-wrap items-center gap-2 text-sm text-ink-500"
            aria-live="polite"
          >
            {searching ? (
              <Loader2 className="size-4 animate-spin text-teal-600" aria-hidden />
            ) : (
              <Search className="size-4 text-teal-600" aria-hidden />
            )}
            <span>
              {searching ? 'Searching the knowledge base' : 'Searched'}
            </span>
            {queries.map((query, index) => (
              <span
                key={index}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-ink-600"
              >
                {query}
              </span>
            ))}
          </div>
        )}

        {showCursor && (
          <div
            className="flex items-center gap-2 text-sm text-ink-500"
            aria-live="polite"
          >
            <Sparkles className="size-4 text-teal-600" aria-hidden />
            <span
              className="inline-block h-4 w-2 animate-pulse bg-ink-500"
              aria-hidden
            />
            <span className="sr-only">Generating response</span>
          </div>
        )}

        {text && (
          <Markdown content={text} onCitation={handleCitation} />
        )}

        {visibleSources.length > 0 && (
          <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 rounded-md text-sm font-bold text-teal-600 hover:underline">
              <BookOpen className="size-4" aria-hidden />
              {visibleSources.length} source{visibleSources.length > 1 ? 's' : ''}
              <ChevronDown
                className={cn(
                  'size-4 transition-transform',
                  sourcesOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {visibleSources.map((source) => (
                <SourceCard
                  key={source.ref}
                  source={source}
                  highlighted={highlighted === source.ref}
                  ref={(el) => {
                    sourceRefs.current[source.ref] = el
                  }}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  )
}
