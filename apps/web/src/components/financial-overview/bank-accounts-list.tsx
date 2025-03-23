import { AccountFilterOption } from './account-filter';
import { BankAccountCardData } from './types';
import { BankAccountItem } from './bank-account-item';
import React from 'react';

/** Props for the BankAccountsList component */
interface BankAccountsListProps {
    /** Array of bank account data to display */
    accounts: BankAccountCardData[];

    /** The currently selected account, if any */
    selectedAccount: BankAccountCardData | null;

    /**
     * Callback function when an account is selected
     *
     * @param account - The selected account
     */
    onSelectAccount: (account: BankAccountCardData) => void;

    /** Current filter applied to the accounts list */
    filter: AccountFilterOption;
}

/**
 * Renders a list of bank accounts that can be filtered and selected
 *
 * @param accounts - Array of bank account data to display
 * @param selectedAccount - The currently selected account, if any
 * @param onSelectAccount - Callback function when an account is selected
 * @param filter - Current filter applied to the accounts list
 */
export const BankAccountsList: React.FC<BankAccountsListProps> = ({
    accounts,
    selectedAccount,
    onSelectAccount,
    filter,
}) => {
    const filteredAccounts =
        filter === 'all'
            ? accounts
            : accounts.filter(
                (account) =>
                    (filter === 'checking' && account.type.includes('CHECKING')) ||
                    (filter === 'savings' && account.type.includes('SAVINGS'))
            );

    if (filteredAccounts.length === 0) {
        return (
            <div className="rounded-lg border bg-gray-50 p-6 py-10 text-center dark:bg-gray-800/50">
                <p className="text-gray-500 dark:text-gray-400">
                    No {filter !== 'all' ? filter : ''} accounts found.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {filteredAccounts.map((account) => (
                <BankAccountItem
                    key={account.id}
                    account={account}
                    isSelected={selectedAccount?.id === account.id}
                    onSelect={onSelectAccount}
                />
            ))}
        </div>
    );
};
