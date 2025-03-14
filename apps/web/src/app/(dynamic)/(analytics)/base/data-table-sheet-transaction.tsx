"use client";

import * as React from "react";

import {
    AlertCircle,
    ArrowUpDown,
    Bookmark,
    Calendar,
    Check,
    ChevronDown,
    ChevronRight,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    Edit,
    FileSpreadsheet,
    FileText,
    Home,
    Layers,
    RefreshCw,
    Tag,
    X
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/default/potion-ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/registry/default/potion-ui/tooltip";
import { format, isValid, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/registry/default/potion-ui/button";
import type { ColumnSchema } from "./schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/registry/default/potion-ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryColors } from "./columns";
import { cn } from "@/lib/utils";
import { useDataTable } from "@/components/data-table/data-table-provider";

interface TimingPhase {
    name: string;
    percentage: number;
    value: number;
    color: string;
}

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

export function TransactionSheetDetails() {
    const { rowSelection, table } = useDataTable();
    const [loading, setLoading] = React.useState(false);
    const [relatedTransactions, setRelatedTransactions] = React.useState<ColumnSchema[]>([]);

    const selectedRowKey = Object.keys(rowSelection)[0];
    const selectedRow = selectedRowKey ? table.getRow(selectedRowKey) : null;
    const transaction = selectedRow?.original as ColumnSchema | undefined;

    // Fetch related transactions (similar merchant or recurring series)
    React.useEffect(() => {
        if (transaction?.merchantName || transaction?.isRecurring) {
            // Simulate loading of related transactions
            setLoading(true);
            setTimeout(() => {
                // Filter table data for related transactions (this is a simulation)
                const related = (table.getRowModel().rows
                    .filter(row => {
                        const t = row.original as ColumnSchema;
                        return (
                            (transaction.merchantName && t.merchantName === transaction.merchantName && row.id !== selectedRowKey) ||
                            (transaction.isRecurring &&
                                t.name === transaction.name &&
                                t.amount === transaction.amount &&
                                row.id !== selectedRowKey)
                        );
                    })
                    .slice(0, 3)
                    .map(row => row.original)) as ColumnSchema[];

                setRelatedTransactions(related);
                setLoading(false);
            }, 500);
        }
    }, [transaction, table, selectedRowKey]);

    // Error state if no transaction selected
    if (!transaction) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center h-full">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Transaction Selected</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Select a transaction from the table to view its details.
                </p>
            </div>
        );
    }

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return "-";
        try {
            const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
            return isValid(date) ? format(date, "MMM dd, yyyy HH:mm:ss") : "-";
        } catch (e) {
            return "-";
        }
    };

    // Format currency amount
    const formatCurrency = (amount?: number, currency: string = "USD") => {
        if (amount === undefined) return "-";
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    // Mock timing phases similar to the image
    const timingPhases: TimingPhase[] = [
        {
            name: "PROCESSING",
            percentage: 12.2,
            value: 122,
            color: "bg-emerald-500"
        },
        {
            name: "VERIFICATION",
            percentage: 29.3,
            value: 293,
            color: "bg-cyan-500"
        },
        {
            name: "AUTHORIZATION",
            percentage: 9.7,
            value: 97,
            color: "bg-blue-500"
        },
        {
            name: "SETTLEMENT",
            percentage: 48.4,
            value: 484,
            color: "bg-amber-500"
        },
        {
            name: "FINALIZATION",
            percentage: 0.4,
            value: 4,
            color: "bg-purple-500"
        }
    ];

    // Latency is the sum of all timing phase values
    const totalLatency = timingPhases.reduce((sum, phase) => sum + phase.value, 0);

    // Get status color based on status code or transaction status
    const getStatusColor = () => {
        if (transaction.pending) return "text-amber-500";
        return "text-emerald-500";
    };

    // Get transaction type
    const getTransactionType = () => {
        const type = transaction.transactionType as string | undefined;
        if (type) return type.replace(/_/g, " ");
        if (transaction.isManual) return "MANUAL";
        if (transaction.isRecurring) return "RECURRING";
        return "STANDARD";
    };

    // Export transaction details
    const handleExportDetails = () => {
        console.log("Exporting transaction details");
    };

    // Safe access to category colors
    const getCategoryDot = () => {
        if (!transaction.category) return null;
        const category = categoryColors[transaction.category];
        if (!category || !category.dot) return null;
        return <div className="h-3 w-3 rounded-full" style={{ background: String(category.dot) }} />;
    };

    return (
        <ScrollArea className="h-full pr-4">
            <div className="flex flex-col space-y-4 py-2">
                {/* Primary Fields */}
                <div className="flex items-start justify-between">
                    <p className="text-sm text-muted-foreground w-28">Transaction ID</p>
                    <p className="text-sm font-mono flex-1 text-right">{transaction.id || "-"}</p>
                </div>

                <div className="flex items-start justify-between">
                    <p className="text-sm text-muted-foreground w-28">Date</p>
                    <p className="text-sm flex-1 text-right">{formatDate(transaction.date)}</p>
                </div>

                <div className="flex items-start justify-between">
                    <p className="text-sm text-muted-foreground w-28">Status</p>
                    <p className={cn("text-sm flex-1 text-right font-medium", getStatusColor())}>
                        {transaction.pending ? "PENDING" : "COMPLETED"}
                    </p>
                </div>

                <div className="flex items-start justify-between">
                    <p className="text-sm text-muted-foreground w-28">Type</p>
                    <p className="text-sm flex-1 text-right font-mono">{getTransactionType()}</p>
                </div>

                <div className="flex items-start justify-between">
                    <p className="text-sm text-muted-foreground w-28">Merchant</p>
                    <p className="text-sm flex-1 text-right">{transaction.merchantName || "-"}</p>
                </div>

                <div className="flex items-start justify-between">
                    <p className="text-sm text-muted-foreground w-28">Name</p>
                    <p className="text-sm flex-1 text-right font-medium">{transaction.name || "-"}</p>
                </div>

                <div className="flex items-start justify-between">
                    <p className="text-sm text-muted-foreground w-28">Category</p>
                    <div className="flex items-center justify-end flex-1 gap-1">
                        {transaction.category && (
                            <div className="flex items-center gap-1">
                                {getCategoryDot()}
                                <Badge variant="outline" className="text-xs font-normal">
                                    {transaction.category.replace(/_/g, " ")}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-start justify-between">
                    <p className="text-sm text-muted-foreground w-28">Amount</p>
                    <p className={cn(
                        "text-sm flex-1 text-right font-medium",
                        transaction.amount && transaction.amount < 0 ? "text-red-500" : "text-emerald-500"
                    )}>
                        {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                </div>

                <div className="flex items-start justify-between">
                    <p className="text-sm text-muted-foreground w-28">Account</p>
                    <p className="text-sm flex-1 text-right font-mono">
                        {transaction.bankAccountName || transaction.bankAccountId || "-"}
                    </p>
                </div>

                {/* Description Section */}
                <CollapsibleSection
                    title="Description & Notes"
                    icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                >
                    <div className="p-2 rounded-md bg-background text-sm">
                        {(transaction as any).description || "No description available for this transaction."}
                    </div>

                    {(transaction as any).location && (
                        <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Location</p>
                            <div className="p-2 rounded-md bg-background text-sm">
                                {(transaction as any).location}
                            </div>
                        </div>
                    )}

                    {transaction.insightTags && transaction.insightTags.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs text-muted-foreground mb-1">Tags</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {transaction.insightTags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CollapsibleSection>

                {/* Categories Section */}
                <CollapsibleSection
                    title="Categorization Details"
                    icon={<Tag className="h-4 w-4 text-muted-foreground" />}
                >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Cash Flow</p>
                            {(transaction as any).cashFlowCategory ? (
                                <Badge variant="outline" className={cn(
                                    "mt-1 px-2 py-0.5 text-xs rounded-md",
                                    (transaction as any).cashFlowCategory === "INCOME"
                                        ? "text-green-600 border-green-300 bg-green-50"
                                        : (transaction as any).cashFlowCategory === "EXPENSE"
                                            ? "text-red-600 border-red-300 bg-red-50"
                                            : "text-blue-600 border-blue-300 bg-blue-50"
                                )}>
                                    {(transaction as any).cashFlowCategory}
                                </Badge>
                            ) : <span className="text-muted-foreground">-</span>}
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">Budget Category</p>
                            {(transaction as any).budgetCategory ? (
                                <Badge variant="secondary" className="mt-1 px-2 py-0.5 text-xs">
                                    {(transaction as any).budgetCategory}
                                </Badge>
                            ) : <span className="text-muted-foreground">-</span>}
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">Needs/Wants</p>
                            {(transaction as any).needsWantsCategory ? (
                                <Badge variant="outline" className={cn(
                                    "mt-1 px-2 py-0.5 text-xs rounded-md",
                                    (transaction as any).needsWantsCategory === "NEEDS"
                                        ? "text-blue-600 border-blue-300 bg-blue-50"
                                        : (transaction as any).needsWantsCategory === "WANTS"
                                            ? "text-purple-600 border-purple-300 bg-purple-50"
                                            : "text-green-600 border-green-300 bg-green-50"
                                )}>
                                    {(transaction as any).needsWantsCategory}
                                </Badge>
                            ) : <span className="text-muted-foreground">-</span>}
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">Custom Category</p>
                            <p className="mt-1 text-xs">
                                {(transaction as any).customCategory || "-"}
                            </p>
                        </div>

                        {(transaction as any).spendingGoalId && (
                            <div className="col-span-2">
                                <p className="text-xs text-muted-foreground">Financial Goal</p>
                                <p className="mt-1 text-xs font-mono">
                                    {(transaction as any).spendingGoalId}
                                </p>
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Processing Time Section */}
                <div className="border rounded-md p-3 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium">Processing Time</h3>
                        </div>
                        <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs font-normal bg-amber-50 border-amber-200">
                                P50
                            </Badge>
                            <p className="text-sm">{totalLatency}ms</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {timingPhases.map((phase) => (
                            <div key={phase.name} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center">
                                        <span className="font-mono">{phase.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">{phase.percentage.toFixed(1)}%</span>
                                        <span className="font-mono">{phase.value}ms</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={cn(phase.color, "h-full rounded-full")}
                                        style={{ width: `${phase.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Properties Section */}
                <CollapsibleSection
                    title="Transaction Properties"
                    icon={<Layers className="h-4 w-4 text-muted-foreground" />}
                >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <PropertyItem
                            label="Recurring"
                            value={transaction.isRecurring}
                        />
                        <PropertyItem
                            label="Manual Entry"
                            value={transaction.isManual}
                        />
                        <PropertyItem
                            label="Verified"
                            value={transaction.isVerified || false}
                        />
                        <PropertyItem
                            label="Tax Deductible"
                            value={(transaction as any).taxDeductible || false}
                        />
                        <PropertyItem
                            label="Exclude from Budget"
                            value={transaction.excludeFromBudget}
                        />
                        <PropertyItem
                            label="Reimbursable"
                            value={(transaction as any).reimbursable || false}
                        />
                        <PropertyItem
                            label="Split Transaction"
                            value={(transaction as any).isSplit || false}
                        />
                        <PropertyItem
                            label="Modified"
                            value={transaction.isModified}
                        />
                    </div>
                </CollapsibleSection>

                {/* Related Transactions */}
                <CollapsibleSection
                    title="Related Transactions"
                    icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
                >
                    {loading ? (
                        <div className="space-y-2">
                            {Array(2).fill(0).map((_, i) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-background rounded-md">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-3 w-28" />
                                        <Skeleton className="h-2 w-20" />
                                    </div>
                                    <Skeleton className="h-3 w-16 ml-auto" />
                                </div>
                            ))}
                        </div>
                    ) : relatedTransactions.length > 0 ? (
                        <div className="space-y-1">
                            {relatedTransactions.map((related, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center p-2 rounded-md bg-background hover:bg-accent/10 transition-colors"
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                            {related.category && categoryColors[related.category]?.icon ||
                                                <DollarSign className="h-3 w-3" />
                                            }
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium truncate">{related.name || "Transaction"}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDate(related.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={cn(
                                        "text-xs font-medium ml-2",
                                        related.amount < 0 ? "text-red-500" : "text-emerald-500"
                                    )}>
                                        {formatCurrency(related.amount, related.currency)}
                                    </p>
                                </div>
                            ))}

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="w-full text-xs mt-1">
                                        View more related transactions
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle>Related Transactions</DialogTitle>
                                        <DialogDescription>
                                            Transactions related to {transaction.merchantName || transaction.name}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <p className="text-center text-muted-foreground py-8">
                                            Extended transaction history would appear here
                                        </p>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                            <div className="rounded-full bg-muted p-2">
                                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <h3 className="mt-2 text-xs font-medium">No related transactions</h3>
                            <p className="mt-1 text-[10px] text-muted-foreground max-w-sm">
                                No other transactions found from this merchant or with similar patterns.
                            </p>
                        </div>
                    )}
                </CollapsibleSection>

                {/* More Metadata */}
                <div className="grid grid-cols-2 gap-3 mt-2 border-t border-dashed border-gray-200 pt-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Age</p>
                        <p className="text-xs font-mono">
                            {(transaction as any).age !== undefined ? (transaction as any).age : "0"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Frequency</p>
                        <p className="text-xs font-mono">
                            {transaction.isRecurring ? "Recurring" : "One-time"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Entry Method</p>
                        <p className="text-xs font-mono">
                            {transaction.isManual ? "Manual entry" : "Auto-import"}
                        </p>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Creation Date</p>
                        <p className="text-xs font-mono">
                            {(transaction as any).creationDate ? formatDate((transaction as any).creationDate) : "-"}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
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
                                <p className="text-xs">Edit transaction details</p>
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
                                    onClick={handleExportDetails}
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Export</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Export transaction details</p>
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