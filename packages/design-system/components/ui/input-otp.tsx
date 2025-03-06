'use client'

import * as React from 'react'

import { OTPInput, OTPInputContext } from 'input-otp'

import { MinusIcon } from '@radix-ui/react-icons'
import { cn } from '@repo/design-system/lib/utils'

// Helper type for forwardRef components
type ForwardRefComponent<T, P> = React.ForwardRefExoticComponent<P & React.RefAttributes<T>>

// Component types
type InputOTPProps = React.ComponentPropsWithoutRef<typeof OTPInput>
type InputOTPGroupProps = React.ComponentPropsWithoutRef<'div'>
type InputOTPSlotProps = React.ComponentPropsWithoutRef<'div'> & { index: number }
type InputOTPSeparatorProps = React.ComponentPropsWithoutRef<'div'>

const InputOTP: ForwardRefComponent<
  React.ElementRef<typeof OTPInput>,
  InputOTPProps
> = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  InputOTPProps
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center gap-2 has-[:disabled]:opacity-50',
      containerClassName,
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
))
InputOTP.displayName = 'InputOTP'

const InputOTPGroup: ForwardRefComponent<
  React.ElementRef<'div'>,
  InputOTPGroupProps
> = React.forwardRef<
  React.ElementRef<'div'>,
  InputOTPGroupProps
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
))
InputOTPGroup.displayName = 'InputOTPGroup'

const InputOTPSlot: ForwardRefComponent<
  React.ElementRef<'div'>,
  InputOTPSlotProps
> = React.forwardRef<
  React.ElementRef<'div'>,
  InputOTPSlotProps
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        'border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
        isActive && 'ring-ring z-10 ring-1',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = 'InputOTPSlot'

const InputOTPSeparator: ForwardRefComponent<
  HTMLDivElement,
  InputOTPSeparatorProps
> = React.forwardRef<
  HTMLDivElement,
  InputOTPSeparatorProps
>(({ className, ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <MinusIcon />
  </div>
))
InputOTPSeparator.displayName = 'InputOTPSeparator'

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot }
