'use server';

import { authActionClient } from '../safe-action';
import { revalidatePath } from 'next/cache';
import { trpc } from '@/trpc/server';
import { z } from 'zod';

/**
 * Schema for validating contact information updates.
 *
 * This schema defines the structure and validation rules for user contact
 * information:
 *
 * - UserId: Required string identifier for the user
 * - AddressLine1: Optional primary address line with max length of 255 characters
 * - AddressLine2: Optional secondary address line with max length of 255
 *   characters
 * - BusinessEmail: Optional business email that must be a valid email format
 * - BusinessPhone: Optional business phone number with max length of 50
 *   characters
 * - City: Optional city name with max length of 100 characters
 * - Country: Optional country name with max length of 100 characters
 * - OfficeLocation: Optional office location with max length of 100 characters
 * - PhoneNumber: Optional personal phone number with max length of 50 characters
 * - PostalCode: Optional postal/zip code with max length of 20 characters
 * - State: Optional state/province with max length of 100 characters
 *
 * All fields except userId are nullable to allow for partial updates.
 */

const contactInfoSchema = z.object({
  userId: z.string(),
  addressLine1: z.string().max(255).optional().nullable(),
  addressLine2: z.string().max(255).optional().nullable(),
  businessEmail: z
    .string()
    .email('Invalid business email')
    .max(255)
    .optional()
    .nullable(),
  businessPhone: z.string().max(50).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  officeLocation: z.string().max(100).optional().nullable(),
  phoneNumber: z.string().max(50).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
});

/**
 * Server action for updating a user's contact information.
 *
 * This action validates the input against the contactInfoSchema and then
 * updates the user's contact information in the database through the tRPC API.
 *
 * @remarks
 *   The action uses the authActionClient to ensure the user is authenticated
 *   before allowing the update. It revalidates the profile page after a
 *   successful update to ensure the UI reflects the latest data.
 * @param ctx - The context object containing the authenticated user
 * @param parsedInput - The validated input data matching the contactInfoSchema
 * @returns A promise that resolves to an object containing:
 *
 *   - Success: A boolean indicating whether the operation was successful
 *   - User: The updated user object (if successful)
 *   - Error: An error message (if unsuccessful)
 *
 * @throws Will not throw directly, but catches and returns errors as part of
 *   the response
 */
export const updateProfileContentInfoAction = authActionClient
  .schema(contactInfoSchema)
  .action(async ({ ctx: { user }, parsedInput }) => {
    const validated = contactInfoSchema.parse(parsedInput);
    try {
      // Validate required data
      const user = await trpc.user.updateContactInfo({
        addressLine1: validated.addressLine1,
        addressLine2: validated.addressLine2,
        businessEmail: validated.businessEmail,
        businessPhone: validated.businessPhone,
        city: validated.city,
        country: validated.country,
        officeLocation: validated.officeLocation,
        phoneNumber: validated.phoneNumber,
        postalCode: validated.postalCode,
        state: validated.state,
      });

      revalidatePath('/profile');
      return { success: true, user };
    } catch (error) {
      console.error('Failed to update profile content info:', error);
      return { success: false, error: 'Failed to update profile content info' };
    }
  });
