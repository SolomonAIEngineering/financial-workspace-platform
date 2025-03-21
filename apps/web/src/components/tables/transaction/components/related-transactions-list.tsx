import * as React from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/registry/default/potion-ui/dialog';

import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/registry/default/potion-ui/button';
import type { ColumnSchema } from '../schema';
import { RelatedTransactionItem } from './related-transaction-item';
import { Skeleton } from '@/components/ui/skeleton';

interface RelatedTransactionsListProps {
    loading: boolean;
    transactions: ColumnSchema[];
    relatedEntityName?: string;
}

export function RelatedTransactionsList({
    loading,
    transactions,
    relatedEntityName = 'transaction',
}: RelatedTransactionsListProps) {
    return (
        <>
            {loading ? (
                <div className="space-y-2">
                    {Array(2)
                        .fill(0)
                        .map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 rounded-md bg-background p-2"
                            >
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-28" />
                                    <Skeleton className="h-2 w-20" />
                                </div>
                                <Skeleton className="ml-auto h-3 w-16" />
                            </div>
                        ))}
                </div>
            ) : transactions.length > 0 ? (
                <div className="space-y-1">
                    {transactions.map((related, idx) => (
                        <RelatedTransactionItem
                            key={idx}
                            transaction={related}
                        />
                    ))}

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1 w-full text-xs"
                            >
                                View more related transactions
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Related Transactions</DialogTitle>
                                <DialogDescription>
                                    Transactions related to {relatedEntityName}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <p className="py-8 text-center text-muted-foreground">
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
                    <h3 className="mt-2 text-xs font-medium">
                        No related transactions
                    </h3>
                    <p className="mt-1 max-w-sm text-[10px] text-muted-foreground">
                        No other transactions found from this merchant or with similar
                        patterns.
                    </p>
                </div>
            )}
        </>
    );
} 