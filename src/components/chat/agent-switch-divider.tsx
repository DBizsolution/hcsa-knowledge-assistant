'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { personaById, type PersonaId } from '@/lib/personas'

export function AgentSwitchDivider({
  personaId,
  showNudge,
  onNewChat,
  onDismiss,
}: {
  personaId: PersonaId
  showNudge: boolean
  onNewChat: () => void
  onDismiss: () => void
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
        <div className="mx-auto mt-2 flex w-fit items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-ink-600">
          <span>Start a fresh {persona.code} chat?</span>
          <Button
            type="button"
            size="sm"
            className="h-7 px-2.5 text-xs"
            onClick={onNewChat}
          >
            New chat
          </Button>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="flex size-5 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-muted hover:text-ink-700"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      )}
    </div>
  )
}
