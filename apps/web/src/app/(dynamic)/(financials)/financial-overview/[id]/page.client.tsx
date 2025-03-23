'use client';

import { BankAccount } from '@solomonai/prisma';
import { SingleBankAccountView } from '@/components/single-bank-view';

interface SingleBankAccountClientProps {
    bankAccount: BankAccount;
}

export default function SingleBankAccountClient({
    bankAccount,
}: SingleBankAccountClientProps) {
    return <SingleBankAccountView bankAccount={bankAccount} />;
}
