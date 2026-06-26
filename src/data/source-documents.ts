import type { ChatSource } from '@/components/chat/types'
import { formatContent } from '@/components/chat/format-content'

/**
 * The corpus stores only retrieved chunks, so a "full document" is a
 * representative reconstruction per source type with the real cited excerpt
 * woven in as a highlight block. Presented honestly as representative in the UI.
 */
export type SourceDocBlock =
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'para'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'callout'; text: string }
  | { type: 'highlight'; text: string }

export type SourceDoc = {
  title: string
  sourceType: string
  meta: { label: string; value: string }[]
  blocks: SourceDocBlock[]
}

type Scaffold = (excerpt: string) => SourceDocBlock[]

const SCAFFOLDS: Record<string, Scaffold> = {
  policy: (excerpt) => [
    { type: 'heading', text: 'Purpose & scope' },
    {
      type: 'para',
      text: 'This policy sets out the eligibility criteria, applicant obligations and assessment process for the programme, and applies to all registered contractors operating within HCSA jurisdiction.',
    },
    { type: 'heading', text: 'Eligibility' },
    {
      type: 'para',
      text: 'Applicants must satisfy each criterion in full before an application proceeds to assessment. Incomplete submissions are returned for rectification.',
    },
    { type: 'highlight', text: excerpt },
    { type: 'heading', text: 'Review & appeals' },
    {
      type: 'para',
      text: 'Rejected applications may be reconsidered within 30 days where new substantiating evidence is provided. Each decision is recorded against the case reference and retained for audit.',
    },
  ],
  sop: (excerpt) => [
    { type: 'heading', text: 'Objective' },
    {
      type: 'para',
      text: 'This standard operating procedure defines the responsibilities, sequencing and safety controls for the activity, ensuring consistent and compliant execution across project sites.',
    },
    { type: 'heading', text: 'Procedure' },
    {
      type: 'list',
      items: [
        'Confirm permits and hazard assessments before work begins.',
        'Sign off and log each control point as it is completed.',
        'Escalate deviations to the responsible officer for approval.',
      ],
    },
    { type: 'highlight', text: excerpt },
    { type: 'heading', text: 'Records' },
    {
      type: 'para',
      text: 'Completed checklists and inspection findings are filed against the site reference and made available for periodic compliance review.',
    },
  ],
  email: (excerpt) => [
    { type: 'subheading', text: 'Correspondence thread' },
    {
      type: 'para',
      text: 'This thread is retained in the email repository and indexed by passage so responses can be cited precisely in future queries.',
    },
    { type: 'heading', text: 'Message' },
    { type: 'highlight', text: excerpt },
    { type: 'heading', text: 'Outcome' },
    {
      type: 'para',
      text: 'The authority acknowledged receipt and set out the documentation required to support the request. The thread remains on file under the case reference.',
    },
  ],
  report: (excerpt) => [
    { type: 'heading', text: 'Financial highlights' },
    {
      type: 'para',
      text: 'The statements present the financial position and operating results for the year, including the reported net deficit before government grant and the corresponding grant receipt.',
    },
    { type: 'highlight', text: excerpt },
    { type: 'heading', text: 'Operational review' },
    {
      type: 'list',
      items: [
        'Development expenditure for the year.',
        'Dwelling units delivered, with prior-year comparatives.',
        'Key programme outcomes and milestones.',
      ],
    },
    { type: 'heading', text: 'Notes' },
    {
      type: 'para',
      text: 'Accounting policies, significant estimates and audit observations are disclosed in the accompanying notes, which are indexed for retrieval alongside the primary statements.',
    },
  ],
}

export function buildSourceDocument(source: ChatSource): SourceDoc {
  const excerpt = formatContent(source.content, source.sourceType)
  const scaffold = SCAFFOLDS[source.sourceType] ?? SCAFFOLDS.report
  return {
    title: source.documentTitle,
    sourceType: source.sourceType,
    meta: [
      { label: 'Reference', value: source.sourcePath },
      { label: 'Passage', value: String(source.chunkIndex + 1) },
      { label: 'Match', value: `${Math.round(source.similarity * 100)}%` },
    ],
    blocks: scaffold(excerpt),
  }
}
