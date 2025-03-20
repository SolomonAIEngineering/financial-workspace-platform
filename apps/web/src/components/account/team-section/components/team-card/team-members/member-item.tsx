/**
 * Team member item component
 *
 * @file Team Member Item Component
 */

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/registry/default/potion-ui/avatar';
import { Check, ChevronsUpDown, Shield, Users } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/registry/default/potion-ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/registry/default/potion-ui/popover';
import { getAvatarFallback, teamRoles } from '../../../utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/registry/default/potion-ui/button';
import { Icons } from '@/components/ui/icons';
import { TeamMemberItemProps } from '../../../types';
import { TeamRole } from '@solomonai/prisma/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useState } from 'react';

/**
 * Component for displaying and managing a single team member
 *
 * Shows member information and provides role management for team owners.
 * Includes safety checks to prevent removing the last owner.
 *
 * @example
 *   ```tsx
 *   <TeamMemberItem
 *     member={member}
 *     isOwner={isOwner}
 *     onRoleUpdate={handleRoleUpdate}
 *     isUpdating={isRoleUpdating}
 *     isBeingUpdated={selectedMember === member.userId}
 *     ownersCount={ownersCount}
 *     isCurrentUser={userId === member.userId}
 *   />
 *   ```;
 *
 * @param props - Component properties
 * @param props.member - Member information
 * @param props.isOwner - Whether the current user is a team owner
 * @param props.onRoleUpdate - Handler for user role updates
 * @param props.isUpdating - Whether role updates are in progress
 * @param props.isBeingUpdated - Whether this member is being updated
 * @param props.ownersCount - Total number of team owners
 * @param props.isCurrentUser - Whether this member is the current user
 * @returns Component for team member display and management
 */
export function TeamMemberItem({
  member,
  isOwner,
  onRoleUpdate,
  isUpdating,
  isBeingUpdated,
  ownersCount,
  isCurrentUser,
}: TeamMemberItemProps) {
  const [roleOpen, setRoleOpen] = useState(false);

  /** Handles role selection with validation */
  const handleRoleSelect = async (newRole: TeamRole) => {
    // Return early if already this role
    if (newRole === member.role) {
      setRoleOpen(false);
      return;
    }

    // Don't allow downgrading yourself if you're the only owner
    if (isCurrentUser && newRole !== TeamRole.OWNER && ownersCount <= 1) {
      toast.error('Cannot remove the last owner of the team');
      setRoleOpen(false);
      return;
    }

    // Update the role
    try {
      await onRoleUpdate(member.userId, newRole);
      setRoleOpen(false);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6 border border-background">
          {member.user?.profileImageUrl ? (
            <AvatarImage
              src={member.user.profileImageUrl}
              alt={member.user?.name || 'Team member'}
            />
          ) : (
            <AvatarFallback className="bg-muted text-xs">
              {getAvatarFallback(member.user?.name)}
            </AvatarFallback>
          )}
        </Avatar>
        <span className="max-w-[120px] truncate text-sm font-medium">
          {member.user?.name || member.userId.substring(0, 8)}
        </span>
      </div>

      {isOwner ? (
        <Popover open={roleOpen} onOpenChange={setRoleOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              aria-expanded={roleOpen}
              className="h-7 min-w-[90px] gap-1.5 bg-background/80 px-2 hover:bg-background"
              disabled={isUpdating}
            >
              <Badge
                variant={member.role === TeamRole.OWNER ? 'default' : 'outline'}
                className={cn(
                  'flex h-5 items-center gap-1 px-1.5 text-[10px] font-medium',
                  member.role === TeamRole.OWNER
                    ? 'border-transparent bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-muted/50 hover:bg-muted'
                )}
              >
                {member.role === TeamRole.OWNER ? (
                  <Shield className="h-2.5 w-2.5" />
                ) : (
                  <Users className="h-2.5 w-2.5" />
                )}
                {member.role === TeamRole.OWNER ? 'Owner' : 'Member'}
              </Badge>
              <ChevronsUpDown className="h-3 w-3 opacity-50" />
              {isUpdating && isBeingUpdated && (
                <Icons.spinner className="ml-1 h-3 w-3 animate-spin" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Search role..." className="h-9" />
              <CommandEmpty>No role found</CommandEmpty>
              <CommandGroup className="p-1.5">
                <div className="flex flex-col gap-4">
                  {teamRoles.map((role) => {
                    const Icon = role.icon;
                    const isActive = member.role === role.id;
                    return (
                      <CommandItem
                        key={role.id}
                        value={role.id}
                        onSelect={() => handleRoleSelect(role.id)}
                        className={cn(
                          'cursor-pointer rounded-md px-2 py-1.5',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        )}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-5 w-5 items-center justify-center rounded-full',
                            isActive ? 'bg-primary text-white' : 'bg-muted'
                          )}
                        >
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {role.description}
                          </span>
                        </div>
                        {isActive && (
                          <Check className="ml-auto h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    );
                  })}
                </div>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        <Badge
          variant={member.role === TeamRole.OWNER ? 'default' : 'outline'}
          className={cn(
            'flex h-5 items-center gap-1 px-1.5 text-[10px] font-medium',
            member.role === TeamRole.OWNER
              ? 'border-transparent bg-primary/10 text-primary'
              : 'bg-muted/50'
          )}
        >
          {member.role === TeamRole.OWNER ? (
            <Shield className="h-2.5 w-2.5" />
          ) : (
            <Users className="h-2.5 w-2.5" />
          )}
          {member.role === TeamRole.OWNER ? 'Owner' : 'Member'}
        </Badge>
      )}
    </div>
  );
}
