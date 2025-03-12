'use server';

import {
    sendEventSchema,
    sendTransactionalEmailSchema,
} from './schema';

import { actionClient } from '@/actions/safe-action';
import { loops } from '@/lib/loopsClient';

/**
 * Server action to send an event to the Loops email marketing platform.
 *
 * Events in Loops are used to trigger automated email flows and track user
 * activity. This action sends an event with a specified name for a contact
 * identified by email address or userId. At least one of these identifiers must
 * be provided.
 *
 * You can also:
 *
 * - Update contact properties at the same time as sending the event
 * - Include event-specific properties that can be used in email templates
 * - Subscribe/unsubscribe the contact from mailing lists
 *
 * If the contact doesn't exist in your Loops audience, a new contact will be
 * created using the identifiers and properties provided.
 *
 * Common use cases for events include:
 *
 * - User signups: "signup_completed"
 * - Trial management: "trial_started", "trial_ending_soon", "trial_expired"
 * - Onboarding: "onboarding_step_completed"
 * - Transactional: "order_placed", "payment_failed"
 * - Inactivity: "account_inactive", "winback_opportunity"
 *
 * @example
 *   // Send a basic event
 *   const result = await sendEventToLoopsAction({
 *     email: 'user@example.com',
 *     eventName: 'account_created',
 *   });
 *
 * @example
 *   // Send an event with contact property updates
 *   const result = await sendEventToLoopsAction({
 *     email: 'user@example.com',
 *     eventName: 'subscription_changed',
 *     contactProperties: {
 *       planName: 'Pro Plan',
 *       planPrice: 49.99,
 *       isAnnualBilling: true,
 *     },
 *   });
 *
 * @example
 *   // Send an event with event-specific properties
 *   const result = await sendEventToLoopsAction({
 *     email: 'user@example.com',
 *     eventName: 'order_placed',
 *     eventProperties: {
 *       orderId: '12345',
 *       orderTotal: 99.95,
 *       itemCount: 3,
 *     },
 *   });
 *
 * @example
 *   // Send an event to a contact identified by userId
 *   const result = await sendEventToLoopsAction({
 *     userId: 'user_abc123',
 *     eventName: 'feature_used',
 *     contactProperties: {
 *       lastActive: new Date().toISOString(),
 *     },
 *     eventProperties: {
 *       featureName: 'advanced_reporting',
 *       usageCount: 5,
 *     },
 *   });
 *
 * @function sendEventToLoopsAction
 * @param {SendEventInput} input - The input data for sending an event
 * @param {string} [input.email] - The email address of the contact (required if
 *   userId not provided)
 * @param {string} [input.userId] - The user ID of the contact (required if
 *   email not provided)
 * @param {string} input.eventName - The name of the event to send
 * @param {Object} [input.contactProperties] - Optional properties to update on
 *   the contact record
 * @param {Object} [input.eventProperties] - Optional properties associated with
 *   this specific event
 * @returns {Promise<{
 *   success: boolean;
 *   data?: {
 *     success: boolean;
 *   };
 *   error?: string;
 * }>}
 *   A promise resolving to the result with a success indicator if successful
 * @see {@link https://loops.so/docs/sdks/javascript#sendevent}
 */
export const sendEventToLoopsAction = actionClient
    .schema(sendEventSchema)
    .action(async (input) => {
        try {
            const { email, userId, eventName, contactProperties, eventProperties } =
                input.parsedInput;

            // Send event to Loops using the SDK
            const response = await loops.sendEvent({
                email,
                userId,
                eventName,
                contactProperties,
                eventProperties,
            });

            return {
                success: true,
                data: response,
                error: undefined,
            };
        } catch (error) {
            console.error('Error in sendEventToLoopsAction:', error);
            return {
                success: false,
                error:
                    error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    });

/**
 * Server action to send a transactional email via the Loops email marketing
 * platform.
 *
 * Transactional emails are individual emails sent to specific recipients in
 * response to actions they've taken or events that have occurred. Unlike
 * marketing emails, they're not sent to an audience segment but to individual
 * recipients based on their actions.
 *
 * This action requires:
 *
 * - A transactional email template created in Loops (identified by
 *   transactionalId)
 * - The recipient's email address
 * - Any template variables needed for personalization
 *
 * Transactional email types commonly include:
 *
 * - Welcome emails
 * - Password reset emails
 * - Order confirmations
 * - Receipts and invoices
 * - Account notifications
 * - Security alerts
 *
 * The variables you provide in dataVariables will be used to replace
 * placeholders in your email template, allowing for personalized content.
 *
 * @example
 *   // Send a basic welcome email
 *   const result = await sendTransactionalEmailViaLoopsAction({
 *     email: 'newuser@example.com',
 *     transactionalId: 'welcome-email-template',
 *     dataVariables: {
 *       userName: 'John',
 *       loginUrl: 'https://example.com/login',
 *     },
 *   });
 *
 * @example
 *   // Send a password reset email
 *   const result = await sendTransactionalEmailViaLoopsAction({
 *     email: 'user@example.com',
 *     transactionalId: 'password-reset-template',
 *     dataVariables: {
 *       resetToken: '12345abcde',
 *       resetUrl: 'https://example.com/reset-password?token=12345abcde',
 *       expiryTime: '1 hour',
 *     },
 *   });
 *
 * @example
 *   // Send an order confirmation email
 *   const result = await sendTransactionalEmailViaLoopsAction({
 *     email: 'customer@example.com',
 *     transactionalId: 'order-confirmation-template',
 *     dataVariables: {
 *       orderNumber: 'ORD-12345',
 *       orderDate: '2023-04-15',
 *       orderTotal: '$129.99',
 *       deliveryDate: '2023-04-20',
 *       trackingNumber: 'TRK-98765',
 *     },
 *   });
 *
 * @function sendTransactionalEmailViaLoopsAction
 * @param {SendTransactionalEmailInput} input - The input data for sending a
 *   transactional email
 * @param {string} input.email - The email address of the recipient
 * @param {string} input.transactionalId - The ID of the transactional email
 *   template in Loops
 * @param {Object} [input.dataVariables] - Optional variables to replace
 *   placeholders in the email template
 * @returns {Promise<{
 *   success: boolean;
 *   data?: {
 *     success: boolean;
 *   };
 *   error?: string;
 * }>}
 *   A promise resolving to the result with a success indicator if successful
 * @see {@link https://loops.so/docs/sdks/javascript#sendtransactionalemail}
 */
export const sendTransactionalEmailViaLoopsAction = actionClient
    .schema(sendTransactionalEmailSchema)
    .action(async (input) => {
        try {
            const { email, transactionalId, dataVariables } = input.parsedInput;

            // Send transactional email via Loops using the SDK
            const response = await loops.sendTransactionalEmail({
                email,
                transactionalId,
                dataVariables,
            });

            return {
                success: true,
                data: response,
                error: undefined,
            };
        } catch (error) {
            console.error('Error in sendTransactionalEmailViaLoopsAction:', error);
            return {
                success: false,
                error:
                    error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    });
