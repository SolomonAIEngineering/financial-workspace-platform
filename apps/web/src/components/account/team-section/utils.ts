/**
 * Utility functions and constants for team components
 *
 * @file Team utils
 */

import { Currency, currencies } from '@/types/status';
import { FeatureFlag, TeamRoleDefinition } from './types';
import { Shield, Users } from 'lucide-react';

import { TeamRole } from '@prisma/client';

/**
 * Common team feature flags with their display information
 *
 * @constant commonFlags
 */
export const commonFlags: FeatureFlag[] = [
  { id: 'feature_analytics', name: 'Analytics' },
  { id: 'feature_invoicing', name: 'Invoicing' },
  { id: 'feature_documents', name: 'Documents' },
  { id: 'feature_reports', name: 'Reports' },
  { id: 'feature_time_tracking', name: 'Time Tracking' },
  { id: 'beta', name: 'Beta Features' },
];

/**
 * Available team roles with metadata
 *
 * @constant teamRoles
 */
export const teamRoles: TeamRoleDefinition[] = [
  {
    id: TeamRole.OWNER,
    name: 'Owner',
    description: 'Can manage team settings and members',
    icon: Shield,
  },
  {
    id: TeamRole.MEMBER,
    name: 'Member',
    description: 'Can view and contribute to team resources',
    icon: Users,
  },
];

/**
 * Retrieves currency information based on currency code
 *
 * @param code - The currency code to look up (e.g., 'USD')
 * @returns The currency information including symbol and name
 */
export const getCurrencyInfo = (code: string): Currency => {
  const currency = currencies.find((c) => c.code === code);
  return (
    currency || { code: code || 'USD', name: 'Unknown Currency', symbol: '$' }
  );
};

/**
 * Validates a team slug according to formatting rules
 *
 * @param slug - The slug string to validate
 * @returns Object containing validation result and error message if invalid
 */
export const validateTeamSlug = (
  slug: string
): { isValid: boolean; errorMessage: string } => {
  if (!slug.trim()) {
    return { isValid: false, errorMessage: 'Slug cannot be empty' };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      isValid: false,
      errorMessage:
        'Slug can only contain lowercase letters, numbers, and hyphens',
    };
  }

  return { isValid: true, errorMessage: '' };
};

/**
 * Counts the number of owners in a team
 *
 * @param team - The team object containing user roles
 * @returns The count of users with OWNER role
 */
export const countTeamOwners = (team: {
  usersOnTeam?: { role: TeamRole }[];
}): number => {
  return team.usersOnTeam?.filter((u) => u.role === TeamRole.OWNER).length || 0;
};

/**
 * Generates a fallback for avatar display
 *
 * @param name - The name to generate initials from
 * @returns The first two uppercase letters of the name or a default value
 */
export const getAvatarFallback = (name?: string): string => {
  return (name || '').substring(0, 2).toUpperCase() || 'TM';
};
