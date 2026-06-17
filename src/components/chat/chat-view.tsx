'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { toast } from 'sonner'
import { Sparkles, ShieldCheck } from 'lucide-react'
import { BrandMark } from '@/components/shell/brand'
import { ChatMessage } from './chat-message'
import { ChatComposer } from './chat-composer'
import { SUGGESTIONS } from './suggestions'

export function ChatView() {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, stop, error } = useChat({
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
                <p className="text-sm text-destructive">
                  Something went wrong generating a response. Please try again.
                </p>
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

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion.label}
            type="button"
            onClick={() => onPick(suggestion.prompt)}
            className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-teal-600 hover:bg-teal-50/40"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal-600">
              <Sparkles className="size-3.5" />
              {suggestion.category}
            </span>
            <span className="text-base font-medium text-ink-700">
              {suggestion.label}
            </span>
            <span className="text-sm text-ink-500">{suggestion.prompt}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
