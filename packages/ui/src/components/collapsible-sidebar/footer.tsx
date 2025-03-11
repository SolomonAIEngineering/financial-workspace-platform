import * as React from 'react'

type FooterProps = {
  description: string
  className?: string
  children?: React.ReactNode
}

export function Footer({ description, className, children }: FooterProps) {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 z-20 w-full shadow backdrop-blur">
      <div className="mx-4 flex h-14 items-center md:mx-8">
        <p className="text-muted-foreground text-left text-xs leading-loose md:text-sm">
          {description}{' '}
        </p>
        {children}
      </div>
    </div>
  )
}
