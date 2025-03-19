'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { Button } from '@/registry/default/potion-ui/button';
import { Kbd } from '@/components/ui/kbd';
import { X } from 'lucide-react';
import { useDataTable } from '@/components/data-table/data-table-provider';
import { useHotKey } from '@/hooks/use-hot-key';

export function DataTableResetButton() {
  const { table } = useDataTable();
  useHotKey(table.resetColumnFilters, 'Escape');

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.resetColumnFilters()}
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>
            Reset filters with{' '}
            <Kbd className="ml-1 text-muted-foreground group-hover:text-accent-foreground">
              <span className="mr-1">⌘</span>
              <span>Esc</span>
            </Kbd>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
