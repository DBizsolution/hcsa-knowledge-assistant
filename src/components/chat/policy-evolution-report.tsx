'use client'

import { forwardRef, useState } from 'react'
import {
  History,
  FilePenLine,
  Plus,
  GitCompareArrows,
  ShieldCheck,
  ArrowRight,
  CircleDot,
  CalendarCheck,
  ChevronDown,
  BookOpen,
  Quote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { SourceCard } from './source-card'
import type { ChatSource } from './types'
import type {
  PolicyEvolution,
  TimelineEvent,
  ChangedClause,
  Contradiction,
} from '@/lib/rag/policy-evolution'

const SEVERITY: Record<
  Contradiction['severity'],
  { label: string; dot: string }
> = {
  high: { label: 'Significant', dot: 'bg-destructive' },
  medium: { label: 'Moderate', dot: 'bg-amber-500' },
  low: { label: 'Minor', dot: 'bg-ink-500/40' },
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: typeof History
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-4 text-teal-600" aria-hidden />
      <h3 className="text-sm font-bold text-ink-700">{children}</h3>
    </div>
  )
}

/** A quiet document reference — plain text, not a candy pill. */
function DocRef({ code }: { code: string }) {
  return <span className="font-medium text-ink-600">{code}</span>
}

function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative space-y-4">
      {/* Connector line + dot markers share one axis at x=8px (left-2),
          each centred on it with -translate-x-1/2. */}
      <span
        className="pointer-events-none absolute left-2 top-2.5 bottom-2.5 w-px -translate-x-1/2 bg-border"
        aria-hidden
      />
      {events.map((event, index) => {
        const isReview = event.kind === 'review'
        const isBaseline = event.kind === 'baseline'
        return (
          <li key={index} className="relative pl-8">
            <span
              className={cn(
                'absolute left-2 top-0.5 flex size-4 -translate-x-1/2 items-center justify-center rounded-full ring-4 ring-background',
                isReview
                  ? 'bg-background text-teal-600'
                  : isBaseline
                    ? 'bg-ink-500/25'
                    : 'bg-teal-600',
              )}
              aria-hidden
            >
              {isReview ? (
                <CalendarCheck className="size-3" />
              ) : (
                !isBaseline && (
                  <CircleDot className="size-3 text-primary-foreground" />
                )
              )}
            </span>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-bold text-ink-700">
                {event.date}
              </span>
              {event.version !== '–' && (
                <span className="text-xs text-ink-500">v{event.version}</span>
              )}
              <span className="text-sm text-ink-600">· {event.label}</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-ink-500">
              {event.summary}
            </p>
          </li>
        )
      })}
    </ol>
  )
}

function ChangedClauseCard({ clause }: { clause: ChangedClause }) {
  const added = clause.kind === 'added'
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-bold text-ink-700">{clause.title}</span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
            added ? 'bg-teal-50 text-teal-700' : 'bg-muted text-ink-600',
          )}
        >
          {added ? <Plus className="size-3" /> : <FilePenLine className="size-3" />}
          {added ? 'New' : 'Updated'}
        </span>
        <span className="ml-auto text-xs text-ink-500">
          <DocRef code={clause.docCode} /> {clause.section}
        </span>
      </div>
      <p className="mt-1.5 text-sm leading-6 text-ink-600">{clause.detail}</p>
    </div>
  )
}

function ContradictionCard({ item }: { item: Contradiction }) {
  const sev = SEVERITY[item.severity]
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <span className={cn('size-2 shrink-0 rounded-full', sev.dot)} aria-hidden />
        <span className="text-sm font-bold text-ink-700">{item.title}</span>
        <span className="ml-auto text-xs text-ink-500">{sev.label}</span>
      </div>

      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        <ConflictSide
          heading="What the policy says"
          code={item.requires.code}
          section={item.requires.section}
          quote={item.requires.quote}
        />
        <ConflictSide
          heading="What the procedure says"
          code={item.conflictsWith.code}
          section={item.conflictsWith.section}
          quote={item.conflictsWith.quote}
        />
      </div>

      <div className="mt-3 mb-1 flex items-start gap-2">
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-ink-500"
          aria-hidden
        />
        <p className="text-sm leading-snug text-ink-600">
          <span className="font-bold text-ink-700">Resolved: </span>
          {item.resolution.rule}{' '}
          <span className="whitespace-nowrap text-ink-500">
            ({item.resolution.docCode} {item.resolution.section})
          </span>
        </p>
      </div>
    </div>
  )
}

