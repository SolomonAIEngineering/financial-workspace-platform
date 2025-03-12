import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Props for the DataTableSkeleton component
 */
export interface DataTableSkeletonProps {
    /**
     * Number of rows to render
     * @default 10
     */
    rows?: number;

    /**
     * Number of columns to render
     * @default 5
     */
    columns?: number;

    /**
     * Whether to show header
     * @default true
     */
    showHeader?: boolean;

    /**
     * Custom class name for the component
     */
    className?: string;

    /**
     * Custom class name for the header
     */
    headerClassName?: string;

    /**
     * Custom class name for table rows
     */
    rowClassName?: string;

    /**
     * Custom class name for table cells
     */
    cellClassName?: string;

    /**
     * Responsive column visibility configuration
     * Define at which breakpoints columns should become visible
     * @default ["table-cell", "hidden sm:table-cell", "hidden md:table-cell", "table-cell", "flex justify-end"]
     */
    columnVisibility?: string[];

    /**
     * Configuration for cell widths
     * @default ["max-w-[10rem]", "max-w-[13rem]", "w-24", "max-w-[10rem]", "w-5 h-5"]
     */
    cellWidths?: string[];
}

/**
 * A skeleton loading component for data tables
 * 
 * @param {DataTableSkeletonProps} props - The component props
 * @returns React component
 */
export function DataTableSkeleton({
    rows = 10,
    columns = 5,
    showHeader = true,
    className,
    headerClassName,
    rowClassName,
    cellClassName,
    columnVisibility = [
        "table-cell",
        "hidden sm:table-cell",
        "hidden md:table-cell",
        "table-cell",
        "flex justify-end"
    ],
    cellWidths = [
        "max-w-[10rem]",
        "max-w-[13rem]",
        "w-24",
        "max-w-[10rem]",
        "w-5 h-5"
    ],
}: DataTableSkeletonProps) {
    // Ensure we have enough visibility and width settings for all columns
    const safeColumnVisibility = [...columnVisibility];
    const safeCellWidths = [...cellWidths];

    // Fill in any missing visibility settings
    while (safeColumnVisibility.length < columns) {
        safeColumnVisibility.push("table-cell");
    }

    // Fill in any missing width settings
    while (safeCellWidths.length < columns) {
        safeCellWidths.push("w-full");
    }

    return (
        <div className={cn("w-full", className)}>
            <Table>
                {showHeader && (
                    <TableHeader className={cn("bg-muted/50", headerClassName)}>
                        <TableRow className="hover:bg-transparent">
                            {Array.from({ length: columns }).map((_, index) => (
                                <TableHead
                                    key={`header-${index}`}
                                    className={safeColumnVisibility[index]}
                                >
                                    <Skeleton
                                        className={cn(
                                            "my-1.5 h-4",
                                            index === columns - 1 ? "w-5" : "w-24"
                                        )}
                                    />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                )}
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow
                            key={`row-${rowIndex}`}
                            className={cn("hover:bg-transparent", rowClassName)}
                        >
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <TableCell
                                    key={`cell-${rowIndex}-${colIndex}`}
                                    className={cn(safeColumnVisibility[colIndex], cellClassName)}
                                >
                                    <Skeleton
                                        className={cn(
                                            "my-1.5 h-4 w-full",
                                            safeCellWidths[colIndex]
                                        )}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
} 