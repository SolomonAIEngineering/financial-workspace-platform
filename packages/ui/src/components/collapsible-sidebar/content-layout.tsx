import * as React from 'react'

import { Group } from '../../types/menu'
import { cn } from '../../utils'
import { Navbar } from './navbar'

interface ContentLayoutProps {
  title: string
  children: React.ReactNode
  menu: Group<string>[]
  className?: string
}

export function ContentLayout({
  title,
  children,
  menu,
  className,
}: ContentLayoutProps) {
  return (
    <div className={cn(className)}>
      <Navbar title={title} menu={menu} />
      <div className="container px-4 pb-8 pt-8 sm:px-8">{children}</div>
    </div>
  )
}
