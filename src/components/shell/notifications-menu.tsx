'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Notification = {
  title: string
  body: string
  time: string
  unread: boolean
}

const NOTIFICATIONS: Notification[] = [
  {
    title: 'Knowledge base re-indexed',
    body: '42 new passages added from the Q2 policy updates.',
    time: '12m ago',
    unread: true,
  },
  {
    title: 'Evaluation run completed',
    body: '11 of 12 test queries passed the Annex A thresholds.',
    time: '1h ago',
    unread: true,
  },
  {
    title: 'Document ingested',
    body: 'HDB-AR-FY23.pdf finished processing and is searchable.',
    time: 'Yesterday',
    unread: false,
  },
]

export function NotificationsMenu() {
  const unread = NOTIFICATIONS.filter((item) => item.unread).length

  return (
    <Button
      variant="ghost"
      size="icon"
      tabIndex={-1}
      aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      className="relative cursor-default text-ink-600 hover:bg-transparent"
    >
      <Bell className="size-5" />
      {unread > 0 && (
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
      )}
    </Button>
  )
}
