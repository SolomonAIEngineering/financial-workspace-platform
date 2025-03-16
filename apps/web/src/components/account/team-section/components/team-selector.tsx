/**
 * Team selector component for choosing active team
 *
 * @file Team Selector Component
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/registry/default/potion-ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { TeamSelectorProps } from '../types';
import { getAvatarFallback } from '../utils';

/**
 * Component for selecting the active team
 * 
 * Displays a dropdown with all available teams, highlighting the user's role
 * in each team and showing team avatars.
 *
 * @param props - Component properties
 * @param props.teams - List of available teams
 * @param props.selectedTeamId - ID of the currently selected team
 * @param props.onTeamChange - Handler for team selection changes
 * @param props.getUserRoleInTeam - Function to get user's role in a given team
 * @returns Team selector dropdown component
 * 
 * @example
 * ```tsx
 * <TeamSelector
 *   teams={teams}
 *   selectedTeamId={selectedTeamId}
 *   onTeamChange={handleTeamChange}
 *   getUserRoleInTeam={getUserRoleInTeam}
 * />
 * ```
 */
export function TeamSelector({
    teams,
    selectedTeamId,
    onTeamChange,
    getUserRoleInTeam
}: TeamSelectorProps) {
    return (
        <div className="space-y-2 md:py-[3%]">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Active Team</label>
                <span className="text-xs text-muted-foreground">
                    {teams?.length} {teams?.length === 1 ? 'team' : 'teams'}
                </span>
            </div>
            <Select value={selectedTeamId || ""} onValueChange={onTeamChange}>
                <SelectTrigger className="w-full bg-background/50 transition-all hover:bg-background/80">
                    <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                    {teams?.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                            <div className="flex items-center gap-2">
                                {team.logoUrl ? (
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={team.logoUrl} alt={`${team.name || "Team"} logo`} />
                                        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                                            {getAvatarFallback(team.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                                        <Icons.user className="h-3 w-3 text-primary" />
                                    </div>
                                )}
                                <span className="font-medium">{team.name}</span>
                                {getUserRoleInTeam(team.id) === 'OWNER' && (
                                    <Badge variant="outline" className="ml-1 rounded-sm px-1 py-0 text-xs">
                                        Owner
                                    </Badge>
                                )}
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
} 