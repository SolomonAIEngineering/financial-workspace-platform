'use server';

import { authActionClient } from '../safe-action';
import { revalidatePath } from 'next/cache';
import { trpc } from '@/trpc/server';
import { z } from 'zod';

/**
 * Schema for validating team updates.
 *
 * This schema defines the structure and validation rules for updating a team:
 *
 * - Id: Required string identifier for the team
 * - Name: Optional team name with minimum length of 2 characters
 * - Email: Optional valid email address for the team
 * - BaseCurrency: Optional currency code
 * - Slug: Optional URL-friendly identifier (lowercase letters, numbers, and
 *   hyphens)
 * - InboxForwarding: Optional boolean flag for enabling email forwarding
 * - Flags: Optional array of feature flag strings
 */
const updateTeamSchema = z.object({
  id: z.string(),
  data: z.object({
    name: z
      .string()
      .min(2, 'Team name must be at least 2 characters')
      .optional(),
    email: z.string().email('Please provide a valid email address').optional(),
    baseCurrency: z.string().optional(),
    slug: z
      .string()
      .regex(
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens'
      )
      .optional(),
    inboxForwarding: z.boolean().optional(),
    flags: z.array(z.string()).optional(),
  }),
});

/**
 * Server action for updating a team.
 *
 * This authenticated action handles updates to a team's details, including
 * name, email, and base currency.
 *
 * @remarks
 *   The action uses the authActionClient to ensure the user is authenticated
 *   before allowing the update. It validates all input against the
 *   updateTeamSchema before processing the update through the tRPC API.
 *
 *   After a successful update, it revalidates the team page to ensure the UI
 *   reflects the latest information.
 * @example
 *   ```tsx
 *   const result = await updateTeamAction({
 *     id: "team-id",
 *     data: {
 *       name: "Updated Team Name",
 *       email: "updated@example.com"
 *     }
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
 * @param parsedInput - The validated input data matching the updateTeamSchema
 * @returns A promise that resolves to an object containing:
 *
 *   - Success: A boolean indicating whether the operation was successful
 *   - Team: The updated team object (if successful)
 *   - Error: An error message (if unsuccessful)
 */
export const updateTeamAction = authActionClient
  .schema(updateTeamSchema)
  .action(async ({ ctx: { user }, parsedInput }) => {
    const validated = updateTeamSchema.parse(parsedInput);

    try {
      // Use the tRPC router instead of direct Prisma access
      const team = await trpc.team.update({
        id: validated.id,
        data: validated.data,
      });

      revalidatePath(`/teams/${validated.id}`);
      revalidatePath('/teams');
      return { success: true, team };
    } catch (error) {
      console.error('Failed to update team:', error);
      return { success: false, error: 'Failed to update team' };
    }
  });
