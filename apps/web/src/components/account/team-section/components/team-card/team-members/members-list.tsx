/**
 * Team members list component
 *
 * @file Team Members List Component
 */

import { Button } from '@/registry/default/potion-ui/button';
import { TeamMemberItem } from './member-item';
import { TeamMembersListProps } from '../../../types';
import { TeamRole } from '@prisma/client';
import { countTeamOwners } from '../../../utils';
import { useState } from 'react';

/**
 * Component for displaying and managing a list of team members
 *
 * Shows all team members with their roles and allows role management for team
 * owners.
 *
 * @example
 *   ```tsx
 *   <TeamMembersList
 *     team={team}
 *     isOwner={isOwner}
 *     onManageTeam={handleManageTeam}
 *     onRoleUpdate={handleRoleUpdate}
 *     isRoleUpdating={isRoleUpdating}
 *     updatingMemberId={updatingMemberId}
 *   />
 *   ```;
 *
 * @param props - Component properties
 * @param props.team - Team information including member list
 * @param props.isOwner - Whether the current user is a team owner
 * @param props.onManageTeam - Handler for team management action
 * @param props.onRoleUpdate - Handler for user role updates
 * @param props.isRoleUpdating - Whether role updates are in progress
 * @param props.updatingMemberId - ID of the member being updated
 * @returns Component for team members list
 */
export function TeamMembersList({
  team,
  isOwner,
  onManageTeam,
  onRoleUpdate,
  isRoleUpdating,
  updatingMemberId,
}: TeamMembersListProps) {
  const memberCount = team.usersOnTeam?.length || 0;
  const ownersCount = countTeamOwners(team);

  return (
    <div className="col-span-2 space-y-1">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground uppercase">
          Members ({memberCount})
        </h4>
        {isOwner && memberCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onManageTeam()}
            className="h-6 px-2 text-xs"
          >
            Manage
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-background/50 p-2">
        {team.usersOnTeam && team.usersOnTeam.length > 0 ? (
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {team.usersOnTeam.map((member) => (
              <TeamMemberItem
                key={member.userId}
                member={member}
                isOwner={isOwner}
                onRoleUpdate={onRoleUpdate}
                isUpdating={isRoleUpdating}
                isBeingUpdated={updatingMemberId === member.userId}
                ownersCount={ownersCount}
                isCurrentUser={false} // This would be determined by parent component
              />
            ))}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No members</span>
        )}
      </div>
    </div>
  );
}
