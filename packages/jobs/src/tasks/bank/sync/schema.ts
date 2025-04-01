import { BankConnectionProvider, BankConnectionStatus } from '@solomonai/prisma/client';

import { AccountType } from '@solomonai/prisma';
import { z } from 'zod';

/**
 * Create a Zod schema for AccountType
 */
export const accountTypeSchema = z.nativeEnum(AccountType);

/**
 * Schema for bank team member
 */
export const bankTeamMemberSchema = z.object({
    id: z.string(),
});

/**
 * Schema for bank connection details
 */
export const bankConnectionDetailsSchema = z.object({
    id: z.string(),
    accessToken: z.string(),
    institutionId: z.string(),
    institutionName: z.string(),
    status: z.nativeEnum(BankConnectionStatus),
    userId: z.string(),
    provider: z.nativeEnum(BankConnectionProvider),
    team: z.array(bankTeamMemberSchema).nullable(),
});

/**
 * Type definition for a bank connection record with select fields
 */
export type BankConnectionDetails = z.infer<typeof bankConnectionDetailsSchema>;

/**
 * Schema for bank account record
 */
export const bankAccountRecordSchema = z.object({
    id: z.string(),
    name: z.string(),
    plaidAccountId: z.string().nullable(),
    status: z.string(),
    type: z.string(),
});

/**
 * Type definition for a bank account record with select fields
 */
export type BankAccountRecord = z.infer<typeof bankAccountRecordSchema>;

/**
 * Type definition for the syncAccount task input
 */
export type SyncAccountInput = {
    /** The internal bank account ID */
    id: string;

    /** The team ID that owns this account */
    teamId: string;

    /** The external account ID from the provider */
    accountId: string;

    /** The access token for the provider API */
    accessToken: string;

    /** Number of previous error retries */
    errorRetries?: number;

    /** The financial data provider */
    provider: BankConnectionProvider;

    /** Whether this is a manually triggered sync */
    manualSync?: boolean;

    /** The type of bank account */
    accountType?: AccountType;
};

/**
 * Type definition for the syncAccount task output
 */
export type SyncAccountOutput = {
    /** Whether the sync operation was successful */
    success: boolean;

    /** The external account ID from the provider */
    accountId: string;

    /** The financial data provider */
    provider: string;

    /** A message describing the result of the sync operation */
    message: string;
};

/**
 * Schema for validating the syncAccount task input
 */
export const syncAccountInputSchema = z.object({
    /** The internal bank account ID */
    id: z.string(),

    /** The team ID that owns this account */
    teamId: z.string(),

    /** The external account ID from the provider */
    accountId: z.string(),

    /** The access token for the provider API */
    accessToken: z.string(),

    /** Number of previous error retries */
    errorRetries: z.number().optional(),

    /** The financial data provider */
    provider: z.nativeEnum(BankConnectionProvider),

    /** Whether this is a manually triggered sync */
    manualSync: z.boolean().optional(),

    /** The type of bank account */
    accountType: accountTypeSchema.optional(),
});

/**
 * Schema for validating the syncAccount task output
 */
export const syncAccountOutputSchema = z.object({
    /** Whether the sync operation was successful */
    success: z.boolean(),

    /** The external account ID from the provider */
    accountId: z.string(),

    /** The financial data provider */
    provider: z.string(),

    /** A message describing the result of the sync operation */
    message: z.string(),
});

/**
 * Type definition for the syncConnection task input
 */
export type SyncConnectionInput = {
    /** The unique identifier for the bank connection to sync */
    connectionId: string;

    /** Whether this is a manual sync initiated by the user */
    manualSync?: boolean;
};

/**
 * Type definition for the syncConnection task output
 */
export type SyncConnectionOutput = {
    /** The unique identifier for the bank connection that was synced */
    connectionId: string;

    /** The status of the operation */
    status: string;

    /** A message describing the result of the operation */
    message: string;

    /** The number of accounts that were synced (optional) */
    accountsSynced?: number;
};

/**
 * Schema for validating the syncConnection task input
 */
export const syncConnectionInputSchema = z.object({
    /** The unique identifier for the bank connection to sync */
    connectionId: z.string(),

    /** Whether this is a manual sync initiated by the user */
    manualSync: z.boolean().optional(),
});

/**
 * Schema for validating the syncConnection task output
 */
export const syncConnectionOutputSchema = z.object({
    /** The unique identifier for the bank connection that was synced */
    connectionId: z.string(),

    /** The status of the operation */
    status: z.string(),

    /** A message describing the result of the operation */
    message: z.string(),

    /** The number of accounts that were synced (optional) */
    accountsSynced: z.number().optional(),
});

/**
 * Type definition for a bank account connection
 */
export type BalanceConnection = {
    id: string;
    institutionName: string;
    accounts: Array<{
        id: string;
        name: string;
        status: string;
        balanceLastUpdated: Date;
        currentBalance: number | null;
        availableBalance: number | null;
    }>;
};

/**
 * Type definition for balance update payload
 */
export type BalanceUpdatePayload = {
    connectionId: string;
    manualSync: boolean;
};

/**
 * Type definition for batch operation results
 */
export type BatchOperationResults = {
    results: Array<{
        runId: string;
        status: string;
        payload: {
            connectionId: string;
        };
        output?: {
            accounts?: Array<any>;
        };
        error?: {
            message: string;
        };
    }>;
};

/**
 * Type definition for balance update result
 */
export type BalanceUpdateResult = {
    accountsUpdated: number;
    connectionsProcessed: number;
    errorCount: number;
    successCount: number;
};

/**
 * Schema for validating balance update result
 */
export const balanceUpdateResultSchema = z.object({
    accountsUpdated: z.number(),
    connectionsProcessed: z.number(),
    errorCount: z.number(),
    successCount: z.number(),
}); 