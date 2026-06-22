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
  BarChart3,
  Layers,
  ShieldCheck,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  /** Functional = working feature; otherwise a hi-fi mock per Annex B. */
  functional?: boolean
  description: string
}

export type NavSection = {
  /** Group label; for collapsible sections this is also the trigger text. */
  label: string
  /** Section landing route (redirects to its first child). Empty for flat groups. */
  href: string
  icon: LucideIcon
  /** Shown in the section header on every sub-page. */
  description: string
  /** Minimum role rank that can see this section (0 officer, 1 knowledge, 2 admin). */
  minRank: number
  /** When true, renders as a collapsible sidebar group whose children are
   * deep-links that also drive the in-page tab strip. */
  collapsible: boolean
  items: NavItem[]
}

export const navSections: NavSection[] = [
  {
    label: 'Workspace',
    href: '',
    icon: MessageSquare,
    description: '',
    minRank: 0,
    collapsible: false,
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
      {
        title: 'Data analytics',
        href: '/analytics',
        icon: BarChart3,
        description: 'Ask quantitative questions across the project datasets.',
      },
    ],
  },
  {
    label: 'Knowledge',
    href: '/knowledge',
    icon: Database,
    description:
      'The indexed sources and uploads that ground every answer.',
    minRank: 1,
    collapsible: true,
    items: [
      {
        title: 'Sources',
        href: '/knowledge/sources',
        icon: Layers,
        description: 'Manage indexed sources, chunks and embeddings.',
      },
      {
        title: 'Upload',
        href: '/knowledge/upload',
        icon: Upload,
        description: 'Add new documents to the knowledge base.',
      },
    ],
  },
  {
    label: 'Quality & operations',
    href: '/operations',
    icon: LayoutDashboard,
    description:
      'Evaluation, retrieval quality and consumption monitoring.',
    minRank: 2,
    collapsible: true,
    items: [
      {
        title: 'Performance',
        href: '/operations/performance',
        icon: LayoutDashboard,
        description: 'System performance and retrieval quality metrics.',
      },
      {
        title: 'Query testing',
        href: '/operations/testing',
        icon: FlaskConical,
        description: 'Automated query testing and response evaluation.',
      },
      {
        title: 'Consumption',
        href: '/operations/consumption',
        icon: Coins,
        description: 'Token, request and cost consumption.',
      },
    ],
  },
  {
    label: 'Administration',
    href: '/administration',
    icon: ShieldCheck,
    description: 'Configure the assistant and manage user access.',
    minRank: 2,
    collapsible: true,
    items: [
      {
        title: 'Configuration',
        href: '/administration/configuration',
        icon: SlidersHorizontal,
        description: 'Tune the model, retrieval and guardrails.',
      },
      {
        title: 'Users',
        href: '/administration/users',
        icon: Users,
        description: 'Manage users, roles and access.',
      },
    ],
  },
]

export const allNavItems: NavItem[] = navSections.flatMap((s) => s.items)

function matchesPath(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** The leaf nav item (tab) for a path. */
export function findNavItem(pathname: string): NavItem | undefined {
  return allNavItems.find((item) => matchesPath(item.href, pathname))
}

/** The section that owns a path — by section route or by any child item. */
export function findSection(pathname: string): NavSection | undefined {
  return navSections.find(
    (section) =>
      (section.href !== '' && matchesPath(section.href, pathname)) ||
      section.items.some((item) => matchesPath(item.href, pathname)),
  )
}

/** Minimum role rank required to view a path. Pages outside the nav sections
 * (e.g. /profile, /guide) are always accessible (rank 0). */
export function requiredRankForPath(pathname: string): number {
  return findSection(pathname)?.minRank ?? 0
}
