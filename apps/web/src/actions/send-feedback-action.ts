'use server';

import { PlainClient } from '@team-plain/typescript-sdk';

import { authActionClient } from '@/actions/safe-action';
import { type FeedbackType, sendFeedbackSchema } from '@/actions/schema';

/**
 * Initialize the Plain client with the API key for customer support platform
 * integration
 *
 * @constant {PlainClient} client
 */
const client = new PlainClient({
  apiKey: process.env.PLAIN_API_KEY || '',
});

/**
 * Maps feedback types to their corresponding environment variable label IDs for
 * Plain CRM
 *
 * @function getLabelId
 * @param {FeedbackType} feedbackType - The type of feedback (FEATURE, BUG,
 *   SUPPORT, GENERAL)
 * @returns {string} The Plain CRM label ID for the specified feedback type
 */
const getLabelId = (feedbackType: FeedbackType): string => {
  switch (feedbackType) {
    case 'BUG': {
      return process.env.PLAIN_FEEDBACK_LABEL_BUG || '';
    }
    case 'FEATURE': {
      return process.env.PLAIN_FEEDBACK_LABEL_FEATURE || '';
    }
    case 'SUPPORT': {
      return process.env.PLAIN_FEEDBACK_LABEL_SUPPORT || '';
    }
    default: {
      return process.env.PLAIN_FEEDBACK_LABEL_GENERAL || '';
    }
  }
};

/**
 * Server action to submit user feedback to the Plain CRM system. This action
 * handles creating or updating a customer record in Plain and creating a thread
 * with the appropriate feedback label.
 *
 * @function sendFeebackAction
 * @param {Object} options - The action input and context
 * @param {Object} options.parsedInput - The validated input from the client
 * @param {string} options.parsedInput.feedback - The feedback text provided by
 *   the user
 * @param {FeedbackType} options.parsedInput.feedbackType - The type of feedback
 *   (FEATURE, BUG, SUPPORT, GENERAL)
 * @param {Object} options.ctx - The action context containing user information
 * @param {Object} options.ctx.user - The authenticated user information
 * @returns {Promise<Object>} The Plain CRM thread creation result
 * @throws {Error} If customer creation, thread creation, or any other step
 *   fails
 * @serverAction
 * This is a Next.js server action wrapped with next-safe-action for validation and type safety.
 * The action requires user authentication and uses the sendFeedbackSchema for input validation.
 */
export const sendFeebackAction = authActionClient
  .schema(sendFeedbackSchema)
  .action(
    async ({ ctx: { user }, parsedInput: { feedback, feedbackType } }) => {
      try {
        /**
         * Step 1: Create or update customer in Plain CRM This creates a
         * customer profile or updates an existing one based on user email
         */
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
            fullName: user.full_name,
          },
          onUpdate: {},
        });

        // Handle potential errors with customer creation
        if (customerResult.error) {
          console.error('Error upserting customer:', customerResult.error);

          throw new Error('Failed to create or update customer record');
        }

        /**
         * Step 2: Get the appropriate label ID for the feedback type This
         * determines how the feedback will be categorized in Plain CRM
         */
        const labelId = getLabelId(feedbackType);
        const feedbackTypeTitle =
          feedbackType.charAt(0) + feedbackType.slice(1).toLowerCase();

        /**
         * Step 3: Create a thread with the feedback using the appropriate label
         * This creates a new conversation in Plain CRM with the user's
         * feedback
         */
        const threadResult = await client.createThread({
          components: [
            {
              componentText: {
                text: feedback,
              },
            },
          ],
          customerIdentifier: {
            customerId: customerResult.data.customer.id,
          },
          // Use the label ID corresponding to the feedback type
          labelTypeIds: labelId ? [labelId] : undefined,
          title: `${feedbackTypeTitle} Feedback`,
        });

        // Handle potential errors with thread creation
        if (threadResult.error) {
          console.error('Error creating thread:', threadResult.error);
          console.error(
            'Error details:',
            JSON.stringify(threadResult.error, null, 2)
          );

          throw new Error('Failed to create feedback thread');
        }

        /**
         * Step 4: Return success response with thread data The response
         * structure follows next-safe-action's format Client will receive {
         * data: successResponse }
         */
        const successResponse = threadResult.data;

        return successResponse;
      } catch (error) {
        /**
         * Step 5: Error handling Let next-safe-action handle the error
         * formatting Client will receive { error: { message, ... } }
         */
        console.error('Unexpected error in feedback submission:', error);

        throw error;
      }
    }
  );
