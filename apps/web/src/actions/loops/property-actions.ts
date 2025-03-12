'use server';

import { actionClient } from '@/actions/safe-action';
import {
    createContactPropertySchema,
} from './schema';
import { loops } from '@/lib/loopsClient';
import { z } from 'zod';

/**
 * Server action to create a custom contact property in the Loops email
 * marketing platform.
 *
 * Custom contact properties allow you to store additional information about
 * your contacts beyond the default properties (email, firstName, lastName,
 * etc.). These properties can be used for segmentation, personalization in
 * emails, and triggering automated flows.
 *
 * This action must be called before you can use a custom property with your
 * contacts. If you attempt to use a custom property that hasn't been created
 * first, Loops will return an error.
 *
 * The supported property types are:
 *
 * - `string`: Text values of any length
 * - `number`: Numeric values (integers or decimals)
 * - `boolean`: True/false values
 * - `date`: Date values in ISO 8601 format (e.g., "2023-12-31T23:59:59Z")
 *
 * @example
 *   // Create a string property for favorite color
 *   const result = await createContactPropertyInLoopsAction({
 *     name: 'favoriteColor',
 *     type: 'string',
 *     description: "The user's favorite color",
 *   });
 *
 * @example
 *   // Create a numeric property for subscription tier
 *   const result = await createContactPropertyInLoopsAction({
 *     name: 'subscriptionTier',
 *     type: 'number',
 *     description: 'Numeric value representing subscription level (1-3)',
 *   });
 *
 * @example
 *   // Create a boolean property for feature flag
 *   const result = await createContactPropertyInLoopsAction({
 *     name: 'hasAccessToBetaFeatures',
 *     type: 'boolean',
 *     description: 'Whether the user has access to beta features',
 *   });
 *
 * @function createContactPropertyInLoopsAction
 * @param {CreateContactPropertyInput} input - The input data for creating a
 *   contact property
 * @param {string} input.name - The name of the property (must be unique)
 * @param {string} input.type - The type of the property ('string', 'number',
 *   'boolean', 'date')
 * @param {string} [input.description] - Optional description of the property's
 *   purpose
 * @returns {Promise<{
 *   success: boolean;
 *   data?: {
 *     success: boolean;
 *     message: string;
 *   };
 *   error?: string;
 * }>}
 *   A promise resolving to the result with a success message if successful
 * @see {@link https://loops.so/docs/sdks/javascript#createcontactproperty}
 */
export const createContactPropertyInLoopsAction = actionClient
    .schema(createContactPropertySchema)
    .action(async (input) => {
        try {
            const { name, type, description } = input.parsedInput;

            // Create contact property in Loops using the SDK
            const response = await loops.createContactProperty(name, type);

            return {
                success: true,
                data: response,
                error: undefined,
            };
        } catch (error) {
            console.error('Error in createContactPropertyInLoopsAction:', error);
            return {
                success: false,
                error:
                    error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    });

/**
 * Server action to retrieve all mailing lists from the Loops email marketing
 * platform.
 *
 * Mailing lists in Loops allow you to organize your contacts into specific
 * groups for targeted email campaigns. This action fetches all mailing lists in
 * your Loops account, including both public and private lists.
 *
 * For each mailing list, the response includes:
 *
 * - `id`: Unique identifier for the list
 * - `name`: Display name of the list
 * - `isPublic`: Whether the list is available for public signup
 * - `description`: Optional description of the list's purpose
 *
 * You can use the retrieved list IDs to:
 *
 * - Subscribe/unsubscribe contacts to specific lists
 * - Create signup forms that add contacts to particular lists
 * - Filter your audience for targeted campaigns
 *
 * @example
 *   // Get all mailing lists
 *   const result = await getMailingListsInLoopsAction();
 *
 *   // Example usage of the result
 *   if (result.success && result.data) {
 *     const lists = result.data;
 *
 *     // Find a specific list by name
 *     const newsletterList = lists.find(
 *       (list) => list.name === 'Weekly Newsletter'
 *     );
 *
 *     // Get all public lists for a signup form
 *     const publicLists = lists.filter((list) => list.isPublic);
 *   }
 *
 * @function getMailingListsInLoopsAction
 * @returns {Promise<{
 *   success: boolean;
 *   data?: {
 *     id: string;
 *     name: string;
 *     isPublic: boolean;
 *     description?: string;
 *   }[];
 *   error?: string;
 * }>}
 *   A promise resolving to the result with an array of mailing lists if
 *   successful
 * @see {@link https://loops.so/docs/sdks/javascript#getmailinglists}
 */
export const getMailingListsInLoopsAction = actionClient
    .schema(z.object({}))
    .action(async () => {
        try {
            // Get mailing lists in Loops using the SDK
            const response = await loops.getMailingLists();

            return {
                success: true,
                data: response,
                error: undefined,
            };
        } catch (error) {
            console.error('Error in getMailingListsInLoopsAction:', error);
            return {
                success: false,
                error:
                    error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    });
