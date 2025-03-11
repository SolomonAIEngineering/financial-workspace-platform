'use client';

import {
  ArrowRightIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/registry/default/potion-ui/dialog';
import React, { useState } from 'react';
import type { WaitlistStatus, WaitlistSubmission } from '@/hooks/use-waitlist';

import { Button } from '@/registry/default/potion-ui/button';
import { TextareaAutosize } from '@/registry/default/potion-ui/textarea';
import { motion } from 'framer-motion';

export interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WaitlistSubmission) => Promise<void>;
  status: WaitlistStatus;
  error: Error | null;
  featureName: string;
}

export function WaitlistModal({
  isOpen,
  onClose,
  onSubmit,
  status,
  error,
  featureName,
}: WaitlistModalProps) {
  const [reason, setReason] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ reason });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md" className="overflow-hidden p-0 sm:max-w-md">
        {/* Decorative gradient element */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

        <div className="relative z-10 p-6">
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <XMarkIcon className="h-5 w-5" />
            </Button>
          </div>

          <DialogHeader className="pb-4">
            <div className="mb-2 flex items-center gap-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <SparklesIcon className="h-4 w-4 text-primary" />
              </span>
              <DialogTitle className="text-xl font-semibold">
                Join the {featureName} Waitlist
              </DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              Be among the first to access our new feature when it launches.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error.message}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-foreground"
              >
                Why are you interested in this feature?
              </label>
              <TextareaAutosize
                id="reason"
                name="reason"
                value={reason}
                onChange={handleChange}
                className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none"
                placeholder="Tell us what you're looking forward to..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Your feedback helps us prioritize our development roadmap.
              </p>
            </div>

            <DialogFooter className="mt-6 flex gap-3 sm:justify-between">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={status === 'loading'}
                variant="default"
                size="sm"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto"
                icon={status === 'loading' ? undefined : <ArrowRightIcon />}
                iconPlacement="right"
                loading={status === 'loading'}
              >
                {status === 'loading' ? 'Submitting...' : 'Join Waitlist'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
