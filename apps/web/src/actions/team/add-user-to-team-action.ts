import { authActionClient } from "../safe-action";
import { revalidatePath } from "next/cache";
import { trpc } from "@/trpc/server";
import { z } from "zod";

/**
 * Schema for validating adding a user to a team.
 * 
 * This schema defines the structure and validation rules for adding a user to a team:
 * - teamId: Required string identifier for the team
 * - userId: Required string identifier for the user to add
 * - role: Required role for the user in the team (OWNER or MEMBER)
 */
const addUserToTeamSchema = z.object({
    teamId: z.string(),
    userId: z.string(),
    role: z.enum(["OWNER", "MEMBER"]),
});

/**
 * Server action for adding a user to a team.
 * 
 * This authenticated action handles adding a user to a team with a specified role.
 * 
 * @remarks
 * The action uses the authActionClient to ensure the user is authenticated before
 * allowing the operation. It validates all input against the addUserToTeamSchema
 * before processing the addition through the tRPC API.
 * 
 * After a successful addition, it revalidates the team page to ensure the UI reflects
 * the latest information.
 * 
 * @param ctx - The context object containing the authenticated user
 * @param parsedInput - The validated input data matching the addUserToTeamSchema
 * 
 * @returns A promise that resolves to an object containing:
 *   - success: A boolean indicating whether the operation was successful
 *   - error: An error message (if unsuccessful)
 * 
 * @example
 * ```tsx
 * const result = await addUserToTeamAction({
 *   teamId: "team-id",
 *   userId: "user-id",
 *   role: "MEMBER"
 * });
 * 
 * if (result.success) {
 *   // Handle success
 * } else {
 *   // Handle error
 * }
 * ```
 */
export const addUserToTeamAction = authActionClient
    .schema(addUserToTeamSchema)
    .action(async ({ ctx: { user }, parsedInput }) => {
        const validated = addUserToTeamSchema.parse(parsedInput);

        try {
            // Use the tRPC router to add the user to the team
            await trpc.team.addUser({
                teamId: validated.teamId,
                userId: validated.userId,
                role: validated.role,
            });

            revalidatePath(`/teams/${validated.teamId}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to add user to team:', error);
            return { success: false, error: 'Failed to add user to team' };
        }
    }); 