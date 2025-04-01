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