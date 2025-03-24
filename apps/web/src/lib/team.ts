import { auth } from '@/components/auth/rsc/auth';
import { trpc } from '@/trpc/server';
import { z } from 'zod';

// Zod schemas for return types
export const TeamsResponseSchema = z.object({
  teams: z.array(z.any()), // You can make this more specific based on team structure
  defaultTeamId: z.string().nullable(),
});

export const DefaultTeamIdSchema = z.string().nullable();

export const UserAndTeamIdSchema = z.object({
  userId: z.string().nullable().optional(),
  defaultTeamId: z.string().nullable().optional(),
});

// Type definitions from Zod schemas
export type TeamsResponse = z.infer<typeof TeamsResponseSchema>;
export type DefaultTeamId = z.infer<typeof DefaultTeamIdSchema>;
export type UserAndTeamId = z.infer<typeof UserAndTeamIdSchema>;

/**
 * Fetches all teams and the default team for the current user
 *
 * @returns A tuple containing [all teams, default team ID]
 */
export async function getUserTeams(): Promise<TeamsResponse> {
  const [teams, defaultTeam] = await Promise.all([
    trpc.team.getAll(),
    trpc.team.getDefaultTeam(),
  ]);

  const defaultTeamId = defaultTeam ? defaultTeam.id : teams[0]?.id;

  return { teams, defaultTeamId };
}

/**
 * Returns just the default team ID for the current user
 *
 * @returns The default team ID or undefined if no teams exist
 */
export async function getDefaultTeamId(): Promise<DefaultTeamId> {
  const defaultTeam = await trpc.team.getDefaultTeam();

  if (defaultTeam) {
    return defaultTeam.id;
  }

  // If no default team is set, use the first team
  const teams = await trpc.team.getAll();
  return teams[0]?.id;
}

/**
 * Gets both current user ID and default team ID
 *
 * @returns Object containing userId and defaultTeamId
 */
export async function getUserAndTeamId(): Promise<UserAndTeamId> {
  const [currentUser, defaultTeamId] = await Promise.all([
    auth(),
    getDefaultTeamId(),
  ]);

  return {
    userId: currentUser?.user?.id,
    defaultTeamId,
  };
}
