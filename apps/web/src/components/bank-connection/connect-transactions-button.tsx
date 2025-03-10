'use client';

import { Button, ButtonProps } from '@/registry/default/potion-ui/button';

import { Building } from 'lucide-react';
import { useConnectTransactions } from './connect-transactions-context';
import { useEffect } from 'react';

/**
 * Props for the ConnectTransactionsButton component
 * 
 * @property countryCode - The country code to use for institution search (default: 'US')
 * @property userId - The ID of the current user (required)
 * @property buttonProps - Additional props to customize the button appearance and behavior
 * @property children - Optional children to render inside the button
 * @property openOnMount - Whether to automatically open the modal when the component mounts
 */
type ConnectTransactionsButtonProps = {
    countryCode?: string;
    userId: string;
    buttonProps?: Omit<ButtonProps, 'onClick'>;
    children?: React.ReactNode;
    openOnMount?: boolean;
};

/**
 * A configurable button that opens the ConnectTransactionsModal when clicked
 * 
 * This component renders a button that, when clicked, opens the ConnectTransactionsModal
 * with the specified country code and user ID. The button's appearance and behavior
 * can be customized using the buttonProps property.
 *
 * @example
 * // Basic usage
 * <ConnectTransactionsButton userId={user.id} />
 * 
 * // With custom styling
 * <ConnectTransactionsButton 
 *   userId={user.id}
 *   countryCode="CA"
 *   buttonProps={{ 
 *     variant: "secondary",
 *     size: "lg",
 *     className: "w-full"
 *   }}
 * >
 *   Connect Bank Account
 * </ConnectTransactionsButton>
 * 
 * // Open automatically on mount
 * <ConnectTransactionsButton userId={user.id} openOnMount />
 */
export function ConnectTransactionsButton({
    countryCode = 'US',
    userId,
    buttonProps,
    children,
    openOnMount = false,
}: ConnectTransactionsButtonProps) {
    // Use the context to control the modal
    const { openModal } = useConnectTransactions();

    // Function to open the modal directly via context
    const handleOpenModal = () => {
        openModal(countryCode, userId);
    };

    // Open the modal automatically if openOnMount is true
    useEffect(() => {
        if (openOnMount) {
            handleOpenModal();
        }
    }, [openOnMount]);

    return (
        <Button
            icon={<Building className="h-4 w-4" />}
            onClick={handleOpenModal}
            variant="default"
            size="xs"
            {...buttonProps}
        >
            {children || 'Connect Bank'}
        </Button>
    );
} 