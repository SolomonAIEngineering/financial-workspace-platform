'use client';

import React, { ReactNode, createContext, useContext, useState } from 'react';

type ConnectTransactionsContextType = {
  isOpen: boolean;
  countryCode: string;
  userId: string;
  teamId: string;
  openModal: (countryCode?: string, userId?: string, teamId?: string) => void;
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
  defaultTeamId?: string;
};

export function ConnectTransactionsProvider({
  children,
  defaultCountryCode = 'US',
  defaultUserId = '',
  defaultTeamId = '',
}: ConnectTransactionsProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [userId, setUserId] = useState(defaultUserId);
  const [teamId, setTeamId] = useState(defaultTeamId);

  const openModal = (
    newCountryCode?: string,
    newUserId?: string,
    newTeamId?: string
  ) => {
    if (newCountryCode) setCountryCode(newCountryCode);
    if (newUserId) setUserId(newUserId);
    if (newTeamId) setTeamId(newTeamId);
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
        teamId,
        openModal,
        closeModal,
      }}
    >
      {children}
    </ConnectTransactionsContext.Provider>
  );
}
