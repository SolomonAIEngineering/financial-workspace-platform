/**
 * Header component for team card
 *
 * @file Team Card Header Component
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/registry/default/potion-ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/registry/default/potion-ui/tooltip';

import { Button } from '@/registry/default/potion-ui/button';
import { Icons } from '@/components/ui/icons';
import { TeamCardHeaderProps } from '../../types';
import { getAvatarFallback } from '../../utils';

/**
 * Header section of a team card showing team identity and management action
 * 
 * Displays the team logo/avatar, name, email, and a manage button
 * with appropriate permissions.
 *
 * @param props - Component properties
 * @param props.team - Team object with detailed information
 * @param props.isOwner - Whether the current user is a team owner
 * @param props.onManageTeam - Handler for team management action
 * @returns Header component for team card
 * 
 * @example
 * ```tsx
 * <TeamCardHeader
 *   team={selectedTeam}
 *   isOwner={isOwner}
 *   onManageTeam={handleManageTeam}
 * />
 * ```
 */
export function TeamCardHeader({ team, isOwner, onManageTeam }: TeamCardHeaderProps) {
    return (
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    {team.logoUrl ? (
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarImage src={team.logoUrl} alt={`${team.name || "Team"} logo`} />
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
                        <h3 className="text-lg font-semibold tracking-tight">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {team.email || 'No email set'}
                        </p>
                    </div>
                </div>
            </div>

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
    );
} 