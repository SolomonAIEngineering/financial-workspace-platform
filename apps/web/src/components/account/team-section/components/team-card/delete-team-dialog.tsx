/**
 * Delete team confirmation dialog component
 *
 * @file Delete Team Dialog Component
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui//alert-dialog';

import { Icons } from '@/components/ui/icons';
import { Input } from '@/registry/default/potion-ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface DeleteTeamDialogProps {
  teamName: string | undefined;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteTeamDialog({
  teamName,
  isOpen,
  onOpenChange,
  onConfirmDelete,
  isDeleting,
}: DeleteTeamDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmDisabled = confirmText !== teamName;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Icons.trash className="h-5 w-5" />
            Delete Team
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              This action <strong>cannot be undone</strong>. This will
              permanently delete the team
              <strong> {teamName}</strong>, all associated data, and remove all
              members.
            </p>
            <div className="pt-2">
              <Label htmlFor="confirm-delete" className="text-sm font-medium">
                Please type <span className="font-bold">{teamName}</span> to
                confirm
              </Label>
              <Input
                id="confirm-delete"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={teamName}
                className="mt-1"
                autoComplete="off"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirmDelete();
            }}
            disabled={isConfirmDisabled || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Team'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
