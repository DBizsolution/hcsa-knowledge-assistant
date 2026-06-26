'use client'

import { useRef, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowRight, ChevronDown, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { personaById, type PersonaId } from '@/lib/personas'
import { PersonaMenu } from './persona-menu'

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  busy,
  disabled,
  persona,
  onPersonaChange,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop: () => void
  busy: boolean
  disabled?: boolean
  persona: PersonaId
  onPersonaChange: (persona: PersonaId) => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const active = personaById(persona)
  const ActiveIcon = active.icon

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (value.trim() && !busy) onSubmit()
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (value.trim() && !busy) onSubmit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex flex-col gap-1.5 rounded-2xl border border-input bg-card p-2 shadow-sm transition-colors focus-within:border-teal-600',
        disabled && 'opacity-60',
      )}
    >
      <label htmlFor="chat-input" className="sr-only">
        Ask the HCSA Knowledge Assistant
      </label>
      <textarea
        id="chat-input"
        ref={textareaRef}
        rows={1}
        value={value}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.value)
          autoResize()
        }}
        onKeyDown={handleKeyDown}
        placeholder={active.placeholder}
        className="max-h-[200px] w-full resize-none bg-transparent px-3 py-2 text-base leading-7 text-ink outline-none placeholder:text-ink-500 disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-between gap-2">
        <PersonaMenu
          persona={persona}
          onChange={onPersonaChange}
          side="top"
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-xs font-medium text-ink-600 transition hover:bg-muted"
              aria-label="Switch agent"
            >
              <span
                className={cn(
                  'flex size-5 items-center justify-center rounded-md',
                  active.chipClass,
                )}
              >
                <ActiveIcon className="size-3" aria-hidden />
              </span>
              {active.label}
              <ChevronDown className="size-3.5 text-ink-500" aria-hidden />
            </button>
          }
        />
        {busy ? (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            onClick={onStop}
            aria-label="Stop generating"
            className="size-10 rounded-xl"
          >
            <Square className="size-4 fill-current" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!value.trim() || disabled}
            aria-label="Send message"
            className="size-10 rounded-xl bg-primary text-primary-foreground hover:bg-hdb-red-hover"
          >
            <ArrowRight className="size-5" />
          </Button>
        )}
      </div>
    </form>
  )
}
