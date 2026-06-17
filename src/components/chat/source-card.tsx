'use client'

import { forwardRef } from 'react'
import { FileText, Mail, Scale, FileBarChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ChatSource } from './types'

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
  const Icon = ICONS[source.sourceType] ?? FileText
  return (
    <div
      ref={ref}
      className={cn(
        'scroll-mt-24 rounded-lg border border-border bg-card p-3 transition-colors',
        highlighted && 'border-teal-600 ring-2 ring-teal-600/30',
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-teal-50 text-xs font-bold text-teal-800">
          {source.ref}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Icon className="size-4 shrink-0 text-ink-500" aria-hidden />
            <span className="truncate text-sm font-bold text-ink-700">
              {source.documentTitle}
            </span>
            <Badge
              variant="secondary"
              className="bg-muted text-xs font-medium text-ink-600"
            >
              {source.sourceLabel}
            </Badge>
            <span className="ml-auto text-xs text-ink-500">
              {Math.round(source.similarity * 100)}% match
            </span>
          </div>
          <p className="mt-1.5 line-clamp-3 text-sm leading-6 text-ink-600">
            {source.content}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {source.sourcePath} · passage {source.chunkIndex + 1}
          </p>
        </div>
      </div>
    </div>
  )
})
