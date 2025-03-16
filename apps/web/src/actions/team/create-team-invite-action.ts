import { authActionClient } from '../safe-action';
import { revalidatePath } from 'next/cache';
import { trpc } from '@/trpc/server';
import { z } from 'zod';

/**
 * Schema for validating team invite creation.
 *
 * This schema defines the structure and validation rules for creating a team
 * invite:
 *
 * - TeamId: Required string identifier for the team
 * - Email: Required valid email address for the invitee
 * - Role: Required role to assign to the invitee (OWNER or MEMBER)
 */
const createTeamInviteSchema = z.object({
  teamId: z.string(),
  email: z.string().email('Please provide a valid email address'),
  role: z.enum(['OWNER', 'MEMBER']),
});

/**
 * Server action for creating a team invite.
 *
 * This authenticated action handles creating an invitation for a user to join a
 * team.
 *
 * @remarks
 *   The action uses the authActionClient to ensure the user is authenticated
 *   before allowing the operation. It validates all input against the
 *   createTeamInviteSchema before processing the invite creation through the
 *   tRPC API.
 *
 *   After a successful creation, it revalidates the team page to ensure the UI
 *   reflects the latest information.
 * @example
 *   ```tsx
 *   const result = await createTeamInviteAction({
 *     teamId: "team-id",
 *     email: "user@example.com",
 *     role: "MEMBER"
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
 *   createTeamInviteSchema
 * @returns A promise that resolves to an object containing:
 *
 *   - Success: A boolean indicating whether the operation was successful
 *   - Invite: The created invite object (if successful)
 *   - Error: An error message (if unsuccessful)
 */
export const createTeamInviteAction = authActionClient
  .schema(createTeamInviteSchema)
  .action(async ({ ctx: { user }, parsedInput }) => {
    const validated = createTeamInviteSchema.parse(parsedInput);

    try {
      // Use the tRPC router instead of direct Prisma access
      const invite = await trpc.team.createInvite({
        teamId: validated.teamId,
        email: validated.email,
        role: validated.role,
      });

      revalidatePath(`/teams/${validated.teamId}`);
      return { success: true, invite };
    } catch (error) {
      console.error('Failed to create team invite:', error);
      return { success: false, error: 'Failed to create team invite' };
    }
  });
