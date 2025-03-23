'use client';

// Import components from financial-overview folder
import {
    AccountFilter,
    AccountFilterOption,
    BankAccountCardData,
    BankAccountDetail,
    BankAccountsHeader,
    BankAccountsList,
    WelcomeHeader,
    animationStyles,
    convertBankAccountsToCardData,
} from '@/components/financial-overview';
import { AccountType, BankAccount } from '@solomonai/prisma';
import { useEffect, useState } from 'react';

import { Button } from '@/registry/default/potion-ui/button';
import { ConnectTransactionsButton } from '@/components/bank-connection/connect-transactions-button';
import { CreditCard } from 'lucide-react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useCurrentUser } from '@/components/auth/useCurrentUser';

// Add CSS to hide scrollbars
const hideScrollbarCSS = `
::-webkit-scrollbar {
    display: none;
}

html, body {
    scrollbar-width: none;
    -ms-overflow-style: none;
    height: 100%;
    overflow: hidden;
}
`;

// Main Component
export default function FinancialOverviewClient({
    bankAccountsByType,
}: {
    bankAccountsByType?: Record<AccountType, BankAccount[]>;
}) {
    const user = useCurrentUser();
    const [accounts, setAccounts] = useState<BankAccountCardData[]>([]);
    const [selectedAccount, setSelectedAccount] =
        useState<BankAccountCardData | null>(null);
    const [activeFilter, setActiveFilter] = useState<AccountFilterOption>('all');
    const [hasAccounts, setHasAccounts] = useState(false);
    const initialSelectionMade = React.useRef(false);

    useEffect(() => {
        // If we have bank accounts, convert them to card data
        if (bankAccountsByType && Object.keys(bankAccountsByType).length > 0) {
            const convertedAccounts =
                convertBankAccountsToCardData(bankAccountsByType);
            setAccounts(convertedAccounts);
            setHasAccounts(true);

            // Select the first card by default, but only if we haven't made a selection yet
            if (convertedAccounts.length > 0 && !initialSelectionMade.current) {
                setSelectedAccount(convertedAccounts[0]);
                initialSelectionMade.current = true;
            }
        } else {
            // Reset accounts if no bank accounts
            setAccounts([]);
            setSelectedAccount(null);
            setHasAccounts(false);
            initialSelectionMade.current = false;
        }
    }, [bankAccountsByType]);

    const handleSelectAccount = (account: BankAccountCardData) => {
        setSelectedAccount(account);
    };

    const handleFilterChange = (filter: AccountFilterOption) => {
        setActiveFilter(filter);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Apply animation styles */}
            <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

            {/* Apply hide scrollbar styles */}
            <style dangerouslySetInnerHTML={{ __html: hideScrollbarCSS }} />

            {/* Main Content */}
            <div className="flex-grow overflow-hidden">
                {!hasAccounts ? (
                    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                        {/* Background gradient overlay */}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-gray-900 dark:to-gray-900"></div>

                        <div className="relative flex flex-col items-center lg:flex-row">
                            <div className="flex items-center justify-center p-8 lg:w-1/2 lg:p-12">
                                <div className="max-w-md text-center lg:text-left">
                                    <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                                        No Bank Accounts Connected
                                    </h2>
                                    <p className="mb-6 text-gray-600 dark:text-gray-300">
                                        Connect your bank accounts to view balances, track spending,
                                        and manage your finances all in one place.
                                    </p>
                                    <div className="group relative">
                                        <div className="absolute -inset-0.5 animate-pulse rounded-lg bg-primary opacity-60 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                                        <ConnectTransactionsButton
                                            userId={user?.id ?? ''}
                                            buttonProps={{
                                                size: 'lg',
                                                className:
                                                    'relative w-full bg-primary hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 overflow-hidden group-hover:scale-[1.01]',
                                            }}
                                        >
                                            <span className="relative flex items-center">
                                                <span>Connect Bank Account</span>
                                                <span className="absolute right-0 -mt-3 -mr-8 hidden animate-ping rounded-full bg-white/20 p-1 group-hover:block"></span>
                                            </span>
                                        </ConnectTransactionsButton>
                                    </div>
                                    <div className="mt-4 text-center lg:text-left">
                                        <span className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <svg
                                                className="mr-1 h-4 w-4"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M7 11V7C7 5.93913 7.42143 4.92172 8.17157 4.17157C8.92172 3.42143 9.93913 3 11 3C12.0609 3 13.0783 3.42143 13.8284 4.17157C14.5786 4.92172 15 5.93913 15 7V11"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M12 16.5C12.8284 16.5 13.5 15.8284 13.5 15C13.5 14.1716 12.8284 13.5 12 13.5C11.1716 13.5 10.5 14.1716 10.5 15C10.5 15.8284 11.1716 16.5 12 16.5Z"
                                                    fill="currentColor"
                                                />
                                            </svg>
                                            Bank-grade security & encryption
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 p-6 lg:w-1/2 lg:p-12 dark:from-gray-800 dark:to-gray-900">
                                {/* Decorative circles */}
                                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-40 w-40 rounded-full bg-indigo-500/10"></div>
                                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-40 w-40 rounded-full bg-blue-500/10"></div>

                                <div className="relative mx-auto w-full max-w-lg">
                                    {/* Decorative elements */}
                                    <div className="animate-blob absolute top-0 -left-4 h-72 w-72 rounded-full bg-blue-300 opacity-20 mix-blend-multiply blur-2xl filter dark:bg-blue-800"></div>
                                    <div className="animate-blob animation-delay-2000 absolute top-0 -right-4 h-72 w-72 rounded-full bg-indigo-300 opacity-20 mix-blend-multiply blur-2xl filter dark:bg-indigo-800"></div>
                                    <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-blue-300 opacity-20 mix-blend-multiply blur-2xl filter dark:bg-blue-800"></div>

                                    {/* Bank account illustration */}
                                    <div className="relative">
                                        <div className="aspect-7/4 transform overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
                                            <div className="absolute inset-0 opacity-20">
                                                <div className="grid h-full grid-cols-3 grid-rows-3 gap-4 p-6">
                                                    {[...Array(9)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="rounded-md bg-white/10"
                                                        ></div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20"></div>
                                            <div className="relative flex h-full flex-col justify-between p-6">
                                                <div className="flex justify-between">
                                                    <div className="h-10 w-10 rounded-md bg-white/10"></div>
                                                    <div className="h-6 w-16 rounded-md bg-white/10"></div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-6 w-full rounded-md bg-white/10"></div>
                                                    <div className="h-6 w-4/5 rounded-md bg-white/10"></div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <div className="h-8 w-20 rounded-md bg-white/10"></div>
                                                    <div className="h-8 w-20 rounded-md bg-white/10"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute -right-4 -bottom-4 -z-10 aspect-7/4 w-full rotate-3 transform rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
                                        <div className="absolute -right-2 -bottom-2 -z-20 aspect-7/4 w-full rotate-6 transform rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
                                    </div>

                                    {/* Small floating elements */}
                                    <div className="animate-float absolute top-12 -right-6 h-12 w-12 rotate-12 rounded-lg bg-white/10 backdrop-blur-sm dark:bg-white/5"></div>
                                    <div className="animate-float-delay absolute bottom-4 -left-6 h-8 w-8 -rotate-12 rounded-lg bg-white/10 backdrop-blur-sm dark:bg-white/5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full bg-white lg:relative lg:flex dark:bg-gray-900 overflow-hidden">
                        {/* Content */}
                        <div className="mx-auto w-full max-w-[96rem] px-4 py-8 sm:px-6 lg:px-8 h-full overflow-auto no-scrollbar">
                            <BankAccountsHeader userId={user?.id ?? ''} />
                            <AccountFilter onFilterChange={handleFilterChange} />
                            <BankAccountsList
                                accounts={accounts}
                                selectedAccount={selectedAccount}
                                onSelectAccount={handleSelectAccount}
                                filter={activeFilter}
                            />
                        </div>

                        {/* Modern Sidebar */}
                        <div className="h-full flex-shrink-0 lg:w-[400px]">
                            <div className="h-full no-scrollbar rounded-xl border-0 bg-white/50 shadow-lg backdrop-blur-sm lg:sticky lg:top-16 lg:ml-6 lg:overflow-x-hidden lg:overflow-y-auto lg:border-0 dark:bg-gray-800/50">
                                {/* Glass effect overlay */}
                                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-white/5 dark:from-gray-700/10 dark:to-gray-900/5"></div>
                                {/* Subtle border effect */}
                                <div className="pointer-events-none absolute inset-0 rounded-xl border border-gray-200/20 dark:border-gray-700/20"></div>

                                <div className="relative">
                                    <BankAccountDetail
                                        account={selectedAccount}
                                        hasAccounts={hasAccounts}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
