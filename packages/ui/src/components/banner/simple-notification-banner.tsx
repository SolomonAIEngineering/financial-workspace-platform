import { cn } from '../../utils/cn'
import { Button } from '../button'
import { Card } from '../card'

/** Props for the SimpleNotificationBanner component. */
interface SimpleNotificationBannerProps {
  /** Position of the banner: 'top' or 'bottom'. Default is 'bottom'. */
  position?: 'top' | 'bottom'
  /** Whether the banner should be centered. Default is false. */
  centered?: boolean
  /** Whether the banner should be full screen width. Default is false. */
  fullScreen?: boolean
  /** Whether the banner should have left margin. Default is false. */
  marginLeft?: boolean
  /** Message to be displayed in the banner. */
  message: string
  /** Callback function for the 'Accept' button click event. */
  onSave?: () => void
  /** Callback function for the 'Reject' button click event. */
  onReject?: () => void
}

/**
 * A simple notification banner component that displays a message with accept
 * and reject options.
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
  onSave,
  onReject,
}: SimpleNotificationBannerProps) {
  const bannerClasses = cn(
    'pointer-events-none fixed inset-x-0 px-6 p-6 ring-1 ring-gray-900/10',
    {
      'bottom-0': position === 'bottom',
      'top-0': position === 'top',
      'flex flex-col justify-between gap-x-8 gap-y-4 md:flex-row md:items-center':
        fullScreen,
      'mx-auto': centered,
      'ml-auto': marginLeft,
    },
  )

  const handleSave = () => {
    if (onSave) onSave()
  }

  const handleReject = () => {
    if (onReject) onReject()
  }

  return (
    <div className={bannerClasses}>
      <Card className="pointer-events-auto max-w-xl rounded-2xl border-4 p-6 shadow-lg">
        <p className="text-sm leading-6 text-gray-900">{message}</p>
        <div className="mt-4 flex items-center gap-x-5">
          <Button
            className="bg-background text-foreground rounded-md px-3 py-2 text-sm font-semibold shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            onClick={handleSave}
          >
            Accept
          </Button>
          <Button
            variant="ghost"
            onClick={handleReject}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Reject
          </Button>
        </div>
      </Card>
    </div>
  )
}
