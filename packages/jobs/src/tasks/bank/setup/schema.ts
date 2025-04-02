import { z } from 'zod';

/**
 * Schema for initial setup job input
 */
export const initialSetupInputSchema = z.object({
    teamId: z.string().describe("The ID of the team"),
    connectionId: z.string().describe("The ID of the bank connection"),
});

/**
 * Schema for initial setup job output
 */
export const initialSetupOutputSchema = z.object({
    success: z.boolean().describe("Whether the setup was successful"),
    bankConnectionId: z.string().describe("The ID of the bank connection"),
    accountCount: z.number().describe("The number of accounts set up"),
});

/**
 * Type definitions derived from schemas
 */
export type InitialSetupInput = z.infer<typeof initialSetupInputSchema>;
export type InitialSetupOutput = z.infer<typeof initialSetupOutputSchema>; 