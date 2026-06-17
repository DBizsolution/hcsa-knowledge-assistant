'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, MessageSquare, ArrowRight, SearchX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CONVERSATIONS, type Conversation } from '@/data/mock'

export function HistoryList() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return CONVERSATIONS
    return CONVERSATIONS.filter((conversation) =>
      [conversation.title, conversation.preview, conversation.source]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [query])

  return (
    <>
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search conversations…"
          className="h-11 pl-9"
          aria-label="Search conversations"
        />
      </div>

      {filtered.length === 0 ? (
        <NoResults query={query} />
      ) : (
        <div className="space-y-3">
          {filtered.map((conversation) => (
            <ConversationRow key={conversation.title} conversation={conversation} />
          ))}
        </div>
      )}
    </>
  )
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  return (
    <Card className="transition-colors hover:border-line-soft">
      <CardContent className="flex items-center gap-4 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
          <MessageSquare className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-bold text-ink-700">{conversation.title}</h3>
            <Badge variant="secondary" className="bg-muted text-xs text-ink-600">
              {conversation.source}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-sm text-ink-500">
            {conversation.preview}
          </p>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1 text-sm text-ink-500 sm:flex">
          <span>{conversation.date}</span>
          <span>{conversation.messages} messages</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Open ${conversation.title}`}
          render={<Link href="/chat" />}
          nativeButton={false}
        >
          <ArrowRight className="size-5" />
        </Button>
      </CardContent>
    </Card>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line-soft bg-gray-50 px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
        <SearchX className="size-6" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-ink-700">
        No conversations found
      </h3>
      <p className="mt-1 max-w-sm text-sm text-ink-500">
        Nothing matches <span className="font-medium text-ink-600">“{query}”</span>.
        Try a different document name, topic or keyword.
      </p>
    </div>
  )
}
