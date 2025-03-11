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
import { api, useTRPC } from '@/trpc/react';
import { useEffect, useState } from 'react';

import { Icons } from '../ui/icons';
import { Input } from '@/registry/default/potion-ui/input';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export function DeleteAccountButton() {
  const trpc = useTRPC();
  const { data: userSettings } = useQuery(trpc.user.getSettings.queryOptions());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(false);

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
    }
  }, [isDeleteDialogOpen]);

  // Check if email is valid
  useEffect(() => {
    setIsConfirmEnabled(confirmEmail === userSettings?.email);
  }, [confirmEmail, userSettings?.email]);

  const deleteAccountMutation = api.user.deleteAccount.useMutation({
    onError: (error) => {
      toast.error(`Failed to delete account: ${error.message}`);
    },
    onSuccess: () => {
      toast.success('Account deleted successfully');
      // Perform a hard refresh to the home page
      window.location.href = '/';
    },
  });

  const handleDeleteAccount = () => {
    if (confirmEmail === userSettings?.email) {
      deleteAccountMutation.mutate();
    }
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
        {/* Top red warning band */}
        <div className="h-2 w-full bg-gradient-to-r from-red-500 to-destructive" />

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
              <Icons.alertCircle className="size-10 text-destructive" />
            </motion.div>
            <AlertDialogTitle className="mt-5 text-center text-2xl font-bold">
              Delete your account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              This action{' '}
              <span className="font-semibold text-destructive">
                cannot be undone
              </span>
              . This will permanently delete your entire account and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-6 py-4">
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
              className="space-y-3"
            >
              <Label htmlFor="confirm-email" className="text-sm font-medium">
                Type{' '}
                <span className="font-semibold">{userSettings?.email}</span> to
                confirm
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
                {isConfirmEnabled && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-2.5 right-3 rounded-full bg-green-500/10 p-1 text-green-500"
                  >
                    <Icons.check className="size-4" />
                  </motion.div>
                )}
                {confirmEmail && !isConfirmEnabled && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-2.5 right-3 rounded-full bg-destructive/10 p-1 text-destructive"
                  >
                    <Icons.x className="size-4" />
                  </motion.div>
                )}
              </div>
              {confirmEmail && !isConfirmEnabled && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center text-xs font-medium text-destructive"
                >
                  <Icons.alertCircle className="mr-1 size-3" />
                  Email doesn't match your account email
                </motion.p>
              )}
            </motion.div>
          </div>

          <AlertDialogFooter className="flex-col space-y-3 pt-2 sm:space-y-0 sm:space-x-2">
            <AlertDialogAction
              size="md"
              className={cn(
                'relative w-full overflow-hidden bg-destructive font-medium text-white transition-all duration-300',
                'hover:bg-destructive/90 hover:shadow-md disabled:opacity-50',
                'focus:ring-2 focus:ring-destructive/50 focus:ring-offset-2 focus:outline-none',
                !isConfirmEnabled && 'cursor-not-allowed opacity-50'
              )}
              disabled={!isConfirmEnabled}
              onClick={handleDeleteAccount}
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
                  <span>Permanently delete account</span>
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
            >
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
