import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, MessageSquare, ArrowRight } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CONVERSATIONS } from '@/data/mock'

export const metadata: Metadata = { title: 'Conversation history' }

export default function HistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Conversation history"
        description="Revisit and resume previous conversations. Each is retained with its sources."
        mock
        actions={
          <Button
            render={<Link href="/chat" />}
            nativeButton={false}
            className="gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover"
          >
            <MessageSquare className="size-4" />
            New chat
          </Button>
        }
      />

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
        <Input
          placeholder="Search conversations…"
          className="h-11 pl-9"
          aria-label="Search conversations"
        />
      </div>

      <div className="space-y-3">
        {CONVERSATIONS.map((conversation) => (
          <Card key={conversation.title} className="transition-colors hover:border-line-soft">
            <CardContent className="flex items-center gap-4 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <MessageSquare className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-bold text-ink-700">
                    {conversation.title}
                  </h3>
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
        ))}
      </div>
    </PageContainer>
  )
}
