import { DEFAULT_QUERY_OPTIONS, QueryOptions } from './query-options';
import { api, useTRPC } from '@/trpc/react';

import { mergeDefined } from '@/lib/mergeDefined';
import { produce } from 'immer';
import { toast } from 'sonner';
import { useCallback } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebounceCallback';
import { useRouter } from 'next/navigation';

// Define TeamRole type to match the schema
type TeamRole = 'OWNER' | 'MEMBER';

/**
 * Hook for fetching a team by ID
 * 
 * @param id - The ID of the team to fetch
 * @param options - TRPC query options
 * @returns TRPC query result containing the team data
 */
export function useTeamQueryOptions(
    id: string,
    options: QueryOptions = DEFAULT_QUERY_OPTIONS
) {
    return api.team.getById.useQuery(
        { id },
        options
    );
}

/**
 * Hook for fetching all teams for the current user
 * 
 * @param options - TRPC query options
 * @returns TRPC query result containing the teams data
 */
export function useTeamsQueryOptions(
    options: QueryOptions = DEFAULT_QUERY_OPTIONS
) {
    return api.team.getAll.useQuery(
        undefined,
        options
    );
}

/**
 * Hook for fetching team invites
 * 
 * @param teamId - The ID of the team to fetch invites for
 * @param options - TRPC query options
 * @returns TRPC query result containing the invites data
 */
export function useTeamInvitesQueryOptions(
    teamId: string,
    options: QueryOptions = DEFAULT_QUERY_OPTIONS
) {
    return api.team.getInvites.useQuery(
        { id: teamId },
        options
    );
}

/**
 * Hook for creating a new team with optimistic updates
 * 
 * @returns A mutation object for creating a team
 * 
 * @example
 * ```tsx
 * const createTeam = useCreateTeamMutation();
 * 
 * const handleCreateTeam = async () => {
 *   try {
 *     await createTeam.mutate({
 *       name: 'My Team',
 *       email: 'team@example.com',
 *     });
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useCreateTeamMutation = () => {
    const router = useRouter();
    const trpc = useTRPC();

    return api.team.create.useMutation({
        onSuccess: (team) => {
            toast.success('Team created successfully');
            void trpc.team.getAll.invalidate();
            router.push(`/teams/${team.id}`);
        },
        onError: (error) => {
            console.error('Failed to create team:', error);
            toast.error('Failed to create team');
        },
    });
};

/**
 * Hook for updating a team with optimistic updates
 * 
 * @returns A mutation object for updating a team
 * 
 * @example
 * ```tsx
 * const updateTeam = useUpdateTeamMutation();
 * 
 * const handleUpdateTeam = async () => {
 *   try {
 *     await updateTeam.mutate({
 *       id: 'team-id',
 *       data: {
 *         name: 'Updated Team Name',
 *       },
 *     });
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useUpdateTeamMutation = () => {
    const trpc = useTRPC();

    return api.team.update.useMutation({
        onError: (_, __, context: any) => {
            if (context?.previousTeams) {
                trpc.team.getAll.setData(undefined, context.previousTeams);
            }
            if (context?.previousTeam) {
                trpc.team.getById.setData(
                    { id: context.id },
                    context.previousTeam
                );
            }
            toast.error('Failed to update team');
        },
        onMutate: async (input) => {
            await trpc.team.getAll.cancel();
            await trpc.team.getById.cancel({ id: input.id });

            const previousTeams = trpc.team.getAll.getData();
            const previousTeam = trpc.team.getById.getData({ id: input.id });

            // Optimistically update the team details
            if (previousTeam) {
                trpc.team.getById.setData({ id: input.id }, (old) => {
                    if (!old) return old;

                    return {
                        ...old,
                        ...mergeDefined(input.data, old, {
                            omitNull: true,
                        }),
                    };
                });
            }

            // Optimistically update the teams list
            if (previousTeams) {
                trpc.team.getAll.setData(undefined, (old) => {
                    if (!old || !Array.isArray(old)) return old;

                    return old.map((team) => {
                        if (team.id === input.id) {
                            return {
                                ...team,
                                ...mergeDefined(input.data, team, {
                                    omitNull: true,
                                }),
                            };
                        }
                        return team;
                    });
                });
            }

            return { id: input.id, previousTeam, previousTeams };
        },
        onSuccess: () => {
            toast.success('Team updated successfully');
            void trpc.team.getAll.invalidate();
        },
    });
};

/**
 * Hook for updating a team name with debouncing
 * 
 * @returns A function to update the team name with debouncing
 * 
 * @example
 * ```tsx
 * const updateTeamName = useUpdateTeamName();
 * 
 * const handleNameChange = (e) => {
 *   updateTeamName({
 *     id: 'team-id',
 *     name: e.target.value,
 *   });
 * };
 * ```
 */
