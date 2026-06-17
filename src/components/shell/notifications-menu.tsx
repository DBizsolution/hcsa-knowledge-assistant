'use client'

import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
            className="relative text-ink-600"
          />
        }
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-3">
          <span className="font-bold text-ink-700">Notifications</span>
          {unread > 0 && (
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-800">
              {unread} new
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />
        <ul className="max-h-80 overflow-y-auto py-1">
          {NOTIFICATIONS.map((item) => (
            <li
              key={item.title}
              className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted"
            >
              <span
                className={cn(
                  'mt-1.5 size-2 shrink-0 rounded-full',
                  item.unread ? 'bg-primary' : 'bg-transparent',
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-700">{item.title}</p>
                <p className="mt-0.5 text-sm text-ink-500">{item.body}</p>
                <p className="mt-1 text-xs text-ink-500">{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
