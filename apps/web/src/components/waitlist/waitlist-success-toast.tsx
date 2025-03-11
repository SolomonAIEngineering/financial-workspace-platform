'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';

/**
 * Props for the WaitlistSuccessToast component.
 * 
 * @interface WaitlistSuccessToastProps
 * @property {boolean} isVisible - Controls whether the toast is displayed.
 * @property {() => void} onClose - Callback function to close the toast.
 * @property {string} featureName - The name of the feature for which the user joined the waitlist.
 *   This will be displayed in the toast message.
 * @property {number} [autoCloseDelay=5000] - Time in milliseconds after which the toast 
 *   will automatically close. Default is 5000ms (5 seconds).
 */
interface WaitlistSuccessToastProps {
  isVisible: boolean;
  onClose: () => void;
  featureName: string;
  autoCloseDelay?: number;
}

/**
 * WaitlistSuccessToast Component
 * 
 * A toast notification component that displays a success message when a user
 * successfully joins a waitlist. The toast shows in the bottom-right corner
 * with an animation and automatically disappears after a configurable delay.
 * 
 * This component uses Framer Motion for smooth enter/exit animations and
 * includes a check icon for visual confirmation.
 * 
 * @component
 * @example
 * // Basic usage
 * const [isVisible, setIsVisible] = useState(false);
 * 
 * <WaitlistSuccessToast
 *   isVisible={isVisible}
 *   onClose={() => setIsVisible(false)}
 *   featureName="Premium Plan"
 * />
 * 
 * @example
 * // With custom auto-close delay (10 seconds)
 * <WaitlistSuccessToast
 *   isVisible={showToast}
 *   onClose={handleCloseToast}
 *   featureName="Analytics Dashboard"
 *   autoCloseDelay={10000}
 * />
 * 
 * @example
 * // In a component that manages waitlist state
 * function FeatureWaitlist() {
 *   const [isToastVisible, setIsToastVisible] = useState(false);
 *   
 *   const handleJoinWaitlist = async () => {
 *     // API call to join waitlist
 *     await joinWaitlistAPI();
 *     setIsToastVisible(true);
 *   };
 *   
 *   return (
 *     <>
 *       <button onClick={handleJoinWaitlist}>Join Waitlist</button>
 *       
 *       <WaitlistSuccessToast
 *         isVisible={isToastVisible}
 *         onClose={() => setIsToastVisible(false)}
 *         featureName="Developer API"
 *       />
 *     </>
 *   );
 * }
 */
export function WaitlistSuccessToast({
  isVisible,
  onClose,
  featureName,
  autoCloseDelay = 5000,
}: WaitlistSuccessToastProps) {
  /**
   * Effect to automatically close the toast after the specified delay.
   * The timer is cleared if the toast becomes invisible or when the component unmounts.
   */
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, autoCloseDelay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed right-5 bottom-5 z-[200] w-full max-w-sm overflow-hidden rounded-lg border border-border/50 bg-card shadow-lg md:right-8 md:bottom-8"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', damping: 20, stiffness: 300 },
          }}
          exit={{
            opacity: 0,
            y: 20,
            scale: 0.95,
            transition: { duration: 0.2 },
          }}
        >
          <div className="relative flex items-start p-4">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="ml-3 flex-1 pt-0.5">
              <p className="text-sm font-medium text-foreground">
                Thank you for your interest!
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                You've been added to the {featureName} waitlist. We'll notify
                you as soon as it's available.
              </p>
            </div>
            <button
              type="button"
              className="ml-2 flex-shrink-0 rounded-md bg-transparent p-1 hover:bg-background/50"
              onClick={onClose}
            >
              <XMarkIcon className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
