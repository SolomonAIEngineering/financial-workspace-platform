import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'

import { Button } from '../button'
import { Card } from '../card'
import { cn } from '../../utils/cn'

/** Props for the SimpleNotificationBanner component. */
export interface SimpleNotificationBannerProps {
  /** Position of the banner: 'top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'. Default is 'bottom'. */
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** Whether the banner should be centered. Default is false. */
  centered?: boolean
  /** Whether the banner should be full screen width. Default is false. */
  fullScreen?: boolean
  /** Whether the banner should have left margin. Default is false. */
  marginLeft?: boolean
  /** Message to be displayed in the banner. Can be a string or ReactNode for rich content. */
  message: string | ReactNode
  /** Optional title for the notification. */
  title?: string
  /** Custom label for the primary button. Default is 'Accept'. */
  primaryLabel?: string
  /** Custom label for the secondary button. Default is 'Reject'. */
  secondaryLabel?: string
  /** Callback function for the primary button click event. */
  onPrimaryAction?: () => void
  /** Callback function for the secondary button click event. */
  onSecondaryAction?: () => void
  /** Whether to show a close button. Default is true. */
  showCloseButton?: boolean
  /** Callback function for the close button click event. */
  onClose?: () => void
  /** Whether the banner should be dismissible. Default is true. */
  dismissible?: boolean
  /** Variant of the notification. Affects the styling and icon. */
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
  /** Whether to show an icon based on the variant. Default is true. */
  showIcon?: boolean
  /** Whether to show only one button. Default is false. */
  singleButton?: boolean
  /** Width of the notification. Can be 'auto', 'full', or a specific width like '400px'. Default is 'auto'. */
  width?: string
  /** Whether to show a progress bar for auto-dismiss. Default is false. */
  showProgressBar?: boolean
}

/**
 * A simple notification banner component that displays a message with customizable actions.
 * Enhanced with animations, variants, icons, and more customization options.
 *
 * @param props - Props for the SimpleNotificationBanner component.
 * @returns A React element representing the SimpleNotificationBanner component.
 */
export default function SimpleNotificationBanner({
  position = 'bottom',
  centered = false,
  fullScreen = false,
  marginLeft = false,
  message,
  title,
  primaryLabel = 'Accept',
  secondaryLabel = 'Reject',
  onPrimaryAction,
  onSecondaryAction,
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
  showIcon = true,
  singleButton = false,
  width = 'auto',
  showProgressBar = false,
}: SimpleNotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  // Auto-dismiss logic with progress bar
  useEffect(() => {
    if (autoDismiss && isVisible) {
      const startTime = Date.now()
      const endTime = startTime + autoDismissTimeout

      const updateProgress = () => {
        const now = Date.now()
        const remaining = Math.max(0, endTime - now)
        const newProgress = (remaining / autoDismissTimeout) * 100
        setProgress(newProgress)

        if (remaining > 0) {
          requestAnimationFrame(updateProgress)
        } else {
          handleClose()
        }
      }

      const animationId = requestAnimationFrame(updateProgress)
      return () => cancelAnimationFrame(animationId)
    }
  }, [autoDismiss, isVisible, autoDismissTimeout])

  const handlePrimaryAction = () => {
    if (onPrimaryAction) onPrimaryAction()
    if (dismissible) setIsVisible(false)
  }

  const handleSecondaryAction = () => {
    if (onSecondaryAction) onSecondaryAction()
    if (dismissible) setIsVisible(false)
  }

  const handleClose = () => {
    if (onClose) onClose()
    setIsVisible(false)
  }

  if (!isVisible) return null

  // Variant-specific styles and icons
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

  const variantProgressStyles = {
    default: 'bg-gray-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }

  const variantIcons = {
    default: <Info className="h-5 w-5 text-gray-500" />,
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  // Position-specific styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'top-0 inset-x-0'
      case 'bottom':
        return 'bottom-0 inset-x-0'
      case 'top-left':
        return 'top-0 left-0'
      case 'top-right':
        return 'top-0 right-0'
      case 'bottom-left':
        return 'bottom-0 left-0'
      case 'bottom-right':
        return 'bottom-0 right-0'
      default:
        return 'bottom-0 inset-x-0'
    }
  }

  // Animation styles based on position
  const getAnimationStyles = () => {
    if (!animate) return ''

    switch (position) {
      case 'top':
        return 'animate-slide-in-down'
      case 'bottom':
        return 'animate-slide-in-up'
      case 'top-left':
      case 'bottom-left':
        return 'animate-slide-in-left'
      case 'top-right':
      case 'bottom-right':
        return 'animate-slide-in-right'
      default:
        return 'animate-slide-in-up'
    }
  }

  const baseStyles = cn(
    'pointer-events-none fixed p-4',
    getPositionStyles(),
    getAnimationStyles(),
    `z-${zIndex}`,
    className
  )

  const bannerClasses = cn(baseStyles, {
    'flex flex-col justify-between gap-x-8 gap-y-4 md:flex-row md:items-center':
      fullScreen,
    'mx-auto': centered,
    'ml-auto': marginLeft,
  })

  const widthStyles = width === 'full' ? 'w-full' : width === 'auto' ? 'max-w-xl' : `w-[${width}]`

  return (
    <div className={bannerClasses}>
      <Card
        className={cn(
          "pointer-events-auto rounded-2xl border-4 p-6 shadow-lg",
          widthStyles,
          variantStyles[variant],
          cardClassName
        )}
      >
        {showProgressBar && autoDismiss && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-50 rounded-t-lg overflow-hidden">
            <div
              className={cn("h-full transition-all duration-100", variantProgressStyles[variant])}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-start">
          {showIcon && (
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {variantIcons[variant]}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
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
                onClick={handlePrimaryAction}
              >
                {primaryLabel}
              </Button>

              {!singleButton && (
                <Button
                  variant="ghost"
                  className={cn("text-sm font-semibold", variantTextStyles[variant])}
                  onClick={handleSecondaryAction}
                >
                  {secondaryLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
