/**
 * Header component for team card
 *
 * @file Team Card Header Component
 */

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/registry/default/potion-ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/registry/default/potion-ui/tooltip';

import { Button } from '@/registry/default/potion-ui/button';
import { DeleteTeamDialog } from './delete-team-dialog';
import { Icons } from '@/components/ui/icons';
import { TeamCardHeaderProps } from '../../types';
import { getAvatarFallback } from '../../utils';
import { toast } from 'sonner';
import { useDeleteTeamMutation } from '@/trpc/hooks/team-hooks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Header section of a team card showing team identity and management action
 *
 * Displays the team logo/avatar, name, email, and management buttons with
 * appropriate permissions. Includes a delete team button and confirmation
 * dialog.
 *
 * @example
 *   ```tsx
 *   <TeamCardHeader
 *     team={selectedTeam}
 *     isOwner={isOwner}
 *     onManageTeam={handleManageTeam}
 *   />
 *   ```;
 *
 * @param props - Component properties
 * @param props.team - Team object with detailed information
 * @param props.isOwner - Whether the current user is a team owner
 * @param props.onManageTeam - Handler for team management action
 * @returns Header component for team card
 */
export function TeamCardHeader({
  team,
  isOwner,
  onManageTeam,
}: TeamCardHeaderProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteTeam = useDeleteTeamMutation();
  const router = useRouter();

  const handleDeleteTeam = async () => {
    try {
      // We're using mutateAsync instead of the standard mutation to take control of the flow
      await deleteTeam.mutate({
        id: team.id,
      });

      // Handle success manually
      toast.success('Team deleted successfully');
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error('Failed to delete team');
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {team.logoUrl ? (
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
              <AvatarImage
                src={team.logoUrl}
                alt={`${team.name || 'Team'} logo`}
              />
              <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                {getAvatarFallback(team.name)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
              <Icons.user className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold tracking-tight">
              {team.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {team.email || 'No email set'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 gap-1 transition-all hover:bg-destructive hover:text-white"
                disabled={!isOwner}
              >
                <Icons.trash className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            </TooltipTrigger>
            {!isOwner && (
              <TooltipContent>
                <p>Only team owners can delete a team</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onManageTeam}
                className="h-8 gap-1 transition-all hover:bg-primary hover:text-white"
                disabled={!isOwner}
              >
                <Icons.settings className="h-3.5 w-3.5" />
                <span>Manage</span>
              </Button>
            </TooltipTrigger>
            {!isOwner && (
              <TooltipContent>
                <p>Only team owners can manage team settings</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>

      <DeleteTeamDialog
        teamName={team.name}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirmDelete={handleDeleteTeam}
        isDeleting={deleteTeam.isPending}
      />
    </div>
  );
}
