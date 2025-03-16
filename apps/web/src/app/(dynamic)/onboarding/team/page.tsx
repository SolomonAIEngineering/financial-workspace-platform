import { Building } from 'lucide-react';
import { CubeIcon } from '@radix-ui/react-icons';
import { TeamCreationForm } from '@/components/form/team-creation-form';
import { redirect } from 'next/navigation';
import { trpc } from '@/trpc/server';

export default async function TeamCreationPage() {
  const currentUser = (await trpc.layout.app()).currentUser;

  // If user already has a team, redirect to next step
  if (currentUser?.teamId) {
    redirect('/onboarding/profile');
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <CubeIcon className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Create Your Team
          </h2>
        </div>
        <p className="max-w-md text-muted-foreground">
          Set up your organization to start managing your finances. Your team
          will be the central hub for all your financial data.
        </p>
      </div>

      <TeamCreationForm />
    </div>
  );
}
