/**
 * Types used in the team section components
 *
 * @file Team section type definitions
 */

import { TeamRole } from '@prisma/client';
import { useRouter } from 'next/navigation';

/**
 * Team representation with detailed information
 *
 * @interface Team
 */
export interface Team {
  /** Unique identifier for the team */
  id: string;
  /** Display name of the team */
  name?: string;
  /** Email address associated with the team */
  email?: string;
  /** Base currency used by the team for financial calculations */
  baseCurrency?: string;
  /** URL to the team's logo image */
  logoUrl?: string;
  /** Unique slug used in URLs */
  slug?: string;
  /** Whether email forwarding is enabled for this team */
  inboxForwarding?: boolean;
  /** Feature flags enabled for this team */
  flags?: string[];
  /** Users who are members of this team and their roles */
  usersOnTeam?: UsersOnTeam[];
}

/**
 * User relationship to a team
 *
 * @interface UsersOnTeam
 */
export interface UsersOnTeam {
  /** ID of the team */
  teamId: string;
  /** ID of the user */
  userId: string;
  /** User's role within the team */
  role: TeamRole;
  /** User profile details */
  user?: {
    /** User's display name */
    name?: string;
    /** User's profile image URL */
    profileImageUrl?: string;
  };
}

/**
 * Props for the main team section component
 *
 * @interface TeamSectionProps
 */
export interface TeamSectionProps {
  /** ID of the current user */
  userId: string;
}

/**
 * Props for the team header component
 *
 * @interface TeamHeaderProps
 */
export interface TeamHeaderProps {
  /** Whether data is being loaded */
  isLoading: boolean;
}

/**
 * Props for the team selector component
 *
 * @interface TeamSelectorProps
 */
export interface TeamSelectorProps {
  /** List of available teams */
  teams: Team[] | undefined;
  /** ID of the currently selected team */
  selectedTeamId: string | null;
  /** Handler for team selection changes */
  onTeamChange: (teamId: string) => void;
  /** Function to get user's role in a given team */
  getUserRoleInTeam: (teamId: string) => string | null;
}

/**
 * Props for the team card component
 *
 * @interface TeamCardProps
 */
export interface TeamCardProps {
  /** Team object with detailed information */
  team: Team;
  /** Current user's role in the team */
  userRole: string | null;
  /** Handler for team management action */
  onManageTeam: () => void;
  /** Router object for navigation */
  router: ReturnType<typeof useRouter>;
}

/**
 * Props for the team card header component
 *
 * @interface TeamCardHeaderProps
 */
export interface TeamCardHeaderProps {
  /** Team object with detailed information */
  team: Team;
  /** Whether the current user is a team owner */
  isOwner: boolean;
  /** Handler for team management action */
  onManageTeam: () => void;
}

/**
 * Props for the team slug setting component
 *
 * @interface TeamSlugSettingProps
 */
export interface TeamSlugSettingProps {
  /** Current team slug */
  teamSlug: string | undefined;
  /** Whether the current user is a team owner */
  isOwner: boolean;
  /** Handler for slug updates */
  onSlugUpdate: (slug: string) => Promise<void>;
  /** Whether slug updates are currently in progress */
  isUpdating: boolean;
}

/**
 * Props for the team currency setting component
 *
 * @interface TeamCurrencySettingProps
 */
export interface TeamCurrencySettingProps {
  /** Current base currency code */
  baseCurrency: string | undefined;
  /** Whether the current user is a team owner */
  isOwner: boolean;
  /** Handler for currency updates */
  onCurrencyUpdate: (currencyCode: string) => Promise<void>;
  /** Whether currency updates are in progress */
  isUpdating: boolean;
}

/**
 * Props for the team inbox forwarding setting component
 *
 * @interface TeamInboxForwardingProps
 */
export interface TeamInboxForwardingProps {
  /** Whether inbox forwarding is enabled */
  inboxForwarding: boolean;
  /** Whether the current user is a team owner */
  isOwner: boolean;
  /** Handler for toggling inbox forwarding */
  onToggleInboxForwarding: (value: boolean) => Promise<void>;
  /** Whether updates are in progress */
  isUpdating: boolean;
}

/**
 * Props for the team features setting component
 *
 * @interface TeamFeaturesSettingProps
 */
export interface TeamFeaturesSettingProps {
  /** Currently enabled feature flags */
  flags: string[];
  /** Whether the current user is a team owner */
  isOwner: boolean;
  /** Handler for updating feature flags */
  onFlagsUpdate: (flags: string[]) => Promise<void>;
  /** Whether updates are in progress */
  isUpdating: boolean;
}

/**
 * Props for the team members list component
 *
 * @interface TeamMembersListProps
 */
export interface TeamMembersListProps {
  /** Team information including member list */
  team: Team;
  /** Whether the current user is a team owner */
  isOwner: boolean;
  /** Handler for team management action */
  onManageTeam: () => void;
  /** Handler for user role updates */
  onRoleUpdate: (userId: string, role: TeamRole) => Promise<void>;
  /** Whether role updates are in progress */
  isRoleUpdating: boolean;
  /** ID of the member being updated */
  updatingMemberId: string | null;
}

/**
 * Props for the team member item component
 *
 * @interface TeamMemberItemProps
 */
export interface TeamMemberItemProps {
  /** Member information */
  member: UsersOnTeam;
  /** Whether the current user is a team owner */
  isOwner: boolean;
  /** Handler for user role updates */
  onRoleUpdate: (userId: string, role: TeamRole) => Promise<void>;
  /** Whether role updates are in progress */
  isUpdating: boolean;
  /** Whether this member is being updated */
  isBeingUpdated: boolean;
  /** Total number of team owners */
  ownersCount: number;
  /** Whether this member is the current user */
  isCurrentUser: boolean;
}

/**
 * Props for the empty team state component
 *
 * @interface EmptyTeamStateProps
 */
export interface EmptyTeamStateProps {
  /** Handler for team creation action */
  onCreateTeam: () => void;
}

/**
 * Props for the team actions component
 *
 * @interface TeamActionsProps
 */
export interface TeamActionsProps {
  /** Handler for viewing all teams */
  onViewAllTeams: () => void;
  /** Handler for creating a new team */
  onCreateTeam: () => void;
  /** List of available teams */
  teams: Team[] | undefined;
  /** ID of the currently selected team */
  selectedTeamId: string | null;
  /** Handler for team selection changes */
  onTeamSelect: (teamId: string) => void;
  /** Function to get user's role in a given team */
  getUserRoleInTeam: (teamId: string) => string | null;
}

/**
 * Team role definition with metadata
 *
 * @interface TeamRoleDefinition
 */
export interface TeamRoleDefinition {
  /** Role identifier */
  id: TeamRole;
  /** Display name of the role */
  name: string;
  /** Description of role capabilities */
  description: string;
  /** Icon component for visual representation */
  icon: React.ElementType;
}

/**
 * Feature flag definition
 *
 * @interface FeatureFlag
 */
export interface FeatureFlag {
  /** Unique feature identifier */
  id: string;
  /** Display name of the feature */
  name: string;
}
