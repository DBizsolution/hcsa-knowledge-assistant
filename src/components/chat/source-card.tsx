'use client'

import { forwardRef, useState } from 'react'
import { FileText, Mail, Scale, FileBarChart, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ChatSource } from './types'
import { formatContent } from './format-content'

const ICONS: Record<string, typeof FileText> = {
  policy: Scale,
  sop: FileText,
  email: Mail,
  report: FileBarChart,
}

export const SourceCard = forwardRef<
  HTMLDivElement,
  { source: ChatSource; highlighted?: boolean }
>(function SourceCard({ source, highlighted }, ref) {
  const [open, setOpen] = useState(false)
  const expanded = open || Boolean(highlighted)
  const Icon = ICONS[source.sourceType] ?? FileText
  const content = formatContent(source.content, source.sourceType)

  return (
    <div
      ref={ref}
      className={cn(
        'scroll-mt-24 overflow-hidden rounded-lg border border-border bg-card transition-colors',
        highlighted && 'border-teal-600 ring-2 ring-teal-600/30',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-2.5 px-2.5 py-2 text-left transition-colors hover:bg-muted/50"
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-teal-50 text-xs font-bold text-teal-800">
          {source.ref}
        </span>
        <Icon className="size-4 shrink-0 text-ink-500" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-700">
          {source.documentTitle}
        </span>
        <Badge
          variant="secondary"
          className="hidden shrink-0 bg-muted text-xs font-medium text-ink-600 sm:inline-flex"
        >
          {source.sourceLabel}
        </Badge>
        <span className="shrink-0 text-xs tabular-nums text-ink-500">
          {Math.round(source.similarity * 100)}%
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-500 transition-transform',
            expanded && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {expanded && (
        <div className="border-t border-border px-2.5 py-2.5">
          <p className="text-sm leading-6 text-ink-600">{content}</p>
          <p className="mt-1.5 text-xs text-ink-500">
            {source.sourcePath} · passage {source.chunkIndex + 1}
          </p>
        </div>
      )}
    </div>
  )
})
