'use client'

import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { PERSONAS, personaById, type PersonaId } from '@/lib/personas'

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
    <div className="flex flex-wrap items-end gap-x-3 gap-y-1.5">
      <div className="flex flex-col gap-1">
        <span className="px-0.5 text-xs font-semibold uppercase tracking-wide text-ink-500">
          Agent
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-ink-700 shadow-sm transition hover:bg-muted hover:shadow"
              />
            }
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
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80 p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1.5 text-xs leading-relaxed text-ink-500">
              Choose an agent: answers stay within its authorised scope
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {PERSONAS.map((item) => {
            const Icon = item.icon
            const selected = item.id === persona
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => onChange(item.id)}
                className="items-start gap-3 px-2 py-2.5"
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                    item.chipClass,
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium text-ink-700">{item.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
                    {item.blurb}
                  </span>
                </span>
                <Check
                  className={cn(
                    'mt-1 size-4 shrink-0 text-primary transition-opacity',
                    selected ? 'opacity-100' : 'opacity-0',
                  )}
                  aria-hidden
                />
              </DropdownMenuItem>
            )
          })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
