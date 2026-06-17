import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function PageContainer({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8', className)}>
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
  mock,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  mock?: boolean
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-ink-700">
            {title}
          </h2>
          {mock && (
            <Badge
              variant="outline"
              className="border-line-soft text-xs font-medium text-ink-500"
            >
              UI prototype
            </Badge>
          )}
        </div>
        {description && (
          <p className="mt-1 max-w-2xl text-base text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
