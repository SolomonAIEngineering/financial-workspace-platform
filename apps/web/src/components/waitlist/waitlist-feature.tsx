'use client';

import React, { ReactNode } from 'react';

import { WaitlistModal } from '../modals/waitlist-modal';
import { WaitlistSuccessToast } from './waitlist-success-toast';
import { motion } from 'framer-motion';
import { useWaitlist } from '@/hooks/use-waitlist';

/**
 * Props for the WaitlistFeature component.
 * 
 * @interface WaitlistFeatureProps
 * @property {string} featureName - The name of the feature for which users are joining the waitlist.
 *   This name is displayed in the modal and success toast.
 * @property {React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>} [buttonIcon] - Optional icon component 
 *   to display in the default trigger button. Should be a React SVG component.
 * @property {string} [buttonText='Join Waitlist'] - Text to display on the default trigger button.
 * @property {ReactNode} [customTrigger] - Optional custom trigger element to replace the default button.
 *   When provided, this element will be wrapped with a click handler to open the modal.
 */
interface WaitlistFeatureProps {
  featureName: string;
  buttonIcon?: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  buttonText?: string;
  customTrigger?: ReactNode;
}

/**
 * WaitlistFeature Component
 * 
 * A flexible component for implementing waitlist functionality with customizable triggers. 
 * This component encapsulates the entire waitlist flow including modal display, form submission,
 * and success notification.
 * 
 * The component can either use its built-in styled button as a trigger or accept a custom trigger element.
 * It uses the `useWaitlist` hook to manage state and handle the waitlist submission process.
 * 
 * @component
 * @example
 * // Basic usage with default button
 * <WaitlistFeature featureName="Enterprise Plan" />
 * 
 * @example
 * // With custom button text and an icon
 * import { SparklesIcon } from '@heroicons/react/24/outline';
 * 
 * <WaitlistFeature 
 *   featureName="AI Analytics"
 *   buttonText="Get Early Access"
 *   buttonIcon={SparklesIcon}
 * />
 * 
 * @example
 * // With a completely custom trigger element
 * <WaitlistFeature
 *   featureName="Developer API"
 *   customTrigger={
 *     <div className="custom-card p-4 hover:bg-blue-50">
 *       <h3>Developer API</h3>
 *       <p>Integrate our services directly into your application.</p>
 *       <span className="text-primary font-medium">Request Access →</span>
 *     </div>
 *   }
 * />
 * 
 * @example
 * // In a feature grid
 * <div className="grid grid-cols-2 gap-4">
 *   {features.map(feature => (
 *     <WaitlistFeature
 *       key={feature.id}
 *       featureName={feature.name}
 *       buttonIcon={feature.icon}
 *       buttonText={`Join ${feature.name} Waitlist`}
 *     />
 *   ))}
 * </div>
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

  /**
   * Default button trigger with animations and styling.
   * Used when no custom trigger is provided.
   */
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

  /**
   * Renders either the custom trigger or the default trigger button.
   * If a custom trigger is provided, it wraps it with the onClick handler.
   * 
   * @returns {ReactNode} The trigger element to render
   */
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
