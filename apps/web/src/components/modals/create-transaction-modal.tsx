'use client';

import * as React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/registry/default/potion-ui/dialog';
import { useEffect, useState } from 'react';

import { TransactionForm } from '../form/transaction-form';

interface CreateTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateTransactionModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTransactionModalProps) {
  // Use a key to force re-mount the form when modal opens
  // This prevents stale state issues that can cause controlled/uncontrolled switches
  const [formKey, setFormKey] = useState(0);

  // Reset the form when the modal opens
  useEffect(() => {
    if (open) {
      setFormKey((prev) => prev + 1);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-h-[50%] min-w-[30%] gap-0 overflow-hidden border-neutral-200 p-0 shadow-lg sm:max-w-[600px] dark:border-neutral-800">
        <div className="border-b border-neutral-200 bg-white px-6 py-6 dark:border-neutral-800 dark:bg-neutral-950">
          <DialogHeader className="px-0 py-0">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Add New Transaction
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              Create a manual transaction record for your accounts.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
          <TransactionForm
            key={formKey}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => {
              onOpenChange(false);
              if (onSuccess) onSuccess();
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
