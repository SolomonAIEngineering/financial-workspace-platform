import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

import { Button } from '@/registry/default/potion-ui/button';
import Link from 'next/link';
import { Progress } from '@/registry/default/potion-ui/progress';
import { getUserOnboardingStatus } from '@/lib/onboarding';
import { trpc } from '@/trpc/server';

export async function OnboardingBanner() {
  const currentUser = (await trpc.layout.app()).currentUser;

  const { isComplete, currentStep, nextStep } = await getUserOnboardingStatus(
    currentUser?.id
  );

  // If onboarding is complete, don't show banner
  if (isComplete) {
    return null;
  }

  const progress = (currentStep / 4) * 100;
  const stepsRemaining = 4 - currentStep;

  return (
    <Alert className="mb-6">
      <AlertTitle className="flex items-center justify-between">
        <span>Complete your account setup</span>
        <Progress value={progress} className="h-2 w-24" />
      </AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          You have {stepsRemaining} {stepsRemaining === 1 ? 'step' : 'steps'}{' '}
          remaining to complete your account setup.
        </span>
        <Button asChild size="sm">
          <Link href={nextStep}>Continue Setup</Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
