'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { toast } from 'sonner'
import { ShieldCheck, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/shell/brand'
import { ChatMessage } from './chat-message'
import { ChatComposer } from './chat-composer'
import { SUGGESTIONS } from './suggestions'

export function ChatView() {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, stop, error, regenerate, clearError } =
    useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: () => {
      toast.error(
        'The assistant is unavailable. Check that the server has OpenAI and Supabase configured.',
      )
    },
  })

  const busy = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    sendMessage({ text: trimmed })
    setInput('')
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {isEmpty ? (
            <EmptyState onPick={submit} />
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={
                    busy &&
                    index === messages.length - 1 &&
                    message.role === 'assistant'
                  }
                />
              ))}
              {error && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                  <p className="text-sm text-destructive">
                    Something went wrong generating a response.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="ml-auto gap-1.5"
                    onClick={() => {
                      clearError()
                      regenerate()
                    }}
                  >
                    <RotateCw className="size-3.5" />
                    Retry
                  </Button>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background">
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <ChatComposer
            value={input}
            onChange={setInput}
            onSubmit={() => submit(input)}
            onStop={stop}
            busy={busy}
          />
          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-ink-500">
            <ShieldCheck className="size-3.5" />
            Grounded in HCSA sources. Verify critical decisions against the
            original document.
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center pt-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
        <BrandMark className="size-8" />
      </span>
      <h2 className="mt-5 text-2xl font-bold text-ink-700">
        How can I help you today?
      </h2>
      <p className="mt-2 max-w-md text-base text-muted-foreground">
        Ask a question and I&apos;ll search across HCSA policies, SOPs, email
        correspondence and reports — with citations.
      </p>

      <div className="mt-10 grid w-full gap-4 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => onPick(suggestion.prompt)}
            className={cn(
              'group flex items-start gap-4 rounded-xl border border-border bg-card p-6 text-left transition hover:shadow-md motion-safe:hover:-translate-y-0.5',
              suggestion.hoverClass,
            )}
          >
            <span
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
                suggestion.chipClass,
              )}
            >
              <suggestion.icon className="size-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span
                className={cn(
                  'text-xs font-bold uppercase tracking-wider',
                  suggestion.accentClass,
                )}
              >
                {suggestion.category}
              </span>
              <span className="mt-2 text-base font-semibold leading-snug text-ink-700">
                {suggestion.label}
              </span>
              <span className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-500">
                {suggestion.prompt}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
