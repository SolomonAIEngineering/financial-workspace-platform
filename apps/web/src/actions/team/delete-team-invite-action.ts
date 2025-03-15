import { authActionClient } from "../safe-action";
import { revalidatePath } from "next/cache";
import { trpc } from "@/trpc/server";
import { z } from "zod";

/**
 * Schema for validating team invite deletion.
 * 
 * This schema defines the structure and validation rules for deleting a team invite:
 * - inviteId: Required string identifier for the invite to delete
 * - teamId: Required string identifier for the team
 */
const deleteTeamInviteSchema = z.object({
    inviteId: z.string(),
    teamId: z.string(),
});

/**
 * Server action for deleting a team invite.
 * 
 * This authenticated action handles deleting an invitation for a user to join a team.
 * 
 * @remarks
 * The action uses the authActionClient to ensure the user is authenticated before
 * allowing the operation. It validates all input against the deleteTeamInviteSchema
 * before processing the invite deletion through the tRPC API.
 * 
 * After a successful deletion, it revalidates the team page to ensure the UI reflects
 * the latest information.
 * 
 * @param ctx - The context object containing the authenticated user
 * @param parsedInput - The validated input data matching the deleteTeamInviteSchema
 * 
 * @returns A promise that resolves to an object containing:
 *   - success: A boolean indicating whether the operation was successful
 *   - error: An error message (if unsuccessful)
 * 
 * @example
 * ```tsx
 * const result = await deleteTeamInviteAction({
 *   inviteId: "invite-id",
 *   teamId: "team-id"
 * });
 * 
 * if (result.success) {
 *   // Handle success
 * } else {
 *   // Handle error
 * }
 * ```
 */
export const deleteTeamInviteAction = authActionClient
    .schema(deleteTeamInviteSchema)
    .action(async ({ ctx: { user }, parsedInput }) => {
        const validated = deleteTeamInviteSchema.parse(parsedInput);

        try {
            // Use the tRPC router instead of direct Prisma access
            // Note: The API only accepts inviteId, but we store teamId for revalidation
            await trpc.team.deleteInvite({
                inviteId: validated.inviteId,
            });

            revalidatePath(`/teams/${validated.teamId}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to delete team invite:', error);
            return { success: false, error: 'Failed to delete team invite' };
        }
    }); 