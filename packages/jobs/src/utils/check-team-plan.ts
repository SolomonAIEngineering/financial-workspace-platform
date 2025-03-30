import { SubscriptionStatus, prisma } from "@solomonai/prisma";

/**
 * Determines if email notifications should be sent to a team based on their subscription status
 * 
 * @param {string} teamId - The unique identifier of the team
 * @returns {Promise<boolean>} Whether email notifications should be sent
 * @throws {Error} If the team is not found
 */
export async function shouldSendEmail(teamId: string) {
    const team = await prisma.team.findUnique({
        where: {
            id: teamId,
        },
        include: {
            subscription: true
        }
    });

    if (!team) {
        throw new Error("Team not found");
    }

    if (team.subscription?.status === SubscriptionStatus.TRIAL) {
        return true;
    }

    return false;
}
