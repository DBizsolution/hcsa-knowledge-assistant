'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Plus, ShieldCheck, MessageSquare, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navSections, type NavSection } from '@/lib/nav'
import { roleRank } from '@/lib/roles'
import { useRole } from '@/lib/use-role-store'
import { useChatSessionStore } from '@/lib/use-chat-session-store'
import { conversationById } from '@/data/conversations'
import { Brand } from './brand'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'

const RECENT_LIMIT = 5

const flatItemClass = cn(
  'h-9 gap-2.5 rounded-none border-l-[3px] border-transparent px-3 font-medium text-ink-600 transition-colors',
  'hover:bg-teal-50/70 hover:text-teal-900',
  'data-active:border-teal-700 data-active:bg-teal-50 data-active:font-semibold data-active:text-teal-900',
)

const liveBadgeClass = cn(
  'ml-auto gap-1 border-teal-200 bg-teal-50 px-1.5 text-[0.6875rem] font-semibold text-teal-700',
  'before:size-1.5 before:rounded-full before:bg-teal-500 before:content-[""]',
)

export function ConsoleSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile } = useSidebar()
  const { role } = useRole()
  const currentTitle = useChatSessionStore((state) => state.currentTitle)
  const history = useChatSessionStore((state) => state.history)
  const startNewChat = useChatSessionStore((state) => state.startNewChat)
  const openConversation = useChatSessionStore((state) => state.openConversation)

  const visibleSections = navSections.filter(
    (section) => section.minRank <= roleRank(role),
  )
  const onChat = pathname === '/chat' || pathname.startsWith('/chat/')
  const recent = history.slice(0, RECENT_LIMIT)

  function closeMobile() {
    setOpenMobile(false)
  }

  function handleNewChat() {
    startNewChat()
    closeMobile()
    router.push('/chat')
  }

  function handleOpenHistory(id: string) {
    const conversation = conversationById(id)
    if (conversation) openConversation(conversation)
    closeMobile()
    router.push('/chat')
  }

  return (
    <Sidebar>
      <SidebarHeader className="gap-3 px-3 py-4">
        <Brand onClick={handleNewChat} />
        <Button
          type="button"
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-hdb-red-hover"
        >
          <Plus className="size-4" />
          New chat
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {visibleSections.map((section) =>
          section.collapsible ? (
            <CollapsibleNavSection
              key={section.label}
              section={section}
              pathname={pathname}
              onNavigate={closeMobile}
            />
          ) : (
            <SidebarGroup key={section.label} className="px-1 py-1">
              <SidebarGroupLabel className="px-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                {section.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {section.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          render={
                            <Link
                              href={item.href}
                              onClick={closeMobile}
                              aria-current={active ? 'page' : undefined}
                            />
                          }
                          isActive={active}
                          tooltip={item.description}
                          className={flatItemClass}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          {item.functional && (
                            <Badge variant="secondary" className={liveBadgeClass}>
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
          ),
        )}

        <SidebarGroup className="px-1 py-1">
          {currentTitle && (
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={
                      <Link
                        href="/chat"
                        onClick={closeMobile}
                        aria-current={onChat ? 'page' : undefined}
                      />
                    }
                    isActive={onChat}
                    className={cn(
                      'h-9 gap-2.5 rounded-md px-3 font-medium text-ink-600 transition-colors',
                      'hover:bg-teal-50/70 hover:text-teal-900',
                      'data-active:bg-teal-50 data-active:font-semibold data-active:text-teal-900',
                    )}
                  >
                    <MessageSquare />
                    <span className="truncate">{currentTitle}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          )}

          {recent.length > 0 && (
            <>
              <SidebarGroupLabel className="mt-4 px-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Recent
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-0.5">
                  {recent.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        onClick={() => handleOpenHistory(chat.id)}
                        tooltip={chat.title}
                        className="h-9 gap-2.5 rounded-md px-3 font-normal text-ink-500 transition-colors hover:bg-teal-50/70 hover:text-teal-900"
                      >
                        <span className="truncate">{chat.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={
                        <Link href="/history" onClick={closeMobile} />
                      }
                      className="h-8 gap-2.5 rounded-md px-3 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-50/70 hover:text-teal-900"
                    >
                      All conversations
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </>
          )}
        </SidebarGroup>
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

function CollapsibleNavSection({
  section,
  pathname,
  onNavigate,
}: {
  section: NavSection
  pathname: string
  onNavigate: () => void
}) {
  const inSection =
    pathname === section.href || pathname.startsWith(`${section.href}/`)
  const [manualOpen, setManualOpen] = useState(false)
  // The section that owns the current page stays expanded; others follow the
  // user's manual toggle. Derived (no effect) so navigation auto-expands.
  const open = inSection || manualOpen

  return (
    <SidebarGroup className="px-1 py-1">
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          <Collapsible
            open={open}
            onOpenChange={setManualOpen}
            render={<SidebarMenuItem />}
          >
            <CollapsibleTrigger
              render={
                <SidebarMenuButton
                  isActive={inSection}
                  tooltip={section.description}
                  className={cn(
                    'h-9 gap-2.5 rounded-md px-3 font-medium text-ink-600 transition-colors',
                    'hover:bg-teal-50/70 hover:text-teal-900',
                    'data-active:bg-transparent data-active:font-semibold data-active:text-teal-900',
                  )}
                />
              }
            >
              <section.icon />
              <span>{section.label}</span>
              <ChevronRight
                className={cn(
                  'ml-auto size-4 text-ink-500 transition-transform',
                  open && 'rotate-90',
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className="mr-0 gap-0.5 border-line-soft pr-0">
                {section.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                  return (
                    <SidebarMenuSubItem key={item.href}>
                      <SidebarMenuSubButton
                        isActive={active}
                        render={
                          <Link
                            href={item.href}
                            onClick={onNavigate}
                            aria-current={active ? 'page' : undefined}
                          />
                        }
                        className={cn(
                          'gap-2.5 text-ink-600',
                          'hover:bg-teal-50/70 hover:text-teal-900',
                          'data-active:bg-teal-50 data-active:font-semibold data-active:text-teal-900',
                        )}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  )
                })}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
