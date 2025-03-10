'use client';

import { ConnectTransactionsModal } from '../modals/connect-transactions-modal';
import { useConnectParams } from '@/lib/hooks/use-connect-params';
import { useConnectTransactions } from './connect-transactions-context';

/**
 * A wrapper component that uses the ConnectTransactionsContext to control
 * the ConnectTransactionsModal. This component should be placed at the root
 * of your application or in a layout component.
 */
export function ConnectTransactionsWrapper() {
    const { isOpen, countryCode, userId, closeModal } = useConnectTransactions();

    // Get the setParams function from useConnectParams to properly manage modal state
    const { setParams } = useConnectParams(countryCode);

    // When the modal is opened through our context, we need to set the 'step' parameter
    // to 'connect' to ensure the internal modal logic works correctly
    if (isOpen) {
        // Use setTimeout to avoid React state update warnings
        setTimeout(() => {
            setParams({ step: 'connect', countryCode });
        }, 0);
    }

    // Custom handleClose to call the closeModal function from context
    // and also reset the URL parameters
    const handleClose = () => {
        closeModal();
        setParams({
            step: null,
            countryCode: null,
            q: null,
            ref: null,
        }, {
            shallow: false,
        });
    };

    return (
        <ConnectTransactionsModal
            countryCode={countryCode}
            userId={userId}
            _isOpenOverride={isOpen}
            _onCloseOverride={handleClose}
        />
    );
} 