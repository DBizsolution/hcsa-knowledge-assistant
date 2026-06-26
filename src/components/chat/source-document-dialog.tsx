'use client'

import type { ReactElement } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TypeBadge } from '@/components/shell/type-badge'
import {
  buildSourceDocument,
  type SourceDocBlock,
} from '@/data/source-documents'
import { formatPassage } from './format-content'
import type { ChatSource } from './types'

function Block({ block }: { block: SourceDocBlock }): ReactElement {
  switch (block.type) {
    case 'heading':
      return (
        <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-ink-700 first:mt-0">
          {block.text}
        </h3>
      )
    case 'subheading':
      return (
        <h4 className="mt-4 text-sm font-semibold text-ink-700">
          {block.text}
        </h4>
      )
    case 'para':
      return (
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          {block.text}
        </p>
      )
    case 'list':
      return (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-600">
          {block.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-semibold text-ink-600">
              <tr>
                {block.columns.map((column) => (
                  <th key={column} className="px-3 py-2">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 text-ink-600">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case 'callout':
      return (
        <p className="mt-3 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs leading-relaxed text-ink-600">
          {block.text}
        </p>
      )
    case 'highlight':
      return (
        <div className="mt-3 rounded-r-lg border-l-4 border-teal-600 bg-teal-50/60 py-2.5 pl-3 pr-3">
          <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
            Cited passage
          </p>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink-700">
            {formatPassage(block.text)}
          </p>
        </div>
      )
  }
}

export function SourceDocumentDialog({
  source,
  trigger,
}: {
  source: ChatSource
  trigger: ReactElement
}) {
  const doc = buildSourceDocument(source)

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <TypeBadge type={doc.sourceType} />
          <DialogTitle className="text-lg leading-snug text-ink-700">
            {doc.title}
          </DialogTitle>
          <DialogDescription>
            Representative view of an indexed HCSA source, with the cited
            passage highlighted.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-3 gap-x-6 gap-y-3 rounded-lg bg-muted/50 p-4">
          {doc.meta.map((item) => (
            <div key={item.label}>
              <dt className="text-xs text-ink-500">{item.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink-700">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-border bg-card p-5">
          {doc.blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-sm text-xs text-ink-500">
            Representative reconstruction of the indexed source. The full
            document opens in the source system.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => toast('Opens in the connected source system')}
          >
            Open in source system
            <ArrowUpRight className="size-3.5" aria-hidden />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
