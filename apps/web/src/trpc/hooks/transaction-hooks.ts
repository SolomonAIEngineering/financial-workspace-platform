import { DEFAULT_QUERY_OPTIONS, QueryOptions } from './query-options';
import { api, useTRPC } from '@/trpc/react';

import { Transaction } from '@solomonai/prisma';
import { mergeDefined } from '@/lib/mergeDefined';
import { produce } from 'immer';
import { toast } from 'sonner';
import { useCallback } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebounceCallback';
import { useWarnIfUnsavedChanges } from '@/hooks/useWarnIfUnsavedChanges';

/** Hook for fetching a specific transaction by ID */
export function useTransaction(
  id: string,
  options: QueryOptions = DEFAULT_QUERY_OPTIONS
) {
  return api.transactions.getTransaction.useQuery({ id }, options);
}

/** Hook for creating a new transaction */
export function useCreateTransaction() {
  const trpc = useTRPC();

  return api.transactions.createTransaction.useMutation({
    onSuccess: () => {
      toast.success('Transaction created successfully');
      void trpc.transactions.getTransactions.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create transaction: ${error.message}`);
    },
  });
}

/** Hook for updating an existing transaction with optimistic updates */
export function useUpdateTransaction() {
  const trpc = useTRPC();

  return api.transactions.updateTransaction.useMutation({
    onSuccess: () => {
      toast.success('Transaction updated successfully');
    },
    onError: (_, __, context: any) => {
      if (context?.previousTransactions) {
        trpc.transactions.getTransactions.setData(
          {},
          context.previousTransactions
        );
      }
      if (context?.previousTransaction) {
        trpc.transactions.getTransaction.setData(
          { id: context.id },
          context.previousTransaction
        );
      }
      toast.error('Failed to update transaction');
    },
    onMutate: async (input) => {
      await trpc.transactions.getTransactions.cancel();
      await trpc.transactions.getTransaction.cancel({ id: input.id });

      const previousTransactions = trpc.transactions.getTransactions.getData(
        {}
      );
      const previousTransaction = trpc.transactions.getTransaction.getData({
        id: input.id,
      });

      // Update the specific transaction
      trpc.transactions.getTransaction.setData({ id: input.id }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          return {
            ...draft,
            ...mergeDefined(input.data, draft, { omitNull: true }),
          };
        })
      );

      // Update the transaction in the list
      trpc.transactions.getTransactions.setData({}, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          draft.transactions = draft.transactions.map((transaction) => {
            if (transaction.id === input.id) {
              return mergeDefined(input.data, transaction, { omitNull: true });
            }
            return transaction;
          });
        })
      );

      return { id: input.id, previousTransaction, previousTransactions };
    },
  });
}

/** Hook for updating transaction details with debouncing */
export function useUpdateTransactionDebounced() {
  const trpc = useTRPC();
  const updateTransaction = useUpdateTransaction();
  const updateDebounced = useDebouncedCallback(updateTransaction.mutate, 500);

  useWarnIfUnsavedChanges({ enabled: updateDebounced.isPending() });

  return useCallback(
    (input: { id: string; data: any }) => {
      updateDebounced({
        id: input.id,
        data: input.data,
      });

      // Optimistically update the UI
      void trpc.transactions.getTransaction.setData(
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

/** Hook for deleting a transaction */
export function useDeleteTransaction() {
  const trpc = useTRPC();

  return api.transactions.deleteTransaction.useMutation({
    onSuccess: () => {
      toast.success('Transaction deleted successfully');
      void trpc.transactions.getTransactions.invalidate();
    },
    onError: (_, __, context: any) => {
      if (context?.previousTransactions) {
        trpc.transactions.getTransactions.setData(
          {},
          context.previousTransactions
        );
      }
      toast.error('Failed to delete transaction');
    },
    onMutate: async (input) => {
      await trpc.transactions.getTransactions.cancel();

      const previousTransactions = trpc.transactions.getTransactions.getData(
        {}
      );

      // Remove the transaction from the list
      trpc.transactions.getTransactions.setData({}, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          draft.transactions = draft.transactions.filter(
            (transaction) => transaction.id !== input.id
          );
        })
      );

      return { previousTransactions };
    },
  });
}

/** Hook for batch creating transactions */
export function useCreateBatchTransactions() {
  const trpc = useTRPC();

  return api.transactions.createBatchTransactions.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} transactions created successfully`);
      void trpc.transactions.getTransactions.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to create transactions: ${error.message}`);
    },
  });
}

/** Hook for batch updating transactions */
export function useUpdateBatchTransactions() {
  const trpc = useTRPC();

  return api.transactions.updateBatchTransactions.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.successCount} transactions updated successfully`);
      if (data.errorCount > 0) {
        toast.warning(`${data.errorCount} transactions failed to update`);
      }
      void trpc.transactions.getTransactions.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to update transactions: ${error.message}`);
    },
  });
}

/** Hook for batch deleting transactions */
export function useDeleteBatchTransactions() {
  const trpc = useTRPC();

  return api.transactions.deleteBatchTransactions.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} transactions deleted successfully`);
      void trpc.transactions.getTransactions.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete transactions: ${error.message}`);
    },
  });
}

/** Hook for adding tags to a transaction with optimistic updates */
export function useAddTransactionTags() {
  const trpc = useTRPC();

  return api.transactions.addTags.useMutation({
    onSuccess: () => {
      toast.success('Tags added successfully');
    },
    onError: (_, __, context: any) => {
      if (context?.previousTransaction) {
        trpc.transactions.getTransaction.setData(
          { id: context.id },
          context.previousTransaction
        );
      }
      toast.error('Failed to add tags');
    },
    onMutate: async (input) => {
      await trpc.transactions.getTransaction.cancel({ id: input.id });

      const previousTransaction = trpc.transactions.getTransaction.getData({
        id: input.id,
      });

      // Update transaction with new tags
      trpc.transactions.getTransaction.setData({ id: input.id }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          // Add the new tags to the existing ones
          const currentTags = draft.tags || [];
          const newTags = [...new Set([...currentTags, ...input.tags])];

          return {
            ...draft,
            tags: newTags,
          };
        })
      );

      return { id: input.id, previousTransaction };
    },
  });
}

/** Hook for removing a tag from a transaction with optimistic updates */
export function useRemoveTransactionTag() {
  const trpc = useTRPC();

  return api.transactions.removeTag.useMutation({
    onSuccess: () => {
      toast.success('Tag removed successfully');
    },
    onError: (_, __, context: any) => {
      if (context?.previousTransaction) {
        trpc.transactions.getTransaction.setData(
          { id: context.id },
          context.previousTransaction
        );
      }
      toast.error('Failed to remove tag');
    },
    onMutate: async (input) => {
      await trpc.transactions.getTransaction.cancel({ id: input.id });

      const previousTransaction = trpc.transactions.getTransaction.getData({
        id: input.id,
      });

      // Update transaction by removing the tag
      trpc.transactions.getTransaction.setData({ id: input.id }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          const currentTags = draft.tags || [];
          const updatedTags = currentTags.filter((tag) => tag !== input.tag);

          return {
            ...draft,
            tags: updatedTags,
          };
        })
      );

      return { id: input.id, previousTransaction };
    },
  });
}

/** Hook for updating transaction category with optimistic updates */
export function useUpdateTransactionCategory() {
  const trpc = useTRPC();

  return api.transactions.updateCategory.useMutation({
    onSuccess: () => {
      toast.success('Category updated successfully');
    },
    onError: (_, __, context: any) => {
      if (context?.previousTransaction) {
        trpc.transactions.getTransaction.setData(
          { id: context.id },
          context.previousTransaction
        );
      }
      toast.error('Failed to update category');
    },
    onMutate: async (input) => {
      await trpc.transactions.getTransaction.cancel({ id: input.id });

      const previousTransaction = trpc.transactions.getTransaction.getData({
        id: input.id,
      });

      // Update transaction with new category
      trpc.transactions.getTransaction.setData({ id: input.id }, (old) =>
        produce(old, (draft: any) => {
          if (!draft) return draft;

          return {
            ...draft,
            category: input.category,
            subCategory: input.subCategory,
            customCategory: input.customCategory,
          };
        })
      );

      return { id: input.id, previousTransaction };
    },
  });
}

/** Hook for updating transaction merchant with optimistic updates */
export function useUpdateTransactionMerchant() {
  const trpc = useTRPC();

  return api.transactions.updateMerchant.useMutation({
    onSuccess: () => {
      toast.success('Merchant details updated successfully');
    },
    onError: (_, __, context: any) => {
      if (context?.previousTransaction) {
        trpc.transactions.getTransaction.setData(
          { id: context.id },
          context.previousTransaction
        );
      }
      toast.error('Failed to update merchant details');
    },
    onMutate: async (input) => {
      await trpc.transactions.getTransaction.cancel({ id: input.id });

      const previousTransaction = trpc.transactions.getTransaction.getData({
        id: input.id,
      });

      // Update transaction with new merchant details
      trpc.transactions.getTransaction.setData({ id: input.id }, (old) =>
        produce(old, (draft: Transaction) => {
          if (!draft) return draft;

          return {
            ...draft,
            merchantName: input.merchantName,
            merchantId: input.merchantId,
            merchantLogoUrl: input.merchantLogoUrl,
            merchantCategory: input.merchantCategory,
            merchantWebsite: input.merchantWebsite,
            merchantPhone: input.merchantPhone,
            merchantAddress: input.merchantAddress,
          };
        })
      );

      return { id: input.id, previousTransaction };
    },
  });
}

/** Hook for updating transaction status with optimistic updates */
export function useUpdateTransactionStatus() {
  const trpc = useTRPC();

  return api.transactions.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Status updated successfully');
    },
    onError: (_, __, context: any) => {
      if (context?.previousTransaction) {
        trpc.transactions.getTransaction.setData(
          { id: context.id },
          context.previousTransaction
        );
      }
      toast.error('Failed to update status');
    },
    onMutate: async (input) => {
      await trpc.transactions.getTransaction.cancel({ id: input.id });

      const previousTransaction = trpc.transactions.getTransaction.getData({
        id: input.id,
      });

      // Update transaction with new status
      trpc.transactions.getTransaction.setData({ id: input.id }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          return {
            ...draft,
            status: input.status,
          };
        })
      );

      return { id: input.id, previousTransaction };
    },
  });
}

/** Hook for updating transaction payment method with optimistic updates */
export function useUpdateTransactionPaymentMethod() {
  const trpc = useTRPC();

  return api.transactions.updatePaymentMethod.useMutation({
    onSuccess: () => {
      toast.success('Payment method updated successfully');
    },
    onError: (_, __, context: any) => {
      if (context?.previousTransaction) {
        trpc.transactions.getTransaction.setData(
          { id: context.id },
          context.previousTransaction
        );
      }
      toast.error('Failed to update payment method');
    },
    onMutate: async (input) => {
      await trpc.transactions.getTransaction.cancel({ id: input.id });

      const previousTransaction = trpc.transactions.getTransaction.getData({
        id: input.id,
      });

      // Update transaction with new payment method
      trpc.transactions.getTransaction.setData({ id: input.id }, (old) =>
        produce(old, (draft: any) => {
          if (!draft) return draft;

          return {
            ...draft,
            paymentMethod: input.paymentMethod,
            paymentProcessor: input.paymentProcessor,
            paymentChannel: input.paymentChannel,
            cardType: input.cardType,
            cardLastFour: input.cardLastFour,
          };
        })
      );

      return { id: input.id, previousTransaction };
    },
  });
}

/** Hook for assigning a transaction to a user with optimistic updates */
export function useAssignTransaction() {
  const trpc = useTRPC();

  return api.transactions.assignTransaction.useMutation({
    onSuccess: () => {
      toast.success('Transaction assigned successfully');
    },
    onError: (_, __, context: any) => {
      if (context?.previousTransaction) {
        trpc.transactions.getTransaction.setData(
          { id: context.id },
          context.previousTransaction
        );
      }
      toast.error('Failed to assign transaction');
    },
    onMutate: async (input) => {
      await trpc.transactions.getTransaction.cancel({ id: input.id });

      const previousTransaction = trpc.transactions.getTransaction.getData({
        id: input.id,
      });

      // Update transaction with assignment
      trpc.transactions.getTransaction.setData({ id: input.id }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          return {
            ...draft,
            assignedToUserId: input.assignedToUserId,
          };
        })
      );

      return { id: input.id, previousTransaction };
    },
  });
}

/** Hook for updating transaction notes with optimistic updates and debouncing */
export function useUpdateTransactionNotes() {
  const trpc = useTRPC();

  const mutation = api.transactions.updateNotes.useMutation({
    onSuccess: () => {
      toast.success('Notes updated successfully');
    },
    onError: (_, __, context: any) => {
      if (context?.previousTransaction) {
        trpc.transactions.getTransaction.setData(
          { id: context.id },
          context.previousTransaction
        );
      }
      toast.error('Failed to update notes');
    },
    onMutate: async (input) => {
      await trpc.transactions.getTransaction.cancel({ id: input.id });

      const previousTransaction = trpc.transactions.getTransaction.getData({
        id: input.id,
      });

      // Update transaction with new notes
      trpc.transactions.getTransaction.setData({ id: input.id }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          return {
            ...draft,
            notes: input.notes,
          };
        })
      );

      return { id: input.id, previousTransaction };
    },
  });

  const updateNotesDebounced = useDebouncedCallback(mutation.mutate, 500);

  useWarnIfUnsavedChanges({ enabled: updateNotesDebounced.isPending() });

  return useCallback(
    (input: { id: string; notes: string }) => {
      updateNotesDebounced(input);

      // Optimistically update the UI
      void trpc.transactions.getTransaction.setData(
        { id: input.id },
        (prevData) =>
          produce(prevData, (draft) => {
            if (draft) {
              return {
                ...draft,
                notes: input.notes,
              };
            }
          })
      );
    },
    [trpc, updateNotesDebounced]
  );
}

/** Hook for adding an attachment to a transaction */
export function useAddTransactionAttachment() {
  const trpc = useTRPC();

  return api.transactions.addAttachment.useMutation({
    onSuccess: () => {
      toast.success('Attachment added successfully');
      void trpc.transactions.getTransaction.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to add attachment: ${error.message}`);
    },
  });
}

