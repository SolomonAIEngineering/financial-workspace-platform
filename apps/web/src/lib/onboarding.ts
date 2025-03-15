import { getCookie } from 'cookies-next';
import { prisma } from '@/server/db';

/**
 * Interface for user onboarding status
 */
export interface OnboardingStatus {
    hasTeam: boolean;
    hasProfile: boolean;
    hasBankConnection: boolean;
    hasBankSkipped: boolean;
    isComplete: boolean;
    nextStep: string;
}

/**
 * Check if a user has completed the onboarding process
 * 
 * @param userId - The ID of the user to check
 * @returns An object containing the user's onboarding status
 */
export async function getUserOnboardingStatus(userId: string): Promise<OnboardingStatus> {
    // Default status
    const status: OnboardingStatus = {
        hasTeam: false,
        hasProfile: false,
        hasBankConnection: false,
        hasBankSkipped: false,
        isComplete: false,
        nextStep: '/onboarding/team',
    };

    try {
        // Fetch user data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                profileImageUrl: true,
                teamId: true,
                bankConnections: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!user) {
            return status;
        }

        // Check if user has a team
        status.hasTeam = Boolean(user.teamId);

        // Update next step if user has a team
        if (status.hasTeam) {
            status.nextStep = '/onboarding/profile';
        }

        // Check if user has completed profile
        status.hasProfile = Boolean(
            user.name && user.email && user.profileImageUrl
        );

        // Update next step if user has a profile
        if (status.hasTeam && status.hasProfile) {
            status.nextStep = '/onboarding/bank-connection';
        }

        // Check if user has connected a bank account
        status.hasBankConnection = user.bankConnections && user.bankConnections.length > 0;

        // Check if user has skipped bank connection
        // Note: This will need to be called in a client component or API route
        // as cookies-next's getCookie can't be used in server components directly
        status.hasBankSkipped = false; // This will be set by the client

        // Check if onboarding is complete
        status.isComplete = status.hasTeam && status.hasProfile && (status.hasBankConnection || status.hasBankSkipped);

        // Update next step if onboarding is complete
        if (status.isComplete) {
            status.nextStep = '/dashboard';
        }

        return status;
    } catch (error) {
        console.error('Error checking onboarding status:', error);
        return status;
    }
} 