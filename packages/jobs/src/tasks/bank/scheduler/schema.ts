import { BankConnectionStatus } from '@solomonai/prisma/client';
import { z } from 'zod';

/**
 * Schema defining the structure of a user in a bank connection
 */
export const bankConnectionUserSchema = z.object({
    id: z.string(),
    email: z.string().nullable(),
    name: z.string().nullable(),
});

/**
 * Schema defining the structure of a bank account
 */
export const bankAccountSchema = z.object({
    id: z.string(),
    name: z.string(),
});

/**
 * Schema defining the structure of a team
 */
export const teamSchema = z.object({
    id: z.string(),
    name: z.string().nullable(),
    slug: z.string().optional(),
});

/**
 * Schema defining the structure of a bank connection
 */
export const bankConnectionSchema = z.object({
    id: z.string(),
    institutionName: z.string(),
    status: z.string(),
    user: bankConnectionUserSchema,
    accounts: z.array(bankAccountSchema),
    team: z.array(teamSchema).optional(),
});

/**
 * Schema defining the minimal structure needed for disabling a connection
 */
export const disableConnectionSchema = z.object({
    id: z.string(),
});

/**
 * Schema for the scheduler job's output
 */
export const schedulerOutputSchema = z.object({
    connectionsProcessed: z.number(),
    disabledCount: z.number(),
    notificationsSent: z.number(),
    skipped: z.boolean(),
    environment: z.string().optional(),
});

/**
 * Extended schema for bank connections with additional fields needed for expiration management
 */
export const expiringConnectionSchema = z.object({
    id: z.string(),
    userId: z.string(),
    institutionId: z.string(),
    institutionName: z.string(),
    lastAccessedAt: z.date().nullable(),
    expiresAt: z.date().nullable(),
    errorMessage: z.string().nullable().optional(),
    status: z.nativeEnum(BankConnectionStatus),
    user: bankConnectionUserSchema,
    accounts: z.array(bankAccountSchema),
    team: z.array(
        teamSchema.extend({
            slug: z.string(),
        })
    ).optional(),
});

/**
 * Schema for the expiring scheduler job's output
 */
export const expiringSchedulerResultSchema = z.object({
    connectionsProcessed: z.number(),
    markedForAttention: z.number(),
    notificationsSent: z.number(),
    skipped: z.boolean(),
    environment: z.string().optional(),
});

/**
 * Extended bank account schema for balance updates
 */
export const balanceAccountSchema = bankAccountSchema.extend({
    status: z.string(),
    balanceLastUpdated: z.date().nullable(),
    currentBalance: z.number().nullable(),
    availableBalance: z.number().nullable(),
});

/**
 * Schema for bank connections used in balance updates
 */
export const balanceConnectionSchema = z.object({
    id: z.string(),
    accessToken: z.string(),
    status: z.nativeEnum(BankConnectionStatus),
    balanceLastUpdated: z.date().nullable(),
    institutionName: z.string(),
    provider: z.string(),
    accounts: z.array(balanceAccountSchema),
});

/**
 * Schema for batch payload for balance updates
 */
export const balanceUpdatePayloadSchema = z.object({
    connectionId: z.string(),
    manualSync: z.boolean(),
});

/**
 * Schema for a single account sync result 
 */
export const accountSyncResultSchema = z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
    updated: z.boolean(),
});

/**
 * Schema for connection sync job output 
 */
export const connectionSyncOutputSchema = z.object({
    success: z.boolean(),
    accounts: z.array(accountSyncResultSchema).optional(),
    errorMessage: z.string().optional(),
});

/**
 * Schema for batch operation result 
 */
export const batchOperationResultSchema = z.object({
    runId: z.string(),
    status: z.string(),
    payload: balanceUpdatePayloadSchema,
    output: connectionSyncOutputSchema.optional(),
    error: z.object({
        message: z.string(),
        stack: z.string().optional(),
    }).optional(),
});

/**
 * Schema for batch operation results 
 */
export const batchOperationResultsSchema = z.object({
    results: z.array(batchOperationResultSchema),
});

/**
 * Schema for the balance update job's output
 */
export const balanceUpdateResultSchema = z.object({
    accountsUpdated: z.number(),
    connectionsProcessed: z.number(),
    errorCount: z.number(),
    successCount: z.number(),
});

/**
 * Type for a bank connection derived from its schema
 */
export type BankConnection = z.infer<typeof bankConnectionSchema>;

/**
 * Type for a connection to be disabled derived from its schema
 */
export type DisableConnection = z.infer<typeof disableConnectionSchema>;

/**
 * Type for the scheduler job's output derived from its schema
 */
export type SchedulerOutput = z.infer<typeof schedulerOutputSchema>;

/**
 * Type for bank connections with expiration information
 */
export type ExpiringConnection = z.infer<typeof expiringConnectionSchema>;

/**
 * Type for the expiring scheduler job's output
 */
export type ExpiringSchedulerResult = z.infer<typeof expiringSchedulerResultSchema>;

/**
 * Type for bank connection with balance information
 */
export type BalanceConnection = z.infer<typeof balanceConnectionSchema>;

/**
 * Type for balance update payload
 */
export type BalanceUpdatePayload = z.infer<typeof balanceUpdatePayloadSchema>;

/**
 * Type for connection sync job output
 */
export type ConnectionSyncOutput = z.infer<typeof connectionSyncOutputSchema>;

/**
 * Type for batch operation result
 */
export type BatchOperationResult = z.infer<typeof batchOperationResultSchema>;

/**
 * Type for batch operation results
 */
export type BatchOperationResults = z.infer<typeof batchOperationResultsSchema>;

/**
 * Type for balance update result
 */
export type BalanceUpdateResult = z.infer<typeof balanceUpdateResultSchema>; 