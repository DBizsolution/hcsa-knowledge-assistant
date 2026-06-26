'use client'

import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { personaById, type PersonaId } from '@/lib/personas'

export function AgentSwitchDivider({
  personaId,
  showNudge,
  decided,
  onNewChat,
  onStay,
  onPickPrompt,
}: {
  personaId: PersonaId
  showNudge: boolean
  /** True once the user chose to continue here — keeps the prompts, drops the CTA. */
  decided: boolean
  onNewChat: () => void
  onStay: () => void
  onPickPrompt: (prompt: string) => void
}) {
  const persona = personaById(personaId)
  const Icon = persona.icon

  return (
    <div className="py-1">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-ink-600 shadow-sm">
          <span
            className={cn(
              'flex size-5 items-center justify-center rounded-md',
              persona.chipClass,
            )}
          >
            <Icon className="size-3" aria-hidden />
          </span>
          Switched to {persona.code}
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      {showNudge && (
        <div className="mx-auto mt-3 w-full max-w-md">
          <p className="text-xs leading-relaxed text-ink-600">
            You can ask questions within{' '}
            <span className="font-medium text-ink-700">
              {persona.scopeLabel.toLowerCase()}
            </span>
            . Try one of these:
          </p>
          <div className="mt-2 flex flex-col gap-1.5">
            {persona.suggestions.slice(0, 3).map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPickPrompt(prompt)}
                className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-xs leading-relaxed text-ink-700 transition hover:border-teal-600 hover:bg-teal-50/40"
              >
                <span className="flex-1">{prompt}</span>
                <ArrowUpRight
                  className="size-3.5 shrink-0 text-ink-500/60 transition-colors group-hover:text-teal-600"
                  aria-hidden
                />
              </button>
            ))}
          </div>
          {!decided && (
            <div className="mt-3 flex items-center gap-2">
              <Button type="button" size="sm" onClick={onNewChat}>
                New {persona.code} chat
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onStay}
              >
                Continue here
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
