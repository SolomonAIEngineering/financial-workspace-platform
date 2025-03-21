'use client';

import * as React from 'react';

import { DataTableFilterControls } from '@/components/data-table/data-table-filter-controls';
import { DataTableResetButton } from '@/components/data-table/data-table-reset-button';
import { cn } from '@/lib/utils';

/**
 * Props for the FilterSidebar component.
 * 
 * @property className - Custom class name for the main container
 * @property headerClassName - Custom class name for the header
 * @property contentClassName - Custom class name for the content area containing filters
 * @property title - Optional custom title for the filter sidebar
 */
export interface FilterSidebarProps {
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    title?: string;
}

/**
 * FilterSidebar component for the DataTable.
 * Displays the filters and filter controls for the data table.
 * This component can be customized with className props to adjust its layout.
 */
export function FilterSidebar({
    className,
    headerClassName,
    contentClassName,
    title = 'Filters',
}: FilterSidebarProps) {
    return (
        <div
            className={cn(
                'h-full w-full flex-col p-[1%] sm:sticky sm:top-0 sm:max-h-screen sm:min-h-screen sm:max-w-52 sm:min-w-52 sm:self-start md:max-w-100 md:min-w-90',
                'group-data-[expanded=false]/controls:hidden',
                'hidden sm:flex',
                className
            )}
        >
            <div className={cn(
                "rounded-t-lg border-b border-gray-200 bg-background md:sticky md:top-0 dark:border-gray-800",
                headerClassName
            )}>
                <div className="flex h-[46px] items-center justify-between gap-3 px-4">
                    <p className="font-medium text-foreground">{title}</p>
                    <div>
                        <DataTableResetButton />
                    </div>
                </div>
            </div>
            <div
                className={cn(
                    "no-scrollbar flex-1 overflow-y-auto p-3",
                    contentClassName
                )}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
                <DataTableFilterControls />
            </div>
        </div>
    );
} 