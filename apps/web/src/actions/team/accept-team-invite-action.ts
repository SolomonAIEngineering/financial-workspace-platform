import { authActionClient } from "../safe-action";
import { revalidatePath } from "next/cache";
import { trpc } from "@/trpc/server";
import { z } from "zod";

/**
 * Schema for validating team invite acceptance.
 * 
 * This schema defines the structure and validation rules for accepting a team invite:
 * - code: Required string code for the invite
 */
const acceptTeamInviteSchema = z.object({
    code: z.string(),
});

/**
 * Server action for accepting a team invite.
 * 
 * This authenticated action handles accepting an invitation to join a team.
 * 
 * @remarks
 * The action uses the authActionClient to ensure the user is authenticated before
 * allowing the operation. It validates the invite code against the acceptTeamInviteSchema
 * before processing the acceptance through the tRPC API.
 * 
 * After a successful acceptance, it revalidates the teams page to ensure the UI reflects
 * the latest information.
 * 
 * @param ctx - The context object containing the authenticated user
 * @param parsedInput - The validated input data matching the acceptTeamInviteSchema
 * 
 * @returns A promise that resolves to an object containing:
 *   - success: A boolean indicating whether the operation was successful
 *   - teamId: The ID of the team that was joined (if successful)
 *   - error: An error message (if unsuccessful)
 * 
 * @example
 * ```tsx
 * const result = await acceptTeamInviteAction({
 *   code: "invite-code"
 * });
 * 
 * if (result.success) {
 *   // Handle success, e.g., redirect to the team page
 *   router.push(`/teams/${result.teamId}`);
 * } else {
 *   // Handle error
 * }
 * ```
 */
export const acceptTeamInviteAction = authActionClient
    .schema(acceptTeamInviteSchema)
    .action(async ({ ctx: { user }, parsedInput }) => {
        const validated = acceptTeamInviteSchema.parse(parsedInput);

        try {
            // Use the tRPC router instead of direct Prisma access
            const result = await trpc.team.acceptInvite({
                code: validated.code,
            });

            revalidatePath('/teams');
            return {
                success: true,
                teamId: result.teamId
            };
        } catch (error) {
            console.error('Failed to accept team invite:', error);
            return { success: false, error: 'Failed to accept team invite' };
        }
    }); 