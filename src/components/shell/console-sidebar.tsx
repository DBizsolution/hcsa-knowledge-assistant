'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navGroups } from '@/lib/nav'
import { roleRank } from '@/lib/roles'
import { useRole } from '@/lib/use-role-store'
import { Brand } from './brand'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function ConsoleSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const { role } = useRole()
  const visibleGroups = navGroups.filter(
    (group) => group.minRank <= roleRank(role),
  )

  return (
    <Sidebar>
      <SidebarHeader className="gap-3 px-3 py-4">
        <Brand />
        <Button
          render={<Link href="/chat" onClick={() => setOpenMobile(false)} />}
          nativeButton={false}
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover"
        >
          <Plus className="size-4" />
          New chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label} className="px-1 py-1">
            <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <Link
                            href={item.href}
                            onClick={() => setOpenMobile(false)}
                            aria-current={active ? 'page' : undefined}
                          />
                        }
                        isActive={active}
                        tooltip={item.description}
                        className={cn(
                          'h-9 gap-2.5 rounded-none border-l-[3px] border-transparent px-3 font-medium text-ink-600 transition-colors',
                          'hover:bg-teal-50/70 hover:text-teal-900',
                          'data-active:border-teal-700 data-active:bg-teal-50 data-active:font-semibold data-active:text-teal-900',
                        )}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        {item.functional && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              'ml-auto gap-1 border-teal-200 bg-teal-50 px-1.5 text-[0.6875rem] font-semibold text-teal-700',
                              'before:size-1.5 before:rounded-full before:bg-teal-500 before:content-[""]',
                            )}
                          >
                            Live
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-3 py-4">
        <div className="flex items-start gap-2.5 rounded-lg border border-teal-100 bg-teal-50 px-3 py-2.5 text-xs leading-snug text-teal-800">
          <ShieldCheck className="size-4 shrink-0 text-teal-600" />
          <span>Answers are grounded in HCSA sources only.</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
