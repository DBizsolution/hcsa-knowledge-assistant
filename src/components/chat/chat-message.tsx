'use client'

import { useRef, useState } from 'react'
import { Search, Loader2, Sparkles, BookOpen } from 'lucide-react'
import type { UIMessage } from 'ai'
import { BrandMark } from '@/components/shell/brand'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Markdown } from './markdown'
import { SourceCard } from './source-card'
import { extractMessageMeta } from './types'

export function ChatMessage({
  message,
  isStreaming,
}: {
  message: UIMessage
  isStreaming?: boolean
}) {
  const [highlighted, setHighlighted] = useState<number | null>(null)
  const [sourcesOpen, setSourcesOpen] = useState(true)
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
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-card">
        <BrandMark className="size-5" />
      </span>
      <div className="min-w-0 flex-1 space-y-3">
        {(searching || queries.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink-500">
            {searching ? (
              <Loader2 className="size-4 animate-spin text-teal-600" />
            ) : (
              <Search className="size-4 text-teal-600" />
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
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <Sparkles className="size-4 text-teal-600" />
            <span className="inline-block h-4 w-2 animate-pulse bg-ink-500" />
          </div>
        )}

        {text && (
          <Markdown content={text} onCitation={handleCitation} />
        )}

        {sources.length > 0 && (
          <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 rounded-md text-sm font-bold text-teal-600 hover:underline">
              <BookOpen className="size-4" />
              {sources.length} source{sources.length > 1 ? 's' : ''}
              <span className="text-xs font-normal text-ink-500">
                {sourcesOpen ? 'Hide' : 'Show'}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {sources.map((source) => (
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
