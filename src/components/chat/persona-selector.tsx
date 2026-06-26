'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { personaById, type PersonaId } from '@/lib/personas'
import { PersonaMenu } from './persona-menu'

const SOURCE_LABELS: Record<string, string> = {
  policy: 'Policies',
  sop: 'SOPs',
  email: 'Correspondence',
  report: 'Reports',
}

export function PersonaSelector({
  persona,
  onChange,
}: {
  persona: PersonaId
  onChange: (persona: PersonaId) => void
}) {
  const active = personaById(persona)
  const ActiveIcon = active.icon

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="px-0.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
        Agent
      </span>
      <PersonaMenu
        persona={persona}
        onChange={onChange}
        trigger={
          <button
            type="button"
            className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-muted hover:shadow"
          >
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-lg',
                active.chipClass,
              )}
            >
              <ActiveIcon className="size-4" aria-hidden />
            </span>
            {active.label}
            <ChevronDown className="size-4 text-ink-500" aria-hidden />
          </button>
        }
      />

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-ink-500">Scope:</span>
        {active.sources.map((source) => (
          <Badge
            key={source}
            variant="secondary"
            className="bg-muted text-xs font-medium text-ink-600"
          >
            {SOURCE_LABELS[source] ?? source}
          </Badge>
        ))}
      </div>
    </div>
  )
}
