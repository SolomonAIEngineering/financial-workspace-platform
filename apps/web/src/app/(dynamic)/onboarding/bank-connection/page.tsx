import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { BankConnectionForm } from '@/components/form/bank-connection-form';
import { ConnectTransactionsWrapper } from '@/components/bank-connection/connect-transactions-wrapper';
import { redirect } from 'next/navigation';
import { routes } from '@/lib/navigation/routes';
import { trpc } from '@/trpc/server';

export default async function BankConnectionPage() {
    const currentUser = (await trpc.layout.app()).currentUser;

    // If user doesn't have a team or profile, redirect to appropriate step
    if (!currentUser?.teamId) {
        redirect(routes.onboardingTeam());
    }

    if (!(currentUser.name && currentUser.email && currentUser.profileImageUrl)) {
        redirect(routes.onboardingProfile());
    }

    // If user already has bank connections, redirect to completion
    if (currentUser.bankConnections && currentUser.bankConnections.length > 0) {
        redirect(routes.onboardingComplete());
    }

    return (
        <div className="flex flex-col gap-6">
            <CardHeader className="p-2">
                <div className="flex items-center mb-1">
                    <div className="h-10 w-1 bg-primary mr-3 rounded-full"></div>
                    <CardTitle className="text-3xl font-light tracking-tight">Connect Your Finances</CardTitle>
                </div>
                <CardDescription className="text-base mt-3 ml-4 text-gray-600">
                    Securely link your financial accounts to unlock the full potential of your workspace.
                </CardDescription>
            </CardHeader>

            <BankConnectionForm userId={currentUser.id} teamId={currentUser.teamId} />
            <ConnectTransactionsWrapper />
        </div>
    );
} 