import { TeamRole } from '@prisma/client';
import { authActionClient } from '../safe-action';
import { revalidatePath } from 'next/cache';
import { trpc } from '@/trpc/server';
import { z } from 'zod';

/**
 * Schema for validating updating a user's role in a team.
 *
 * This schema defines the structure and validation rules for updating a user's
 * role:
 *
 * - TeamId: Required string identifier for the team
 * - UserId: Required string identifier for the user
 * - Role: Required new role for the user (OWNER or MEMBER)
 */
const updateUserRoleSchema = z.object({
  teamId: z.string(),
  userId: z.string(),
  role: z.nativeEnum(TeamRole),
});

/**
 * Server action for updating a user's role in a team.
 *
 * This authenticated action handles updating a user's role within a team.
 *
 * @remarks
 *   The action uses the authActionClient to ensure the user is authenticated
 *   before allowing the operation. It validates all input against the
 *   updateUserRoleSchema before processing the update through the tRPC API.
 *
 *   After a successful update, it revalidates the team page to ensure the UI
 *   reflects the latest information.
 * @example
 *   ```tsx
 *   const result = await updateUserRoleAction({
 *     teamId: "team-id",
 *     userId: "user-id",
 *     role: "OWNER"
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
 *   updateUserRoleSchema
 * @returns A promise that resolves to an object containing:
 *
 *   - Success: A boolean indicating whether the operation was successful
 *   - Error: An error message (if unsuccessful)
 */
export const updateUserRoleAction = authActionClient
  .schema(updateUserRoleSchema)
  .action(async ({ ctx: { user }, parsedInput }) => {
    const validated = updateUserRoleSchema.parse(parsedInput);

    try {
      // Use the tRPC router instead of direct Prisma access
      await trpc.team.updateUserRole({
        teamId: validated.teamId,
        userId: validated.userId,
        role: validated.role,
      });

      revalidatePath(`/teams/${validated.teamId}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to update user role:', error);
      return { success: false, error: 'Failed to update user role' };
    }
  });
