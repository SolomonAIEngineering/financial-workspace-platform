import { Component, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * Props for the ErrorBoundary component
 * @interface ErrorBoundaryProps
 * @property {ReactNode} children - Child components to wrap
 * @property {ReactNode} [fallback] - Custom fallback UI
 */
type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * State for the ErrorBoundary component
 * @interface ErrorBoundaryState
 * @property {Error | null} error - The caught error, if any
 */
type ErrorBoundaryState = {
  error: Error | null
}

/**
 * Error boundary component for graceful error handling
 *
 * @component
 * @example
 * ```tsx
 * <ErrorBoundary fallback={<ErrorMessage />}>
 *   <AIChat />
 * </ErrorBoundary>
 * ```
 *
 * @description
 * Catches JavaScript errors in child components and displays a fallback UI.
 * Prevents the entire app from crashing due to component errors.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback || (
          <div
            role="alert"
            className={twMerge(
              'bg-destructive/10 rounded-xl p-4',
              'text-destructive',
            )}
          >
            <h2 className="font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm">{this.state.error.message}</p>
          </div>
        )
      )
    }

    return this.props.children
  }
}
