'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { findNavItem, findSection, requiredRankForPath } from '@/lib/nav'
import { roleLabel, roleRank } from '@/lib/roles'
import { useRole } from '@/lib/use-role-store'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserMenu } from './user-menu'
import { RoleSwitcher } from './role-switcher'
import { ThemeSwitcher } from '@/components/theme/theme-switcher'
import { NotificationsMenu } from './notifications-menu'

export function ConsoleHeader({ email }: { email: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const { role } = useRole()
  const leaf = findNavItem(pathname)
  const section = findSection(pathname)
  // Consolidated (tabbed) sections show the section in the top bar; the active
  // tab and the page's own header carry the leaf detail below.
  const current = section?.collapsible
    ? { title: section.label, description: section.description }
    : leaf

  // If the current view requires a higher role than the active demo role
  // (e.g. switched down to Officer while on an admin page), return to Chat.
  useEffect(() => {
    if (requiredRankForPath(pathname) > roleRank(role)) {
      const blocked = findNavItem(pathname)
      toast.info(
        `The ${roleLabel(role)} role can’t access ${blocked?.title ?? 'that page'}. Returned to Chat.`,
      )
      router.replace('/chat')
    }
  }, [pathname, role, router])

  return (
    <header className="sticky top-0 z-20 shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-2 px-4 md:px-8">
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
          <ThemeSwitcher />
          <NotificationsMenu />
          <UserMenu email={email} />
        </div>
      </div>
    </header>
  )
}
