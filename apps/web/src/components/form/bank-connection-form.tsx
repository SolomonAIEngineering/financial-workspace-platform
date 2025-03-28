'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '@/registry/default/potion-ui/button';
import { ConnectTransactionsButton } from '../bank-connection/connect-transactions-button';
import { ConnectTransactionsModal } from '@/components/modals/connect-transactions-modal';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { routes } from '@/lib/navigation/routes';
import { skipBankConnection } from '@/actions/bank/skip-bank-connection';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface BankConnectionFormProps {
  userId: string;
  teamId: string;
  redirectTo?: string;
}

export function BankConnectionForm({
  userId,
  teamId,
  redirectTo = routes.onboardingComplete(),
}: BankConnectionFormProps) {
  const router = useRouter();
  const [isSkipping, setIsSkipping] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 250,
        damping: 25,
      },
    },
  };

  async function handleSkip() {
    setIsSkipping(true);

    try {
      const promise = skipBankConnection();

      toast.promise(promise, {
        loading: 'Skipping bank connection...',
        success: 'Successfully skipped. You can connect your accounts later!',
        error: 'There was an issue skipping. Please try again.',
      });

      await promise;

      // Add small delay to ensure toast is visible
      setTimeout(() => {
        // NOTE: this redirect to will always be onboarding/complete
        // because we want to redirect to the complete page after skipping
        router.push(redirectTo);
      }, 1500);
    } catch (error) {
      console.error('Failed to skip bank connection:', error);
    } finally {
      setIsSkipping(false);
    }
  }

  return (
    <>
      <motion.div
        className="grid gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Card className="overflow-hidden rounded-2xl border-0 shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="absolute inset-0 z-0 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 opacity-50"></div>

            <div className="relative z-10">
              <CardContent className="pb-8">
                <div className="space-y-6 px-4 py-6">
                  <motion.div
                    className="flex items-start space-x-5"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex-shrink-0 rounded-xl bg-primary/10 p-3">
                      <svg
                        className="h-6 w-6 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22 10H2M22 12V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.7157 21.2843 5.40974 20.908 5.21799C20.4802 5 19.9201 5 18.8 5H5.2C4.07989 5 3.51984 5 3.09202 5.21799C2.7157 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.0799 2 8.2V15.8C2 16.9201 2 17.4802 2.21799 17.908C2.40973 18.2843 2.71569 18.5903 3.09202 18.782C3.51984 19 4.07989 19 5.2 19H18.8C19.9201 19 20.4802 19 20.908 18.782C21.2843 18.5903 21.5903 18.2843 21.782 17.908C22 17.4802 22 16.9201 22 15.8V12ZM16 15H16.01M12 15H14M6 15H8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Real-time Financial Dashboard
                      </h3>
                      <p className="mt-1 text-gray-500">
                        View all your accounts in one unified workspace with
                        automatic categorization.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="flex items-start space-x-5"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex-shrink-0 rounded-xl bg-primary/10 p-3">
                      <svg
                        className="h-6 w-6 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Enhanced Transaction Analysis
                      </h3>
                      <p className="mt-1 text-gray-500">
                        Gain insights with AI-powered transaction categorization
                        and spending patterns.
                      </p>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-6 px-4">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ConnectTransactionsButton
                      redirectTo={redirectTo}
                      userId={userId}
                      buttonProps={{
                        size: 'default',
                        className: cn(
                          'w-full py-6 text-base font-medium rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300'
                        ),
                      }}
                    >
                      Connect Financial Accounts
                    </ConnectTransactionsButton>
                  </motion.div>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="overflow-hidden rounded-xl border-0 bg-muted/5 shadow-sm backdrop-blur-lg transition-all duration-300 hover:bg-white/5">
            <div className="flex flex-col items-center justify-between p-6 md:flex-row">
              <div className="flex-1">
                <CardTitle className="text-xl font-light">
                  Skip for Now
                </CardTitle>
                <CardDescription className="mt-1 max-w-md text-sm text-gray-500">
                  You can connect your accounts later from your dashboard.
                </CardDescription>
              </div>
              <div className="mt-4 md:mt-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="min-w-[140px] rounded-xl border-gray-200 transition-all duration-300 hover:bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                    disabled={isSkipping}
                    onClick={handleSkip}
                    size="default"
                  >
                    {isSkipping ? 'Skipping...' : 'Skip This Step'}
                  </Button>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {showConnectModal && (
        <ConnectTransactionsModal
          countryCode="US"
          userId={userId}
          teamId={teamId}
          _isOpenOverride={showConnectModal}
          _onCloseOverride={() => setShowConnectModal(false)}
          pathname={redirectTo}
        />
      )}
    </>
  );
}
