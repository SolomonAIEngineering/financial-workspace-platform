'use client';

import * as React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';

export const Popover = PopoverPrimitive.Root;

export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverAnchor = PopoverPrimitive.Anchor;

export const PopoverPortal = PopoverPrimitive.Portal;

export const popoverVariants = cva(
  cn(
    'group/popover',
    'z-50 max-w-[calc(100vw-24px)] animate-popover overflow-hidden rounded-md bg-popover text-popover-foreground shadow-floating outline-hidden'
  ),
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        combobox: '',
        default: 'w-72',
        equation: 'w-[400px] rounded-lg px-2.5 py-2',
        equationInline: 'w-[400px] rounded-lg px-2.5 py-2',
        media: 'max-h-[70vh] min-w-[180px] rounded-lg',
      },
    },
  }
);

export function PopoverContent({
  align = 'center',
  className,
  sideOffset = 4,
  variant,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> &
  VariantProps<typeof popoverVariants>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn(popoverVariants({ variant }), className)}
        align={align}
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/**
 * PopoverContentWithoutPortal is a forwardRef to the PopoverPrimitive.Content
 * component. It is used to create a popover content without a portal.
 *
 * @param props - The props for the PopoverPrimitive.Content component.
 * @returns The PopoverPrimitive.Content component.
 */
export const PopoverContentWithoutPortal = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 border bg-background p-4 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      className
    )}
    {...props}
  />
));
