'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { toast } from 'sonner'
import { ShieldCheck, RotateCw, ArrowLeft, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/shell/brand'
import { usePersona } from '@/lib/use-persona-store'
import { useChatSessionStore } from '@/lib/use-chat-session-store'
import { personaById } from '@/lib/personas'
import type { StoredConversation } from '@/data/conversations'
import { ChatMessage } from './chat-message'
import { ChatComposer } from './chat-composer'
import { PersonaSelector } from './persona-selector'
import { CATEGORIES, type Category } from './suggestions'

/** Turn a stored transcript into UIMessages the chat view can render. */
function conversationToMessages(conversation: StoredConversation): UIMessage[] {
  return conversation.transcript.map((turn, index) => ({
    id: `${conversation.id}-${index}`,
    role: turn.role,
    parts: [{ type: 'text', text: turn.text }],
  }))
}

export function ChatView() {
  const [input, setInput] = useState('')
  const { persona, setPersona } = usePersona()
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevCount = useRef(0)

  const resetKey = useChatSessionStore((state) => state.resetKey)
  const setCurrentTitle = useChatSessionStore((state) => state.setCurrentTitle)
  const pending = useChatSessionStore((state) => state.pending)
  const consumePending = useChatSessionStore((state) => state.consumePending)

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
    error,
    regenerate,
    clearError,
  } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    onError: () => {
      toast.error(
        'The assistant is unavailable. Check that the server has OpenAI and Supabase configured.',
      )
    },
  })

  const busy = status === 'submitted' || status === 'streaming'

  // Clear the conversation when a new chat is started from the sidebar or logo.
  const firstReset = useRef(resetKey)
  useEffect(() => {
    if (resetKey === firstReset.current) return
    firstReset.current = resetKey
    setMessages([])
    setInput('')
  }, [resetKey, setMessages])

  // Load a past conversation when one is opened from history (sidebar or page).
  useEffect(() => {
    if (!pending) return
    setMessages(conversationToMessages(pending))
    setPersona(pending.persona)
    consumePending()
  }, [pending, setMessages, setPersona, consumePending])

  // Scroll once per turn — pin the new question near the top so the answer
  // streams into the space below. Never scroll on streaming tokens or on
  // completion, which is what caused the screen to jump.
  useEffect(() => {
    if (messages.length > prevCount.current) {
      const container = scrollRef.current
      const users = container?.querySelectorAll('[data-chat-role="user"]')
      const lastUser = users?.[users.length - 1] as HTMLElement | undefined
      lastUser?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    prevCount.current = messages.length
  }, [messages.length])

  function submit(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setCurrentTitle(trimmed)
    sendMessage({ text: trimmed }, { body: { persona } })
    setInput('')
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto w-full max-w-3xl px-4 py-2">
          <PersonaSelector persona={persona} onChange={setPersona} />
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          {isEmpty ? (
            <EmptyState persona={persona} onPick={submit} />
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
                  onFollowUp={submit}
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

function EmptyState({
  persona,
  onPick,
}: {
  persona: string
  onPick: (prompt: string) => void
}) {
  const [active, setActive] = useState<Category | null>(null)
  const activePersona = personaById(persona)
  const isGeneral = activePersona.id === 'general'
  const ActiveIcon = activePersona.icon

  return (
    <div className="flex flex-col items-center pt-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
        {isGeneral ? (
          <BrandMark className="size-8" />
        ) : (
          <span
            className={cn(
              'flex size-9 items-center justify-center rounded-xl',
              activePersona.chipClass,
            )}
          >
            <ActiveIcon className="size-5" aria-hidden />
          </span>
        )}
      </span>
      <h2 className="mt-5 text-2xl font-bold text-ink-700">
        {isGeneral
          ? 'How can I help you today?'
          : `${activePersona.label} agent`}
      </h2>
      <p className="mt-2 max-w-md text-base text-muted-foreground">
        {isGeneral
          ? 'Pick a topic to explore example questions, or just ask your own across HCSA policies, SOPs, email correspondence and reports, with citations.'
          : `Scoped to ${activePersona.scopeLabel.toLowerCase()}. Try one of these, or ask your own.`}
      </p>

      <div className="mt-10 w-full">
        {isGeneral ? (
          active ? (
            <PromptList
              category={active}
              onPick={onPick}
              onBack={() => setActive(null)}
            />
          ) : (
            <TopicGrid onSelect={setActive} />
          )
        ) : (
          <PersonaPrompts persona={activePersona} onPick={onPick} />
        )}
      </div>
    </div>
  )
}

function PersonaPrompts({
  persona,
  onPick,
}: {
  persona: ReturnType<typeof personaById>
  onPick: (prompt: string) => void
}) {
  return (
    <div className="flex flex-col gap-2.5 motion-safe:animate-in motion-safe:fade-in">
      {persona.suggestions.map((prompt) => (
        <button
          key={prompt}
          type="button"
          onClick={() => onPick(prompt)}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-left transition hover:border-teal-600 hover:bg-teal-50/40 hover:shadow-md motion-safe:hover:-translate-y-0.5"
        >
          <span className="flex-1 text-base leading-relaxed text-ink-700">
            {prompt}
          </span>
          <ArrowUpRight
            className="size-4 shrink-0 text-ink-500/60 transition-colors group-hover:text-teal-600"
            aria-hidden
          />
        </button>
      ))}
    </div>
  )
}

function TopicGrid({ onSelect }: { onSelect: (category: Category) => void }) {
  return (
    <div className="grid w-full gap-4 motion-safe:animate-in motion-safe:fade-in sm:grid-cols-2">
      {CATEGORIES.map((category) => (
        <button
          key={category.category}
          type="button"
          onClick={() => onSelect(category)}
          className={cn(
            'group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition hover:shadow-md motion-safe:hover:-translate-y-0.5',
            category.hoverClass,
          )}
        >
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105',
              category.chipClass,
            )}
          >
            <category.icon className="size-5" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span
              className={cn(
                'text-xs font-bold uppercase tracking-wider',
                category.accentClass,
              )}
            >
              {category.category}
            </span>
            <span className="mt-0.5 line-clamp-2 text-sm text-ink-500">
              {category.blurb}
            </span>
          </span>
          <ArrowUpRight
            className="size-4 shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </button>
      ))}
    </div>
  )
}

function PromptList({
  category,
  onPick,
  onBack,
}: {
  category: Category
  onPick: (prompt: string) => void
  onBack: () => void
}) {
  return (
    <div className="w-full motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-ink-500 transition hover:bg-muted hover:text-ink-700"
          aria-label="Back to topics"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </button>
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg',
            category.chipClass,
          )}
        >
          <category.icon className="size-5" />
        </span>
        <span
          className={cn(
            'text-sm font-bold uppercase tracking-wider',
            category.accentClass,
          )}
        >
          {category.category}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {category.prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onPick(prompt)}
            className={cn(
              'group flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-left transition hover:shadow-md motion-safe:hover:-translate-y-0.5',
              category.hoverClass,
            )}
          >
            <span className="flex-1 text-base leading-relaxed text-ink-700">
              {prompt}
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-ink-500/60 transition-colors group-hover:text-ink-700" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  )
}