function ConflictSide({
  heading,
  code,
  section,
  quote,
}: {
  heading: string
  code: string
  section: string
  quote: string
}) {
  return (
    <div className="rounded-md border border-border bg-muted p-2.5">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-500">
        {heading}
      </p>
      <p className="mt-1 text-sm leading-6 text-ink-600">{quote}</p>
      <p className="mt-1.5 text-xs text-ink-500">
        <DocRef code={code} /> {section}
      </p>
    </div>
  )
}

export const PolicyEvolutionReport = forwardRef<
  HTMLDivElement,
  {
    data: PolicyEvolution
    evidence: ChatSource[]
    onFollowUp?: (prompt: string) => void
  }
>(function PolicyEvolutionReport({ data, evidence, onFollowUp }, ref) {
  const [citationsOpen, setCitationsOpen] = useState(false)
  const [evidenceOpen, setEvidenceOpen] = useState(false)

  return (
    <div ref={ref} className="space-y-5 border-t border-border pt-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <GitCompareArrows className="size-4 text-hdb-red" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-wider text-hdb-red">
            Policy Intelligence
          </span>
        </div>
        <h2 className="mt-1.5 text-lg font-bold leading-tight text-ink-700">
          {data.topic}
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-ink-600">{data.summary}</p>
        <div className="mt-3 space-y-1">
          {data.documents.map((doc) => (
            <p key={doc.code} className="text-xs text-ink-500">
              <DocRef code={doc.code} /> · {doc.title} · v{doc.version} ·
              effective {doc.effectiveDate}
            </p>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <section className="space-y-3">
          <SectionLabel icon={History}>How it changed over time</SectionLabel>
          <Timeline events={data.timeline} />
        </section>

        <section className="space-y-2.5">
          <SectionLabel icon={FilePenLine}>What changed</SectionLabel>
          <div className="space-y-2">
            {data.changedClauses.map((clause) => (
              <ChangedClauseCard
                key={`${clause.docCode}-${clause.section}`}
                clause={clause}
              />
            ))}
          </div>
        </section>

        <section className="space-y-2.5">
          <SectionLabel icon={GitCompareArrows}>
            Where documents disagree
          </SectionLabel>
          <div className="space-y-2">
            {data.contradictions.map((item) => (
              <ContradictionCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Citations — collapsed by default to keep the view calm */}
        <Collapsible open={citationsOpen} onOpenChange={setCitationsOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 rounded-md text-sm font-bold text-teal-600 hover:underline">
            <Quote className="size-4" aria-hidden />
            {data.citations.length} citations
            <ChevronDown
              className={cn(
                'size-4 transition-transform',
                citationsOpen && 'rotate-180',
              )}
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <ol className="space-y-1.5">
              {data.citations.map((citation) => (
                <li key={citation.id} className="flex gap-2.5 text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded bg-teal-50 text-xs font-bold text-teal-800">
                    {citation.id}
                  </span>
                  <span className="min-w-0 leading-6 text-ink-600">
                    <span className="font-medium text-ink-700">
                      {citation.docCode}
                    </span>{' '}
                    <span className="text-ink-500">{citation.section}</span>,{' '}
                    {citation.quote}
                  </span>
                </li>
              ))}
            </ol>
          </CollapsibleContent>
        </Collapsible>

        {/* Live evidence — proves retrieval is real, not scripted */}
        {evidence.length > 0 && (
          <Collapsible open={evidenceOpen} onOpenChange={setEvidenceOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 rounded-md text-sm font-bold text-teal-600 hover:underline">
              <BookOpen className="size-4" aria-hidden />
              {evidence.length} passage{evidence.length > 1 ? 's' : ''} retrieved
              live
              <ChevronDown
                className={cn(
                  'size-4 transition-transform',
                  evidenceOpen && 'rotate-180',
                )}
                aria-hidden
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {evidence.map((source) => (
                <SourceCard key={source.ref} source={source} />
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Suggested follow-ups */}
        {data.followUps.length > 0 && (
          <section className="space-y-2">
            <SectionLabel icon={ArrowRight}>You might next ask</SectionLabel>
            <div className="flex flex-col gap-2">
              {data.followUps.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onFollowUp?.(prompt)}
                  disabled={!onFollowUp}
                  className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm text-ink-700 transition hover:border-teal-600 hover:bg-teal-50/50 disabled:cursor-default disabled:hover:border-border disabled:hover:bg-card"
                >
                  <span className="flex-1">{prompt}</span>
                  <ArrowRight
                    className="size-4 shrink-0 text-ink-500/60 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600"
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
})
