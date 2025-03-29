import { Prisma, Team, TeamRole } from '@solomonai/prisma';

import { prisma } from '@solomonai/prisma';

export type GetTeamByIdOptions = {
    userId?: string;
    teamId: string;
};

// Define the response interface directly instead of using Zod inference
export interface TeamResponse extends Team {
    currentTeamMember: { role: TeamRole } | null;
}

/**
 * Get a team given a teamId.
 *
 * Provide an optional userId to check that the user is a member of the team.
 */
export const getTeamById = async ({
    userId,
    teamId,
}: GetTeamByIdOptions): Promise<TeamResponse> => {
    const whereFilter: Prisma.TeamWhereUniqueInput = {
        id: teamId,
    };

    if (userId !== undefined) {
        whereFilter['usersOnTeam'] = {
            some: {
                userId,
            },
        };
    }

    const result = await prisma.team.findUniqueOrThrow({
        where: whereFilter,
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

    const { usersOnTeam, ...team } = result;

    return {
        ...team,
        currentTeamMember: userId !== undefined ? usersOnTeam[0] : null,
    } as TeamResponse;
};
