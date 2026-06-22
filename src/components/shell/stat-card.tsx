import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
}: {
  label: string
  value: string
  icon?: LucideIcon
  hint?: string
  trend?: { direction: 'up' | 'down'; value: string; good?: boolean }
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-6">
        <div className="flex items-center gap-2 text-ink-500">
          {Icon && <Icon className="size-4 text-teal-600" aria-hidden />}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <p className="text-3xl font-bold leading-none text-ink-700">{value}</p>
        {(trend || hint) && (
          <div className="flex items-center gap-2 text-sm">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-medium',
                  trend.good === false ? 'text-destructive' : 'text-teal-600',
                )}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="size-4" />
                ) : (
                  <TrendingDown className="size-4" />
                )}
                {trend.value}
              </span>
            )}
            {hint && <span className="text-ink-500">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
