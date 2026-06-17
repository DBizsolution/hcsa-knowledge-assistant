'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, ShieldCheck } from 'lucide-react'
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

      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
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
                          />
                        }
                        isActive={active}
                        tooltip={item.description}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        {item.functional && (
                          <Badge
                            variant="secondary"
                            className="ml-auto bg-teal-50 text-xs text-teal-800"
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
        <div className="flex items-center gap-2 rounded-md bg-teal-50 px-3 py-2 text-sm text-teal-800">
          <ShieldCheck className="size-4 shrink-0" />
          <span>Answers are grounded in HCSA sources only.</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
