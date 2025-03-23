'use client';

import { ChevronDown, MoreHorizontal, Plus } from 'lucide-react';
import {
    animationStyles,
    convertBankAccountsToCardData
} from '@/components/financial-overview';

import { BankAccount } from '@solomonai/prisma';
import { Button } from '@/registry/default/potion-ui/button';
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

interface SingleBankAccountClientProps {
    bankAccount: BankAccount;
}

export default function SingleBankAccountClient({
    bankAccount
}: SingleBankAccountClientProps) {
    const user = useCurrentUser();

    // Convert bank account data to the format expected by our components
    const accountType = bankAccount.type;
    // Create a proper Record<AccountType, BankAccount[]> with type assertion
    const accountsRecord = {} as Record<typeof accountType, BankAccount[]>;
    accountsRecord[accountType] = [bankAccount];

    const bankAccountCardData = convertBankAccountsToCardData(accountsRecord)[0];

    // Format total balance
    const formattedBalance = `$${(bankAccount.availableBalance || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    // Get user's name or use default
    const userName = user?.name?.split(' ')[0] || 'User';

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Apply animation styles */}
            <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

            {/* Apply hide scrollbar styles */}
            <style dangerouslySetInnerHTML={{ __html: hideScrollbarCSS }} />

            {/* Main Content */}
            <div className="flex-grow overflow-hidden">
                <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
                    <div className="mx-auto w-full max-w-[96rem] h-full flex">
                        {/* Left Panel - Account Details */}
                        <div className="w-1/2 p-8 overflow-auto no-scrollbar">
                            {/* Greeting */}
                            <h1 className="text-4xl font-semibold text-indigo-950 dark:text-white mb-12">
                                Good morning, {userName}!
                            </h1>

                            {/* Total Balance */}
                            <div className="mb-8">
                                <p className="text-lg text-gray-600 dark:text-gray-300">Total Balance</p>
                                <div className="flex items-end justify-between mt-2">
                                    <h2 className="text-5xl font-semibold text-indigo-950 dark:text-white">
                                        {formattedBalance}
                                    </h2>
                                    <div className="flex items-center mb-2 gap-4">
                                        <Button
                                            variant="outline"
                                            className="rounded-lg border border-gray-200 flex items-center gap-2 bg-white text-gray-800"
                                        >
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full overflow-hidden bg-blue-50">
                                                <span className="font-bold text-xs">$</span>
                                            </span>
                                            USD
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                        <Button className="rounded-lg bg-sky-100 text-sky-800 hover:bg-sky-200">
                                            Withdraw
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* My Wallet */}
                            <div className="mb-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-indigo-950 dark:text-white">My Wallet</h2>
                                    <Button variant="ghost" size="icon" className="text-gray-500">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="relative">
                                    {/* Black Card */}
                                    <div className="relative z-10 w-72 h-44 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 shadow-lg">
                                        <div className="flex justify-between mb-10">
                                            <span className="text-xl uppercase font-semibold tracking-widest">VISA</span>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-gray-300">{userName}</p>
                                            <p className="text-gray-300">Melasari</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-300 tracking-widest">**** **** **** {bankAccountCardData.number}</p>
                                            <p className="text-gray-300">12/25</p>
                                        </div>

                                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                                            <div className="w-8 h-6 bg-gray-400/30 rounded border border-gray-600"></div>
                                            <div className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center">
                                                <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shadow Cards */}
                                    <div className="absolute top-0 left-0 w-72 h-44 rounded-2xl bg-gray-300 dark:bg-gray-700 transform translate-x-1/3 -translate-y-2 z-0 opacity-70"></div>
                                    <div className="absolute top-0 left-0 w-72 h-44 rounded-2xl bg-gray-200 dark:bg-gray-600 transform translate-x-2/3 -translate-y-4 z-0 opacity-40"></div>
                                </div>
                            </div>

                            {/* Recent Withdrawals */}
                            <div className="mb-12">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-indigo-950 dark:text-white">Recent Withdrawals</h2>
                                    <Button variant="outline" className="text-gray-600">
                                        View all
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {/* Success Transaction */}
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium">To: Azie Melasari</p>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span>Show tracking</span>
                                                    <ChevronDown className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-800 dark:text-gray-200 font-semibold">-$5,280.00</p>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                SUCCESS
                                            </span>
                                        </div>
                                    </div>

                                    {/* Failed Transaction */}
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full relative">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                                                    !
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-medium">To: Azie Melasari</p>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span>Show tracking</span>
                                                    <ChevronDown className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-800 dark:text-gray-200 font-semibold">-$1,240.00</p>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                FAILED
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Payments */}
                            <div>
                                <h2 className="text-xl font-semibold text-indigo-950 dark:text-white mb-6">Upcoming payments</h2>
                                <div className="flex items-center text-gray-500">
                                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>No upcoming payments.</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Statistics */}
                        <div className="w-1/2 bg-gray-100 dark:bg-gray-800 p-8 overflow-auto no-scrollbar">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-semibold text-indigo-950 dark:text-white">Statistics</h2>
                                <Button variant="ghost" size="icon" className="text-gray-500">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Stats Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-4xl font-semibold text-indigo-950 dark:text-white">$10,200</h3>
                                    <span className="inline-flex items-center text-sm font-medium text-green-600">
                                        <svg className="mr-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12 7a1 1 0 01-1 1H9a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1zm-2 4a1 1 0 00-1 1v1a1 1 0 001 1h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                            <path fillRule="evenodd" d="M12 13a1 1 0 01-1 1H9a1 1 0 01-1-1v-1a1 1 0 011-1h2a1 1 0 011 1v1zm-2-8a1 1 0 00-1 1v1a1 1 0 001 1h2a1 1 0 001-1V6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                        </svg>
                                        2.8%
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <span>January - March</span>
                                    <svg className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>

                            {/* Chart Selector */}
                            <div className="flex space-x-4 mb-8">
                                <button className="px-4 py-2 text-gray-600 dark:text-gray-300">Bar Chart</button>
                                <button className="px-4 py-2 text-gray-600 dark:text-gray-300">Pie Chart</button>
                                <button className="px-4 py-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm text-indigo-800 dark:text-indigo-300 font-medium">AI Sphere</button>
                            </div>

                            {/* AI Sphere Visualization */}
                            <div className="relative h-72 flex items-center justify-center mb-8">
                                <div className="w-48 h-48 bg-gradient-to-b from-sky-100 to-white dark:from-gray-700 dark:to-gray-800 rounded-full shadow-lg flex items-center justify-center">
                                    <div className="w-40 h-40 bg-gradient-to-br from-gray-300 to-gray-100 dark:from-gray-600 dark:to-gray-400 rounded-full transform rotate-45 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-200/80 to-white/30 dark:from-gray-500/80 dark:to-gray-300/30"></div>
                                        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-gray-100/10 to-white/30 dark:via-gray-400/10 dark:to-gray-200/30"></div>
                                    </div>
                                </div>

                                <button className="absolute top-2 right-2 h-8 w-8 bg-white dark:bg-gray-700 rounded-full shadow-md flex items-center justify-center">
                                    <Plus className="h-5 w-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Monthly Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div>
                                    <h4 className="text-2xl font-semibold text-indigo-950 dark:text-white">$1,200</h4>
                                    <p className="text-gray-500">January</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-semibold text-indigo-950 dark:text-white">$2,300</h4>
                                    <p className="text-gray-500">February</p>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-semibold text-indigo-950 dark:text-white">$5,800</h4>
                                    <p className="text-gray-500">March</p>
                                </div>
                            </div>

                            {/* Chart Visualization */}
                            <div className="h-28 mb-12">
                                <div className="flex items-end justify-between h-full">
                                    {[...Array(31)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-indigo-500 dark:bg-indigo-400 rounded-t-sm"
                                            style={{ height: `${20 + Math.random() * 60}%` }}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            {/* Contracts */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-indigo-950 dark:text-white">Contracts (2)</h2>
                                    <Button className="rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm">
                                        Create a Contract
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {/* First Contract */}
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full text-white">
                                                A
                                            </div>
                                            <div>
                                                <p className="font-medium">Azie Melasari</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                                                        MONTHLY
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        ACTIVE
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p>No work submitted</p>
                                            <p className="text-sm text-gray-500">This week</p>
                                        </div>
                                    </div>

                                    {/* Second Contract */}
                                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full text-white">
                                                A
                                            </div>
                                            <div>
                                                <p className="font-medium">Azie Melasari</p>
                                                <div className="flex items-center gap-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                                                        PAY AS YOU GO
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        ACTIVE
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p>12 Hrs 30Mins</p>
                                            <p className="text-sm text-gray-500">This week</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 