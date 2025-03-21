import * as React from 'react';

import { DollarSign, Goal, TagIcon, Target } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CategoriesContentProps {
    cashFlowCategory?: string;
    budgetCategory?: string;
    needsWantsCategory?: string;
    customCategory?: string;
    spendingGoalId?: string;
}

export function CategoriesContent({
    cashFlowCategory,
    budgetCategory,
    needsWantsCategory,
    customCategory,
    spendingGoalId,
}: CategoriesContentProps) {
    return (
        <div className="space-y-4">
            {/* Cash Flow Category */}
            <div className="rounded-lg border border-border/70 overflow-hidden">
                <div className="bg-muted/30 px-3 py-2 border-b border-border/70 flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    <h4 className="text-xs font-medium text-muted-foreground">Cash Flow</h4>
                </div>
                <div className="p-3 flex items-center justify-center">
                    {cashFlowCategory ? (
                        <Badge
                            variant="outline"
                            className={cn(
                                'px-3 py-1 text-sm font-medium',
                                cashFlowCategory === 'INCOME'
                                    ? 'border-green-300 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400'
                                    : cashFlowCategory === 'EXPENSE'
                                        ? 'border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
                                        : 'border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                            )}
                        >
                            {cashFlowCategory}
                        </Badge>
                    ) : (
                        <span className="text-muted-foreground">Not categorized</span>
                    )}
                </div>
            </div>

            {/* Needs/Wants & Budget Category */}
            <div className="grid grid-cols-2 gap-4">
                {/* Needs/Wants */}
                <div className="rounded-lg border border-border/70 overflow-hidden">
                    <div className="bg-muted/30 px-3 py-2 border-b border-border/70 flex items-center gap-2">
                        <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <h4 className="text-xs font-medium text-muted-foreground">Needs/Wants</h4>
                    </div>
                    <div className="p-3 flex items-center justify-center">
                        {needsWantsCategory ? (
                            <Badge
                                variant="outline"
                                className={cn(
                                    'px-2 py-0.5 text-xs font-medium',
                                    needsWantsCategory === 'NEEDS'
                                        ? 'border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                                        : needsWantsCategory === 'WANTS'
                                            ? 'border-purple-300 bg-purple-50 text-purple-600 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-400'
                                            : 'border-green-300 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400'
                                )}
                            >
                                {needsWantsCategory}
                            </Badge>
                        ) : (
                            <span className="text-muted-foreground">Not categorized</span>
                        )}
                    </div>
                </div>

                {/* Budget */}
                <div className="rounded-lg border border-border/70 overflow-hidden">
                    <div className="bg-muted/30 px-3 py-2 border-b border-border/70 flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 text-muted-foreground" />
                        <h4 className="text-xs font-medium text-muted-foreground">Budget</h4>
                    </div>
                    <div className="p-3 flex items-center justify-center">
                        {budgetCategory ? (
                            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                                {budgetCategory}
                            </Badge>
                        ) : (
                            <span className="text-muted-foreground">Not categorized</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Category and Financial Goal */}
            <div className="grid grid-cols-1 gap-4">
                {/* Custom Category */}
                {customCategory && (
                    <div className="rounded-lg border border-border/70 overflow-hidden">
                        <div className="bg-muted/30 px-3 py-2 border-b border-border/70 flex items-center gap-2">
                            <TagIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <h4 className="text-xs font-medium text-muted-foreground">Custom Category</h4>
                        </div>
                        <div className="p-3 flex items-center justify-center">
                            <span className="text-sm">{customCategory}</span>
                        </div>
                    </div>
                )}

                {/* Financial Goal */}
                {spendingGoalId && (
                    <div className="rounded-lg border border-border/70 overflow-hidden">
                        <div className="bg-muted/30 px-3 py-2 border-b border-border/70 flex items-center gap-2">
                            <Goal className="h-3.5 w-3.5 text-muted-foreground" />
                            <h4 className="text-xs font-medium text-muted-foreground">Financial Goal</h4>
                        </div>
                        <div className="p-3 flex items-center justify-center">
                            <span className="font-mono text-xs">{spendingGoalId}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 