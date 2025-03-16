import { useEffect, useState } from 'react';

import { getCookie } from 'cookies-next';
import { routes } from '@/lib/navigation/routes';

/** Interface for user onboarding status */
export interface OnboardingStatus {
  hasTeam: boolean;
  hasProfile: boolean;
  hasBankConnection: boolean;
  hasBankSkipped: boolean;
  isComplete: boolean;
  nextStep: string;
  isLoading: boolean;
}

/**
 * Hook to check the user's onboarding status
 *
 * This hook fetches the user's data from the /api/auth/me endpoint and combines
 * it with cookie information to determine onboarding status.
 *
 * @returns The user's onboarding status
 */
export function useOnboardingStatus(): OnboardingStatus {
  const [status, setStatus] = useState<OnboardingStatus>({
    hasTeam: false,
    hasProfile: false,
    hasBankConnection: false,
    hasBankSkipped: false,
    isComplete: false,
    nextStep: routes.onboardingTeam(),
    isLoading: true,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Fetch user data from the API
        const response = await fetch('/api/auth/me');

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();

        // Check if user has skipped bank connection using client-side cookie
        const hasBankSkipped = getCookie('onboarding-bank-skipped') === 'true';

        // Check if user has a team
        const hasTeam = Boolean(userData.teamId);

        // Check if user has completed profile
        const hasProfile = Boolean(
          userData.name && userData.email && userData.profileImageUrl
        );

        // Check if user has connected a bank account
        const hasBankConnection =
          userData.bankConnections && userData.bankConnections.length > 0;

        // Determine next step
        let nextStep = routes.onboardingTeam();

        if (hasTeam) {
          nextStep = routes.onboardingProfile();
        }

        if (hasTeam && hasProfile) {
          nextStep = routes.onboardingBankConnections();
        }

        // Check if onboarding is complete
        const isComplete =
          hasTeam && hasProfile && (hasBankConnection || hasBankSkipped);

        if (isComplete) {
          nextStep = routes.dashboard();
        }

        setStatus({
          hasTeam,
          hasProfile,
          hasBankConnection,
          hasBankSkipped,
          isComplete,
          nextStep,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching onboarding status:', error);
        setStatus((prev) => ({ ...prev, isLoading: false }));
      }
    };

    void fetchStatus();
  }, []);

  return status;
}
