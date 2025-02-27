'use client';

import React from 'react';

import { cn } from '@udecode/cn';

import { useToggleLeftPanel } from '@/hooks/useResizablePanel';
import { Button } from '@/registry/default/potion-ui/button';

export const CloseButton = ({ children }: React.PropsWithChildren) => {
  const toggle = useToggleLeftPanel();

  return (
    <Button
      size="iconSm"
      variant="nav"
      className={cn('opacity-0 group-hover/sidebar:opacity-100')}
      onClick={() => toggle()}
      tooltip="Close sidebar"
      tooltipContentProps={{
        side: 'right',
      }}
    >
      {children}
    </Button>
  );
};
