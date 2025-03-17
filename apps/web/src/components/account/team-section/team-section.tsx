/**
 * Main team section component
 *
 * @file Team Section Component
 */

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Team, TeamSectionProps } from './types';
import { useMemo, useState } from 'react';

import { AnimatePresence } from 'framer-motion';
import { EmptyTeamState } from './components/empty-team-state';
import { Icons } from '@/components/ui/icons';
import { TeamActions } from './components/team-actions';
import { TeamCard } from './components/team-card';
import { TeamCreationSheet } from './components/team-creation-sheet';
import { TeamHeader } from './components/team-header';
import { TeamSelector } from './components/team-selector';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTRPC } from '@/trpc/react';
import { useTeamsQueryOptions } from '@/trpc/hooks/team-hooks';

/**
 * Team section component that displays the user's teams and provides management
 * options
 *
 * Main component for team management in the account settings section. Allows
 * users to view and switch between teams, manage team settings, and navigate to
 * team-specific pages.
 *
 * @example
 *   ```tsx
 *   <TeamSection userId={session.user.id} />
 *   ```;
 *
 * @param props - Component properties
 * @param props.userId - The ID of the current user
 * @returns Team management section component
 */
export function TeamSection({ userId }: TeamSectionProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  // State for team creation sheet
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  // Fetch teams data
  const { data: apiTeams, isLoading } = useTeamsQueryOptions({
    refetchOnWindowFocus: true,
  });

  // Transform API data to match Team interface (converting null to undefined)
  const teams = useMemo(() => {
    if (!apiTeams) return undefined;

    return apiTeams.map((team) => ({
      ...team,
      name: team.name || undefined,
      email: team.email || undefined,
      baseCurrency: team.baseCurrency || undefined,
      logoUrl: team.logoUrl || undefined,
      slug: team.slug || undefined,
      inboxForwarding: team.inboxForwarding || false,
      flags: team.flags || [],
      // Map each team member's role to correct UserRole enum
      usersOnTeam: team.usersOnTeam?.map((member) => ({
        ...member,
        role: member.role,
      })),
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
    return teams.find((team) => team.id === selectedTeamId);
  }, [teams, selectedTeamId]);

  // Handle team selection change
  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  // Open team creation sheet
  const handleOpenCreateTeamSheet = () => {
    setIsCreateSheetOpen(true);
  };

  // Handle team creation completion
  const handleTeamCreated = async (newTeam?: any) => {
    // Invalidate team cache
    await trpc.team.invalidate();

    // Refetch teams data
    const updatedTeams = await trpc.team.getAll.fetch();

    // If we have the newly created team and it exists in the updated list, select it
    if (newTeam && newTeam.id) {
      setSelectedTeamId(newTeam.id);
      toast.success(`Team "${newTeam.name}" created and selected`);
    } else if (updatedTeams && updatedTeams.length > 0) {
      // Otherwise select the first team if available
      const lastCreatedTeam = updatedTeams[updatedTeams.length - 1];
      setSelectedTeamId(lastCreatedTeam.id);
    }
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
    const team = teams.find((t) => t.id === teamId);
    if (!team || !team.usersOnTeam) return null;

    const userOnTeam = team.usersOnTeam.find((ut) => ut.userId === userId);
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
    <>
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
                    onManageTeam={() => {}}
                    router={router}
                  />
                )}
              </AnimatePresence>
            </>
          ) : (
            <EmptyTeamState onCreateTeam={handleOpenCreateTeamSheet} />
          )}
        </CardContent>

        <TeamActions
          onViewAllTeams={() => {}}
          onCreateTeam={handleOpenCreateTeamSheet}
          teams={teams}
          selectedTeamId={selectedTeamId}
          onTeamSelect={handleTeamChange}
          getUserRoleInTeam={getUserRoleInTeam}
        />
      </Card>

      {/* Team Creation Sheet */}
      <TeamCreationSheet
        open={isCreateSheetOpen}
        onOpenChange={setIsCreateSheetOpen}
        onSuccess={handleTeamCreated}
      />
    </>
  );
}
