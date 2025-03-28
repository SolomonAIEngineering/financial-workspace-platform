import { useCallback } from 'react';
import { toast } from 'sonner';
import { produce } from 'immer';

import { useDebouncedCallback } from '@/hooks/useDebounceCallback';
import { useWarnIfUnsavedChanges } from '@/hooks/useWarnIfUnsavedChanges';
import { mergeDefined } from '@/lib/mergeDefined';
import { api, useTRPC } from '@/trpc/react';
import { DEFAULT_QUERY_OPTIONS, type QueryOptions } from './query-options';

/**
 * Hook for fetching a specific recurring transaction by ID
 *
 * This hook retrieves a single recurring transaction by its ID.
 *
 * @example
 *   // Example usage:
 *   function TransactionDetails({ id }) {
 *     const {
 *       data: transaction,
 *       isLoading,
 *       error,
 *     } = useRecurringTransaction(id);
 *
 *     // Render transaction details
 *   }
 *
 * @param id - The recurring transaction ID to fetch
 * @param options - TRPC query options
 * @returns TRPC query result containing the recurring transaction data
 */
export function useRecurringTransaction(
  id: string,
  options: QueryOptions = DEFAULT_QUERY_OPTIONS
) {
  return api.recurringTransactions.getRecurringTransaction.useQuery(
    { id },
    options
  );
}

/**
 * Hook for creating a new recurring transaction
 *
 * This hook provides a mutation function to create a new recurring transaction.
 * On success, it shows a success toast notification and invalidates the
 * recurring transactions query.
 *
 * @example
 *   // Example usage:
 *   function CreateTransactionForm() {
 *     const createMutation = useCreateRecurringTransaction();
 *
 *     const handleSubmit = (data) => {
 *       createMutation.mutate(data);
 *     };
 *
 *     // Render form with submit handler
 *   }
 *
 * @returns TRPC mutation object with methods to create a recurring transaction
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
 * This hook provides a mutation function to update a recurring transaction. It
 * implements optimistic updates to immediately reflect changes in the UI before
 * the server responds, and rolls back changes if the update fails.
 *
 * @example
 *   // Example usage:
 *   function EditTransactionForm({ transaction }) {
 *     const updateMutation = useUpdateRecurringTransaction();
 *
 *     const handleSubmit = (data) => {
 *       updateMutation.mutate({
 *         id: transaction.id,
 *         data: data,
 *       });
 *     };
 *
 *     // Render form with submit handler
 *   }
 *
 * @returns TRPC mutation object with methods to update a recurring transaction
 */
export function useUpdateRecurringTransaction() {
  const trpc = useTRPC();

  return api.recurringTransactions.updateRecurringTransaction.useMutation({
    onSuccess: () => {
      toast.success('Recurring transaction updated successfully');
    },
    onError: (_, __, context: any) => {
      if (context?.previousRecurringTransactions) {
        trpc.recurringTransactions.getRecurringTransactions.setData(
          {},
          context.previousRecurringTransactions
        );
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
      await trpc.recurringTransactions.getRecurringTransaction.cancel({
        id: input.id,
      });

      const previousRecurringTransactions =
        trpc.recurringTransactions.getRecurringTransactions.getData({});
      const previousRecurringTransaction =
        trpc.recurringTransactions.getRecurringTransaction.getData({
          id: input.id,
        });

      trpc.recurringTransactions.getRecurringTransaction.setData(
        { id: input.id },
        (old) =>
          produce(old, (draft) => {
            if (!draft) return draft;

            return {
              ...draft,
              ...mergeDefined(input.data, draft, { omitNull: true }),
            };
          })
      );

      trpc.recurringTransactions.getRecurringTransactions.setData({}, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          draft.recurringTransactions = draft.recurringTransactions.map(
            (recurringTransaction) => {
              if (recurringTransaction.id === input.id) {
                return mergeDefined(input.data, recurringTransaction, {
                  omitNull: true,
                });
              }
              return recurringTransaction;
            }
          );
        })
      );

      return {
        id: input.id,
        previousRecurringTransaction,
        previousRecurringTransactions,
      };
    },
  });
}

/**
 * Hook for updating recurring transaction details with debouncing
 *
 * This hook provides a debounced function to update a recurring transaction.
 * It's useful for fields that update frequently (like text inputs) to avoid
 * sending too many API requests. It also implements optimistic updates for a
 * responsive UI experience.
 *
 * @example
 *   // Example usage:
 *   function TransactionNotesField({ transaction }) {
 *     const [notes, setNotes] = useState(transaction.notes || '');
 *     const updateDebounced = useUpdateRecurringTransactionDebounced();
 *
 *     const handleChange = (e) => {
 *       setNotes(e.target.value);
 *       updateDebounced({
 *         id: transaction.id,
 *         data: { notes: e.target.value },
 *       });
 *     };
 *
 *     // Render text area with change handler
 *   }
 *
 * @returns A debounced function that accepts an object with id and data
 *   properties
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

      void trpc.recurringTransactions.getRecurringTransaction.setData(
        { id: input.id },
        (prevData) =>
          produce(prevData, (draft) => {
            if (draft) {
              return {
                ...draft,
                ...mergeDefined(input.data, draft, { omitNull: true }),
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
 * This hook provides a mutation function to delete a recurring transaction. It
 * implements optimistic updates to immediately remove the transaction from the
 * UI before the server responds, and restores it if the deletion fails.
 *
 * @example
 *   // Example usage:
 *   function DeleteButton({ transactionId }) {
 *     const deleteMutation = useDeleteRecurringTransaction();
 *
 *     const handleDelete = () => {
 *       deleteMutation.mutate({ id: transactionId });
 *     };
 *
 *     // Render delete button with confirmation
 *   }
 *
 * @returns TRPC mutation object with methods to delete a recurring transaction
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
        trpc.recurringTransactions.getRecurringTransactions.setData(
          {},
          context.previousRecurringTransactions
        );
      }
      toast.error('Failed to delete recurring transaction');
    },
    onMutate: async (input) => {
      await trpc.recurringTransactions.getRecurringTransactions.cancel();

      const previousRecurringTransactions =
        trpc.recurringTransactions.getRecurringTransactions.getData({});

      trpc.recurringTransactions.getRecurringTransactions.setData({}, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          draft.recurringTransactions = draft.recurringTransactions.filter(
            (recurringTransaction) => recurringTransaction.id !== input.id
          );
        })
      );

      return { previousRecurringTransactions };
    },
  });
}
