'use client';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/registry/default/potion-ui/button';
import React from 'react';
import { WaitlistModal } from '../modals/waitlist-modal';
import { WaitlistSuccessToast } from './waitlist-success-toast';
import { motion } from 'framer-motion';
import { useWaitlist } from '@/hooks/use-waitlist';

interface WaitlistButtonProps {
  featureName: string;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function WaitlistButton({
  featureName,
  className,
  variant = 'default',
  size = 'default',
}: WaitlistButtonProps) {
  const {
    openModal,
    closeModal,
    isModalOpen,
    status,
    error,
    submitToWaitlist,
    isSuccessToastVisible,
    closeSuccessToast,
  } = useWaitlist({ featureName });

  const handleSubmit = async (data: { reason: string }): Promise<void> => {
    await submitToWaitlist(data);
  };

  return (
    <>
      <Button
        onClick={openModal}
        variant={variant}
        size={size}
        className={className}
      >
        <motion.span
          className="flex items-center"
          initial={{ x: 0 }}
          whileHover={{ x: -4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        >
          <span>Join Waitlist</span>
          <motion.span
            className="ml-1.5"
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <ArrowRightIcon className="h-4 w-4" />
          </motion.span>
        </motion.span>
      </Button>

      <WaitlistModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        status={status}
        error={error}
        featureName={featureName}
      />

      <WaitlistSuccessToast
        isVisible={isSuccessToastVisible}
        onClose={closeSuccessToast}
        featureName={featureName}
      />
    </>
  );
}
