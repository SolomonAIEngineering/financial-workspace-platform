'use client';

import React, { ReactNode } from 'react';

import { WaitlistModal } from '../modals/waitlist-modal';
import { WaitlistSuccessToast } from './waitlist-success-toast';
import { motion } from 'framer-motion';
import { useWaitlist } from '@/hooks/use-waitlist';

interface WaitlistFeatureProps {
  featureName: string;
  buttonIcon?: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  buttonText?: string;
  customTrigger?: ReactNode;
}

/**
 * A unified component that handles the waitlist functionality including the
 * modal, success toast, and optionally the trigger button. Uses the Dialog
 * component from the registry for better positioning and accessibility.
 */
export function WaitlistFeature({
  featureName,
  buttonIcon: ButtonIcon,
  buttonText = 'Join Waitlist',
  customTrigger,
}: WaitlistFeatureProps) {
  const {
    status,
    error,
    isModalOpen,
    isSuccessToastVisible,
    openModal,
    closeModal,
    submitToWaitlist,
    closeSuccessToast,
  } = useWaitlist({ featureName });

  // Default button if no custom trigger is provided
  const defaultTrigger = (
    <motion.div
      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border/40 bg-background/80 px-3.5 py-2 text-sm font-medium shadow-sm backdrop-blur-md transition-all duration-200"
      whileHover={{ scale: 1.02, borderColor: 'rgba(var(--primary-rgb), 0.3)' }}
      whileTap={{ scale: 0.98 }}
      onClick={openModal}
    >
      {ButtonIcon && <ButtonIcon className="h-4 w-4 text-primary/80" />}
      <span>{buttonText}</span>
    </motion.div>
  );

  // Render the trigger (either custom or default)
  const renderTrigger = () => {
    if (customTrigger) {
      return <div onClick={openModal}>{customTrigger}</div>;
    }
    return defaultTrigger;
  };

  return (
    <>
      {/* Render the trigger button */}
      {renderTrigger()}

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={submitToWaitlist}
        status={status}
        error={error}
        featureName={featureName}
      />

      {/* Success Toast */}
      <WaitlistSuccessToast
        isVisible={isSuccessToastVisible}
        onClose={closeSuccessToast}
        featureName={featureName}
      />
    </>
  );
}
