'use server';

import { actionClient, authActionClient } from '@/actions/safe-action';
import {
    createContactSchema,
    type ContactProperties,
} from './schema';
import { loops } from '@/lib/loopsClient';

/**
 * Server action to create a contact in the Loops email marketing platform.
 *
 * This action adds a new contact to your Loops audience with the specified
 * email address, optional contact properties, and optional mailing list
 * subscriptions. If a contact with the same email already exists, an error will
 * be returned.
 *
 * Use cases include:
 *
 * - Adding new subscribers from signup forms
 * - Importing contacts from other systems
 * - Creating contacts programmatically based on user actions
 * - Adding users to specific mailing lists
 *
 * The action supports both default contact properties (firstName, lastName,
 * etc.) and any custom properties that have been defined in your Loops account.
 * Custom properties must be created in Loops before they can be used with this
 * action.
 *
 * By default, new contacts will be added to the mailing lists specified in the
 * environment variables USER_BASE_MAILING_LIST and FEATURE_LAUNCH_MAIN_LIST,
 * but you can override these by providing your own mailingLists object.
 *
 * @example
 *   // Basic usage with just an email
 *   const result = await createContactAndAddToMailingListInLoopsAction({
 *     email: 'user@example.com',
 *   });
 *
 * @example
 *   // Creating a contact with properties
 *   const result = await createContactAndAddToMailingListInLoopsAction({
 *     email: 'user@example.com',
 *     contactProperties: {
 *       firstName: 'John',
 *       lastName: 'Doe',
 *       company: 'Acme Inc.',
 *       role: 'Developer',
 *     },
 *   });
 *
 * @example
 *   // Creating a contact with custom mailing list subscriptions
 *   const result = await createContactAndAddToMailingListInLoopsAction({
 *     email: 'user@example.com',
 *     mailingLists: {
 *       'newsletter-list-id': true, // Subscribe to newsletter
 *       'product-updates-list-id': true, // Subscribe to product updates
 *       'marketing-list-id': false, // Do not subscribe to marketing emails
 *     },
 *   });
 *
 * @example
 *   // Full example with properties and mailing lists
 *   const result = await createContactAndAddToMailingListInLoopsAction({
 *     email: 'user@example.com',
 *     contactProperties: {
 *       firstName: 'John',
 *       lastName: 'Doe',
 *       favoriteColor: 'Blue',
 *       signupDate: new Date().toISOString(),
 *       isPremium: false,
 *     },
 *     mailingLists: {
 *       'list-id-1': true,
 *       'list-id-2': false,
 *     },
 *   });
 *
 * @function createContactAndAddToMailingListInLoopsAction
 * @param {Object} input - The input data for creating a contact
 * @param {string} input.email - The email address of the contact
 * @param {ContactProperties} [input.contactProperties] - Optional properties
 *   for the contact
 * @param {MailingLists} [input.mailingLists] - Optional mailing list
 *   subscriptions
 * @returns {Promise<{
 *   success: boolean;
 *   data?: {
 *     success: boolean;
 *     id: string;
 *   };
 *   error?: string;
 * }>}
 *   A promise resolving to the result with the contact id if successful
 * @see {@link https://loops.so/docs/sdks/javascript#createcontact}
 */
export const createContactAndAddToMailingListInLoopsAction = actionClient
    .schema(createContactSchema)
    .action(async (input) => {
        try {
            const { email, contactProperties, mailingLists } = input.parsedInput;

            // Create or update contact in Loops using the SDK
            const response = await loops.createContact(
                email,
                contactProperties,
                mailingLists
            );

            return {
                success: true,
                data: response,
                error: undefined,
            };
        } catch (error) {
            console.error(
                'Error in createContactAndAddToMailingListInLoopsAction:',
                error
            );
            return {
                success: false,
                error:
                    error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    });

/**
 * Authenticated version of the contact creation action for the Loops email
 * marketing platform.
 *
 * This action creates a contact in Loops using the authenticated user's
 * information from the session context. It automatically extracts the user's
 * email address and full name, splitting the full name into firstName and
 * lastName components.
 *
 * Key benefits of this authenticated version:
 *
 * - No need to manually provide the user's email address
 * - Automatic extraction of first and last name from the user's full name
 * - Ability to override or supplement the extracted name with custom properties
 * - Seamless integration with your authentication system
 *
 * This action is ideal for scenarios where you want to add logged-in users to
 * your email marketing lists, such as:
 *
 * - After user registration
 * - When users opt into marketing communications
 * - When adding users to specific feature announcement lists
 * - For personalized onboarding sequences
 *
 * @example
 *   // Basic usage with no additional parameters
 *   const result = await createContactAuthAndAddToMailingListInLoopsAction();
 *
 * @example
 *   // Adding additional contact properties
 *   const result = await createContactAuthAndAddToMailingListInLoopsAction({
 *     contactProperties: {
 *       company: 'Acme Inc.',
 *       role: 'Developer',
 *       plan: 'Premium',
 *       signupDate: new Date().toISOString(),
 *     },
 *   });
 *
 * @example
 *   // Specifying mailing list subscriptions
 *   const result = await createContactAuthAndAddToMailingListInLoopsAction({
 *     mailingLists: {
 *       'onboarding-list-id': true,
 *       'product-updates-list-id': true,
 *     },
 *   });
 *
 * @function createContactAuthAndAddToMailingListInLoopsAction
 * @param {Object} [input] - Optional input data for creating a contact
 * @param {ContactProperties} [input.contactProperties] - Optional additional
 *   properties for the contact
 * @param {MailingLists} [input.mailingLists] - Optional mailing list
 *   subscriptions
 * @returns {Promise<{
 *   success: boolean;
 *   data?: {
 *     success: boolean;
 *     id: string;
 *   };
 *   error?: string;
 * }>}
 *   A promise resolving to the result with the contact id if successful
 * @see {@link https://loops.so/docs/sdks/javascript#createcontact}
 */
export const createContactAuthAndAddToMailingListInLoopsAction =
    authActionClient
        .schema(createContactSchema.omit({ email: true }).optional())
        .action(async ({ ctx, parsedInput }) => {
            try {
                // Get user from context
                const { user } = ctx;

                // Use full_name to derive first and last name if not provided
                const names = user.full_name ? user.full_name.split(' ') : [];
                const firstName = names[0] || '';
                const lastName = names.slice(1).join(' ') || '';

                const contactProperties: ContactProperties = {
                    firstName,
                    lastName,
                    ...parsedInput?.contactProperties,
                };

                // Create or update contact in Loops using the SDK
                const response = await loops.createContact(
                    user.email,
                    contactProperties,
                    parsedInput?.mailingLists
                );

                return {
                    success: true,
                    data: response,
                    error: undefined,
                };
            } catch (error) {
                console.error(
                    'Error in createContactAuthAndAddToMailingListInLoopsAction:',
                    error
                );
                return {
                    success: false,
                    error:
                        error instanceof Error ? error.message : 'Unknown error occurred',
                };
            }
        });
