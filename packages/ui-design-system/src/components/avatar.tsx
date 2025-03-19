'use client'

import * as AvatarPrimitive from '@radix-ui/react-avatar'
import * as React from 'react'

import Image, { ImageProps } from 'next/image'

import { cn } from '../utils'

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

interface AvatarImageNextProps extends Omit<ImageProps, 'src'> {
  src?: string
}

export const AvatarImageNext = React.forwardRef<
  React.ElementRef<typeof Image>,
  AvatarImageNextProps
>(({ className, onError, alt = '', src, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false)

  if (hasError || !src) {
    return null
  }

  return (
    <Image
      ref={ref}
      className={cn('absolute z-10 aspect-square h-full w-full', className)}
      onError={(e) => {
        setHasError(true)
        onError?.(e)
      }}
      alt={alt}
      src={src}
      {...props}
    />
  )
})

AvatarImageNext.displayName = 'AvatarImageNext'

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'bg-accent flex h-full w-full items-center justify-center rounded-full',
      className,
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarFallback, AvatarImage }