/** Hook for marking a transaction as complete with optimistic updates */
export function useCompleteTransaction() {
  const trpc = useTRPC();

  return api.transactions.completeTransaction.useMutation({
    onSuccess: () => {
      toast.success('Transaction marked as complete');
    },
    onError: (_, __, context: any) => {
      if (context?.previousTransaction) {
        trpc.transactions.getTransaction.setData(
          { id: context.id },
          context.previousTransaction
        );
      }
      if (context?.previousTransactions) {
        trpc.transactions.getTransactions.setData(
          {},
          context.previousTransactions
        );
      }
      toast.error('Failed to mark transaction as complete');
    },
    onMutate: async (input) => {
      await trpc.transactions.getTransaction.cancel({ id: input.id });
      await trpc.transactions.getTransactions.cancel();

      const previousTransaction = trpc.transactions.getTransaction.getData({
        id: input.id,
      });
      const previousTransactions = trpc.transactions.getTransactions.getData(
        {}
      );

      // Update transaction
      trpc.transactions.getTransaction.setData({ id: input.id }, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          return {
            ...draft,
            status: 'completed',
            pending: false,
          };
        })
      );

      // Update transaction in list
      trpc.transactions.getTransactions.setData({}, (old) =>
        produce(old, (draft) => {
          if (!draft) return draft;

          draft.transactions = draft.transactions.map((transaction) => {
            if (transaction.id === input.id) {
              return {
                ...transaction,
                status: 'completed',
                pending: false,
              };
            }
            return transaction;
          });
        })
      );

      return { id: input.id, previousTransaction, previousTransactions };
    },
  });
}

/** Hook for categorizing transactions by merchant */
export function useCategorizeByMerchant() {
  const trpc = useTRPC();

  return api.transactions.categorizeByMerchant.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} transactions categorized successfully`);
      void trpc.transactions.getTransactions.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to categorize transactions: ${error.message}`);
    },
  });
}

/** Hook for manual categorization of multiple transactions */
export function useManualCategorization() {
  const trpc = useTRPC();

  return api.transactions.manualCategorization.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} transactions categorized successfully`);
      void trpc.transactions.getTransactions.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to categorize transactions: ${error.message}`);
    },
  });
}
