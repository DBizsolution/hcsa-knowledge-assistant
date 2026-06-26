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
import type { ResolvedReference } from '@/lib/rag/doc-references'

/**
 * Inline document reference (e.g. "POL-UD-002 §8.2" / "SOP §10.1") rendered as
 * a link that opens the actual clause from the curated source material.
 */
export function DocReferenceLink({
  label,
  reference,
}: {
  label: string
  reference: ResolvedReference
}): ReactElement {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="font-medium text-link-blue underline decoration-link-blue/40 underline-offset-2 transition-colors hover:text-teal-600 hover:decoration-teal-600"
          />
        }
      >
        {label}
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <TypeBadge type={reference.sourceType} />
          <DialogTitle className="text-lg leading-snug text-ink-700">
            {reference.code} · {reference.title}
          </DialogTitle>
          <DialogDescription>
            Referenced source from the HCSA knowledge base.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-3 gap-x-6 gap-y-3 rounded-lg bg-muted/50 p-4">
          <div>
            <dt className="text-xs text-ink-500">Version</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink-700">
              v{reference.version}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">Effective</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink-700">
              {reference.effectiveDate}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">Owner</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink-700">
              {reference.owner}
            </dd>
          </div>
        </dl>

        {reference.section && (
          <div className="rounded-r-lg border-l-4 border-teal-600 bg-teal-50/60 py-2.5 pl-3 pr-3">
            <p className="text-xs font-bold uppercase tracking-wide text-teal-800">
              {reference.section}
            </p>
            {reference.quote ? (
              <p className="mt-1 text-sm leading-relaxed text-ink-700">
                “{reference.quote}”
              </p>
            ) : (
              <p className="mt-1 text-sm leading-relaxed text-ink-500">
                Referenced section — open the full source for the complete text.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-sm text-xs text-ink-500">
            Curated excerpt from the indexed source. The full document opens in
            the source system.
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
