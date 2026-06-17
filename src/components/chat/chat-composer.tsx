'use client'

import { useRef, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowRight, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  busy,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop: () => void
  busy: boolean
  disabled?: boolean
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
        'flex items-end gap-2 rounded-2xl border border-input bg-card p-2 shadow-sm transition-colors focus-within:border-teal-600',
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
        placeholder="Ask about policies, SOPs, emails or reports…"
        className="max-h-[200px] flex-1 resize-none bg-transparent px-3 py-2 text-base leading-7 text-ink outline-none placeholder:text-ink-500 disabled:cursor-not-allowed"
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
    </form>
  )
}
