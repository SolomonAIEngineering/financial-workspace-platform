import { authActionClient } from "../safe-action";
import { revalidatePath } from "next/cache";
import { trpc } from "@/trpc/server";
import { z } from "zod";

/**
 * Schema for validating removing a user from a team.
 * 
 * This schema defines the structure and validation rules for removing a user from a team:
 * - teamId: Required string identifier for the team
 * - userId: Required string identifier for the user to remove
 */
const removeUserFromTeamSchema = z.object({
    teamId: z.string(),
    userId: z.string(),
});

/**
 * Server action for removing a user from a team.
 * 
 * This authenticated action handles removing a user from a team.
 * 
 * @remarks
 * The action uses the authActionClient to ensure the user is authenticated before
 * allowing the operation. It validates all input against the removeUserFromTeamSchema
 * before processing the removal through the tRPC API.
 * 
 * After a successful removal, it revalidates the team page to ensure the UI reflects
 * the latest information.
 * 
 * @param ctx - The context object containing the authenticated user
 * @param parsedInput - The validated input data matching the removeUserFromTeamSchema
 * 
 * @returns A promise that resolves to an object containing:
 *   - success: A boolean indicating whether the operation was successful
 *   - error: An error message (if unsuccessful)
 * 
 * @example
 * ```tsx
 * const result = await removeUserFromTeamAction({
 *   teamId: "team-id",
 *   userId: "user-id"
 * });
 * 
 * if (result.success) {
 *   // Handle success
 * } else {
 *   // Handle error
 * }
 * ```
 */
export const removeUserFromTeamAction = authActionClient
    .schema(removeUserFromTeamSchema)
    .action(async ({ ctx: { user }, parsedInput }) => {
        const validated = removeUserFromTeamSchema.parse(parsedInput);

        try {
            // Use the tRPC router instead of direct Prisma access
            await trpc.team.removeUser({
                teamId: validated.teamId,
                userId: validated.userId,
            });

            revalidatePath(`/teams/${validated.teamId}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to remove user from team:', error);
            return { success: false, error: 'Failed to remove user from team' };
        }
    }); 