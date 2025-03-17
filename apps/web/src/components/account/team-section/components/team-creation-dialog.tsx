/**
 * Dialog component for team creation
 *
 * @file Team Creation Dialog Component
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/registry/default/potion-ui/dialog';

import { TeamCreationForm } from '@/components/form/team-creation-form';
import { Users } from 'lucide-react';
import { useState } from 'react';

/**
 * Props for the TeamCreationDialog component
 *
 * @interface TeamCreationDialogProps
 */
export interface TeamCreationDialogProps {
  /** The trigger button/element children */
  children?: React.ReactNode;
  /** Whether the dialog is open */
  open?: boolean;
  /** Function called when the open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Function called after successful team creation */
  onTeamCreated?: (team?: any) => void;
}

/**
 * Dialog component for creating a new team
 *
 * Provides a modal dialog with the team creation form.
 *
 * @example
 *   ```tsx
 *   <TeamCreationDialog onTeamCreated={handleTeamCreated}>
 *     <Button>Create Team</Button>
 *   </TeamCreationDialog>
 *   ```;
 *
 * @param props - Component properties
 * @param props.children - Optional trigger element
 * @param props.open - Whether the dialog is open (controlled mode)
 * @param props.onOpenChange - Handler for open state changes
 * @param props.onTeamCreated - Handler called after successful team creation
 * @returns Dialog component with team creation form
 */
export function TeamCreationDialog({
  children,
  open,
  onOpenChange,
  onTeamCreated,
}: TeamCreationDialogProps) {
  // If no external open state control is provided, manage it internally
  const [internalOpen, setInternalOpen] = useState(false);

  // Use either external or internal open state
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  /** Handle team creation success */
  const handleTeamCreated = (team?: any) => {
    // Close the dialog
    setIsOpen(false);

    // Call the external handler if provided
    if (onTeamCreated) {
      onTeamCreated(team);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Create a New Team
          </DialogTitle>
          <DialogDescription>
            Set up a team to collaborate with others and manage your
            organizational finances.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <TeamCreationForm
            onSuccess={(team) => handleTeamCreated(team)}
            isDialog={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
