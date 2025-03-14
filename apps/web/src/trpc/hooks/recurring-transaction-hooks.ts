import { useCallback } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { produce } from 'immer';

import { useDebouncedCallback } from '@/hooks/useDebounceCallback';
import { useWarnIfUnsavedChanges } from '@/hooks/useWarnIfUnsavedChanges';
import { mergeDefined } from '@/lib/mergeDefined';
import { api, useTRPC } from '@/trpc/react';
import type { TransactionCategory, TransactionFrequency } from '@prisma/client';
import { DEFAULT_QUERY_OPTIONS, type QueryOptions } from './query-options';

/**
 * Hook for fetching a list of recurring transactions with optional filtering
 * 
 * This hook provides pagination and filtering capabilities for recurring transactions.
 * It automatically handles pagination state and returns both the raw query result and
 * helper methods for pagination.
 * 
 * @param filters - Optional filters to apply to the recurring transactions query
 * @param options - TRPC query options
 * @returns Object containing query result, transaction list, pagination data, and page controls
 * 
 * @example
 * // Example usage:
 * function RecurringTransactionsList() {
 *   const [filters, setFilters] = useState({
 *     isActive: true,
 *     frequency: 'MONTHLY' as TransactionFrequency,
 *     minAmount: 100
 *   });
 * 
 *   const { 
 *     recurringTransactions, 
 *     isLoading, 
 *     pagination, 
 *     page, 
 *     setPage 
 *   } = useRecurringTransactions(filters);
 * 
 *   // Render the transactions list with pagination
 * }
 */
export function useRecurringTransactions(
    filters?: {
        isActive?: boolean;
        category?: TransactionCategory;
        frequency?: TransactionFrequency;
        startDateFrom?: string;
        startDateTo?: string;
        minAmount?: number;
        maxAmount?: number;
        title?: string;
        merchantName?: string;
        tags?: string[];
        page?: number;
        limit?: number;
    },
    options: QueryOptions = DEFAULT_QUERY_OPTIONS,
) {
    const [page, setPage] = useState(filters?.page || 1);
    const [limit, setLimit] = useState(filters?.limit || 20);

    const apiFilters = {
        page,
        limit,
        status: filters?.isActive ? 'active' : undefined,
        maxAmount: filters?.maxAmount,
        minAmount: filters?.minAmount,
        title: filters?.title,
        merchantName: filters?.merchantName,
        frequency: filters?.frequency,
    };

    const query = api.recurringTransactions.getRecurringTransactions.useQuery(
        apiFilters,
        {
            ...options,
        },
    );

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setPage(1);
    };

    return {
        ...query,
        recurringTransactions: query.data?.recurringTransactions || [],
        pagination: query.data?.pagination,
        page,
        limit,
        setPage: handlePageChange,
        setLimit: handleLimitChange,
    };
}

/**
 * Hook for fetching a specific recurring transaction by ID
 * 
 * This hook retrieves a single recurring transaction by its ID.
 * 
 * @param id - The recurring transaction ID to fetch
 * @param options - TRPC query options
 * @returns TRPC query result containing the recurring transaction data
 * 
 * @example
 * // Example usage:
 * function TransactionDetails({ id }) {
 *   const { data: transaction, isLoading, error } = useRecurringTransaction(id);
 *   
 *   // Render transaction details
 * }
 */
export function useRecurringTransaction(id: string, options: QueryOptions = DEFAULT_QUERY_OPTIONS) {
    return api.recurringTransactions.getRecurringTransaction.useQuery({ id }, options);
}

/**
 * Hook for creating a new recurring transaction
 * 
 * This hook provides a mutation function to create a new recurring transaction.
 * On success, it shows a success toast notification and invalidates the recurring transactions query.
 * 
 * @returns TRPC mutation object with methods to create a recurring transaction
 * 
 * @example
 * // Example usage:
 * function CreateTransactionForm() {
 *   const createMutation = useCreateRecurringTransaction();
 *   
 *   const handleSubmit = (data) => {
 *     createMutation.mutate(data);
 *   };
 *   
 *   // Render form with submit handler
 * }
 */
export function useCreateRecurringTransaction() {
    const trpc = useTRPC();

    return api.recurringTransactions.createRecurringTransaction.useMutation({
        onSuccess: () => {
            toast.success('Recurring transaction created successfully');
            void trpc.recurringTransactions.getRecurringTransactions.invalidate();
        },
        onError: (error) => {
            toast.error(`Failed to create recurring transaction: ${error.message}`);
        },
    });
}

/**
 * Hook for updating an existing recurring transaction with optimistic updates
 * 
 * This hook provides a mutation function to update a recurring transaction.
 * It implements optimistic updates to immediately reflect changes in the UI
 * before the server responds, and rolls back changes if the update fails.
 * 
 * @returns TRPC mutation object with methods to update a recurring transaction
 * 
 * @example
 * // Example usage:
 * function EditTransactionForm({ transaction }) {
 *   const updateMutation = useUpdateRecurringTransaction();
 *   
 *   const handleSubmit = (data) => {
 *     updateMutation.mutate({
 *       id: transaction.id,
 *       data: data
 *     });
 *   };
 *   
 *   // Render form with submit handler
 * }
 */
