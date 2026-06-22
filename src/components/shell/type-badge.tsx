import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STYLES: Record<string, string> = {
  policy: 'bg-[color-mix(in_oklch,var(--info),var(--background)_88%)] text-info',
  sop: 'bg-[color-mix(in_oklch,var(--cat-purple),var(--background)_88%)] text-cat-purple',
  email: 'bg-muted text-ink-600',
  report: 'bg-[color-mix(in_oklch,var(--cat-cyan),var(--background)_88%)] text-cat-cyan',
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
