import { BankConnectionForm } from '@/components/form/bank-connection-form';
import { redirect } from 'next/navigation';
import { trpc } from '@/trpc/server';

export default async function BankConnectionPage() {
    const currentUser = (await trpc.layout.app()).currentUser;

    // If user doesn't have a team or profile, redirect to appropriate step
    if (!currentUser?.teamId) {
        redirect('/onboarding/team');
    }

    if (!(currentUser.name && currentUser.email && currentUser.profileImageUrl)) {
        redirect('/onboarding/profile');
    }

    // If user already has bank connections, redirect to completion
    if (currentUser.bankConnections && currentUser.bankConnections.length > 0) {
        redirect('/onboarding/complete');
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-bold">Connect Your Bank</h2>
                <p className="text-muted-foreground">
                    Connect your bank accounts to start tracking your finances.
                </p>
            </div>

            <BankConnectionForm userId={currentUser.id} teamId={currentUser.teamId} />
        </div>
    );
} 