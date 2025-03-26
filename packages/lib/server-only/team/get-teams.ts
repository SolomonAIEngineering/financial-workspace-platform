import { Prisma, Team, TeamRole } from '@solomonai/prisma';

import { prisma } from '@solomonai/prisma';

export type GetTeamsOptions = {
    userId?: string;
};

// Define the response interface directly instead of using Zod inference
export interface SingleTeam extends Team {
    currentTeamMember: { role: TeamRole } | null;
}

export type TeamsResponse = SingleTeam[];

/**
 * Get all teams for a user.
 *
 * Provide an optional userId to check that the user is a member of the team.
 */
export const getTeams = async ({ userId }: GetTeamsOptions): Promise<TeamsResponse> => {
    const teams = await prisma.team.findMany({
        where: {
            usersOnTeam: {
                some: {
                    userId,
                },
            },
        },
        include: {
            usersOnTeam: {
                where: {
                    userId,
                },
                select: {
                    role: true,
                },
            },
        },
    });

    return teams.map(({ usersOnTeam, ...team }) => ({
        ...team,
        currentTeamMember: usersOnTeam[0],
    }));
};
