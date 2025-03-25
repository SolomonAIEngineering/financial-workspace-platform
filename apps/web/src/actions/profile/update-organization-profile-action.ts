'use server';

import { authActionClient } from '../safe-action';
import { revalidatePath } from 'next/cache';
import { trpc } from '@/trpc/server';
import { z } from 'zod';
/**
 * Schema for validating organization-related profile updates.
 *
 * This schema defines the structure and validation rules for a user's
 * organizational information:
 *
 * - UserId: Required string identifier for the user
 * - Department: Optional department name with max length of 100 characters
 * - JobTitle: Optional job title with max length of 100 characters
 * - OrganizationName: Optional organization/company name with max length of 100
 *   characters
 * - OrganizationUnit: Optional organizational unit or division with max length of
 *   100 characters
 * - TeamName: Optional team name with max length of 100 characters
 *
 * All fields except userId are nullable to allow for partial updates or
 * clearing existing values.
 */
const userOrganizationProfileSchema = z.object({
  userId: z.string(),
  department: z.string().max(100).optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  organizationName: z.string().max(100).optional().nullable(),
  organizationUnit: z.string().max(100).optional().nullable(),
  teamName: z.string().max(100).optional().nullable(),
});

/**
 * Server action for updating a user's organization profile information.
 *
 * This authenticated action handles updates to a user's organizational details,
 * including department, job title, organization name, organizational unit, and
 * team name.
 *
 * @remarks
 *   The action uses the authActionClient to ensure the user is authenticated
 *   before allowing the update. It validates all input against the
 *   userOrganizationProfileSchema before processing the update through the tRPC
 *   API.
 *
 *   After a successful update, it revalidates the profile page to ensure the UI
 *   reflects the latest information.
 * @example
 *   ```tsx
 *   const result = await updateUserOrganizationProfileAction({
 *     userId: user.id,
 *     jobTitle: "Software Engineer",
 *     department: "Engineering",
 *     organizationName: "Acme Corp"
 *   });
 *
 *   if (result.success) {
 *     // Handle success
 *   } else {
 *     // Handle error
 *   }
 *   ```;
 *
 * @param ctx - The context object containing the authenticated user
 * @param parsedInput - The validated input data matching the
 *   userOrganizationProfileSchema
 * @returns A promise that resolves to an object containing:
 *
 *   - Success: A boolean indicating whether the operation was successful
 *   - User: The updated user object (if successful)
 *   - Error: An error message (if unsuccessful)
 */
export const updateUserOrganizationProfileAction = authActionClient
  .schema(userOrganizationProfileSchema)
  .action(async ({ ctx: { user }, parsedInput }) => {
    const validated = userOrganizationProfileSchema.parse(parsedInput);

    try {
      // Use the tRPC router instead of direct Prisma access
      const user = await trpc.user.updateOrganizationInfo({
        department: validated.department,
        jobTitle: validated.jobTitle,
        organizationName: validated.organizationName,
        organizationUnit: validated.organizationUnit,
        teamName: validated.teamName,
      });

      revalidatePath('/profile');
      return { success: true, user };
    } catch (error) {
      console.error('Failed to update organization information:', error);
      return {
        success: false,
        error: 'Failed to update organization information',
      };
    }
  });
