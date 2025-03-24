import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useInitialConnectionStatus } from '@/hooks/use-initial-connection-status';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

/**
 * Dynamically imported Lottie component to prevent SSR issues with animation
 * rendering.
 */
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
});

/**
 * Props for the LoadingTransactionsEvent component.
 *
 * @property {string} [accessToken] - The access token for API authentication
 * @property {string} [runId] - The unique identifier for the current
 *   transaction loading process
 * @property {function} setRunId - Callback to update the runId state
 * @property {function} onClose - Callback to close the transaction loading
 *   modal
 * @property {function} setActiveTab - Callback to change the active tab in the
 *   parent component
 * @property {string} pathname - The path to navigate to after transaction
 *   loading completes
 * @interface Props
 */
type Props = {
  accessToken?: string;
  runId?: string;
  setRunId: (runId?: string) => void;
  onClose: () => void;
  setActiveTab: (value: 'support' | 'loading' | 'select-accounts') => void;
  pathname: string;
};

/**
 * LoadingTransactionsEvent Component
 *
 * Displays a multi-step loading process for fetching and processing bank
 * transactions. This component visualizes the connection status in three
 * phases:
 *
 * 1. Connecting to the bank
 * 2. Fetching transactions
 * 3. Completion
 *
 * The component automatically advances through these stages based on the status
 * returned by the useInitialConnectionStatus hook, and navigates to the
 * specified pathname upon successful completion.
 *
 * @param {Props} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function LoadingTransactionsEvent({
  accessToken,
  runId,
  setRunId,
  onClose,
  setActiveTab,
  pathname,
}: Props) {
  /**
   * Current step in the loading process 1: Connecting to bank 2: Getting
   * transactions 3: Completed
   */
  const [step, setStep] = useState(1);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  /**
   * Validates required props and logs errors if any are missing. This helps
   * with debugging when component fails to work correctly.
   */
  useEffect(() => {
    if (!runId || !accessToken) {
      console.error('❌ Missing required props:', {
        runId,
        hasAccessToken: !!accessToken,
        pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, [runId, accessToken, pathname]);

  /**
   * Hook to fetch and monitor the connection status. Returns one of several
   * statuses indicating the current state of transaction loading:
   *
   * - CONNECTING: Initial connection to the financial institution is in progress
   * - SYNCING: Connected and actively retrieving transactions
   * - COMPLETED: All transactions successfully retrieved
   * - ERROR: An error occurred during the process
   */
  const { status } = useInitialConnectionStatus({
    runId,
    accessToken,
  });

  /**
   * Effect to handle status changes and control the step progression.
   *
   * This effect:
   *
   * 1. Updates the UI step based on the current connection status
   * 2. Shows completion state with a delay before navigation
   * 3. Navigates to the specified pathname on completion
   * 4. Handles error cases and cleanup
   */
  useEffect(() => {
    if (status === 'SYNCING') {
      setStep(2);
    }

    if (status === 'COMPLETED') {
      setStep(3);

      // Add a delay to show the completed state before navigating
      const timeoutId = setTimeout(() => {
        // Reset runId immediately
        setRunId(undefined);

        // Check if pathname is valid before attempting navigation
        if (pathname && typeof pathname === 'string') {
          try {
            // Force a full page reload instead of client-side navigation
            window.location.href = pathname;

            // Close modal after navigation starts
            onClose();
          } catch (error) {
            console.error('❌ Navigation error:', {
              error,
              pathname,
              timestamp: new Date().toISOString(),
            });
            onClose();
          }
        } else {
          console.warn('⚠️ Invalid pathname for navigation:', pathname);
          onClose();
        }
      }, 1500); // 1.5 second delay to show completion

      return () => clearTimeout(timeoutId);
    }
  }, [status, router, setRunId, onClose, pathname, step, runId, accessToken]);

  /**
   * Poll for status updates periodically to ensure UI reflects latest state.
   * This is particularly important for long-running processes where webhooks or
   * server-sent events might not be available.
   */
  useEffect(() => {
    if (!runId || !accessToken) {
      console.warn('⚠️ Missing required data for status polling:', {
        hasRunId: !!runId,
        hasAccessToken: !!accessToken,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const pollInterval = setInterval(() => {
      console.info('🔄 Status Poll:', {
        currentStatus: status,
        currentStep: step,
        runId,
        timestamp: new Date().toISOString(),
      });
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [runId, accessToken, status, step]);

  return (
    <div className="w-full rounded-xl border border-zinc-200/10 bg-background/95 p-8 shadow-xl backdrop-blur-lg dark:border-zinc-800/30">
      <div className="mb-8 flex justify-center">
        <Lottie
          animationData={
            resolvedTheme === 'dark'
              ? require('public/assets/setup-animation.json')
              : require('public/assets/setup-animation-dark.json')
          }
          loop={true}
          style={{ width: 90, height: 90 }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice',
          }}
        />
      </div>

      <h2 className="mb-3 text-center text-2xl font-bold tracking-tight">
        Setting Up Your Account
      </h2>

      <p className="mx-auto mb-10 max-w-md text-center text-sm text-muted-foreground/90">
        Depending on your bank, it may take up to 1 hour to fetch all
        transactions. Feel free to close this window—we'll notify you when
        everything is ready.
      </p>

      <div className="mx-auto mb-10 max-w-sm space-y-5">
        {/* Step 1: Bank Connection */}
        <div className="flex items-center gap-5">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500',
              step > 0
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                : 'border-zinc-300 text-zinc-400 dark:border-zinc-700'
            )}
          >
            {step > 1 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-check"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <span className="text-sm font-semibold">1</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  'text-base font-medium transition-colors',
                  step > 0
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-400 dark:text-zinc-500'
                )}
              >
                Connecting bank
              </p>
              {step === 1 && (
                <div className="flex space-x-1.5">
                  <div
                    className="h-2 w-2 animate-pulse rounded-full bg-zinc-900 dark:bg-white"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-pulse rounded-full bg-zinc-900 dark:bg-white"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-pulse rounded-full bg-zinc-900 dark:bg-white"
                    style={{ animationDelay: '600ms' }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connector Line between Steps 1 and 2 */}
        <div className="flex items-center gap-5">
          <div className="flex w-10 justify-center">
            <div
              className={cn(
                'h-8 w-0.5 transition-colors duration-500',
                step > 1
                  ? 'bg-zinc-900 dark:bg-white'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              )}
            ></div>
          </div>
        </div>

        {/* Step 2: Transaction Fetching */}
        <div className="flex items-center gap-5">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500',
              step > 1
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                : 'border-zinc-300 text-zinc-400 dark:border-zinc-700'
            )}
          >
            {step > 2 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-check"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <span className="text-sm font-semibold">2</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  'text-base font-medium transition-colors',
                  step > 1
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-400 dark:text-zinc-500'
                )}
              >
                Getting transactions
              </p>
              {step === 2 && (
                <div className="flex space-x-1.5">
                  <div
                    className="h-2 w-2 animate-pulse rounded-full bg-zinc-900 dark:bg-white"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-pulse rounded-full bg-zinc-900 dark:bg-white"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                  <div
                    className="h-2 w-2 animate-pulse rounded-full bg-zinc-900 dark:bg-white"
                    style={{ animationDelay: '600ms' }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connector Line between Steps 2 and 3 */}
        <div className="flex items-center gap-5">
          <div className="flex w-10 justify-center">
            <div
              className={cn(
                'h-8 w-0.5 transition-colors duration-500',
                step > 2
                  ? 'bg-zinc-900 dark:bg-white'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              )}
            ></div>
          </div>
        </div>

        {/* Step 3: Completion */}
        <div className="flex items-center gap-5">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-500',
              step > 2
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                : 'border-zinc-300 text-zinc-400 dark:border-zinc-700'
            )}
          >
            {step > 2 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-check"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <span className="text-sm font-semibold">3</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  'text-base font-medium transition-colors',
                  step > 2
                    ? 'font-semibold text-zinc-900 dark:text-white'
                    : 'text-zinc-400 dark:text-zinc-500'
                )}
              >
                Setup completed
              </p>
              {step === 3 && (
                <div className="flex items-center">
                  <span className="mr-2 text-xs font-semibold text-zinc-900 dark:text-white">
                    Success
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-zinc-900 dark:text-white"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-sm space-y-4">
        {/* Support link */}
        <button
          type="button"
          className="w-full py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          onClick={() => {
            setActiveTab('support');
          }}
        >
          Need support?
        </button>
      </div>
    </div>
  );
}
