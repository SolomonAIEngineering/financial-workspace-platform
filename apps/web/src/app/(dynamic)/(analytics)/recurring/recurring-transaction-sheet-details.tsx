"use client";

import * as React from "react";

import {
    AlertCircle,
    ArrowUpDown,
    Calendar,
    CalendarClock,
    CalendarDays,
    Check,
    ChevronDown,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Edit,
    Info,
    Layers,
    Pause,
    Play,
    RefreshCw,
    Settings,
    X
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/registry/default/potion-ui/tooltip";
import { addDays, addMonths, addWeeks, format, isValid, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/registry/default/potion-ui/button";
// Add import for RecurringTransactionSchema
import type { RecurringTransactionSchema } from "./schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/registry/default/potion-ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useDataTable } from "@/components/data-table/data-table-provider";

// Create a simple collapsible section component
interface CollapsibleSectionProps {
    title: string;
    icon?: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
    className?: string;
}

function CollapsibleSection({
    title,
    icon,
    defaultOpen = false,
    children,
    className
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className={cn("border rounded-md p-2 bg-gray-50/50", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-sm font-medium">{title}</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-7 w-7"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronDown
                        className={cn(
                            "h-4 w-4 transition-transform",
                            isOpen && "rotate-180"
                        )}
                    />
                </Button>
            </div>
            {isOpen && (
                <div className="pt-2">
                    {children}
                </div>
            )}
        </div>
    );
}

// Sample transaction data related to a recurring transaction
const sampleRelatedTransactions = [
    {
        id: "tx_1",
        date: new Date("2023-10-15"),
        name: "Netflix Subscription",
        amount: -15.99,
        currency: "USD",
        status: "completed",
    },
    {
        id: "tx_2",
        date: new Date("2023-09-15"),
        name: "Netflix Subscription",
        amount: -15.99,
        currency: "USD",
        status: "completed",
    },
    {
        id: "tx_3",
        date: new Date("2023-08-15"),
        name: "Netflix Subscription",
        amount: -15.99,
        currency: "USD",
        status: "completed",
    },
    {
        id: "tx_4",
        date: new Date("2023-07-15"),
        name: "Netflix Subscription",
        amount: -15.99,
        currency: "USD",
        status: "completed",
    },
];

// Helper function to get the next execution dates
function getNextExecutionDates(
    frequency: string,
    interval: number,
    baseDate: Date,
    count: number = 5
): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(baseDate);

    for (let i = 0; i < count; i++) {
        // Calculate next date based on frequency
        switch (frequency) {
            case "WEEKLY":
                currentDate = addWeeks(currentDate, interval);
                break;
            case "BIWEEKLY":
                currentDate = addWeeks(currentDate, 2 * interval);
                break;
            case "MONTHLY":
                currentDate = addMonths(currentDate, interval);
                break;
            case "SEMI_MONTHLY":
                currentDate = addDays(currentDate, 15 * interval);
                break;
            case "ANNUALLY":
                currentDate = addMonths(currentDate, 12 * interval);
                break;
            default:
                currentDate = addMonths(currentDate, interval);
        }

        dates.push(new Date(currentDate));
    }

    return dates;
}

export function RecurringTransactionSheetDetails() {
    const { rowSelection, table } = useDataTable();
    const [loading, setLoading] = React.useState(false);

    // Fix the selectedRow and recurringTransaction type handling
    const selectedRowKey = Object.keys(rowSelection)[0];
    const selectedRow = selectedRowKey ? table.getRow(selectedRowKey) : null;
    const recurringTransaction = selectedRow?.original as RecurringTransactionSchema || {} as RecurringTransactionSchema;

    // Update the error state check to include a proper empty check for RecurringTransactionSchema
    if (!selectedRow || !recurringTransaction.id) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Recurring Transaction Selected</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Select a recurring transaction from the table to view its details.
                </p>
            </div>
        );
    }

    // Format date strings
    const formatDate = (dateString?: string | Date | null) => {
        if (!dateString) return "-";
        try {
            const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
            return isValid(date) ? format(date, "MMM dd, yyyy") : "-";
        } catch (e) {
            return "-";
        }
    };

    // Format date with time
    const formatDateTime = (dateString?: string | Date | null) => {
        if (!dateString) return "-";
        try {
            const date = typeof dateString === "string" ? parseISO(dateString) : dateString;
            return isValid(date) ? format(date, "MMM dd, yyyy, HH:mm") : "-";
        } catch (e) {
            return "-";
        }
    };

    // Format currency
    const formatCurrency = (amount?: number | null, currency: string = "USD") => {
        if (amount === undefined || amount === null) return "-";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount);
    };

    // Format recurring frequency
    const formatFrequency = (frequency?: string, interval: number = 1) => {
        if (!frequency) return "-";

        const frequencyMap: Record<string, string> = {
            "WEEKLY": interval === 1 ? "Weekly" : `Every ${interval} weeks`,
            "BIWEEKLY": "Every 2 weeks",
            "MONTHLY": interval === 1 ? "Monthly" : `Every ${interval} months`,
            "SEMI_MONTHLY": "Twice a month",
            "ANNUALLY": interval === 1 ? "Annually" : `Every ${interval} years`,
            "IRREGULAR": "Irregular",
            "UNKNOWN": "Unknown",
        };

        return frequencyMap[frequency] || frequency.toLowerCase();
    };

    // Get execution status styling
    const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-green-50 border-green-200 text-green-700";
            case "paused":
                return "bg-amber-50 border-amber-200 text-amber-700";
            case "completed":
                return "bg-blue-50 border-blue-200 text-blue-700";
            case "cancelled":
                return "bg-red-50 border-red-200 text-red-700";
            default:
                return "bg-gray-50 border-gray-200 text-gray-700";
        }
    };

    // Calculate next execution dates
    const nextDates = getNextExecutionDates(
        recurringTransaction.frequency,
        recurringTransaction.interval,
        new Date(recurringTransaction.nextScheduledDate),
        5
    );

    return (
        <ScrollArea className="h-full pr-4">
            <div className="flex flex-col space-y-4 py-2">
                {/* Header with Title, Status and Actions */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-semibold">{recurringTransaction.title}</h2>
                        <p className="text-sm text-muted-foreground">{recurringTransaction.description}</p>
                    </div>

                    <Badge
                        variant="outline"
                        className={cn(
                            "px-2 py-1 capitalize",
                            getStatusStyle(recurringTransaction.status)
                        )}
                    >
                        {recurringTransaction.status}
                    </Badge>
                </div>

                <Separator />

                {/* Primary Data */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className={cn(
                            "text-lg font-semibold",
                            Number(recurringTransaction.amount) < 0 ? "text-red-500" : "text-green-500"
                        )}>
                            {formatCurrency(recurringTransaction.amount, recurringTransaction.currency)}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Type</p>
                        <div className="flex items-center gap-2">
                            {recurringTransaction.transactionType === "subscription" ? (
                                <RefreshCw className="h-4 w-4 text-purple-500" />
                            ) : recurringTransaction.transactionType === "bill" ? (
                                <CreditCard className="h-4 w-4 text-amber-500" />
                            ) : recurringTransaction.transactionType === "income" ? (
                                <DollarSign className="h-4 w-4 text-green-500" />
                            ) : (
                                <Calendar className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="font-medium capitalize">{recurringTransaction.transactionType || "Other"}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Frequency</p>
                        <div className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-blue-500" />
                            <span>
                                {formatFrequency(recurringTransaction.frequency, recurringTransaction.interval)}
                                {recurringTransaction.dayOfMonth && " (day " + recurringTransaction.dayOfMonth + ")"}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Next Execution</p>
                        <p className="font-medium">{formatDate(recurringTransaction.nextScheduledDate)}</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Merchant</p>
                        <p>{recurringTransaction.merchantName || "-"}</p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Importance</p>
                        <Badge variant="outline" className={cn(
                            "capitalize",
                            recurringTransaction.importanceLevel === "critical" ? "bg-red-50 border-red-200 text-red-700" :
                                recurringTransaction.importanceLevel === "high" ? "bg-amber-50 border-amber-200 text-amber-700" :
                                    recurringTransaction.importanceLevel === "medium" ? "bg-blue-50 border-blue-200 text-blue-700" :
                                        "bg-green-50 border-green-200 text-green-700"
                        )}>
                            {recurringTransaction.importanceLevel || "Low"}
                        </Badge>
                    </div>
                </div>

                <Separator />

                {/* Schedule Details Section */}
                <CollapsibleSection
                    title="Schedule Details"
                    icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                    defaultOpen={true}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Start Date</p>
                                <p className="text-sm">{formatDate(recurringTransaction.startDate)}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">End Date</p>
                                <p className="text-sm">{formatDate(recurringTransaction.endDate) || "No end date"}</p>
                            </div>

                            {recurringTransaction.frequency === "MONTHLY" && recurringTransaction.dayOfMonth && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Day of Month</p>
                                    <p className="text-sm">{recurringTransaction.dayOfMonth}</p>
                                </div>
                            )}

                            {recurringTransaction.frequency === "WEEKLY" && recurringTransaction.dayOfWeek !== undefined && recurringTransaction.dayOfWeek !== null && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Day of Week</p>
                                    <p className="text-sm">
                                        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][recurringTransaction.dayOfWeek]}
                                    </p>
                                </div>
                            )}

                            {recurringTransaction.isVariable && (
                                <div className="space-y-1">
                                    <p className="text-xs text-muted-foreground">Variable Amount</p>
                                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                                        Variable
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <p className="text-xs font-medium mb-2">Upcoming Executions</p>
                            <div className="space-y-2">
                                {nextDates.map((date, index) => (
                                    <div key={index} className="flex items-center justify-between bg-background rounded-md p-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            <span>{formatDate(date)}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {formatCurrency(recurringTransaction.amount, recurringTransaction.currency)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Execution History Section */}
                <CollapsibleSection
                    title="Execution History"
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                    defaultOpen={true}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Last Execution</p>
                                <p className="text-sm">{formatDateTime(recurringTransaction.lastExecutedAt)}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Execution Count</p>
                                <p className="text-sm">{recurringTransaction.executionCount || 0}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Total Executed</p>
                                <p className="text-sm">{formatCurrency(recurringTransaction.totalExecuted, recurringTransaction.currency)}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Last Status</p>
                                <Badge variant="outline" className="capitalize bg-green-50 border-green-200 text-green-700">
                                    {recurringTransaction.lastExecutionStatus || "Success"}
                                </Badge>
                            </div>
                        </div>

                        <div className="pt-2">
                            <p className="text-xs font-medium mb-2">Related Transactions</p>
                            {sampleRelatedTransactions.length > 0 ? (
                                <div className="space-y-2">
                                    {sampleRelatedTransactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between bg-background rounded-md p-2 text-sm">
                                            <div className="flex flex-col">
                                                <span>{tx.name}</span>
                                                <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                                            </div>
                                            <div className={cn(
                                                "tabular-nums text-right",
                                                Number(tx.amount) < 0 ? "text-red-500" : "text-green-500"
                                            )}>
                                                {formatCurrency(tx.amount, tx.currency)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4 text-center">
                                    <div className="rounded-full bg-muted p-2">
                                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <h3 className="mt-2 text-xs font-medium">No transaction history</h3>
                                    <p className="mt-1 text-[10px] text-muted-foreground max-w-sm">
                                        No past transactions found for this recurring transaction.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>

                {/* Additional Details Section */}
                <CollapsibleSection
                    title="Additional Details"
                    icon={<Layers className="h-4 w-4 text-muted-foreground" />}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Bank Account</p>
                            <p className="text-sm font-mono">{recurringTransaction.bankAccountId}</p>
                        </div>

                        {recurringTransaction.minBalanceRequired !== undefined && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Minimum Balance Required</p>
                                <p className="text-sm">{formatCurrency(recurringTransaction.minBalanceRequired, recurringTransaction.currency)}</p>
                            </div>
                        )}

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Automated</p>
                            <PropertyItem
                                label="Auto-create transactions"
                                value={recurringTransaction.isAutomated}
                            />
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">Affect Balance</p>
                            <PropertyItem
                                label="Included in balance calculations"
                                value={recurringTransaction.affectAvailableBalance}
                            />
                        </div>

                        {recurringTransaction.requiresApproval !== undefined && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Approval Required</p>
                                <PropertyItem
                                    label="Requires manual approval"
                                    value={recurringTransaction.requiresApproval}
                                />
                            </div>
                        )}

                        {recurringTransaction.allowedVariance !== undefined && (
                            <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Allowed Variance</p>
                                <p className="text-sm">{recurringTransaction.allowedVariance}%</p>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-2">
                    {recurringTransaction.status === "active" ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                        >
                            <Pause className="h-3.5 w-3.5" />
                            <span>Pause</span>
                        </Button>
                    ) : recurringTransaction.status === "paused" ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                        >
                            <Play className="h-3.5 w-3.5" />
                            <span>Resume</span>
                        </Button>
                    ) : null}

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1"
                                >
                                    <Settings className="h-3.5 w-3.5" />
                                    <span>Manage</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Edit recurring transaction settings</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                    <span>Edit</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Edit recurring transaction details</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1"
                                >
                                    <Info className="h-3.5 w-3.5" />
                                    <span>Forecast</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">View future financial impact</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </ScrollArea>
    );
}

// Small component to show properties with checkmarks
function PropertyItem({
    label,
    value
}: {
    label: string;
    value?: boolean;
}) {
    return (
        <div className="flex items-center gap-2 p-1.5 rounded-md bg-background">
            <div className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full",
                value ? "bg-green-100" : "bg-muted"
            )}>
                {value ?
                    <Check className="h-2.5 w-2.5 text-green-600" /> :
                    <X className="h-2.5 w-2.5 text-muted-foreground" />
                }
            </div>
            <span className="text-xs">{label}</span>
        </div>
    );
} 