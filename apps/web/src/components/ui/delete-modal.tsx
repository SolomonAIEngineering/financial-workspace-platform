'use client';

import * as React from 'react';

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
import { Button, ButtonProps } from '@/registry/default/potion-ui/button';
import { Check, ShieldAlert, Trash, XCircle } from 'lucide-react';

import { Input } from '@/registry/default/potion-ui/input';
import { cn } from '@/lib/utils';

export interface DeleteModalProps {
  /** Whether the modal is open */
  open?: boolean;
  /** Callback when the modal open state changes */
  onOpenChange?: (open: boolean) => void;
  /** The title of the delete modal for the first confirmation stage */
  title?: string;
  /** The description text for the first confirmation stage */
  description?: string;
  /** The title for the second confirmation stage */
  secondStageTitle?: string;
  /** The description text for the second confirmation stage */
  secondStageDescription?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Text for the delete/confirm button on first stage */
  confirmText?: string;
  /** Text for the final delete/confirm button on second stage */
  finalConfirmText?: string;
  /** The text that user needs to type to confirm deletion */
  confirmationWord?: string;
  /** Callback function when delete is confirmed */
  onConfirm?: () => void;
  /** Callback function when delete is canceled */
  onCancel?: () => void;
  /** Optional trigger button/element */
  trigger?: React.ReactNode;
  /** Custom CSS class for the modal content */
  className?: string;
  /** Props to pass to the confirm button */
  confirmButtonProps?: ButtonProps;
  /** Props to pass to the cancel button */
  cancelButtonProps?: ButtonProps;
  /** Props to pass to the final confirm button */
  finalConfirmButtonProps?: ButtonProps;
  /** Whether to close the modal automatically after confirming */
  closeOnConfirm?: boolean;
  /** Whether to require double confirmation (default: true) */
  requireDoubleConfirmation?: boolean;
  /** Additional content to render in the modal body */
  children?: React.ReactNode;
}

/**
 * DeleteModal component
 *
 * A comprehensive, customizable confirmation modal for delete operations with
 * double confirmation.
 *
 * @example
 *   ```tsx
 *   // Basic usage
 *   <DeleteModal
 *     title="Delete Item"
 *     description="Are you sure you want to delete this item? This action cannot be undone."
 *     onConfirm={handleDelete}
 *     trigger={<Button variant="destructive">Delete</Button>}
 *   />
 *
 *   // With custom confirmation word
 *   <DeleteModal
 *     title="Delete Account"
 *     description="Are you sure you want to delete your account?"
 *     secondStageDescription="To confirm, please type your account name below:"
 *     confirmationWord="myaccount"
 *     finalConfirmText="Permanently Delete Account"
 *     onConfirm={handleAccountDeletion}
 *     trigger={<Button variant="destructive">Delete My Account</Button>}
 *   />
 *   ```;
 */
export function DeleteModal({
  open,
  onOpenChange,
  title = 'Confirm Deletion',
  description = 'Are you sure you want to delete this item? This action cannot be undone.',
  secondStageTitle = 'Final Confirmation Required',
  secondStageDescription = 'This action is permanent and cannot be reversed. To proceed, please type the confirmation word below:',
  cancelText = 'Cancel',
  confirmText = 'Delete',
  finalConfirmText = 'Permanently Delete',
  confirmationWord = 'DELETE',
  onConfirm,
  onCancel,
  trigger,
  className,
  confirmButtonProps,
  cancelButtonProps,
  finalConfirmButtonProps,
  closeOnConfirm = true,
  requireDoubleConfirmation = true,
  children,
}: DeleteModalProps) {
  const [isSecondStage, setIsSecondStage] = React.useState(false);
  const [confirmationText, setConfirmationText] = React.useState('');
  const isConfirmationValid =
    !requireDoubleConfirmation ||
    !isSecondStage ||
    confirmationText === confirmationWord;

  const handleFirstStageConfirm = () => {
    if (!requireDoubleConfirmation) {
      if (onConfirm) {
        onConfirm();
      }

      if (closeOnConfirm && onOpenChange) {
        onOpenChange(false);
      }
    } else {
      setIsSecondStage(true);
    }
  };

  const handleFinalConfirm = () => {
    if (isConfirmationValid && onConfirm) {
      onConfirm();

      if (closeOnConfirm && onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }

    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const resetState = React.useCallback(() => {
    setIsSecondStage(false);
    setConfirmationText('');
  }, []);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState();
    }

    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleDialogOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent className={cn('', className)}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isSecondStage ? (
              <>
                <ShieldAlert className="h-5 w-5 text-destructive" />
                {secondStageTitle}
              </>
            ) : (
              <>
                <Trash className="h-5 w-5 text-destructive" />
                {title}
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSecondStage ? secondStageDescription : description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        {isSecondStage && requireDoubleConfirmation && (
          <div className="my-4">
            <div className="mb-2 text-sm font-medium">
              Type{' '}
              <span className="font-bold text-destructive">
                {confirmationWord}
              </span>{' '}
              to confirm:
            </div>
            <Input
              value={confirmationText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setConfirmationText(e.target.value)
              }
              className={cn(
                '',
                confirmationText &&
                  confirmationText !== confirmationWord &&
                  'border-destructive'
              )}
              placeholder={`Type ${confirmationWord} here`}
              autoFocus
            />
          </div>
        )}

        <AlertDialogFooter className="flex flex-row gap-2">
          {isSecondStage ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsSecondStage(false)}
                className="flex items-center gap-1"
              >
                <XCircle className="h-4 w-4" />
                Go Back
              </Button>
              <Button
                variant="destructive"
                onClick={handleFinalConfirm}
                disabled={!isConfirmationValid}
                className={cn(
                  'flex items-center gap-1',
                  !isConfirmationValid && 'cursor-not-allowed opacity-50',
                  finalConfirmButtonProps?.className
                )}
                {...finalConfirmButtonProps}
              >
                <Check className="h-4 w-4" />
                {finalConfirmText}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                {...cancelButtonProps}
              >
                {cancelText}
              </Button>
              <Button
                variant="destructive"
                onClick={handleFirstStageConfirm}
                className={cn(
                  'flex items-center gap-1',
                  confirmButtonProps?.className
                )}
                {...confirmButtonProps}
              >
                {confirmText}
              </Button>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
