'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { api, useTRPC } from '@/trpc/react';
import { useEffect, useState } from 'react';

import { Icons } from '../ui/icons';
import { Input } from '@/registry/default/potion-ui/input';
import { Label } from '../ui/label';
import { Progress } from '@/registry/default/potion-ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useInvalidateSessionMutation } from '../auth/useLogoutMutation';
import { useQuery } from '@tanstack/react-query';

export function DeleteAccountButton() {
  const trpc = useTRPC();
  const { data: userSettings } = useQuery(trpc.user.getSettings.queryOptions());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);
  const [deletionStage, setDeletionStage] = useState(0); // 0: Initial, 1: Email entered, 2: Final confirmation
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const invalidateSession = useInvalidateSessionMutation();

  // Animation for the danger icon pulse effect
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    if (isDeleteDialogOpen) {
      // Start pulse animation after dialog opens
      const timer = setTimeout(() => setIsPulsing(true), 300);
      return () => clearTimeout(timer);
    } else {
      setIsPulsing(false);
      setConfirmEmail('');
      setDeletionStage(0);
      setIsCountingDown(false);
      setCountdown(3);
    }
  }, [isDeleteDialogOpen]);

  // Check if email is valid
  useEffect(() => {
    const isValid = confirmEmail === userSettings?.email;
    setIsConfirmEnabled(isValid);

    // Advance to stage 1 if email is valid
    if (isValid && deletionStage === 0) {
      setDeletionStage(1);
    } else if (!isValid && deletionStage === 1) {
      setDeletionStage(0);
    }
  }, [confirmEmail, userSettings?.email, deletionStage]);

  // Handle countdown timer
  useEffect(() => {
    if (!isCountingDown) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      void handleDeleteAccount();
    }
  }, [countdown, isCountingDown]);

  const deleteAccountMutation = api.user.deleteAccount.useMutation({
    onError: (error) => {
      toast.error(`Failed to delete account: ${error.message}`);
      setIsCountingDown(false);
      setCountdown(3);
    },
    onSuccess: async () => {
      toast.success('Account deleted successfully');

      // First invalidate the session to clear cookies and auth data
      try {
        await invalidateSession.mutateAsync();
        console.log('Session invalidated successfully');
      } catch (error) {
        console.error('Failed to invalidate session:', error);
      }

      // Additional step: try a hard refresh approach to clear cookies
      // Show a message for a brief period before redirecting
      toast.info('Redirecting to homepage...');

      // sleep for 1 second to allow toasts to be seen
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Force a complete reload from server rather than using cache
      // This approach is more likely to respect updated cookie state
      window.location.href = '/?logout=true&t=' + Date.now();
    },
  });

  const startDeletionProcess = () => {
    setDeletionStage(2);
  };

  const confirmFinalDeletion = () => {
    setIsCountingDown(true);
  };

  const handleDeleteAccount = async () => {
    if (confirmEmail === userSettings?.email) {
      // delete the account and all references
      await deleteAccountMutation.mutate();
    }
  };

  const cancelDeletion = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="group flex h-auto w-full cursor-pointer items-center justify-between rounded-xl border border-transparent bg-gradient-to-r from-transparent to-destructive/5 p-4 transition-all duration-300 ease-in-out hover:border-destructive/20 hover:from-destructive/5 hover:to-destructive/10 hover:shadow-sm"
          role="button"
        >
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10">
                <Icons.trash className="size-3.5 text-destructive" />
              </div>
              <Label className="text-base font-semibold text-destructive">
                Delete my account
              </Label>
            </div>
            <p className="pl-8 text-sm text-muted-foreground">
              Permanently delete the account and remove access from all
              workspaces.
            </p>
          </div>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background transition-all duration-300 group-hover:bg-destructive/10 group-hover:shadow-sm">
            <Icons.chevronRight className="size-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-destructive" />
          </div>
        </motion.div>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md overflow-hidden border-none p-0 shadow-xl">
        {/* Top warning band with animated gradient */}
        <motion.div
          className="h-2 w-full bg-gradient-to-r from-red-500 via-destructive to-red-500"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        <div className="p-6">
          <AlertDialogHeader className="pb-2">
            <motion.div
              initial={{ scale: 1 }}
              animate={{
                scale: isPulsing ? [1, 1.05, 1] : 1,
                boxShadow: isPulsing
                  ? [
                      '0 0 0 0 rgba(239, 68, 68, 0)',
                      '0 0 0 10px rgba(239, 68, 68, 0.1)',
                      '0 0 0 0 rgba(239, 68, 68, 0)',
                    ]
                  : '0 0 0 0 rgba(239, 68, 68, 0)',
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
              }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-destructive/20 to-destructive/10"
            >
              <AnimatePresence mode="wait">
                {deletionStage < 2 ? (
                  <motion.div
                    key="warning"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Icons.alertCircle className="size-10 text-destructive" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="trash"
                    initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative"
                  >
                    <Icons.trash className="size-10 text-destructive" />
                    {isCountingDown && (
                      <motion.div
                        className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                      >
                        {countdown}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <AlertDialogTitle className="mt-5 text-center text-2xl font-bold">
              {deletionStage < 2
                ? 'Delete your account?'
                : 'Final confirmation'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              {deletionStage < 2 ? (
                <>
                  This action{' '}
                  <span className="font-semibold text-destructive">
                    cannot be undone
                  </span>
                  . This will permanently delete your entire account and all
                  associated data.
                </>
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-destructive"
                >
                  {isCountingDown
                    ? `Account deletion will begin in ${countdown}...`
                    : 'Are you absolutely sure you want to proceed?'}
                </motion.span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AnimatePresence mode="wait">
            {deletionStage < 2 ? (
              <motion.div
                key="confirmation-stage"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 py-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="group rounded-xl border border-muted bg-muted/5 p-4 transition-all hover:bg-muted/10"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-background to-muted/50 shadow-sm">
                      <Icons.user className="size-5 text-foreground/80" />
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-semibold tracking-tight">
                        {userSettings?.name}
                      </h4>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center space-x-1">
                          <Icons.creditCard className="size-3" />
                          <span>Free Plan</span>
                        </span>
                        <span className="text-xs">•</span>
                        <span className="inline-flex items-center space-x-1">
                          <Icons.user className="size-3" />
                          <span>1 member</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="flex flex-col space-y-5"
                >
                  <Label
                    htmlFor="confirm-email"
                    className="text-sm font-medium"
                  >
                    Type{' '}
                    <span className="font-semibold">{userSettings?.email}</span>{' '}
                    to confirm
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={cn(
                        'border-none border-input bg-muted/5 pr-9 transition-all duration-300 focus-visible:ring-1 focus-visible:ring-offset-0',
                        isConfirmEnabled &&
                          'border-green-500/50 focus-visible:ring-green-500/30',
                        confirmEmail &&
                          !isConfirmEnabled &&
                          'border-destructive/50 focus-visible:ring-destructive/30'
                      )}
                    />
                    <AnimatePresence>
                      {isConfirmEnabled && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute top-2.5 right-3 rounded-full bg-green-500/10 p-1 text-green-500"
                        >
                          <Icons.check className="size-4" />
                        </motion.div>
                      )}
                      {confirmEmail && !isConfirmEnabled && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute top-2.5 right-3 rounded-full bg-destructive/10 p-1 text-destructive"
                        >
                          <Icons.x className="size-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {confirmEmail && !isConfirmEnabled && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center text-xs font-medium text-destructive"
                      >
                        <Icons.alertCircle className="mr-1 size-3" />
                        Email doesn't match your account email
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="final-stage"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6 py-4"
              >
                <div className="space-y-4">
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0 pt-0.5">
                        <Icons.alertCircle className="size-5 text-destructive" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-destructive">
                          What will be deleted:
                        </h3>
                        <ul className="mt-2 space-y-1 text-sm text-destructive/80">
                          <li className="flex items-center">
                            <Icons.circle className="mr-2 size-3" />
                            Your user profile and settings
                          </li>
                          <li className="flex items-center">
                            <Icons.circle className="mr-2 size-3" />
                            All workspaces you've created
                          </li>
                          <li className="flex items-center">
                            <Icons.circle className="mr-2 size-3" />
                            All your data including documents, files, and
                            analytics
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {isCountingDown && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Deletion starts in {countdown}s</span>
                        <span>Click Cancel to abort</span>
                      </div>
                      <Progress
                        value={(countdown / 3) * 100}
                        className="h-1.5 bg-muted/30"
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AlertDialogFooter className="flex-col space-y-3 pt-2 sm:space-y-0 sm:space-x-2">
            <AnimatePresence mode="wait">
              {deletionStage < 1 ? (
                <motion.div
                  key="initial-buttons"
                  className="flex w-full flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertDialogAction
                    size="md"
                    className={cn(
                      'relative w-full overflow-hidden bg-destructive font-medium text-white transition-all duration-300',
                      'hover:bg-destructive/90 hover:shadow-md disabled:opacity-50',
                      'focus:ring-2 focus:ring-destructive/50 focus:ring-offset-2 focus:outline-none',
                      !isConfirmEnabled && 'cursor-not-allowed opacity-50'
                    )}
                    disabled={!isConfirmEnabled}
                    onClick={(e) => {
                      e.preventDefault();
                      startDeletionProcess();
                    }}
                  >
                    Continue to confirmation
                  </AlertDialogAction>
                  <AlertDialogCancel
                    size="md"
                    className="w-full border-none font-medium text-muted-foreground transition-colors hover:bg-muted/10 hover:text-foreground focus:ring-0 focus:ring-offset-0"
                  >
                    Cancel
                  </AlertDialogCancel>
                </motion.div>
              ) : deletionStage === 1 ? (
                <motion.div
                  key="second-stage-buttons"
                  className="flex w-full flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertDialogAction
                    size="md"
                    className={cn(
                      'relative w-full overflow-hidden bg-destructive font-medium text-white transition-all duration-300',
                      'hover:bg-destructive/90 hover:shadow-md',
                      'focus:ring-2 focus:ring-destructive/50 focus:ring-offset-2 focus:outline-none'
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      startDeletionProcess();
                    }}
                  >
                    Continue to confirmation
                  </AlertDialogAction>
                  <AlertDialogCancel
                    size="md"
                    className="w-full border-none font-medium text-muted-foreground transition-colors hover:bg-muted/10 hover:text-foreground focus:ring-0 focus:ring-offset-0"
                  >
                    Cancel
                  </AlertDialogCancel>
                </motion.div>
              ) : isCountingDown ? (
                <motion.div
                  key="counting-buttons"
                  className="flex w-full flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertDialogCancel
                    size="md"
                    className="w-full border border-destructive/30 font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    Cancel Deletion
                  </AlertDialogCancel>
                </motion.div>
              ) : (
                <motion.div
                  key="final-buttons"
                  className="flex w-full flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertDialogAction
                    size="md"
                    className="relative w-full overflow-hidden bg-destructive font-medium text-white transition-all duration-300 hover:bg-destructive/90 hover:shadow-md"
                    onClick={(e) => {
                      e.preventDefault();
                      confirmFinalDeletion();
                    }}
                  >
                    {deleteAccountMutation.isPending ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center"
                      >
                        <Icons.spinner className="mr-2 size-4 animate-spin" />
                        Deleting account...
                      </motion.div>
                    ) : (
                      <>
                        <span>Yes, permanently delete my account</span>
                        {/* Add subtle hover animation */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          whileHover={{ opacity: 1, scale: 15 }}
                          transition={{ duration: 0.4 }}
                          className="absolute top-1/2 -left-1 h-1 w-1 -translate-y-1/2 rounded-full bg-white opacity-20"
                        />
                      </>
                    )}
                  </AlertDialogAction>
                  <AlertDialogCancel
                    size="md"
                    className="w-full border-none font-medium text-muted-foreground transition-colors hover:bg-muted/10 hover:text-foreground focus:ring-0 focus:ring-offset-0"
                    onClick={() => setDeletionStage(1)}
                  >
                    Go back
                  </AlertDialogCancel>
                </motion.div>
              )}
            </AnimatePresence>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
