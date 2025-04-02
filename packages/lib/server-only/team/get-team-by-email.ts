import { Team, TeamRole } from '@solomonai/prisma';

import { prisma } from '@solomonai/prisma/server';
import { z } from 'zod';

/**
 * The schema for getting a team by email.
 */
export const getTeamEmailByEmailSchema = z.object({
    email: z.string(),
});

/**
 * The options type for getting a team by email.
 */
export type GetTeamEmailByEmailOptions = z.infer<typeof getTeamEmailByEmailSchema>;

/**
 * The response type for getting a team by email.
 */
export interface TeamEmailResponse extends Team {
    usersOnTeam: { role: TeamRole }[];
}

/**
 * Get a team by email.
 *
 * @param email - The email of the team to get.
 * @returns The team with the given email.
 */
export const getTeamEmailByEmail = async ({ email }: GetTeamEmailByEmailOptions): Promise<TeamEmailResponse | null> => {
    const validated = getTeamEmailByEmailSchema.parse({ email });

    const team = await prisma.team.findFirst({
        where: {
            email: validated.email,
        },
        include: {
            usersOnTeam: {
                select: {
                    role: true,
                },
            },
        },
    });

    return {
        ...team,
        currentTeamMember: team?.usersOnTeam[0] ?? null,
    } as TeamEmailResponse;
};
