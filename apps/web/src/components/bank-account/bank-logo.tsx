'use client';

import { Building } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the BankLogo component
 *
 * @property {string | null} [src] - URL of the bank logo image. If not provided
 *   or null, a fallback icon will be displayed.
 * @property {string} [alt='Bank logo'] - Alt text for the image for
 *   accessibility. Default is `'Bank logo'`
 * @property {string} [className] - Additional CSS classes to apply to the
 *   component.
 * @property {'sm' | 'md' | 'lg'} [size='md'] - Size of the logo: 'sm' (24px),
 *   'md' (36px), or 'lg' (48px). Default is `'md'`
 * @interface BankLogoProps
 */
interface BankLogoProps {
  src?: string | null;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * BankLogo Component
 *
 * Displays a financial institution's logo in a circular container. If no logo
 * source is provided or if the source is null, a fallback building icon is
 * displayed instead.
 *
 * The component handles different size variants (small, medium, large) and
 * supports custom styling through className.
 *
 * @example
 *   // With a logo
 *   <BankLogo src="https://example.com/bank-logo.png" size="lg" />;
 *
 * @example
 *   // With fallback icon (no src provided)
 *   <BankLogo size="sm" />;
 *
 * @param {BankLogoProps} props - The component props
 * @param {string | null} [props.src] - URL of the bank logo image
 * @param {string} [props.alt='Bank logo'] - Alt text for the image. Default is
 *   `'Bank logo'`
 * @param {string} [props.className] - Additional CSS classes
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Size of the logo Default is
 *   `'md'`
 * @returns {JSX.Element} A circular container with either the bank logo or a
 *   fallback icon
 * @component
 */
export function BankLogo({
  src,
  alt = 'Bank logo',
  className,
  size = 'md',
}: BankLogoProps) {
  const dimensions = {
    sm: 24,
    md: 36,
    lg: 48,
  };

  const dimension = dimensions[size];

  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted',
          className
        )}
        style={{ width: dimension, height: dimension }}
      >
        <Building className="h-1/2 w-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div
      className={cn('overflow-hidden rounded-full', className)}
      style={{ width: dimension, height: dimension }}
    >
      <Image
        src={src}
        alt={alt}
        width={dimension}
        height={dimension}
        className="rounded-full object-cover"
      />
    </div>
  );
}
