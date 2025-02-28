import React from 'react';

import type { LucideProps } from 'lucide-react';

import { cn } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';

export type IconBaseProps = {
  /** Custom class names */
  className?: string;
  /** Label for screen readers. Required if icon is standalone */
  label?: string;
  /** Whether the icon should spin */
  spin?: boolean;
};

export const iconVariants = cva(
  'inline-flex shrink-0 items-center justify-center',
  {
    defaultVariants: {
      size: 'md',
      variant: 'default',
      weight: 'regular',
    },
    variants: {
      size: {
        '2xl': 'size-10',
        '2xs': 'size-2',
        '3xl': 'size-12',
        '4xl': 'size-16',
        lg: 'size-6',
        md: 'size-5',
        sm: 'size-4',
        xl: 'size-8',
        xs: 'size-3',
      },
      spin: {
        true: 'animate-spin',
      },
      variant: {
        brand: 'text-brand',
        button: 'mr-2 size-4',
        danger: 'text-danger',
        default: 'text-foreground',
        info: 'text-info',
        menuItem: 'mr-2 size-5 text-muted-foreground',
        muted: 'text-muted-foreground',
        placeholder: 'text-muted-foreground/50',
        primary: 'text-primary',
        success: 'text-success',
        toolbar: 'size-5 text-muted-foreground hover:text-foreground',
        warning: 'text-warning',
      },
      weight: {
        black: 'stroke-[2.25]',
        bold: 'stroke-[2]',
        medium: 'stroke-[1.75]',
        regular: 'stroke-[1.5]',
        thin: 'stroke-[1]',
      },
    },
  }
);

export type IconProps = IconBaseProps &
  IconVariantProps &
  Omit<LucideProps, keyof IconBaseProps>;

export type IconVariantProps = VariantProps<typeof iconVariants>;

export const createIcon = (
  Icon: React.FC<LucideProps>,
  defaultProps: Partial<IconProps> = {}
) => {
  return function IconComponent({
    'aria-hidden': ariaHidden,
    'aria-label': ariaLabel,
    className,
    label,
    size,
    spin,
    variant,
    weight,
    ...props
  }: IconProps) {
    const isStandalone = !ariaHidden && (!!label || !!ariaLabel);
    const finalAriaLabel = ariaLabel || label;

    return (
      <>
        {isStandalone && <span className="sr-only">{finalAriaLabel}</span>}
        <Icon
          className={cn(
            iconVariants({ size, spin: spin ? true : false, variant, weight }),
            defaultProps?.className,
            className
          )}
          aria-hidden={!isStandalone}
          aria-label={isStandalone ? finalAriaLabel : undefined}
          {...defaultProps}
          {...props}
        />
      </>
    );
  };
};

/**
 * Helper to create a colored icon that ignores the variant color Useful for
 * brand icons like Google, GitHub, etc.
 */
export const createColoredIcon = (
  Icon: React.FC<LucideProps>,
  defaultProps: Partial<IconProps> = {}
) => {
  return createIcon(Icon, {
    ...defaultProps,
    className: cn('text-current', defaultProps?.className),
  });
};
