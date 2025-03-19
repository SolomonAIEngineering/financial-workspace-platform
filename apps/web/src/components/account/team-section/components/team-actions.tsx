/**
 * Actions component for team-related actions
 *
 * @file Team Actions Component
 */

import { Button } from '@/registry/default/potion-ui/button';
import { CardFooter } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { ListBulletIcon } from '@radix-ui/react-icons';
import { TeamActionsProps } from '../types';
import { TeamAllSheet } from './team-all-sheet';
import { useState } from 'react';

/**
 * Component for displaying team management action buttons
 *
 * Renders a footer with buttons for viewing all teams and creating new teams.
 * When "All Teams" is clicked, it opens a sheet displaying all teams in a
 * modern, beautiful manner allowing the user to select a team.
 *
 * @example
 *   ```tsx
 *   <TeamActions
 *     onViewAllTeams={() => router.push('/teams')}
 *     onCreateTeam={handleCreateTeam}
 *     teams={teams}
 *     selectedTeamId={selectedTeamId}
 *     onTeamSelect={handleTeamChange}
 *     getUserRoleInTeam={getUserRoleInTeam}
 *   />
 *   ```;
 *
 * @param props - Component properties
 * @param props.onViewAllTeams - Handler for viewing all teams
 * @param props.onCreateTeam - Handler for creating a new team
 * @param props.teams - List of available teams
 * @param props.selectedTeamId - ID of the currently selected team
 * @param props.onTeamSelect - Handler for team selection
 * @param props.getUserRoleInTeam - Function to get user's role in a given team
 * @returns Footer component with team management actions
 */
export function TeamActions({
  onViewAllTeams,
  onCreateTeam,
  teams,
  selectedTeamId,
  onTeamSelect,
  getUserRoleInTeam,
}: TeamActionsProps) {
  const [isAllTeamsSheetOpen, setIsAllTeamsSheetOpen] = useState(false);

  return (
    <>
      <CardFooter className="flex justify-between border-t bg-muted/10 px-6 py-4">
        <Button
          variant="ghost"
          onClick={() => setIsAllTeamsSheetOpen(true)}
          className="gap-2"
        >
          <ListBulletIcon className="h-4 w-4" />
          <span>All Teams</span>
        </Button>
        <Button onClick={onCreateTeam} className="gap-2">
          <Icons.plus className="h-4 w-4" />
          <span>New Team</span>
        </Button>
      </CardFooter>

      <TeamAllSheet
        teams={teams}
        selectedTeamId={selectedTeamId}
        onTeamSelect={onTeamSelect}
        open={isAllTeamsSheetOpen}
        onOpenChange={setIsAllTeamsSheetOpen}
        getUserRoleInTeam={getUserRoleInTeam}
      />
    </>
  );
}
