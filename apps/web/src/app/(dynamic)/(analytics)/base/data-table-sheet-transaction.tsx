"use client";

import * as React from "react";

import { AlertCircle, ArrowUpDown, Bookmark, Calendar, Check, ChevronRight, Clock, CreditCard, DollarSign, Download, Edit, FileSpreadsheet, FileText, Home, Layers, RefreshCw, Tag, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/registry/default/potion-ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/default/potion-ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/default/potion-ui/tooltip";
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

/**
 * Enhanced transaction sheet details component with improved UI and additional features
 */
export function TransactionSheetDetails() {
    const { rowSelection, table } = useDataTable();
    const [activeTab, setActiveTab] = React.useState("details");
    const [isEditing, setIsEditing] = React.useState(false);
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
                    .slice(0, 5)
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

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleExportPDF = () => {
        // Implementation would connect to PDF generation service
        console.log("Exporting transaction details to PDF");
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        try {
            const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
            return isValid(date) ? format(date, "PPP p") : "-";
        } catch (e) {
            return "-";
        }
    };

    return (
        <ScrollArea className="h-[80vh]">
            <div className="flex flex-col gap-6 p-1">
                {/* Header with actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold">{transaction.name || "Transaction"}</h2>
                        <p className="text-muted-foreground">
                            {formatDate(transaction.date.toISOString())} · ID: {transaction.id?.substring(0, 8) || "N/A"}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="outline" size="icon" onClick={handleEditToggle}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isEditing ? "Cancel Editing" : "Edit Transaction"}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" variant="outline" size="icon" onClick={handleExportPDF}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Export Details
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Primary information card */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <CardTitle>Transaction Summary</CardTitle>
                            </div>
                            <Badge
                                variant={transaction.pending ? "outline" : "secondary"}
                                className={cn(
                                    transaction.pending
                                        ? "text-yellow-600 border-yellow-300 bg-yellow-50"
                                        : "text-green-600 border-green-300 bg-green-50"
                                )}
                            >
                                {transaction.pending ? "Pending" : "Completed"}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-6 justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                <p className={cn(
                                    "text-2xl font-bold",
                                    transaction.category === "INCOME"
                                        ? "text-green-600"
                                        : "text-red-500"
                                )}>
                                    {formatCurrency(transaction.amount, transaction.currency)}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Category</p>
                                <div className="flex items-center gap-2">
                                    {transaction.category && categoryColors[transaction.category] ? (
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex items-center justify-center p-1.5 rounded-full bg-muted">
                                                {categoryColors[transaction.category].icon}
                                            </div>
                                            <span className="text-base font-medium">{transaction.category.replace(/_/g, " ")}</span>
                                        </div>
                                    ) : transaction.customCategory ? (
                                        <span className="text-base font-medium">{transaction.customCategory}</span>
                                    ) : (
                                        <span className="text-base font-medium text-muted-foreground">Uncategorized</span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Merchant</p>
                                <p className="text-base font-medium">
                                    {transaction.merchantName || "Unknown Merchant"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tab navigation for detailed information */}
                <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="details" className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            <span className="hidden sm:inline">Details</span>
                        </TabsTrigger>
                        <TabsTrigger value="categorization" className="flex items-center gap-1.5">
                            <Tag className="h-4 w-4" />
                            <span className="hidden sm:inline">Categories</span>
                        </TabsTrigger>
                        <TabsTrigger value="properties" className="flex items-center gap-1.5">
                            <Layers className="h-4 w-4" />
                            <span className="hidden sm:inline">Properties</span>
                        </TabsTrigger>
                        <TabsTrigger value="related" className="flex items-center gap-1.5">
                            <RefreshCw className="h-4 w-4" />
                            <span className="hidden sm:inline">Related</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Details Tab */}
                    <TabsContent value="details" className="mt-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <CardTitle>Transaction Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <Field
                                        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
                                        label="Transaction Date"
                                        value={formatDate(transaction.date.toISOString())}
                                    />
                                    <Field
                                        icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
                                        label="Payment Method"
                                        value={transaction.paymentMethod?.replace(/_/g, " ") || "-"}
                                    />
                                    <Field
                                        icon={<Home className="h-4 w-4 text-muted-foreground" />}
                                        label="Account"
                                        value={transaction.bankAccountName || transaction.bankAccountId || "-"}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Field
                                        icon={<FileSpreadsheet className="h-4 w-4 text-muted-foreground" />}
                                        label="Type"
                                        value={transaction.transactionType?.replace(/_/g, " ") || "-"}
                                    />
                                    <Field
                                        icon={<Bookmark className="h-4 w-4 text-muted-foreground" />}
                                        label="Reference ID"
                                        value={transaction.id || "-"}
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <Field
                                        label="Description"
                                        value={
                                            <div className="p-3 bg-muted/30 rounded-md text-sm">
                                                {transaction.description || "No description available"}
                                            </div>
                                        }
                                    />
                                </div>

                                {transaction.location && (
                                    <div className="col-span-1 md:col-span-2">
                                        <Field
                                            label="Location"
                                            value={
                                                <div className="p-3 bg-muted/30 rounded-md text-sm">
                                                    {transaction.location || "No location data"}
                                                </div>
                                            }
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Categorization Tab */}
                    <TabsContent value="categorization" className="mt-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-5 w-5 text-primary" />
                                    <CardTitle>Categorization</CardTitle>
                                </div>
                                <CardDescription>
                                    How this transaction is categorized for budgeting and analytics
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field
                                    label="Cash Flow"
                                    value={
                                        transaction.cashFlowCategory ? (
                                            <Badge variant="outline" className={cn(
                                                "px-2 py-1 text-sm font-medium rounded-md",
                                                transaction.cashFlowCategory === "INCOME"
                                                    ? "text-green-600 border-green-300 bg-green-50"
                                                    : transaction.cashFlowCategory === "EXPENSE"
                                                        ? "text-red-600 border-red-300 bg-red-50"
                                                        : "text-blue-600 border-blue-300 bg-blue-50"
                                            )}>
                                                {transaction.cashFlowCategory}
                                            </Badge>
                                        ) : "-"
                                    }
                                />
                                <Field
                                    label="Budget Category"
                                    value={
                                        transaction.budgetCategory ? (
                                            <Badge variant="secondary" className="px-2 py-1 text-sm">
                                                {transaction.budgetCategory}
                                            </Badge>
                                        ) : "-"
                                    }
                                />
                                <Field
                                    label="Needs/Wants"
                                    value={
                                        transaction.needsWantsCategory ? (
                                            <Badge variant="outline" className={cn(
                                                "px-2 py-1 text-sm font-medium rounded-md",
                                                transaction.needsWantsCategory === "NEEDS"
                                                    ? "text-blue-600 border-blue-300 bg-blue-50"
                                                    : transaction.needsWantsCategory === "WANTS"
                                                        ? "text-purple-600 border-purple-300 bg-purple-50"
                                                        : "text-green-600 border-green-300 bg-green-50"
                                            )}>
                                                {transaction.needsWantsCategory}
                                            </Badge>
                                        ) : "-"
                                    }
                                />
                                <Field
                                    label="Financial Goal"
                                    value={transaction.spendingGoalId || "-"}
                                />
                                <div className="col-span-1 md:col-span-2">
                                    <Field
                                        label="Tags"
                                        value={
                                            transaction.tags && transaction.tags.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {transaction.tags.map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="text-sm px-2.5 py-0.5 rounded-md">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : <span className="text-muted-foreground">No tags</span>
                                        }
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" size="sm" disabled={!isEditing} className="text-sm">
                                    <Tag className="h-4 w-4 mr-1" /> Add Tags
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Properties Tab */}
                    <TabsContent value="properties" className="mt-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-primary" />
                                    <CardTitle>Properties</CardTitle>
                                </div>
                                <CardDescription>
                                    Additional attributes and flags for this transaction
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <PropertyField
                                        label="Recurring Transaction"
                                        description="This transaction occurs regularly on a schedule"
                                        value={transaction.isRecurring}
                                    />
                                    <PropertyField
                                        label="Verified"
                                        description="Transaction has been verified against statements"
                                        value={transaction.isVerified}
                                    />
                                    <PropertyField
                                        label="Tax Deductible"
                                        description="Eligible for tax deduction"
                                        value={transaction.taxDeductible || false}
                                    />
                                    <PropertyField
                                        label="Exclude from Budget"
                                        description="This won't count toward budget limits"
                                        value={transaction.excludeFromBudget}
                                    />
                                    <PropertyField
                                        label="Reimbursable"
                                        description="Can be submitted for reimbursement"
                                        value={transaction.reimbursable || false}
                                    />
                                    <PropertyField
                                        label="Split Transaction"
                                        description="Transaction is split across categories"
                                        value={transaction.isSplit}
                                    />
                                </div>
                            </CardContent>
                            {isEditing && (
                                <CardFooter>
                                    <Button variant="outline" size="sm" className="text-sm">
                                        Update Properties
                                    </Button>
                                </CardFooter>
                            )}
                        </Card>
                    </TabsContent>

                    {/* Related Tab */}
                    <TabsContent value="related" className="mt-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <RefreshCw className="h-5 w-5 text-primary" />
                                    <CardTitle>Related Transactions</CardTitle>
                                </div>
                                <CardDescription>
                                    Other transactions from the same merchant or recurring series
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="space-y-2">
                                        {Array(3).fill(0).map((_, i) => (
                                            <div key={i} className="flex items-center gap-2 p-2">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-40" />
                                                    <Skeleton className="h-3 w-24" />
                                                </div>
                                                <Skeleton className="h-4 w-20 ml-auto" />
                                            </div>
                                        ))}
                                    </div>
                                ) : relatedTransactions.length > 0 ? (
                                    <div className="space-y-1">
                                        {relatedTransactions.map((related, idx) => (
                                            <React.Fragment key={idx}>
                                                {idx > 0 && <Separator className="my-2" />}
                                                <div className="flex items-center p-2 rounded-md hover:bg-accent transition-colors">
                                                    <div className="flex flex-1 items-center gap-3">
                                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                                                            {related.category && categoryColors[related.category]?.icon || <DollarSign className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{related.name || "Transaction"}</p>
                                                            <p className="text-xs text-muted-foreground">{formatDate(related.date.toISOString())}</p>
                                                        </div>
                                                    </div>
                                                    <p className={cn(
                                                        "text-sm font-medium",
                                                        related.category === "INCOME" ? "text-green-600" : "text-red-500"
                                                    )}>
                                                        {formatCurrency(related.amount, related.currency)}
                                                    </p>
                                                    <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground" />
                                                </div>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-center">
                                        <div className="rounded-full bg-muted p-3">
                                            <ArrowUpDown className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="mt-3 text-sm font-medium">No related transactions</h3>
                                        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                                            We couldn't find any related transactions from the same merchant or matching this recurring pattern.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="text-xs">
                                            View Full Transaction History
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px]">
                                        <DialogHeader>
                                            <DialogTitle>Transaction History</DialogTitle>
                                            <DialogDescription>
                                                Comprehensive view of all transactions from this merchant.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            {/* Transaction history would be implemented here */}
                                            <p className="text-center text-muted-foreground py-8">
                                                Full transaction history view would be implemented here
                                            </p>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ScrollArea>
    );
}

/**
 * Field component for displaying a labeled value
 */
function Field({
    label,
    value,
    icon,
    className
}: {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <div className="flex items-center gap-1.5">
                {icon}
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <div className="text-sm font-medium">{value}</div>
        </div>
    );
}

/**
 * PropertyField component for displaying boolean properties with descriptions
 */
function PropertyField({
    label,
    description,
    value
}: {
    label: string;
    description: string;
    value?: boolean;
}) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-md border bg-card">
            <div className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                value ? "bg-green-100" : "bg-muted"
            )}>
                {value ?
                    <Check className="h-4 w-4 text-green-600" /> :
                    <X className="h-4 w-4 text-muted-foreground" />
                }
            </div>
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
        </div>
    );
}

/**
 * Format currency values with proper localization
 */
function formatCurrency(amount: number, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 2,
    }).format(amount);
} 