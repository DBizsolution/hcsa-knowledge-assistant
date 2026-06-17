import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { PageContainer, PageHeader } from '@/components/shell/page'
import { Button } from '@/components/ui/button'
import { HistoryList } from './history-list'

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

      <HistoryList />
    </PageContainer>
  )
}
