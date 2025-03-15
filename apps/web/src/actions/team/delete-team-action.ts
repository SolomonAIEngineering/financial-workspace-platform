import { authActionClient } from "../safe-action";
import { revalidatePath } from "next/cache";
import { trpc } from "@/trpc/server";
import { z } from "zod";

/**
 * Schema for validating team deletion.
 * 
 * This schema defines the structure and validation rules for deleting a team:
 * - id: Required string identifier for the team to delete
 */
const deleteTeamSchema = z.object({
    id: z.string(),
});

/**
 * Server action for deleting a team.
 * 
 * This authenticated action handles the deletion of a team and all associated data.
 * 
 * @remarks
 * The action uses the authActionClient to ensure the user is authenticated before
 * allowing the deletion. It validates the team ID against the deleteTeamSchema
 * before processing the deletion through the tRPC API.
 * 
 * After a successful deletion, it revalidates the teams page to ensure the UI reflects
 * the latest information.
 * 
 * @param ctx - The context object containing the authenticated user
 * @param parsedInput - The validated input data matching the deleteTeamSchema
 * 
 * @returns A promise that resolves to an object containing:
 *   - success: A boolean indicating whether the operation was successful
 *   - error: An error message (if unsuccessful)
 * 
 * @example
 * ```tsx
 * const result = await deleteTeamAction({
 *   id: "team-id"
 * });
 * 
 * if (result.success) {
 *   // Handle success
 * } else {
 *   // Handle error
 * }
 * ```
 */
export const deleteTeamAction = authActionClient
    .schema(deleteTeamSchema)
    .action(async ({ ctx: { user }, parsedInput }) => {
        const validated = deleteTeamSchema.parse(parsedInput);

        try {
            // Use the tRPC router instead of direct Prisma access
            await trpc.team.delete({
                id: validated.id,
            });

            revalidatePath('/teams');
            return { success: true };
        } catch (error) {
            console.error('Failed to delete team:', error);
            return { success: false, error: 'Failed to delete team' };
        }
    }); 