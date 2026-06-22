'use client'

import type { ReactElement } from 'react'
import { TypeBadge } from './type-badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export type PreviewDocument = {
  title: string
  /** policy | sop | email | report */
  type: string
  subtitle?: string
  meta?: { label: string; value: string }[]
}

const EXCERPTS: Record<string, string[]> = {
  policy: [
    'Purpose & scope: This policy sets out the eligibility criteria, applicant obligations and assessment process for the programme, and applies to all registered contractors operating within HCSA jurisdiction.',
    'Eligibility: Applicants must demonstrate a minimum 30% energy-reduction tier, with third-party audit verification required for any claim above the 35% threshold. Incomplete submissions are returned for rectification before assessment.',
    'Review & appeals: Rejected applications may be reconsidered within 30 days where new substantiating evidence is provided. Each decision is recorded against the case reference and retained for audit.',
  ],
  sop: [
    'Objective: This standard operating procedure defines the responsibilities, sequencing and safety controls for the activity, ensuring consistent and compliant execution across project sites.',
    'Procedure: Site supervisors confirm permits and hazard assessments before commencement. Every control point is signed off and logged; deviations are escalated to the responsible officer for approval.',
    'Records: Completed checklists and inspection findings are filed against the site reference and made available for periodic compliance review.',
  ],
  email: [
    'Subject: Reconsideration request. The contractor disputes the assessed reading and requests a review of the original determination, citing a revised measurement.',
    'Response: The authority acknowledges receipt and sets out the documentation required to support reconsideration, including the third-party audit certificate and the corrected reduction figures.',
    'Outcome: The thread is retained in the email repository and indexed by passage so that responses can be cited precisely in future queries.',
  ],
  report: [
    'Financial highlights: The statements present the financial position and operating results for the year, including the reported net deficit before government grant and the corresponding grant receipt.',
    'Operational review: Development expenditure, dwelling units delivered and key programme outcomes are summarised, with comparatives against the prior financial year.',
    'Notes: Accounting policies, significant estimates and audit observations are disclosed in the accompanying notes, which are indexed for retrieval alongside the primary statements.',
  ],
}

export function DocumentPreview({
  doc,
  trigger,
}: {
  doc: PreviewDocument
  trigger: ReactElement
}) {
  const paragraphs = EXCERPTS[doc.type] ?? EXCERPTS.report

  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <TypeBadge type={doc.type} />
          <DialogTitle className="text-lg leading-snug text-ink-700">
            {doc.title}
          </DialogTitle>
          {doc.subtitle && <DialogDescription>{doc.subtitle}</DialogDescription>}
        </DialogHeader>

        {doc.meta && doc.meta.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-lg bg-muted/50 p-4 sm:grid-cols-4">
            {doc.meta.map((item) => (
              <div key={item.label}>
                <dt className="text-xs text-ink-500">{item.label}</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink-700">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-border p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
            Indexed text preview
          </p>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-600">
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-500">
          Representative excerpt of the extracted text used for retrieval. The
          full document opens in the source system.
        </p>
      </DialogContent>
    </Dialog>
  )
}
