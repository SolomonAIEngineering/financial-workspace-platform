/**
 * Main team section component
 *
 * @file Team Section Component
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Team, TeamSectionProps } from './types';
import { useCreateTeamMutation, useTeamsQueryOptions, useUpdateTeamMutation, useUpdateUserRoleMutation } from '@/trpc/hooks/team-hooks';
import { useMemo, useState } from 'react';

import { AnimatePresence } from 'framer-motion';
import { EmptyTeamState } from './components/empty-team-state';
import { Icons } from '@/components/ui/icons';
import { TeamActions } from './components/team-actions';
import { TeamCard } from './components/team-card';
import { TeamHeader } from './components/team-header';
import { TeamSelector } from './components/team-selector';
import { useRouter } from 'next/navigation';
import { useTRPC } from '@/trpc/react';

/**
 * Team section component that displays the user's teams and provides management options
 * 
 * Main component for team management in the account settings section.
 * Allows users to view and switch between teams, manage team settings,
 * and navigate to team-specific pages.
 *
 * @param props - Component properties
 * @param props.userId - The ID of the current user
 * @returns Team management section component
 * 
 * @example
 * ```tsx
 * <TeamSection userId={session.user.id} />
 * ```
 */
export function TeamSection({ userId }: TeamSectionProps) {
    const router = useRouter();
    const trpc = useTRPC();
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

    // Fetch teams data
    const { data: apiTeams, isLoading } = useTeamsQueryOptions({
        refetchOnWindowFocus: true,
    });

    // Transform API data to match Team interface (converting null to undefined)
    const teams = useMemo(() => {
        if (!apiTeams) return undefined;

        return apiTeams.map(team => ({
            ...team,
            name: team.name || undefined,
            email: team.email || undefined,
            baseCurrency: team.baseCurrency || undefined,
            logoUrl: team.logoUrl || undefined,
            slug: team.slug || undefined,
            inboxForwarding: team.inboxForwarding || false,
            flags: team.flags || [],
            // Map each team member's role to correct UserRole enum
            usersOnTeam: team.usersOnTeam?.map(member => ({
                ...member,
                role: member.role
            }))
        })) as unknown as Team[];
    }, [apiTeams]);

    // Set the first team as selected initially
    useMemo(() => {
        if (teams?.length && !selectedTeamId) {
            setSelectedTeamId(teams[0].id);
        }
    }, [teams, selectedTeamId]);

    // Current selected team
    const selectedTeam = useMemo(() => {
        if (!teams || !selectedTeamId) return null;
        return teams.find(team => team.id === selectedTeamId);
    }, [teams, selectedTeamId]);

    // Handle team selection change
    const handleTeamChange = (teamId: string) => {
        setSelectedTeamId(teamId);
    };

    // Navigate to team creation page
    const handleCreateTeam = () => {
        router.push('/teams/new');
    };

    // Navigate to team settings page
    const handleManageTeam = () => {
        if (selectedTeamId) {
            router.push(`/teams/${selectedTeamId}`);
        }
    };

    // Get user role in selected team
    const getUserRoleInTeam = (teamId: string) => {
        if (!teams) return null;
        const team = teams.find(t => t.id === teamId);
        if (!team || !team.usersOnTeam) return null;

        const userOnTeam = team.usersOnTeam.find(ut => ut.userId === userId);
        return userOnTeam?.role || null;
    };

    // Loading state
    if (isLoading) {
        return (
            <Card className="overflow-hidden border shadow-sm">
                <TeamHeader isLoading={true} />
                <CardContent className="flex items-center justify-center py-20">
                    <Icons.spinner className="h-12 w-12 animate-spin text-primary/40" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border shadow-sm">
            <TeamHeader isLoading={false} />

            <CardContent className="space-y-6 px-6 pb-6">
                {teams && teams.length > 0 ? (
                    <>
                        <TeamSelector
                            teams={teams}
                            selectedTeamId={selectedTeamId}
                            onTeamChange={handleTeamChange}
                            getUserRoleInTeam={getUserRoleInTeam}
                        />

                        <AnimatePresence mode="wait">
                            {selectedTeam && (
                                <TeamCard
                                    key={selectedTeam.id}
                                    team={selectedTeam}
                                    userRole={getUserRoleInTeam(selectedTeam.id)}
                                    onManageTeam={handleManageTeam}
                                    router={router}
                                />
                            )}
                        </AnimatePresence>
                    </>
                ) : (
                    <EmptyTeamState onCreateTeam={handleCreateTeam} />
                )}
            </CardContent>

            <TeamActions
                onViewAllTeams={() => router.push('/teams')}
                onCreateTeam={handleCreateTeam}
            />
        </Card>
    );
} 