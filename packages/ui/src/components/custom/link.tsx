import { cn } from '@/lib/utils'
import { ArrowUpRight } from 'lucide-react'
import NextLink, { type LinkProps as NextLinkProps } from 'next/link'
import React from 'react'

export interface LinkProps extends NextLinkProps {
  className?: string
  children?: React.ReactNode
  hideArrow?: boolean
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, href, children, hideArrow, ...props }, ref) => {
    const isInternal =
      href?.toString().startsWith('/') || href?.toString().startsWith('#')
    const externalLinkProps = !isInternal
      ? { target: '_blank', rel: 'noreferrer' }
      : undefined

    return (
      <NextLink
        className={cn(
          'text-foreground decoration-border hover:decoration-foreground group underline underline-offset-4',
          'ring-offset-background focus:ring-ring rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
          className,
        )}
        ref={ref}
        href={href}
        {...externalLinkProps}
        {...props}
      >
        {children}
        {!isInternal && !hideArrow ? (
          <ArrowUpRight className="text-muted-foreground group-hover:text-foreground ml-0.5 inline-block h-4 w-4 group-hover:-translate-y-px group-hover:translate-x-px" />
        ) : null}
      </NextLink>
    )
  },
)

Link.displayName = 'Link'

export { Link }
