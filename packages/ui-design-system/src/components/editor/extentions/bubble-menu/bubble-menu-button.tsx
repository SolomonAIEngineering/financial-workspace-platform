'use client'

interface BubbleMenuButtonProps {
  action: () => void
  isActive: boolean
  children: React.ReactNode
  className?: string
}

export function BubbleMenuButton({
  action,
  isActive,
  children,
  className,
}: BubbleMenuButtonProps) {
  return (
    <button
      type="button"
      onClick={action}
      className={`px-2.5 py-1.5 font-mono text-[11px] transition-colors ${className} ${
        isActive
          ? 'text-primary bg-white dark:bg-stone-900'
          : 'hover:bg-muted bg-transparent'
      }`}
    >
      {children}
    </button>
  )
}
