'use server';

import { PlainClient } from '@team-plain/typescript-sdk';
import { authActionClient } from '@/actions/safe-action';
import { env } from '@/env';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

/** Schema for validating waitlist submissions */
const waitlistSchema = z.object({
    reason: z.string().optional(),
    featureName: z.string().min(1, { message: 'Feature name is required' }),
});

export type WaitlistActionInput = z.infer<typeof waitlistSchema>;

/** Initialize the Plain client with the API key */
const client = new PlainClient({
    apiKey: env.PLAIN_API_KEY || '',
});

/**
 * Server action to add a user to a waitlist in Plain CRM
 *
 * This action creates or updates a customer record in Plain and creates a
 * thread for the waitlist request with proper labels and metadata.
 *
 * @serverAction
 * This is a Next.js server action wrapped with next-safe-action for validation and type safety.
 * The action requires user authentication and uses the waitlistSchema for input validation.
 */
export const joinWaitlistAction = authActionClient
    .schema(waitlistSchema)
    .action(async ({ ctx: { user }, parsedInput: { reason, featureName } }) => {
        try {
            // Validate required data
            if (!user.email) {
                throw new Error('Your account does not have an email address');
            }

            if (!env.PLAIN_API_KEY) {
                console.error('PLAIN_API_KEY is not defined');
                throw new Error('Plain API key is not configured');
            }

            /** Step 1: Create or update customer in Plain CRM */
            const customerResult = await client.upsertCustomer({
                identifier: {
                    emailAddress: user.email,
                },
                onCreate: {
                    email: {
                        email: user.email,
                        isVerified: true,
                    },
                    externalId: user.id,
                    fullName: user.full_name || user.email.split('@')[0],
                    // Custom fields have to be added through the appropriate API methods
                },
                onUpdate: {
                    // Updates handled through the appropriate API methods
                },
            });

            // Handle potential errors with customer creation
            if (customerResult.error) {
                console.error('Error upserting customer:', customerResult.error);
                console.error(
                    'Error details:',
                    JSON.stringify(customerResult.error, null, 2)
                );
                throw new Error('Failed to create or update customer record');
            }

            // define label id
            const labelId = process.env.PLAIN_WAITLIST_LABEL || '';
            /** Step 2: Create a thread for the waitlist request */
            const threadTitle = `Waitlist Request: ${featureName}`;
            const threadContent = `**New Waitlist Registration**\n\nCustomer: ${user.full_name || user.email}\nEmail: ${user.email}\nFeature: ${featureName}${reason ? `\n\nReason for interest: ${reason}` : ''}`;

            // Create a thread in Plain with the waitlist request
            const threadResult = await client.createThread({
                components: [
                    {
                        componentText: {
                            text: threadContent,
                        },
                    },
                ],
                customerIdentifier: {
                    customerId: customerResult.data.customer.id,
                },
                // The Plain SDK types don't include labelIds in CreateThreadInput
                // If your Plain instance supports labels, use the appropriate method to add them
                title: threadTitle,
                labelTypeIds: [labelId], // NOTE: This is the label type ID for the waitlist
            });

            // Handle potential errors with thread creation
            if (threadResult.error) {
                console.error('Error creating thread:', threadResult.error);
                console.error(
                    'Error details:',
                    JSON.stringify(threadResult.error, null, 2)
                );
                throw new Error('Failed to create waitlist thread');
            }

            // Revalidate path to update UI if needed
            revalidatePath('/');

            // Return a simpler string response as the threadId
            return threadResult.data.id;
        } catch (error) {
            console.error('Unexpected error in waitlist submission:', error);
            throw error;
        }
    });

/**
 * Legacy function wrapper for backward compatibility
 *
 * @deprecated Use joinWaitlistAction instead
 */
export async function joinWaitlist(data: WaitlistActionInput) {
    try {
        // Validate input data
        const validatedData = waitlistSchema.parse(data);

        // Get authenticated user from context
        const user = await getOrThrowCurrentUser();
        // Call the new action with the validated data
        const result = await joinWaitlistAction({
            featureName: validatedData.featureName,
            reason: validatedData.reason,
        });

        // If we get this far, we have a successful result
        return {
            success: true,
            message: `Successfully added to ${validatedData.featureName} waitlist`,
            threadId: result,
        };

    } catch (error) {
        console.error('Error joining waitlist (legacy function):', error);

        if (error instanceof z.ZodError) {
            return {
                success: false,
                message: 'Invalid submission data',
                errors: error.errors,
            };
        }

        return {
            success: false,
            message:
                error instanceof Error ? error.message : 'Failed to join waitlist',
        };
    }
}

/**
 * Helper function to get current user (copied from lib/auth for this file) This
 * is only used by the legacy wrapper and should be removed when that's no
 * longer needed
 */
async function getOrThrowCurrentUser() {
    const { auth } = await import('@/components/auth/rsc/auth');
    const session = await auth();

    if (!session?.user) {
        throw new Error('You must be logged in to join the waitlist');
    }

    return session.user;
}
