"use client";

import * as React from "react";

import { Calendar, CalendarClock, Check, Clock, CreditCard, DollarSign, RefreshCw, X } from "lucide-react";
import { format, isAfter, isBefore } from "date-fns";

import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { RecurringTransactionSchema } from "./schema";
import { cn } from "@/lib/utils";

// Define transaction type colors
export const transactionTypeColors = {
    subscription: {
        badge: "text-purple-700 bg-purple-50 border-purple-200 hover:bg-purple-100",
        dot: "bg-purple-500",
        icon: <RefreshCw className="h-4 w-4 text-purple-500" />,
    },
    bill: {
        badge: "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100",
        dot: "bg-amber-500",
        icon: <CreditCard className="h-4 w-4 text-amber-500" />,
    },
    income: {
        badge: "text-green-700 bg-green-50 border-green-200 hover:bg-green-100",
        dot: "bg-green-500",
        icon: <DollarSign className="h-4 w-4 text-green-500" />,
    },
    transfer: {
        badge: "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100",
        dot: "bg-blue-500",
        icon: <RefreshCw className="h-4 w-4 text-blue-500" />,
    },
    other: {
        badge: "text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100",
        dot: "bg-gray-500",
        icon: <Calendar className="h-4 w-4 text-gray-500" />,
    },
};

// Define importance level colors
export const importanceLevelColors = {
    critical: {
        badge: "text-red-700 bg-red-50 border-red-200 hover:bg-red-100",
        dot: "bg-red-500",
    },
    high: {
        badge: "text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100",
        dot: "bg-amber-500",
    },
    medium: {
        badge: "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100",
        dot: "bg-blue-500",
    },
    low: {
        badge: "text-green-700 bg-green-50 border-green-200 hover:bg-green-100",
        dot: "bg-green-500",
    },
};

// Helper function to format frequency in a human-readable way
export function formatFrequency(frequency: string, interval: number = 1): string {
    if (interval === 1) {
        switch (frequency) {
            case "WEEKLY": return "Weekly";
            case "BIWEEKLY": return "Every 2 weeks";
            case "MONTHLY": return "Monthly";
            case "SEMI_MONTHLY": return "Twice a month";
            case "ANNUALLY": return "Annually";
            case "IRREGULAR": return "Irregular";
            default: return frequency;
        }
    } else {
        switch (frequency) {
            case "WEEKLY": return `Every ${interval} weeks`;
            case "MONTHLY": return `Every ${interval} months`;
            case "ANNUALLY": return `Every ${interval} years`;
            default: return `Every ${interval} ${frequency.toLowerCase()}s`;
        }
    }
}

// Define columns for the data table
export const columns: ColumnDef<RecurringTransactionSchema>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => {
            const title = row.getValue("title") as string;
            const status = row.original.status;

            return (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-medium">{title}</span>
                        {status && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs",
                                    status === "active" ? "bg-green-50 text-green-700 border-green-200" :
                                        status === "paused" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                            "bg-gray-50 text-gray-700 border-gray-200"
                                )}
                            >
                                {status}
                            </Badge>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {row.original.merchantName || "Manual entry"}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) => {
            const amount = row.original.amount;
            const currency = row.original.currency || "USD";

            // Format with currency symbol
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
            }).format(amount);

            return (
                <div className={cn(
                    "font-medium tabular-nums",
                    amount < 0 ? "text-red-500" : "text-green-500"
                )}>
                    {formatted}
                </div>
            );
        },
    },
    {
        accessorKey: "frequency",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Frequency" />
        ),
        cell: ({ row }) => {
            const frequency = row.getValue("frequency") as string;
            const interval = row.original.interval || 1;

            return (
                <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatFrequency(frequency, interval)}</span>
                </div>
            );
        },
    },
    {
        accessorKey: "nextScheduledDate",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Next Date" />
        ),
        cell: ({ row }) => {
            const date = row.original.nextScheduledDate;

            if (!date) return <span className="text-muted-foreground">-</span>;

            const formattedDate = format(new Date(date), "MMM d, yyyy");
            const now = new Date();
            const daysDiff = Math.round((new Date(date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const isUpcoming = daysDiff <= 7 && daysDiff >= 0;
            const isOverdue = daysDiff < 0;

            return (
                <div className="flex flex-col">
                    <span className={cn(
                        isOverdue ? "text-red-500" :
                            isUpcoming ? "text-amber-500" : ""
                    )}>
                        {formattedDate}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {isOverdue ? `${Math.abs(daysDiff)} days overdue` :
                            isUpcoming ? `In ${daysDiff} day${daysDiff === 1 ? '' : 's'}` :
                                `In ${daysDiff} days`}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "transactionType",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => {
            const type = row.getValue("transactionType") as string;
            const typeColor = transactionTypeColors[type as keyof typeof transactionTypeColors] || transactionTypeColors.other;

            return (
                <Badge
                    variant="outline"
                    className={cn("flex items-center gap-1", typeColor.badge)}
                >
                    {typeColor.icon}
                    <span className="capitalize">{type || "Other"}</span>
                </Badge>
            );
        },
    },
    {
        accessorKey: "executionCount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Executions" />
        ),
        cell: ({ row }) => {
            const count = row.getValue("executionCount") as number;
            const total = row.original.totalExecuted;
            const currency = row.original.currency || "USD";

            return (
                <div className="flex flex-col">
                    <span>{count || 0}</span>
                    <span className="text-xs text-muted-foreground">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: currency,
                        }).format(total || 0)}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const status = row.getValue("status") as string;

            return (
                <div className="flex items-center gap-2">
                    {status === "active" ? (
                        <><Check className="h-4 w-4 text-green-500" /> Active</>
                    ) : status === "paused" ? (
                        <><Clock className="h-4 w-4 text-amber-500" /> Paused</>
                    ) : (
                        <><X className="h-4 w-4 text-muted-foreground" /> {status || "Inactive"}</>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "lastExecutedAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Last Execution" />
        ),
        cell: ({ row }) => {
            const date = row.original.lastExecutedAt;

            if (!date) return <span className="text-muted-foreground">Never</span>;

            return format(new Date(date), "MMM d, yyyy");
        },
    },
]; 