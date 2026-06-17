'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { findNavItem, requiredRankForPath } from '@/lib/nav'
import { roleRank } from '@/lib/roles'
import { useRole } from '@/lib/use-role-store'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { UserMenu } from './user-menu'
import { RoleSwitcher } from './role-switcher'

export function ConsoleHeader({ email }: { email: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { role } = useRole()
  const current = findNavItem(pathname)

  // If the current view requires a higher role than the active demo role
  // (e.g. switched down to Officer while on an admin page), return to Chat.
  useEffect(() => {
    if (requiredRankForPath(pathname) > roleRank(role)) {
      router.replace('/chat')
    }
  }, [pathname, role, router])

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <SidebarTrigger className="-ml-1 mr-1" />
      <div className="flex min-w-0 flex-col">
        <h1 className="truncate text-base font-bold text-ink-700">
          {current?.title ?? 'HCSA Knowledge Assistant'}
        </h1>
        {current?.description && (
          <p className="truncate text-xs text-muted-foreground">
            {current.description}
          </p>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1">
        <RoleSwitcher />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="text-ink-600"
        >
          <Bell className="size-5" />
        </Button>
        <UserMenu email={email} />
      </div>
    </header>
  )
}
