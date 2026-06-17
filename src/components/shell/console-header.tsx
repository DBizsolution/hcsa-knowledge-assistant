'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { findNavItem, requiredRankForPath } from '@/lib/nav'
import { roleLabel, roleRank } from '@/lib/roles'
import { useRole } from '@/lib/use-role-store'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserMenu } from './user-menu'
import { RoleSwitcher } from './role-switcher'
import { NotificationsMenu } from './notifications-menu'

export function ConsoleHeader({ email }: { email: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { role } = useRole()
  const current = findNavItem(pathname)

  // If the current view requires a higher role than the active demo role
  // (e.g. switched down to Officer while on an admin page), return to Chat.
  useEffect(() => {
    if (requiredRankForPath(pathname) > roleRank(role)) {
      const blocked = findNavItem(pathname)
      toast.info(
        `The ${roleLabel(role)} role can’t access ${blocked?.title ?? 'that page'} — returned to Chat.`,
      )
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
        <NotificationsMenu />
        <UserMenu email={email} />
      </div>
    </header>
  )
}
