'use client';

import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from '@/registry/default/potion-ui/button';
import React from 'react';
import { WaitlistModal } from '../modals/waitlist-modal';
import { WaitlistSuccessToast } from './waitlist-success-toast';
import { motion } from 'framer-motion';
import { useWaitlist } from '@/hooks/use-waitlist';

/**
 * Props for the WaitlistButton component.
 * 
 * @interface WaitlistButtonProps
 * @property {string} featureName - The name of the feature for which users are joining the waitlist.
 *   This is displayed in the modal and success toast.
 * @property {string} [className] - Optional CSS class name for custom styling of the button.
 * @property {'default' | 'secondary' | 'outline' | 'ghost'} [variant='default'] - The button's visual style variant.
 * @property {'default' | 'sm' | 'lg' | 'icon'} [size='default'] - The size of the button.
 */
interface WaitlistButtonProps {
  featureName: string;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/**
 * WaitlistButton Component
 * 
 * A button component that opens a waitlist modal when clicked. It handles the entire
 * waitlist signup flow including displaying a success toast when a user successfully
 * joins a waitlist. The button includes an animated arrow icon for enhanced user experience.
 * 
 * This component uses the `useWaitlist` hook to manage its state and handle form submission.
 * 
 * @component
 * @example
 * // Basic usage with default styling
 * <WaitlistButton featureName="AI Assistant" />
 * 
 * @example
 * // Custom styling with different variant and size
 * <WaitlistButton 
 *   featureName="Premium Analytics" 
 *   variant="outline"
 *   size="lg"
 *   className="mt-4 w-full md:w-auto"
 * />
 * 
 * @example
 * // In a feature showcase section
 * <div className="feature-card">
 *   <h3>Advanced Reporting</h3>
 *   <p>Get deeper insights with our advanced reporting tools.</p>
 *   <WaitlistButton 
 *     featureName="Advanced Reporting"
 *     variant="secondary"
 *   />
 * </div>
 */
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

  /**
   * Handles the submission of the waitlist form.
   * 
   * @param {object} data - The form data
   * @param {string} data.reason - The user's reason for joining the waitlist
   * @returns {Promise<void>}
   */
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
