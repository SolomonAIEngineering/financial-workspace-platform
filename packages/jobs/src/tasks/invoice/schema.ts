import { z } from 'zod';

/**
 * Schema for sending an invoice email input
 */
export const sendInvoiceEmailInputSchema = z.object({
    invoiceId: z.string().uuid()
        .describe('The unique identifier of the invoice to send'),
});

/**
 * Schema for sending an invoice email output
 */
export const sendInvoiceEmailOutputSchema = z.object({
    success: z.boolean()
        .describe('Whether the email was sent successfully'),
    invoiceId: z.string()
        .describe('The ID of the invoice that was sent'),
    recipientEmail: z.string().email().nullable().optional()
        .describe('The email address the invoice was sent to'),
    updatedStatus: z.string()
        .describe('The updated status of the invoice'),
});

/**
 * Schema for sending invoice notifications input
 */
export const sendInvoiceNotificationsInputSchema = z.object({
    invoiceId: z.string().uuid()
        .describe('The unique identifier of the invoice'),
    invoiceNumber: z.string()
        .describe('The human-readable invoice number'),
    status: z.enum(['paid', 'overdue'])
        .describe('The status of the invoice'),
    teamId: z.string()
        .describe('The team ID associated with the invoice'),
    customerName: z.string()
        .describe('The name of the customer'),
});

/**
 * Schema for sending invoice notifications output
 */
export const sendInvoiceNotificationsOutputSchema = z.object({
    success: z.boolean()
        .describe('Whether the notifications were sent successfully'),
    notificationType: z.enum(['paid', 'overdue'])
        .describe('The type of notification that was sent'),
    recipientCount: z.number()
        .describe('The number of recipients who received the notification'),
});

// Type definitions derived from schemas
export type SendInvoiceEmailInput = z.infer<typeof sendInvoiceEmailInputSchema>;
export type SendInvoiceEmailOutput = z.infer<typeof sendInvoiceEmailOutputSchema>;
export type SendInvoiceNotificationsInput = z.infer<typeof sendInvoiceNotificationsInputSchema>;
export type SendInvoiceNotificationsOutput = z.infer<typeof sendInvoiceNotificationsOutputSchema>; 