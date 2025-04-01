import { z } from 'zod';

/**
 * Schema for transaction objects received from external providers
 */
export const transactionSchema = z.object({
    id: z.string(),
    description: z.string().nullable(),
    method: z.string().nullable(),
    date: z.string(),
    name: z.string(),
    status: z.enum(['pending', 'posted']),
    balance: z.number().nullable(),
    currency: z.string(),
    amount: z.number(),
    category: z.string().nullable(),
});

/**
 * Type definition for a transaction from external provider
 */
export type Transaction = z.infer<typeof transactionSchema>;

/**
 * Type definition for the upsertTransactions task input
 */
export type UpsertTransactionsInput = {
    /** The user ID who owns these transactions */
    userId: string;

    /** The bank account ID these transactions belong to */
    bankAccountId: string;

    /** Whether this is a manual sync initiated by the user */
    manualSync?: boolean;

    /** The array of transactions to upsert */
    transactions: Transaction[];
};

/**
 * Type definition for the upsertTransactions task output
 */
export type UpsertTransactionsOutput = {
    /** Operation status */
    status: 'success';

    /** Total number of transactions processed */
    totalTransactions: number;

    /** Number of new transactions created */
    newTransactions: number;

    /** A message describing the result of the operation */
    message: string;
};

/**
 * Schema for validating the upsertTransactions task input
 */
export const upsertTransactionsInputSchema = z.object({
    /** The user ID who owns these transactions */
    userId: z.string(),

    /** The bank account ID these transactions belong to */
    bankAccountId: z.string(),

    /** Whether this is a manual sync initiated by the user */
    manualSync: z.boolean().optional(),

    /** The array of transactions to upsert */
    transactions: z.array(transactionSchema),
});

/**
 * Schema for validating the upsertTransactions task output
 */
export const upsertTransactionsOutputSchema = z.object({
    /** Operation status */
    status: z.literal('success'),

    /** Total number of transactions processed */
    totalTransactions: z.number(),

    /** Number of new transactions created */
    newTransactions: z.number(),

    /** A message describing the result of the operation */
    message: z.string(),
}); 