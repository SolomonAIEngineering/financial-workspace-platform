import { Button } from '@/registry/default/potion-ui/button';
import { CheckCircle } from 'lucide-react';
import { Link } from '@/components/ui/link';
import { redirect } from 'next/navigation';
import { routes } from '@/lib/navigation/routes';
import { trpc } from '@/trpc/server';

export default async function CompletePage() {
  const currentUser = (await trpc.layout.app()).currentUser;

  const hasProfile = Boolean(
    currentUser?.name && currentUser?.email && currentUser?.profileImageUrl
  );

  // If any required step is incomplete, redirect to the appropriate step
  if (!currentUser?.teamId) {
    redirect(routes.onboardingTeam());
  }

  if (!hasProfile) {
    redirect(routes.onboardingProfile());
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <CheckCircle className="h-16 w-16 text-primary" />

      <div>
        <h2 className="text-2xl font-bold">Setup Complete!</h2>
        <p className="text-muted-foreground">
          You're all set to start managing your finances with Solomon AI.
        </p>
      </div>

      <Button asChild size="lg">
        <Link href={routes.dashboard()}>Go to Dashboard</Link>
      </Button>
    </div>
  );
}
