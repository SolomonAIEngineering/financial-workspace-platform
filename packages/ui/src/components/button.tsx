import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-3xl',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border bg-transparent hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-green-600 text-white hover:bg-green-700',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
        info: 'bg-blue-600 text-white hover:bg-blue-700',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-8',
        xl: 'h-12 px-10 text-base',
        icon: 'h-9 w-9',
      },
      rounded: {
        default: 'rounded-3xl',
        full: 'rounded-full',
        md: 'rounded-md',
        lg: 'rounded-lg',
        none: 'rounded-none',
      },
      elevation: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
      elevation: 'none',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  /** Makes the button take the full width of its container */
  fullWidth?: boolean;
  /** Renders the button as a child component */
  asChild?: boolean;
  /** Shows a loading spinner */
  isLoading?: boolean;
  /** Text to show next to the loading spinner */
  loadingText?: string;
  /** Icon to display at the start of the button */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of the button */
  endIcon?: React.ReactNode;
  /** Callback fired when the button is clicked */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Callback fired when the button is focused */
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  /** Callback fired when the button loses focus */
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  /** Callback fired when the mouse enters the button */
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Callback fired when the mouse leaves the button */
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS class names */
  className?: string;
  /** Border style */
  border?: 'none' | 'thin' | 'thick';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    rounded,
    elevation,
    asChild = false,
    isLoading = false,
    loadingText,
    startIcon,
    endIcon,
    fullWidth = false,
    border = 'none',
    children,
    disabled,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : 'button'

    // Determine border class based on the border prop
    const borderClass = {
      none: '',
      thin: 'border border-gray-200 dark:border-gray-700',
      thick: 'border-2 border-gray-300 dark:border-gray-600',
    }[border];

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, rounded, elevation, className }),
          fullWidth && 'w-full',
          borderClass,
          isLoading && 'cursor-wait opacity-70'
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
        )}
        {!isLoading && startIcon && (
          <span className="mr-2 flex-shrink-0">{startIcon}</span>
        )}
        {isLoading && loadingText ? loadingText : children}
        {!isLoading && endIcon && (
          <span className="ml-2 flex-shrink-0">{endIcon}</span>
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
