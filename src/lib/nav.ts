import type { LucideIcon } from 'lucide-react'
import {
  MessageSquare,
  History,
  FileText,
  Database,
  Upload,
  FlaskConical,
  LayoutDashboard,
  Coins,
  SlidersHorizontal,
  Users,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  /** Functional = working feature; otherwise a hi-fi mock per Annex B. */
  functional?: boolean
  description: string
}

export type NavGroup = {
  label: string
  /** Minimum role rank that can see this group (0 officer, 1 knowledge, 2 admin). */
  minRank: number
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Workspace',
    minRank: 0,
    items: [
      {
        title: 'Chat',
        href: '/chat',
        icon: MessageSquare,
        functional: true,
        description: 'Ask questions across HCSA policies, emails and reports.',
      },
      {
        title: 'Conversation history',
        href: '/history',
        icon: History,
        description: 'Revisit and resume previous conversations.',
      },
      {
        title: 'Document generation',
        href: '/documents',
        icon: FileText,
        description: 'Draft summaries and reports grounded in the knowledge base.',
      },
    ],
  },
  {
    label: 'Knowledge',
    minRank: 1,
    items: [
      {
        title: 'Knowledge base',
        href: '/knowledge-base',
        icon: Database,
        description: 'Manage indexed sources, chunks and embeddings.',
      },
      {
        title: 'File upload',
        href: '/upload',
        icon: Upload,
        description: 'Add new documents to the knowledge base.',
      },
    ],
  },
  {
    label: 'Quality & operations',
    minRank: 2,
    items: [
      {
        title: 'Query testing',
        href: '/evaluation',
        icon: FlaskConical,
        description: 'Automated query testing and response evaluation.',
      },
      {
        title: 'Performance',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'System performance and retrieval quality metrics.',
      },
      {
        title: 'Consumption',
        href: '/consumption',
        icon: Coins,
        description: 'Token, request and cost consumption.',
      },
    ],
  },
  {
    label: 'Administration',
    minRank: 2,
    items: [
      {
        title: 'Configuration',
        href: '/configuration',
        icon: SlidersHorizontal,
        description: 'Tune the model, retrieval and guardrails.',
      },
      {
        title: 'User management',
        href: '/users',
        icon: Users,
        description: 'Manage users, roles and access.',
      },
    ],
  },
]

export const allNavItems: NavItem[] = navGroups.flatMap((group) => group.items)

export function findNavItem(pathname: string): NavItem | undefined {
  return allNavItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  )
}

/** Minimum role rank required to view a path. Pages outside the nav groups
 * (e.g. /profile, /guide) are always accessible (rank 0). */
export function requiredRankForPath(pathname: string): number {
  for (const group of navGroups) {
    const inGroup = group.items.some(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    if (inGroup) return group.minRank
  }
  return 0
}