export const useUpdateTeamName = () => {
    const trpc = useTRPC();
    const updateTeam = useUpdateTeamMutation();
    const updateTeamDebounced = useDebouncedCallback(
        (params: { id: string, name: string }) => {
            updateTeam.mutate({
                id: params.id,
                data: { name: params.name },
            });
        },
        500
    );

    return useCallback(
        (input: { id: string; name: string }) => {
            updateTeamDebounced(input);

            // Optimistically update the UI immediately
            trpc.team.getById.setData({ id: input.id }, (prevData) => {
                if (!prevData) return prevData;

                return {
                    ...prevData,
                    name: input.name,
                };
            });

            trpc.team.getAll.setData(undefined, (prevData) => {
                if (!prevData || !Array.isArray(prevData)) return prevData;

                return prevData.map((team) => {
                    if (team.id === input.id) {
                        return {
                            ...team,
                            name: input.name,
                        };
                    }
                    return team;
                });
            });
        },
        [trpc, updateTeamDebounced]
    );
};

/**
 * Hook for deleting a team with optimistic updates
 * 
 * @returns A mutation object for deleting a team
 * 
 * @example
 * ```tsx
 * const deleteTeam = useDeleteTeamMutation();
 * 
 * const handleDeleteTeam = async () => {
 *   try {
 *     await deleteTeam.mutate({ id: 'team-id' });
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useDeleteTeamMutation = () => {
    const router = useRouter();
    const trpc = useTRPC();

    return api.team.delete.useMutation({
        onError: (_, __, context: any) => {
            if (context?.previousTeams) {
                trpc.team.getAll.setData(undefined, context.previousTeams);
            }
            toast.error('Failed to delete team');
        },
        onMutate: async (input) => {
            await trpc.team.getAll.cancel();

            const previousTeams = trpc.team.getAll.getData();

            // Optimistically remove the team from the list
            if (previousTeams && Array.isArray(previousTeams)) {
                trpc.team.getAll.setData(undefined,
                    previousTeams.filter(team => team.id !== input.id)
                );
            }

            return { previousTeams };
        },
        onSuccess: () => {
            toast.success('Team deleted successfully');
            void trpc.team.getAll.invalidate();
            router.push('/teams');
        },
    });
};

/**
 * Hook for adding a user to a team with optimistic updates
 * 
 * @returns A mutation object for adding a user to a team
 * 
 * @example
 * ```tsx
 * const addUserToTeam = useAddUserToTeamMutation();
 * 
 * const handleAddUser = async () => {
 *   try {
 *     await addUserToTeam.mutate({
 *       teamId: 'team-id',
 *       userId: 'user-id',
 *       role: 'MEMBER',
 *     });
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useAddUserToTeamMutation = () => {
    const trpc = useTRPC();

    return api.team.addUser.useMutation({
        onError: (_, __, context: any) => {
            if (context?.previousTeam) {
                trpc.team.getById.setData(
                    { id: context.teamId },
                    context.previousTeam
                );
            }
            toast.error('Failed to add user to team');
        },
        onMutate: async (input) => {
            await trpc.team.getById.cancel({ id: input.teamId });

            const previousTeam = trpc.team.getById.getData({ id: input.teamId });

            // We can't optimistically update here because we don't have the user details
            // This would require fetching the user first or passing complete user data

            return { teamId: input.teamId, previousTeam };
        },
        onSuccess: (_, variables) => {
            toast.success('User added to team');
            void trpc.team.getById.invalidate({ id: variables.teamId });
            void trpc.team.getAll.invalidate();
        },
    });
};

/**
 * Hook for removing a user from a team with optimistic updates
 * 
 * @returns A mutation object for removing a user from a team
 * 
 * @example
 * ```tsx
 * const removeUserFromTeam = useRemoveUserFromTeamMutation();
 * 
 * const handleRemoveUser = async () => {
 *   try {
 *     await removeUserFromTeam.mutate({
 *       teamId: 'team-id',
 *       userId: 'user-id',
 *     });
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useRemoveUserFromTeamMutation = () => {
    const trpc = useTRPC();

    return api.team.removeUser.useMutation({
        onError: (_, __, context: any) => {
            if (context?.previousTeam) {
                trpc.team.getById.setData(
                    { id: context.teamId },
                    context.previousTeam
                );
            }
            toast.error('Failed to remove user from team');
        },
        onMutate: async (input) => {
            await trpc.team.getById.cancel({ id: input.teamId });

            const previousTeam = trpc.team.getById.getData({ id: input.teamId });

            // Optimistically remove the user from the team
            if (previousTeam && previousTeam.usersOnTeam) {
                trpc.team.getById.setData({ id: input.teamId }, (old) => {
                    if (!old || !old.usersOnTeam) return old;

                    return {
                        ...old,
                        usersOnTeam: old.usersOnTeam.filter(
                            (userOnTeam) => userOnTeam.userId !== input.userId
                        )
                    };
                });
            }

            return { teamId: input.teamId, previousTeam };
        },
        onSuccess: (_, variables) => {
            toast.success('User removed from team');
            void trpc.team.getById.invalidate({ id: variables.teamId });
            void trpc.team.getAll.invalidate();
        },
    });
};

/**
 * Hook for updating a user's role in a team with optimistic updates
 * 
 * @returns A mutation object for updating a user's role
 * 
 * @example
 * ```tsx
 * const updateUserRole = useUpdateUserRoleMutation();
 * 
 * const handleUpdateRole = async () => {
 *   try {
 *     await updateUserRole.mutate({
 *       teamId: 'team-id',
 *       userId: 'user-id',
 *       role: 'OWNER',
 *     });
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useUpdateUserRoleMutation = () => {
    const trpc = useTRPC();

    return api.team.updateUserRole.useMutation({
        onError: (_, __, context: any) => {
            if (context?.previousTeam) {
                trpc.team.getById.setData(
                    { id: context.teamId },
                    context.previousTeam
                );
            }
            toast.error('Failed to update user role');
        },
        onMutate: async (input) => {
            await trpc.team.getById.cancel({ id: input.teamId });

            const previousTeam = trpc.team.getById.getData({ id: input.teamId });

            // Optimistically update the user's role
            if (previousTeam && previousTeam.usersOnTeam) {
                trpc.team.getById.setData({ id: input.teamId }, (old) => {
                    if (!old || !old.usersOnTeam) return old;

                    return {
                        ...old,
                        usersOnTeam: old.usersOnTeam.map((userOnTeam) => {
                            if (userOnTeam.userId === input.userId) {
                                return {
                                    ...userOnTeam,
                                    role: input.role,
                                };
                            }
                            return userOnTeam;
                        })
                    };
                });
            }

            return { teamId: input.teamId, previousTeam };
        },
        onSuccess: (_, variables) => {
            toast.success(`User role updated to ${variables.role}`);
            void trpc.team.getById.invalidate({ id: variables.teamId });
            void trpc.team.getAll.invalidate();
        },
    });
};

/**
 * Hook for creating a team invite
 * 
 * @returns A mutation object for creating a team invite
 * 
 * @example
 * ```tsx
 * const createInvite = useCreateTeamInviteMutation();
 * 
 * const handleCreateInvite = async () => {
 *   try {
 *     await createInvite.mutate({
 *       teamId: 'team-id',
 *       email: 'user@example.com',
 *       role: 'MEMBER',
 *     });
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useCreateTeamInviteMutation = () => {
    const trpc = useTRPC();

    return api.team.createInvite.useMutation({
        onSuccess: (_, variables) => {
            toast.success(`Invitation sent to ${variables.email}`);
            // TODO: send email to user
            void trpc.team.getInvites.invalidate({ id: variables.teamId });
        },
        onError: (error) => {
            console.error('Failed to create team invite:', error);
            toast.error('Failed to create team invite');
        },
    });
};

/**
 * Hook for deleting a team invite with optimistic updates
 * 
 * @returns A mutation object for deleting a team invite
 * 
 * @example
 * ```tsx
 * const deleteInvite = useDeleteTeamInviteMutation();
 * 
 * const handleDeleteInvite = async (teamId, inviteId) => {
 *   try {
 *     await deleteInvite.mutate({ 
 *       teamId,
 *       inviteId 
 *     });
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useDeleteTeamInviteMutation = () => {
    const trpc = useTRPC();

    return api.team.deleteInvite.useMutation({
        onError: (_, __, context: any) => {
            if (context?.previousInvites && context?.teamId) {
                trpc.team.getInvites.setData(
                    { id: context.teamId },
                    context.previousInvites
                );
            }
            toast.error('Failed to delete team invite');
        },
        onMutate: async (input: { inviteId: string, teamId?: string }) => {
            if (!input.teamId) return {};

            await trpc.team.getInvites.cancel({ id: input.teamId });

            const previousInvites = trpc.team.getInvites.getData({ id: input.teamId });

            // Instead of trying to handle complex types, just invalidate the query
            // This avoids type errors while still providing a good UX
            void trpc.team.getInvites.invalidate({ id: input.teamId });

            return { teamId: input.teamId, previousInvites };
        },
        onSuccess: (_, variables: { inviteId: string, teamId?: string }) => {
            toast.success('Invitation deleted');
            if (variables.teamId) {
                void trpc.team.getInvites.invalidate({ id: variables.teamId });
            }
        },
    });
};

/**
 * Hook for accepting a team invite
 * 
 * @returns A mutation object for accepting a team invite
 * 
 * @example
 * ```tsx
 * const acceptInvite = useAcceptTeamInviteMutation();
 * 
 * const handleAcceptInvite = async () => {
 *   try {
 *     await acceptInvite.mutate({ code: 'invite-code' });
 *     // Handle success
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export const useAcceptTeamInviteMutation = () => {
    const router = useRouter();
    const trpc = useTRPC();

    return api.team.acceptInvite.useMutation({
        onSuccess: (data) => {
            toast.success('You have joined the team');
            void trpc.team.getAll.invalidate();
            if (data.teamId) {
                router.push(`/teams/${data.teamId}`);
            }
            return data;
        },
        onError: (error) => {
            console.error('Failed to accept team invite:', error);
            toast.error('Failed to accept team invite');
        },
    });
}; 