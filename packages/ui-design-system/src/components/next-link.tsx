import Link, { LinkProps } from 'next/link'

/**
 * NextLink component that wraps Next.js Link with prefetch set to true by default
 */
export function NextLink(props: LinkProps) {
    const { prefetch = true, ...rest } = props
    return <Link prefetch={prefetch} {...rest} />
} 