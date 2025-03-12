import * as React from 'react'

import { KeyIcon } from '@heroicons/react/24/outline'
import { ButtonProps } from 'react-day-picker'
import { cn } from '../../utils/cn'
import { Button } from '../button'

/*
 * LogInButtonProps defines the props for the LogInButton component.
 *
 * @interface LogInButtonProps
 * @extends {ButtonProps}
 * */
interface LogInButtonProps extends ButtonProps {
  /** Callback function to execute when the button is clicked */
  onLogin?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Text to display on the button */
  label?: string;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Text to display when the button is loading */
  loadingText?: string;
  /** Whether to show the key icon */
  showIcon?: boolean;
  /** Size of the button */
  size?: 'default' | 'sm' | 'lg' | 'xl';
  /** Variant of the button */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button should take the full width of its container */
  fullWidth?: boolean;
  /** Callback fired when the button is focused */
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  /** Callback fired when the button loses focus */
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
}

/**
 * LogInButton is a component that renders a login button.
 *
 * @param {LogInButtonProps} props - Props for the LogInButton component.
 * @returns {JSX.Element} - The rendered LogInButton component.
 */
const LogInButton: React.FC<LogInButtonProps> = ({
  className,
  onLogin,
  label = 'Log In',
  isLoading = false,
  loadingText = 'Logging in...',
  showIcon = true,
  size = 'default',
  variant = 'outline',
  disabled = false,
  fullWidth = false,
  onFocus,
  onBlur,
  ...props
}) => {
  const handleClick = () => {
    if (onLogin) onLogin();
  };

  return (
    <Button
      className={cn('text-foreground font-bold', className)}
      variant={variant}
      size={size}
      onClick={handleClick}
      isLoading={isLoading}
      loadingText={loadingText}
      disabled={disabled}
      fullWidth={fullWidth}
      onFocus={onFocus}
      onBlur={onBlur}
      startIcon={showIcon && !isLoading ? <KeyIcon className="h-5 w-5" /> : undefined}
      {...props}
    >
      {label}
    </Button>
  )
}

export { LogInButton, type LogInButtonProps }
