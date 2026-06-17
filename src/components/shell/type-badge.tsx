import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  policy: 'bg-teal-50 text-teal-800',
  sop: 'bg-[color-mix(in_oklch,var(--hdb-red),white_88%)] text-hdb-red',
  email: 'bg-muted text-ink-600',
  report: 'bg-[color-mix(in_oklch,var(--link-blue),white_85%)] text-link-blue',
}

const LABELS: Record<string, string> = {
  policy: 'Policy',
  sop: 'SOP',
  email: 'Email',
  report: 'Report',
}

export function TypeBadge({ type }: { type: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn('font-medium', STYLES[type] ?? 'bg-muted text-ink-600')}
    >
      {LABELS[type] ?? type}
    </Badge>
  )
}
