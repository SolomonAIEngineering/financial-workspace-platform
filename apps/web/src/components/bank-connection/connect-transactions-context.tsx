'use client';

import React, { ReactNode, createContext, useContext, useState } from 'react';

type ConnectTransactionsContextType = {
  isOpen: boolean;
  countryCode: string;
  userId: string;
  openModal: (countryCode?: string, userId?: string) => void;
  closeModal: () => void;
};

const ConnectTransactionsContext = createContext<
  ConnectTransactionsContextType | undefined
>(undefined);

export function useConnectTransactions() {
  const context = useContext(ConnectTransactionsContext);

  if (!context) {
    throw new Error(
      'useConnectTransactions must be used within a ConnectTransactionsProvider'
    );
  }

  return context;
}

type ConnectTransactionsProviderProps = {
  children: ReactNode;
  defaultCountryCode?: string;
  defaultUserId?: string;
};

export function ConnectTransactionsProvider({
  children,
  defaultCountryCode = 'US',
  defaultUserId = '',
}: ConnectTransactionsProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [userId, setUserId] = useState(defaultUserId);

  const openModal = (newCountryCode?: string, newUserId?: string) => {
    if (newCountryCode) setCountryCode(newCountryCode);
    if (newUserId) setUserId(newUserId);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <ConnectTransactionsContext.Provider
      value={{
        isOpen,
        countryCode,
        userId,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ConnectTransactionsContext.Provider>
  );
}
