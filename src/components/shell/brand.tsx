import Link from 'next/link'
import { cn } from '@/lib/utils'

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={cn('size-9 shrink-0', className)}
      role="img"
      aria-label="HCSA"
    >
      <rect width="48" height="48" rx="10" fill="var(--hdb-red)" />
      <path
        d="M24 11 11 22h3v15h8v-9h4v9h8V22h3L24 11Z"
        fill="#fff"
      />
    </svg>
  )
}

export function Brand({
  className,
  subtitle = true,
  href = '/chat',
}: {
  className?: string
  subtitle?: boolean
  href?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 font-normal no-underline',
        className,
      )}
    >
      <BrandMark />
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-bold text-ink-700">
          HCSA
        </span>
        {subtitle && (
          <span className="text-xs font-normal text-ink-500">
            Knowledge Assistant
          </span>
        )}
      </span>
    </Link>
  )
}
