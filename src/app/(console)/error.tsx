'use client'

import { useEffect } from 'react'
import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Segment-level error boundary for the whole console. Next.js renders this in
 * place of the crashed page so a render exception degrades gracefully instead
 * of blanking the app. The shell (header/nav) stays mounted around it.
 */
export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[console] route error', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-lg font-bold text-ink-700">
          This page hit an unexpected error
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          The rest of the workspace is unaffected. Try again, or use the
          navigation to continue.
        </p>
        <Button type="button" onClick={reset} className="mt-6 gap-1.5">
          <RotateCw className="size-4" aria-hidden />
          Try again
        </Button>
      </div>
    </div>
  )
}
