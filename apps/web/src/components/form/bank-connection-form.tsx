'use client';

import { Building, CreditCard, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Button } from '@/registry/default/potion-ui/button';
import { ConnectTransactionsModal } from '@/components/modals/connect-transactions-modal';
import { skipBankConnection } from '@/actions/bank/skip-bank-connection';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Note: This is a simplified version. In a real implementation,
// you would integrate with Plaid or another banking API

interface BankConnectionFormProps {
    userId: string;
    teamId: string;
}

export function BankConnectionForm({ userId, teamId }: BankConnectionFormProps) {
    const router = useRouter();
    const [isSkipping, setIsSkipping] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [connectionType, setConnectionType] = useState<'bank' | 'credit' | null>(null);

    async function handleSkip() {
        setIsSkipping(true);

        try {
            await skipBankConnection();
            router.push('/onboarding/complete');
        } catch (error) {
            console.error('Failed to skip bank connection:', error);
        } finally {
            setIsSkipping(false);
        }
    }

    function handleOpenConnectModal(type: 'bank' | 'credit') {
        setConnectionType(type);
        setShowConnectModal(true);
    }

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenConnectModal('bank')}>
                    <CardHeader>
                        <Building className="h-8 w-8 text-primary" />
                        <CardTitle className="mt-4">Connect Bank Account</CardTitle>
                        <CardDescription>
                            Connect your checking or savings accounts to track balances and transactions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full">
                            Connect Bank
                        </Button>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenConnectModal('credit')}>
                    <CardHeader>
                        <CreditCard className="h-8 w-8 text-primary" />
                        <CardTitle className="mt-4">Connect Credit Card</CardTitle>
                        <CardDescription>
                            Connect your credit cards to track spending and manage payments.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full">
                            Connect Card
                        </Button>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <DollarSign className="h-8 w-8 text-muted-foreground" />
                        <CardTitle className="mt-4">Skip for Now</CardTitle>
                        <CardDescription>
                            You can connect your accounts later from the dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled={isSkipping}
                            onClick={handleSkip}
                        >
                            {isSkipping ? 'Skipping...' : 'Skip This Step'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {showConnectModal && (
                <ConnectTransactionsModal
                    countryCode="US"
                    userId={userId}
                    _isOpenOverride={showConnectModal}
                    _onCloseOverride={() => setShowConnectModal(false)}
                />
            )}
        </>
    );
} 