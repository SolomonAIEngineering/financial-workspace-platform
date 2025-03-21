import * as React from 'react';

import { Download, Edit, Share2 } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { Button } from '@/registry/default/potion-ui/button';
import { cn } from '@/lib/utils';

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
    return (
        <div className={cn(
            "flex justify-end gap-2 p-4 mt-2 rounded-lg",
            "bg-gradient-to-r from-background/80 to-background",
            "backdrop-blur-sm",
            className
        )}>
            {onEdit && (
                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="group flex items-center gap-1.5 transition-all duration-300 overflow-hidden hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 dark:hover:border-blue-800"
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
                                className="group flex items-center gap-1.5 transition-all duration-300 overflow-hidden hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-950/30 dark:hover:text-green-400 dark:hover:border-green-800"
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
                                className="group flex items-center gap-1.5 transition-all duration-300 overflow-hidden hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 dark:hover:bg-purple-950/30 dark:hover:text-purple-400 dark:hover:border-purple-800"
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