'use client';

import { useEffect, useRef } from 'react';

import { ConnectTransactionsModal } from '../modals/connect-transactions-modal';
import { useConnectParams } from '@/hooks/use-connect-params';
import { useConnectTransactions } from './connect-transactions-context';

/**
 * A wrapper component that uses the ConnectTransactionsContext to control the
 * ConnectTransactionsModal. This component should be placed at the root of your
 * application or in a layout component.
 */
export function ConnectTransactionsWrapper() {
  const { isOpen, countryCode, userId, teamId, closeModal } =
    useConnectTransactions();

  // Get the setParams function from useConnectParams to properly manage modal state
  const { setParams, step } = useConnectParams(countryCode);

  // Use a ref to track previous isOpen state to avoid unnecessary updates
  const prevIsOpenRef = useRef(isOpen);

  // Move the state update to useEffect to avoid render phase updates
  useEffect(() => {
    // Only update params when isOpen changes from false to true
    if (isOpen && !prevIsOpenRef.current && step !== 'connect') {
      // Update URL parameters when modal is opened through context
      void setParams({ step: 'connect', countryCode });
    }

    // Update the ref to track the current value
    prevIsOpenRef.current = isOpen;
  }, [isOpen, countryCode, setParams, step]);

  // Custom handleClose to call the closeModal function from context
  // and also reset the URL parameters
  const handleClose = async () => {
    closeModal();
    await setParams(
      {
        step: null,
        countryCode: null,
        q: null,
        ref: null,
      },
      {
        shallow: false,
      }
    );
  };

  return (
    <ConnectTransactionsModal
      countryCode={countryCode}
      userId={userId}
      teamId={teamId}
      _isOpenOverride={isOpen}
      _onCloseOverride={handleClose}
    />
  );
}
