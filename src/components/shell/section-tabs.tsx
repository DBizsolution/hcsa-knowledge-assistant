'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { navSections } from '@/lib/nav'

/**
 * Secondary, URL-driven tab strip for consolidated sections. Each tab is a
 * real link to a sub-route, so it stays in sync with the sidebar deep-links —
 * both just read the current pathname.
 *
 * Takes the section's route (a plain string) rather than its items: the items
 * carry `icon` components, which can't be passed from a Server Component layout
 * across the client boundary. Resolving them here keeps the icons client-side.
 */
export function SectionTabs({ sectionHref }: { sectionHref: string }) {
  const pathname = usePathname()
  const items = navSections.find((s) => s.href === sectionHref)?.items ?? []

  return (
    <div
      role="tablist"
      className="mb-6 flex gap-1 overflow-x-auto border-b border-border"
    >
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            role="tab"
            aria-selected={active}
            aria-current={active ? 'page' : undefined}
            className={cn(
              '-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-ink-500 hover:border-border hover:text-ink-700',
            )}
          >
            <item.icon className="size-4" aria-hidden />
            {item.title}
          </Link>
        )
      })}
    </div>
  )
}
