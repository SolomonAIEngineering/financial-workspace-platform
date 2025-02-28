'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';

import { useSidebar } from '@/components/chat/sidebar/use-sidebar';

export interface SidebarProps extends React.ComponentProps<'div'> {}

export function Sidebar({ children, className }: SidebarProps) {
  const { isLoading, isSidebarOpen } = useSidebar();

  return (
    <div
      className={cn(className, 'h-full flex-col dark:bg-zinc-950')}
      data-state={isSidebarOpen && !isLoading ? 'open' : 'closed'}
    >
      {children}
    </div>
  );
}
