import { useEffect, useState } from 'react'

import { twMerge } from 'tailwind-merge'

/**
 * Props for the AccessibilityAnnouncer component
 * @interface AnnouncerProps
 * @property {string} [message] - The message to be announced
 * @property {number} [timeout] - Time in ms before message is cleared (default: 3000)
 * @property {'polite' | 'assertive'} [ariaLive] - ARIA live region setting
 */
type AnnouncerProps = {
  message?: string
  timeout?: number
  ariaLive?: 'polite' | 'assertive'
}

/**
 * Accessibility announcer component for screen readers
 *
 * @component
 * @example
 * ```tsx
 * <AccessibilityAnnouncer
 *   message="Assistant is typing..."
 *   ariaLive="polite"
 * />
 * ```
 *
 * @description
 * This component creates an accessible live region that announces updates
 * to screen readers. Useful for dynamic content updates and status changes.
 */
export const AccessibilityAnnouncer = ({
  message,
  timeout = 3000,
  ariaLive = 'polite',
}: AnnouncerProps) => {
  const [announcement, setAnnouncement] = useState(message)

  useEffect(() => {
    if (message) {
      setAnnouncement(message)
      const timer = setTimeout(() => setAnnouncement(''), timeout)
      return () => clearTimeout(timer)
    }
  }, [message, timeout])

  return (
    <div
      // biome-ignore lint/a11y/useSemanticElements: <explanation>
      role="status"
      aria-live={ariaLive}
      aria-atomic="true"
      className={twMerge(
        'sr-only',
        'pointer-events-none',
        'fixed',
        'h-[1px]',
        'w-[1px]',
        'overflow-hidden',
      )}
    >
      {announcement}
    </div>
  )
}
