import { z } from 'zod';

/**
 * Schema for a bank account in a reconnect alert
 */
export const reconnectAccountSchema = z.object({
    id: z.string()
        .describe('The unique identifier for the account'),
    displayName: z.string().nullable().optional()
        .describe('The display name of the account'),
    name: z.string().nullable().optional()
        .describe('The name of the account'),
});

/**
 * Schema for a user in a reconnect alert
 */
export const reconnectUserSchema = z.object({
    id: z.string()
        .describe('The unique identifier for the user'),
    email: z.string().email().nullable().optional()
        .describe('The email address of the user'),
    name: z.string().nullable().optional()
        .describe('The name of the user'),
});

/**
 * Schema for a bank connection that needs reconnection
 */
export const reconnectConnectionSchema = z.object({
    id: z.string()
        .describe('The unique identifier for the connection'),
    userId: z.string()
        .describe('The ID of the user who owns the connection'),
    institutionName: z.string().nullable().optional()
        .describe('The name of the financial institution'),
    institutionId: z.string().nullable().optional()
        .describe('The ID of the financial institution'),
    alertCount: z.number().optional().default(0)
        .describe('Number of alerts sent for this connection'),
    lastAlertedAt: z.date().nullable().optional()
        .describe('When the last alert was sent'),
    user: reconnectUserSchema
        .describe('The user who owns the connection'),
    accounts: z.array(reconnectAccountSchema)
        .describe('The accounts associated with this connection'),
});

/**
 * Schema for an email message to be sent
 */
export const emailMessageSchema = z.object({
    to: z.string().email()
        .describe('The email address to send to'),
    subject: z.string()
        .describe('The subject line of the email'),
    text: z.string()
        .describe('Plain text version of the email content'),
    html: z.string()
        .describe('HTML version of the email content'),
});

/**
 * Schema for the output results from the send reconnect alerts task
 */
export const sendReconnectAlertsOutputSchema = z.object({
    alertsSent: z.number()
        .describe('Number of reconnect alerts successfully sent'),
    connectionsChecked: z.number()
        .describe('Total number of connections checked for reconnection needs'),
});

// Type definitions derived from schemas
export type ReconnectAccount = z.infer<typeof reconnectAccountSchema>;
export type ReconnectUser = z.infer<typeof reconnectUserSchema>;
export type ReconnectConnection = z.infer<typeof reconnectConnectionSchema>;
export type EmailMessage = z.infer<typeof emailMessageSchema>;
export type SendReconnectAlertsOutput = z.infer<typeof sendReconnectAlertsOutputSchema>; 