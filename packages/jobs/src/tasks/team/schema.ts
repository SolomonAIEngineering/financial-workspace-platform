import { z } from 'zod';

/**
 * Schema for a financial connection to be deleted
 */
export const connectionToDeleteSchema = z.object({
    provider: z.enum(['teller', 'plaid', 'gocardless', 'enablebanking', 'stripe']).nullable()
        .describe('The financial provider for the connection'),
    reference_id: z.string().nullable()
        .describe('The provider-specific reference ID for the connection'),
    access_token: z.string().nullable()
        .describe('The access token used to authenticate with the provider'),
});

/**
 * Schema for the input parameters to the team deletion task
 */
export const deleteTeamInputSchema = z.object({
    teamId: z.string().uuid()
        .describe('The unique identifier for the team to delete'),
    connections: z.array(connectionToDeleteSchema)
        .describe('Array of connections to delete from their respective providers'),
});

/**
 * Schema for a single connection deletion result
 */
export const connectionDeleteResultSchema = z.object({
    success: z.boolean()
        .describe('Whether the connection was successfully deleted'),
    referenceId: z.string().optional()
        .describe('The reference ID of the connection'),
    provider: z.enum(['teller', 'plaid', 'gocardless', 'enablebanking', 'stripe']).nullable().optional()
        .describe('The provider for the connection'),
    error: z.string().optional()
        .describe('Error message if the deletion failed'),
    message: z.string().optional()
        .describe('Additional information about the deletion operation'),
});

/**
 * Schema for the output results from the team deletion task
 */
export const deleteTeamOutputSchema = z.object({
    success: z.boolean()
        .describe('Whether the team deletion process was successful overall'),
    teamId: z.string()
        .describe('The ID of the team that was deleted'),
    connectionsProcessed: z.number()
        .describe('Total number of connections processed'),
    successfulConnections: z.number()
        .describe('Number of connections successfully deleted'),
    failedConnections: z.number()
        .describe('Number of connections that failed to delete'),
    message: z.string()
        .describe('A human-readable message describing the result'),
});

// Type definitions derived from schemas
export type ConnectionToDelete = z.infer<typeof connectionToDeleteSchema>;
export type DeleteTeamInput = z.infer<typeof deleteTeamInputSchema>;
export type ConnectionDeleteResult = z.infer<typeof connectionDeleteResultSchema>;
export type DeleteTeamOutput = z.infer<typeof deleteTeamOutputSchema>; 