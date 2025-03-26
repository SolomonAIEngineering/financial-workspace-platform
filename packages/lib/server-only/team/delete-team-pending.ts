import { prisma } from '@solomonai/prisma';
import { z } from 'zod';

/**
 * Schema for validating team pending deletion options.
 *
 * This schema defines the structure and validation rules for deleting a pending team:
 *
 * - userId: Required string identifier for the user making the deletion
 * - pendingTeamId: Required string identifier for the pending team to delete
 */
export const deleteTeamPendingSchema = z.object({
    userId: z.string(),
    pendingTeamId: z.string(),
});

/**
 * Type derived from the Zod schema for delete team pending options
 */
export type DeleteTeamPendingOptions = z.infer<typeof deleteTeamPendingSchema>;

export const deleteTeamPending = async ({ userId, pendingTeamId }: DeleteTeamPendingOptions) => {
    // Validate input with Zod schema
    const validated = deleteTeamPendingSchema.parse({ userId, pendingTeamId });

    await prisma.teamPending.delete({
        where: {
            id: validated.pendingTeamId,
            ownerUserId: validated.userId,
        },
    });
};
