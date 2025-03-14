"use client";

import * as React from "react";

import {
    AlertCircle,
    ArrowDown,
    ArrowUp,
    ChevronDown,
    Clock,
    CreditCard,
    Download,
    Edit,
    FileText,
    Info,
    Tag
} from "lucide-react";
import { addDays, addMonths, addWeeks, format, isValid, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/registry/default/potion-ui/button";
// Add import for RecurringTransactionSchema
import type { RecurringTransactionSchema } from "./schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/registry/default/potion-ui/separator";
import { cn } from "@/lib/utils";
import { useDataTable } from "@/components/data-table/data-table-provider";

interface CollapsibleSectionProps {
    title: string;
    icon?: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

function CollapsibleSection({
    title,
    icon,
    defaultOpen = false,
    children
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    return (
        <div className="border-t">
            <div
                className="flex items-center py-3 cursor-pointer hover:bg-accent/10 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 text-sm font-medium">
                    {icon}
                    <span>{title}</span>
                </div>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 ml-auto text-muted-foreground transition-transform",
                        isOpen && "rotate-180"
                    )}
                />
            </div>
            {isOpen && (
                <div className="pb-4">
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
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
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
            return isValid(date) ? format(date, "MMM dd, yyyy HH:mm:ss") : "-";
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

    // Format status text
    const formatStatus = (status?: string) => {
        if (!status) return "UNKNOWN";
        return status.toUpperCase();
    };

    // Calculate next execution dates
    const nextDates = getNextExecutionDates(
        recurringTransaction.frequency,
        recurringTransaction.interval,
        new Date(recurringTransaction.nextScheduledDate),
        3
    );

    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col py-2 px-1">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium">Recurring Transaction Details</h2>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Main information section */}
                <div className="space-y-4">
                    {/* Basic info */}
                    <InfoRow label="Transaction ID" value={recurringTransaction.id} monospace />
                    <InfoRow label="Date" value={formatDate(recurringTransaction.startDate)} />
                    <InfoRow
                        label="Status"
                        value={
                            <Badge
                                className={cn(
                                    "uppercase font-normal text-xs px-1.5 py-0",
                                    recurringTransaction.status?.toLowerCase() === "active" ? "bg-green-100 text-green-800" :
                                        recurringTransaction.status?.toLowerCase() === "paused" ? "bg-amber-100 text-amber-800" :
                                            "bg-blue-100 text-blue-800"
                                )}
                            >
                                {formatStatus(recurringTransaction.status)}
                            </Badge>
                        }
                    />
                    <InfoRow
                        label="Type"
                        value={recurringTransaction.transactionType ? recurringTransaction.transactionType.toUpperCase() : "UNKNOWN"}
                    />
                    <InfoRow label="Merchant" value={recurringTransaction.merchantName} />
                    <InfoRow label="Name" value={recurringTransaction.title} />
                    <InfoRow
                        label="Category"
                        value={
                            <Badge className="uppercase font-normal text-xs px-1.5 py-0 bg-gray-100 text-gray-800">
                                {recurringTransaction.transactionType || "INCOME"}
                            </Badge>
                        }
                    />
                    <InfoRow
                        label="Amount"
                        value={
                            <span className={cn(
                                "font-medium",
                                Number(recurringTransaction.amount) < 0 ? "text-red-600" : "text-green-600"
                            )}>
                                {formatCurrency(recurringTransaction.amount, recurringTransaction.currency)}
                            </span>
                        }
                    />
                    <InfoRow label="Account" value={recurringTransaction.bankAccountId || "Primary Checking"} />
                </div>

                <Separator className="my-4" />

                {/* Collapsible Sections */}
                <CollapsibleSection
                    title="Description & Notes"
                    icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                >
                    <div className="text-sm text-muted-foreground pl-6">
                        {recurringTransaction.description || "No description available."}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    title="Categorization Details"
                    icon={<Tag className="h-4 w-4 text-muted-foreground" />}
                >
                    <div className="pl-6 space-y-4">
                        <InfoRow
                            label="Category"
                            value={recurringTransaction.transactionType || "Income"}
                            size="sm"
                        />
                        <InfoRow
                            label="Importance"
                            value={recurringTransaction.importanceLevel || "Low"}
                            size="sm"
                        />
                        <InfoRow
                            label="Type"
                            value={recurringTransaction.transactionType || "Income"}
                            size="sm"
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    title="Processing Time"
                    icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                    defaultOpen={true}
                >
                    <div className="pl-6 space-y-3">
                        <div className="flex justify-between items-center text-xs mb-1">
                            <span>P50</span>
                            <span>1000ms</span>
                        </div>

                        <ProcessingStep
                            label="PROCESSING"
                            percentage={12.2}
                            time="122ms"
                            color="bg-green-500"
                        />

                        <ProcessingStep
                            label="VERIFICATION"
                            percentage={29.3}
                            time="293ms"
                            color="bg-blue-500"
                        />

                        <ProcessingStep
                            label="AUTHORIZATION"
                            percentage={9.7}
                            time="97ms"
                            color="bg-blue-500"
                        />

                        <ProcessingStep
                            label="SETTLEMENT"
                            percentage={48.4}
                            time="484ms"
                            color="bg-orange-500"
                        />

                        <ProcessingStep
                            label="FINALIZATION"
                            percentage={0.4}
                            time="4ms"
                            color="bg-purple-500"
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    title="Transaction Properties"
                    icon={<Info className="h-4 w-4 text-muted-foreground" />}
                >
                    <div className="pl-6 space-y-4">
                        <InfoRow
                            label="Frequency"
                            value={formatFrequency(recurringTransaction.frequency, recurringTransaction.interval)}
                            size="sm"
                        />
                        {recurringTransaction.frequency === "MONTHLY" && recurringTransaction.dayOfMonth && (
                            <InfoRow
                                label="Day of Month"
                                value={String(recurringTransaction.dayOfMonth)}
                                size="sm"
                            />
                        )}
                        <InfoRow
                            label="Next Execution"
                            value={formatDate(recurringTransaction.nextScheduledDate)}
                            size="sm"
                        />
                        <InfoRow
                            label="Last Execution"
                            value={formatDateTime(recurringTransaction.lastExecutedAt)}
                            size="sm"
                        />
                        <InfoRow
                            label="Is Automated"
                            value={recurringTransaction.isAutomated ? "Yes" : "No"}
                            size="sm"
                        />
                        <InfoRow
                            label="Affects Balance"
                            value={recurringTransaction.affectAvailableBalance ? "Yes" : "No"}
                            size="sm"
                        />
                        <InfoRow
                            label="Variable Amount"
                            value={recurringTransaction.isVariable ? "Yes" : "No"}
                            size="sm"
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection
                    title="Related Transactions"
                    icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
                >
                    <div className="pl-6">
                        {sampleRelatedTransactions.length > 0 ? (
                            <div className="space-y-3">
                                {sampleRelatedTransactions.map((tx) => (
                                    <div key={tx.id} className="flex justify-between border-b pb-2">
                                        <div>
                                            <div className="text-sm">{tx.name}</div>
                                            <div className="text-xs text-muted-foreground">{formatDate(tx.date)}</div>
                                        </div>
                                        <div className={cn(
                                            "text-sm font-medium",
                                            Number(tx.amount) < 0 ? "text-red-600" : "text-green-600"
                                        )}>
                                            {formatCurrency(tx.amount, tx.currency)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                No related transactions found.
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Footer info section */}
                <div className="flex items-center justify-between mt-8 text-xs text-muted-foreground">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full">
                        <div>
                            <p className="font-medium">Age</p>
                            <p>{recurringTransaction.executionCount || 0}</p>
                        </div>
                        <div>
                            <p className="font-medium">Frequency</p>
                            <p>Recurring</p>
                        </div>
                        <div>
                            <p className="font-medium">Entry Method</p>
                            <p>Auto-import</p>
                        </div>
                        <div>
                            <p className="font-medium">Creation Date</p>
                            <p>{formatDate(recurringTransaction.createdAt) || "-"}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-8">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button variant="outline" size="sm" className="h-8">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}

// Helper component for key-value pairs of information
function InfoRow({
    label,
    value,
    monospace = false,
    size = "base"
}: {
    label: string;
    value: React.ReactNode;
    monospace?: boolean;
    size?: "sm" | "base";
}) {
    return (
        <div className="flex justify-between items-center">
            <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
                {label}
            </span>
            <span className={cn(
                size === "sm" ? "text-xs" : "text-sm",
                monospace && "font-mono text-xs"
            )}>
                {value || "-"}
            </span>
        </div>
    );
}

// Helper component for processing step visualization
function ProcessingStep({
    label,
    percentage,
    time,
    color
}: {
    label: string;
    percentage: number;
    time: string;
    color: string;
}) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
                <span>{label}</span>
                <span className="text-right">{percentage.toFixed(1)}%</span>
                <span className="text-right w-10">{time}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={cn("h-full", color)}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
} 