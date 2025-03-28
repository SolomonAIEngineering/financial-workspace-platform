import * as React from 'react';

import { Download, Edit, Share2, Tag } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { Button } from '@/registry/default/potion-ui/button';
import { cn } from '@/lib/utils';
import { useTransactionContext } from './transaction-context';

interface TransactionActionsProps {
  onEdit?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  className?: string;
}

export function TransactionActions({
  onEdit,
  onExport,
  onShare,
  className,
}: TransactionActionsProps) {
  const { enterEditModeForCategory } = useTransactionContext();

  return (
    <div
      className={cn(
        'mt-2 flex justify-end gap-2 rounded-lg p-4',
        'bg-gradient-to-r from-background/80 to-background',
        'backdrop-blur-sm',
        className
      )}
    >
      {/* Category Update Button */}
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="group flex items-center gap-1.5 overflow-hidden transition-all duration-300 hover:border-green-200 hover:bg-green-50 hover:text-green-600 dark:hover:border-green-800 dark:hover:bg-green-950/30 dark:hover:text-green-400"
              onClick={() => enterEditModeForCategory()}
            >
              <Tag className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-medium">Update Category</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Update transaction category
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {onEdit && (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="group flex items-center gap-1.5 overflow-hidden transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                onClick={onEdit}
              >
                <Edit className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-medium">Edit</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Edit transaction details
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {onExport && (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="group flex items-center gap-1.5 overflow-hidden transition-all duration-300 hover:border-green-200 hover:bg-green-50 hover:text-green-600 dark:hover:border-green-800 dark:hover:bg-green-950/30 dark:hover:text-green-400"
                onClick={onExport}
              >
                <Download className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-medium">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Export transaction details
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {onShare && (
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="group flex items-center gap-1.5 overflow-hidden transition-all duration-300 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600 dark:hover:border-purple-800 dark:hover:bg-purple-950/30 dark:hover:text-purple-400"
                onClick={onShare}
              >
                <Share2 className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110" />
                <span className="font-medium">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Share transaction details
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
