import { ProfileForm } from '@/components/form/profile-form';
import { getAuth } from '@/lib/auth';
import { prisma } from '@/server/db';
import { redirect } from 'next/navigation';
import { routes } from '@/lib/navigation/routes';
import { trpc } from '@/trpc/server';

export default async function ProfilePage() {
  const currentUser = (await trpc.layout.app()).currentUser;

  // If user doesn't have a team yet, redirect to team creation
  if (currentUser?.teamId) {
    redirect(routes.onboardingTeam());
  }

  // If user already has a complete profile, redirect to next step
  if (currentUser?.name && currentUser?.email && currentUser?.profileImageUrl) {
    redirect('/onboarding/bank-connection');
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold">Complete Your Profile</h2>
        <p className="text-muted-foreground">
          Tell us a bit about yourself to personalize your experience.
        </p>
      </div>

      <ProfileForm
        userId={currentUser.id}
        initialData={{
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          profileImageUrl: currentUser?.profileImageUrl || '',
          firstName: currentUser?.firstName || '',
          lastName: currentUser?.lastName || '',
        }}
      />
    </div>
  );
}
