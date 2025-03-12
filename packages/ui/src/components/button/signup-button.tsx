import * as React from 'react'

import { LockClosedIcon } from '@heroicons/react/24/outline'
import { ButtonProps } from 'react-day-picker'
import { cn } from '../../utils/cn'
import { Button } from '../button'

/*
 * SignUpButtonProps defines the props for the SignUpButton component.
 *
 * @interface SignUpButtonProps
 * @extends {ButtonProps}
 * */
interface SignUpButtonProps extends ButtonProps {
  /** Callback function to execute when the button is clicked */
  onSignUp?: () => void;
  /** Additional CSS class names */
  className?: string;
  /** Text to display on the button */
  label?: string;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Text to display when the button is loading */
  loadingText?: string;
  /** Whether to show the lock icon */
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
  /** Background color of the button */
  bgColor?: string;
  /** Text color of the button */
  textColor?: string;
}

/**
 * SignUpButton is a component that renders a sign up button.
 *
 * @param {SignUpButtonProps} props - Props for the SignUpButton component.
 * @returns {JSX.Element} - The rendered SignUpButton component.
 */
const SignUpButton: React.FC<SignUpButtonProps> = ({
  className,
  onSignUp,
  label = 'Sign Up',
  isLoading = false,
  loadingText = 'Signing up...',
  showIcon = true,
  size = 'default',
  variant = 'default',
  disabled = false,
  fullWidth = false,
  onFocus,
  onBlur,
  bgColor = 'bg-zinc-950',
  textColor = 'text-white',
  ...props
}) => {
  const handleClick = () => {
    if (onSignUp) onSignUp();
  };

  return (
    <Button
      className={cn(
        'font-bold rounded-2xl',
        bgColor,
        textColor,
        className,
      )}
      variant={variant}
      size={size}
      onClick={handleClick}
      isLoading={isLoading}
      loadingText={loadingText}
      disabled={disabled}
      fullWidth={fullWidth}
      onFocus={onFocus}
      onBlur={onBlur}
      startIcon={showIcon && !isLoading ? <LockClosedIcon className="h-5 w-5" /> : undefined}
      {...props}
    >
      {label}
    </Button>
  )
}

export { SignUpButton, type SignUpButtonProps }
