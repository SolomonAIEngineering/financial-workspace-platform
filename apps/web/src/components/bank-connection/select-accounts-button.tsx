'use client';

import { Button, ButtonProps } from '@/registry/default/potion-ui/button';

import { CreditCard } from 'lucide-react';
import { SelectBankAccountsModal } from '../modals/select-bank-accounts-modal';
import { useState } from 'react';

/**
 * Props for the SelectBankAccountsButton component
 *
 * @property userId - The ID of the current user (required)
 * @property teamId - The ID of the current team (required)
 * @property connectionData - Optional pre-configured connection data
 * @property buttonProps - Additional props to customize the button appearance
 * @property children - Optional children to render inside the button
 * @property openOnMount - Whether to automatically open the modal when the
 *   component mounts
 */
type SelectBankAccountsButtonProps = {
  userId: string;
  teamId: string;
  connectionData?: {
    provider: string;
    ref: string;
    institution_id: string;
    token: string;
    itemId: string;
  };
  buttonProps?: Omit<ButtonProps, 'onClick'>;
  children?: React.ReactNode;
  openOnMount?: boolean;
};

/**
 * A configurable button that opens the SelectBankAccountsModal when clicked
 *
 * This component renders a button that, when clicked, opens the
 * SelectBankAccountsModal with the specified connection data, user ID and team
 * ID. The button's appearance and behavior can be customized using the
 * buttonProps property.
 *
 * @example
 *   // Basic usage
 *   <SelectBankAccountsButton userId={user.id} teamId={team.id} />
 *
 *   // With custom styling and pre-configured connection data
 *   <SelectBankAccountsButton
 *   userId={user.id}
 *   teamId={team.id}
 *   connectionData={{
 *   provider: 'plaid',
 *   ref: 'item_id_123',
 *   institution_id: 'inst_123',
 *   token: 'access_token_123',
 *   itemId: 'item_id_123',
 *   }}
 *   buttonProps={{
 *   variant: "secondary",
 *   size: "lg",
 *   className: "w-full"
 *   }}
 *   >
 *   Select Bank Accounts
 *   </SelectBankAccountsButton>
 */
export function SelectBankAccountsButton({
  userId,
  teamId,
  connectionData = {
    provider: 'plaid',
    ref: 'kPLLLo7YMAumyL9wRgPQfeVJjjay8BFRRmvpB',
    institution_id: 'ins_127991',
    token: 'access-production-44a2eed4-de7a-45cc-9f68-d8e3c9cf7976',
    itemId: 'kPLLLo7YMAumyL9wRgPQfeVJjjay8BFRRmvpB',
  },
  buttonProps,
  children,
  openOnMount = false,
}: SelectBankAccountsButtonProps) {
  // State for controlling modal visibility
  const [isModalOpen, setIsModalOpen] = useState(openOnMount);

  // Function to open the modal
  const handleOpenModal = () => {
    console.log('Opening SelectBankAccountsModal directly');
    setIsModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = (syncCompleted?: boolean) => {
    console.log(
      'Closing SelectBankAccountsModal, syncCompleted:',
      syncCompleted
    );
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        icon={<CreditCard className="h-4 w-4" />}
        onClick={handleOpenModal}
        variant="default"
        size="xs"
        {...buttonProps}
      >
        {children || 'Select Accounts'}
      </Button>

      {/* Render the SelectBankAccountsModal when isModalOpen is true */}
      {isModalOpen && (
        <SelectBankAccountsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          provider={connectionData.provider}
          ref={connectionData.ref}
          institution_id={connectionData.institution_id}
          token={connectionData.token}
          itemId={connectionData.itemId}
          userId={userId}
          teamId={teamId}
        />
      )}
    </>
  );
}