export function useUpdateRecurringTransaction() {
    const trpc = useTRPC();

    return api.recurringTransactions.updateRecurringTransaction.useMutation({
        onSuccess: () => {
            toast.success('Recurring transaction updated successfully');
        },
        onError: (_, __, context: any) => {
            if (context?.previousRecurringTransactions) {
                trpc.recurringTransactions.getRecurringTransactions.setData({}, context.previousRecurringTransactions);
            }
            if (context?.previousRecurringTransaction) {
                trpc.recurringTransactions.getRecurringTransaction.setData(
                    { id: context.id },
                    context.previousRecurringTransaction
                );
            }
            toast.error('Failed to update recurring transaction');
        },
        onMutate: async (input) => {
            await trpc.recurringTransactions.getRecurringTransactions.cancel();
            await trpc.recurringTransactions.getRecurringTransaction.cancel({ id: input.id });

            const previousRecurringTransactions = trpc.recurringTransactions.getRecurringTransactions.getData({});
            const previousRecurringTransaction = trpc.recurringTransactions.getRecurringTransaction.getData({ id: input.id });

            trpc.recurringTransactions.getRecurringTransaction.setData({ id: input.id }, (old) =>
                produce(old, (draft) => {
                    if (!draft) return draft;

                    return {
                        ...draft,
                        ...mergeDefined(input.data, draft, { omitNull: true })
                    };
                })
            );

            trpc.recurringTransactions.getRecurringTransactions.setData({}, (old) =>
                produce(old, (draft) => {
                    if (!draft) return draft;

                    draft.recurringTransactions = draft.recurringTransactions.map(recurringTransaction => {
                        if (recurringTransaction.id === input.id) {
                            return mergeDefined(input.data, recurringTransaction, { omitNull: true });
                        }
                        return recurringTransaction;
                    });
                })
            );

            return { id: input.id, previousRecurringTransaction, previousRecurringTransactions };
        },
    });
}

/**
 * Hook for updating recurring transaction details with debouncing
 * 
 * This hook provides a debounced function to update a recurring transaction.
 * It's useful for fields that update frequently (like text inputs) to avoid
 * sending too many API requests. It also implements optimistic updates for
 * a responsive UI experience.
 * 
 * @returns A debounced function that accepts an object with id and data properties
 * 
 * @example
 * // Example usage:
 * function TransactionNotesField({ transaction }) {
 *   const [notes, setNotes] = useState(transaction.notes || '');
 *   const updateDebounced = useUpdateRecurringTransactionDebounced();
 *   
 *   const handleChange = (e) => {
 *     setNotes(e.target.value);
 *     updateDebounced({
 *       id: transaction.id,
 *       data: { notes: e.target.value }
 *     });
 *   };
 *   
 *   // Render text area with change handler
 * }
 */
export function useUpdateRecurringTransactionDebounced() {
    const trpc = useTRPC();
    const updateRecurringTransaction = useUpdateRecurringTransaction();
    const updateDebounced = useDebouncedCallback(
        updateRecurringTransaction.mutate,
        500
    );

    useWarnIfUnsavedChanges({ enabled: updateDebounced.isPending() });

    return useCallback(
        (input: { id: string; data: any }) => {
            updateDebounced({
                id: input.id,
                data: input.data,
            });

            void trpc.recurringTransactions.getRecurringTransaction.setData({ id: input.id }, (prevData) =>
                produce(prevData, (draft) => {
                    if (draft) {
                        return {
                            ...draft,
                            ...mergeDefined(input.data, draft, { omitNull: true })
                        };
                    }
                })
            );
        },
        [trpc, updateDebounced]
    );
}

/**
 * Hook for deleting a recurring transaction
 * 
 * This hook provides a mutation function to delete a recurring transaction.
 * It implements optimistic updates to immediately remove the transaction from the UI
 * before the server responds, and restores it if the deletion fails.
 * 
 * @returns TRPC mutation object with methods to delete a recurring transaction
 * 
 * @example
 * // Example usage:
 * function DeleteButton({ transactionId }) {
 *   const deleteMutation = useDeleteRecurringTransaction();
 *   
 *   const handleDelete = () => {
 *     deleteMutation.mutate({ id: transactionId });
 *   };
 *   
 *   // Render delete button with confirmation
 * }
 */
export function useDeleteRecurringTransaction() {
    const trpc = useTRPC();

    return api.recurringTransactions.deleteRecurringTransaction.useMutation({
        onSuccess: () => {
            toast.success('Recurring transaction deleted successfully');
            void trpc.recurringTransactions.getRecurringTransactions.invalidate();
        },
        onError: (_, __, context: any) => {
            if (context?.previousRecurringTransactions) {
                trpc.recurringTransactions.getRecurringTransactions.setData({}, context.previousRecurringTransactions);
            }
            toast.error('Failed to delete recurring transaction');
        },
        onMutate: async (input) => {
            await trpc.recurringTransactions.getRecurringTransactions.cancel();

            const previousRecurringTransactions = trpc.recurringTransactions.getRecurringTransactions.getData({});

            trpc.recurringTransactions.getRecurringTransactions.setData({}, (old) =>
                produce(old, (draft) => {
                    if (!draft) return draft;

                    draft.recurringTransactions = draft.recurringTransactions.filter(recurringTransaction => recurringTransaction.id !== input.id);
                })
            );

            return { previousRecurringTransactions };
        },
    });
} 