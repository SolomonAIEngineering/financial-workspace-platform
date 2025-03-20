import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import React from 'react';

export interface LinkProps extends NextLinkProps {
  className?: string;
  children?: React.ReactNode;
  hideArrow?: boolean;
  prefetch?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { className, href, children, hideArrow, prefetch = true, ...props },
    ref
  ) => {
    const isInternal =
      href?.toString().startsWith('/') || href?.toString().startsWith('#');
    const externalLinkProps = !isInternal
      ? { target: '_blank', rel: 'noreferrer' }
      : undefined;

    return (
      <NextLink
        className={cn(
          'group text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground',
          'rounded-md ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none',
          className
        )}
        ref={ref}
        href={href}
        prefetch={prefetch}
        {...externalLinkProps}
        {...props}
      >
        {children}
        {!isInternal && !hideArrow ? (
          <ArrowUpRight className="ml-0.5 inline-block h-4 w-4 text-muted-foreground group-hover:translate-x-px group-hover:-translate-y-px group-hover:text-foreground" />
        ) : null}
      </NextLink>
    );
  }
);

Link.displayName = 'Link';

export { Link };
