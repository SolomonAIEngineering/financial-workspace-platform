'use server';

import {
  deleteContactSchema,
  findContactSchema,
  updateContactSchema,
} from './schema';

import { actionClient } from '@/actions/safe-action';
import { loops } from '@/lib/loopsClient';

/**
 * Server action to find a contact in the Loops email marketing platform.
 *
 * This action searches for a contact by either email address or userId. At
 * least one of these parameters must be provided. The Loops API will return the
 * contact's details including all default and custom properties, as well as
 * their mailing list subscriptions.
 *
 * If no contact is found, an empty list will be returned by the Loops API.
 *
 * @example
 *   // Find a contact by email
 *   const result = await findContactInLoopsAction({
 *     email: 'user@example.com',
 *   });
 *
 * @example
 *   // Find a contact by userId
 *   const result = await findContactInLoopsAction({
 *     userId: '12345',
 *   });
 *
 * @function findContactInLoopsAction
 * @param {FindContactInput} input - The input data for finding a contact
 * @param {string} [input.email] - The email address of the contact to find
 * @param {string} [input.userId] - The user ID of the contact to find
 * @returns {Promise<{
 *   success: boolean;
 *   data?: {
 *     id: string;
 *     email: string;
 *     firstName: string | null;
 *     lastName: string | null;
 *     source: string;
 *     subscribed: boolean;
 *     userGroup: string;
 *     userId: string | null;
 *     mailingLists: Record<string, boolean>;
 *     [key: string]: any; // Custom properties
 *   }[];
 *   error?: string;
 * }>}
 *   A promise resolving to the result containing contact data if successful
 * @see {@link https://loops.so/docs/sdks/javascript#findcontact}
 */
export const findContactInLoopsAction = actionClient
  .schema(findContactSchema)
  .action(async (input) => {
    try {
      const { email, userId } = input.parsedInput;

      // Find contact in Loops using the SDK
      const response = await loops.findContact({
        email,
        userId,
      });

      return {
        success: true,
        data: response,
        error: undefined,
      };
    } catch (error) {
      console.error('Error in findContactInLoopsAction:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

/**
 * Server action to update a contact in the Loops email marketing platform.
 *
 * This action updates an existing contact's properties and mailing list
 * subscriptions. If no contact exists with the provided email address, a new
 * contact will be created using the email and properties specified in the
 * request.
 *
 * To update a contact's email address, the contact must have a `userId` value
 * assigned. In that case, you would use the updateContact action with their
 * `userId` and the new email address in the contactProperties.
 *
 * @example
 *   // Update a contact's properties
 *   const result = await updateContactInLoopsAction({
 *     email: 'user@example.com',
 *     contactProperties: {
 *       firstName: 'John',
 *       lastName: 'Smith',
 *       company: 'Acme Inc.',
 *       favoriteColor: 'blue',
 *     },
 *   });
 *
 * @example
 *   // Update a contact's mailing list subscriptions
 *   const result = await updateContactInLoopsAction({
 *     email: 'user@example.com',
 *     mailingLists: {
 *       'list-id-1': true, // Subscribe to this list
 *       'list-id-2': false, // Unsubscribe from this list
 *     },
 *   });
 *
 * @example
 *   // Update both properties and subscriptions
 *   const result = await updateContactInLoopsAction({
 *     email: 'user@example.com',
 *     contactProperties: {
 *       planType: 'premium',
 *       lastLogin: new Date().toISOString(),
 *     },
 *     mailingLists: {
 *       'premium-users-list': true,
 *     },
 *   });
 *
 * @function updateContactInLoopsAction
 * @param {UpdateContactInput} input - The input data for updating a contact
 * @param {string} input.email - The email address of the contact to update
 * @param {ContactProperties} [input.contactProperties] - Optional properties to
 *   update on the contact
 * @param {MailingLists} [input.mailingLists] - Optional mailing list
 *   subscriptions to update
 * @returns {Promise<{
 *   success: boolean;
 *   data?: {
 *     success: boolean;
 *     id: string;
 *   };
 *   error?: string;
 * }>}
 *   A promise resolving to the result with the contact id if successful
 * @see {@link https://loops.so/docs/sdks/javascript#updatecontact}
 */
export const updateContactInLoopsAction = actionClient
  .schema(updateContactSchema)
  .action(async (input) => {
    try {
      const { email, contactProperties, mailingLists } = input.parsedInput;

      // Update contact in Loops using the SDK
      const response = await loops.updateContact(
        email,
        contactProperties || {},
        mailingLists
      );

      return {
        success: true,
        data: response,
        error: undefined,
      };
    } catch (error) {
      console.error('Error in updateContactInLoopsAction:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

/**
 * Server action to delete a contact from the Loops email marketing platform.
 *
 * This action permanently removes a contact from your Loops audience. You can
 * identify the contact to delete by either their email address or userId. At
 * least one of these parameters must be provided.
 *
 * If no contact is found matching the criteria, a 404 error will be returned by
 * Loops.
 *
 * Use this action with caution as deleting a contact is irreversible. The
 * contact's information, subscription status, and event history will all be
 * permanently removed.
 *
 * @example
 *   // Delete a contact by email address
 *   const result = await deleteContactInLoopsAction({
 *     email: 'user@example.com',
 *   });
 *
 * @example
 *   // Delete a contact by userId
 *   const result = await deleteContactInLoopsAction({
 *     userId: '12345',
 *   });
 *
 * @function deleteContactInLoopsAction
 * @param {DeleteContactInput} input - The input data for deleting a contact
 * @param {string} [input.email] - The email address of the contact to delete
 * @param {string} [input.userId] - The user ID of the contact to delete
 * @returns {Promise<{
 *   success: boolean;
 *   data?: {
 *     success: boolean;
 *     message: string;
 *   };
 *   error?: string;
 * }>}
 *   A promise resolving to the result with a success message if successful
 * @see {@link https://loops.so/docs/sdks/javascript#deletecontact}
 */
export const deleteContactInLoopsAction = actionClient
  .schema(deleteContactSchema)
  .action(async (input) => {
    try {
      const { email, userId } = input.parsedInput;

      // Delete contact in Loops using the SDK
      const response = await loops.deleteContact({
        email,
        userId,
      });

      return {
        success: true,
        data: response,
        error: undefined,
      };
    } catch (error) {
      console.error('Error in deleteContactInLoopsAction:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });
