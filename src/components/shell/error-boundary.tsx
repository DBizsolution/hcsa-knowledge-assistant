'use client'

import { Component, type ReactNode } from 'react'

/**
 * Catches render errors in its subtree and shows a fallback instead of letting
 * the exception blank the page. React requires a class for this — it is the one
 * sanctioned exception to the functional-component rule. Pass `resetKeys` to
 * auto-retry when inputs change (e.g. a streaming message finishing).
 */
type ErrorBoundaryProps = {
  children: ReactNode
  /** Shown when the subtree throws. A function form receives reset() to retry. */
  fallback: ReactNode | ((reset: () => void) => ReactNode)
  /** When any value changes while errored, the boundary clears and retries. */
  resetKeys?: ReadonlyArray<unknown>
  onError?: (error: Error) => void
}

type ErrorBoundaryState = { error: Error | null }

function keysChanged(
  previous: ReadonlyArray<unknown> = [],
  next: ReadonlyArray<unknown> = [],
) {
  return (
    previous.length !== next.length ||
    previous.some((value, index) => value !== next[index])
  )
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error) {
    // Keep the crash visible in logs; never let it reach the page.
    console.error('[ErrorBoundary]', error)
    this.props.onError?.(error)
  }

  componentDidUpdate(previousProps: ErrorBoundaryProps) {
    if (
      this.state.error &&
      keysChanged(previousProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset()
    }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      const { fallback } = this.props
      return typeof fallback === 'function' ? fallback(this.reset) : fallback
    }
    return this.props.children
  }
}
