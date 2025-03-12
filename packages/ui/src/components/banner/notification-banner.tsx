import { ReactNode, useEffect, useState } from 'react'

import { Button } from '../button'
import { Card } from '../card'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

/** Props for the NotificationBanner component. */
export interface NotificationBannerProps {
  /** Position of the banner: 'top' or 'bottom'. Default is 'bottom'. */
  position?: 'top' | 'bottom'
  /** Whether the banner should be centered. Default is false. */
  centered?: boolean
  /** Whether the banner should be full screen width. Default is false. */
  fullScreen?: boolean
  /** Whether the banner should have left margin. Default is false. */
  marginLeft?: boolean
  /** Message to be displayed in the banner. Can be a string or ReactNode for rich content. */
  message: string | ReactNode
  /** Custom title for the notification. Optional. */
  title?: string
  /** Custom label for the accept button. Default is 'Accept'. */
  acceptLabel?: string
  /** Custom label for the reject button. Default is 'Reject'. */
  rejectLabel?: string
  /** Callback function for the accept button click event. */
  onAccept?: () => void
  /** Callback function for the reject button click event. */
  onReject?: () => void
  /** Whether to show a close button. Default is true. */
  showCloseButton?: boolean
  /** Callback function for the close button click event. */
  onClose?: () => void
  /** Whether the banner should be dismissible. Default is true. */
  dismissible?: boolean
  /** Variant of the notification. Affects the styling. */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  /** Whether to auto-dismiss the notification after a certain time. Default is false. */
  autoDismiss?: boolean
  /** Time in milliseconds after which the notification should auto-dismiss. Default is 5000ms. */
  autoDismissTimeout?: number
  /** Additional CSS class names to apply to the banner. */
  className?: string
  /** Additional CSS class names to apply to the card. */
  cardClassName?: string
  /** Whether to animate the banner when it appears/disappears. Default is true. */
  animate?: boolean
  /** Z-index for the banner. Default is 50. */
  zIndex?: number
}

/**
 * A notification banner component that displays a customizable message
 * with accept and reject options. Enhanced with animations, variants, and more customization options.
 *
 * @param props - Props for configuring the NotificationBanner component.
 * @returns A React element representing the NotificationBanner component.
 */
export default function NotificationBanner({
  position = 'bottom',
  centered = false,
  fullScreen = false,
  marginLeft = false,
  message = '',
  title,
  acceptLabel = 'Accept',
  rejectLabel = 'Reject',
  onAccept,
  onReject,
  showCloseButton = true,
  onClose,
  dismissible = true,
  variant = 'default',
  autoDismiss = false,
  autoDismissTimeout = 5000,
  className,
  cardClassName,
  animate = true,
  zIndex = 50,
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Auto-dismiss logic
  useEffect(() => {
    if (autoDismiss && isVisible) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoDismissTimeout)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, isVisible, autoDismissTimeout])

  const handleAccept = () => {
    if (onAccept) onAccept()
    if (dismissible) setIsVisible(false)
  }

  const handleReject = () => {
    if (onReject) onReject()
    if (dismissible) setIsVisible(false)
  }

  const handleClose = () => {
    if (onClose) onClose()
    setIsVisible(false)
  }

  if (!isVisible) return null

  // Variant-specific styles
  const variantStyles = {
    default: 'bg-white border-gray-50',
    success: 'bg-green-50 border-green-50',
    warning: 'bg-yellow-50 border-yellow-50',
    error: 'bg-red-50 border-red-50',
    info: 'bg-blue-50 border-blue-50',
  }

  const variantTextStyles = {
    default: 'text-gray-900',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-800',
    info: 'text-blue-800',
  }

  const variantButtonStyles = {
    default: 'bg-gray-900 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    error: 'bg-red-600 hover:bg-red-700 text-white',
    info: 'bg-blue-600 hover:bg-blue-700 text-white',
  }

  const baseStyles = cn(
    'pointer-events-none fixed inset-x-0 px-6 p-6',
    animate && (position === 'top' ? 'animate-slide-in-down' : 'animate-slide-in-up'),
    `z-${zIndex}`,
    className
  )

  const bannerClasses = cn(baseStyles, {
    'bottom-0': position === 'bottom',
    'top-0': position === 'top',
    'flex flex-col justify-between gap-x-8 gap-y-4 md:flex-row md:items-center':
      fullScreen,
    'mx-auto': centered,
    'ml-auto': marginLeft,
  })

  return (
    <div className={bannerClasses}>
      <Card
        className={cn(
          "pointer-events-auto max-w-xl rounded-2xl border-4 p-6 shadow-lg",
          variantStyles[variant],
          cardClassName
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {title && (
              <h3 className={cn("text-lg font-medium mb-1", variantTextStyles[variant])}>
                {title}
              </h3>
            )}
            <div className={cn("text-sm", variantTextStyles[variant])}>
              {message}
            </div>
          </div>

          {showCloseButton && (
            <button
              type="button"
              className="ml-4 inline-flex flex-shrink-0 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-x-3">
          <Button
            className={cn(
              "rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
              variantButtonStyles[variant]
            )}
            onClick={handleAccept}
          >
            {acceptLabel}
          </Button>

          <Button
            variant="ghost"
            className={cn("text-sm font-semibold", variantTextStyles[variant])}
            onClick={handleReject}
          >
            {rejectLabel}
          </Button>
        </div>
      </Card>
    </div>
  )
}
