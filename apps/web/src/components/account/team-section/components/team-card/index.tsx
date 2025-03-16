/**
 * Team card component
 *
 * @file Team Card Component
 */

import { useUpdateTeamMutation, useUpdateUserRoleMutation } from '@/trpc/hooks/team-hooks';

import { Separator } from '@/registry/default/potion-ui/separator';
import { Shield } from 'lucide-react';
import { TeamCardHeader } from './team-card-header';
import { TeamCardProps } from '../../types';
import { TeamCurrencySetting } from './team-settings/currency-setting';
import { TeamFeaturesSetting } from './team-settings/features-setting';
import { TeamInboxForwardingSetting } from './team-settings/inbox-forwarding-setting';
import { TeamMembersList } from './team-members/members-list';
import { TeamRole } from '@prisma/client';
import { TeamSlugSetting } from './team-settings/slug-setting';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useState } from 'react';

/**
 * Component for displaying comprehensive team information
 * 
 * Shows team identity, settings, and members with appropriate
 * management controls based on user permissions.
 *
 * @param props - Component properties
 * @param props.team - Team object with detailed information
 * @param props.userRole - Current user's role in the team
 * @param props.onManageTeam - Handler for team management action
 * @param props.router - Router object for navigation
 * @returns Team card component with settings and member list
 * 
 * @example
 * ```tsx
 * <TeamCard
 *   team={selectedTeam}
 *   userRole={getUserRoleInTeam(selectedTeam.id)}
 *   onManageTeam={handleManageTeam}
 *   router={router}
 * />
 * ```
 */
export function TeamCard({ team, userRole, onManageTeam, router }: TeamCardProps) {
    const isOwner = userRole === 'OWNER';

    // Mutation hooks
    const updateTeam = useUpdateTeamMutation();
    const updateUserRole = useUpdateUserRoleMutation();

    // Local state for updating
    const [isUpdatingSlug, setIsUpdatingSlug] = useState(false);
    const [isCurrencyUpdating, setIsCurrencyUpdating] = useState(false);
    const [isFeatureUpdating, setIsFeatureUpdating] = useState(false);
    const [isRoleUpdating, setIsRoleUpdating] = useState(false);
    const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

    /**
     * Handle slug updates
     */
    const handleSlugUpdate = async (slug: string) => {
        setIsUpdatingSlug(true);
        try {
            await updateTeam.mutateAsync({
                id: team.id,
                data: { slug }
            });
            toast.success('Team slug updated successfully');
            return true;
        } catch (error: any) {
            console.error('Failed to update slug:', error);
            if (error.message?.includes('unique constraint')) {
                throw new Error('This slug is already taken');
            } else {
                toast.error('Failed to update team slug');
                throw error;
            }
        } finally {
            setIsUpdatingSlug(false);
        }
    };

    /**
     * Handle currency updates
     */
    const handleCurrencyUpdate = async (currencyCode: string) => {
        setIsCurrencyUpdating(true);
        try {
            await updateTeam.mutateAsync({
                id: team.id,
                data: { baseCurrency: currencyCode }
            });
            toast.success(`Currency updated to ${currencyCode}`);
        } catch (error) {
            console.error('Failed to update currency:', error);
            toast.error('Failed to update currency');
            throw error;
        } finally {
            setIsCurrencyUpdating(false);
        }
    };

    /**
     * Handle inbox forwarding toggle
     */
    const handleInboxForwardingUpdate = async (value: boolean) => {
        try {
            await updateTeam.mutateAsync({
                id: team.id,
                data: { inboxForwarding: value }
            });
            toast.success(`Inbox forwarding ${value ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Failed to update inbox forwarding:', error);
            toast.error('Failed to update inbox forwarding setting');
            throw error;
        }
    };

    /**
     * Handle feature flags updates
     */
    const handleFlagsUpdate = async (flags: string[]) => {
        setIsFeatureUpdating(true);
        try {
            await updateTeam.mutateAsync({
                id: team.id,
                data: { flags }
            });
            toast.success('Team features updated');
        } catch (error) {
            console.error('Failed to update team flags:', error);
            toast.error('Failed to update team features');
            throw error;
        } finally {
            setIsFeatureUpdating(false);
        }
    };

    /**
     * Handle user role updates
     */
    const handleRoleUpdate = async (userId: string, newRole: TeamRole) => {
        setIsRoleUpdating(true);
        setUpdatingMemberId(userId);
        try {
            await updateUserRole.mutateAsync({
                teamId: team.id,
                userId: userId,
                role: newRole
            });
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            console.error('Failed to update role:', error);
            toast.error("Failed to update user role");
            throw error;
        } finally {
            setIsRoleUpdating(false);
            setUpdatingMemberId(null);
        }
    };

    return (
        <motion.div
            className="relative overflow-hidden rounded-lg border bg-card p-[3%] shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Decorative gradient corner */}
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/5" />

            <TeamCardHeader
                team={team}
                isOwner={isOwner}
                onManageTeam={onManageTeam}
            />

            <Separator className="my-4" />

            <div className="grid grid-cols-2 gap-4">
                {/* Slug setting */}
                <TeamSlugSetting
                    teamSlug={team.slug}
                    isOwner={isOwner}
                    onSlugUpdate={handleSlugUpdate}
                    isUpdating={isUpdatingSlug}
                />

                {/* Currency setting */}
                <TeamCurrencySetting
                    baseCurrency={team.baseCurrency}
                    isOwner={isOwner}
                    onCurrencyUpdate={handleCurrencyUpdate}
                    isUpdating={isCurrencyUpdating}
                />

                {/* Inbox Forwarding Toggle */}
                <TeamInboxForwardingSetting
                    inboxForwarding={team.inboxForwarding || false}
                    isOwner={isOwner}
                    onToggleInboxForwarding={handleInboxForwardingUpdate}
                    isUpdating={updateTeam.isPending}
                />

                {/* Team Features/Flags */}
                <TeamFeaturesSetting
                    flags={team.flags || []}
                    isOwner={isOwner}
                    onFlagsUpdate={handleFlagsUpdate}
                    isUpdating={isFeatureUpdating}
                />

                {/* Role display */}
                <div className="space-y-1">
                    <h4 className="text-xs font-medium uppercase text-muted-foreground">Role</h4>
                    <p className="flex items-center text-sm font-medium">
                        <Shield className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                        {userRole === 'OWNER' ? 'Owner' : 'Member'}
                    </p>
                </div>

                {/* Members section */}
                <TeamMembersList
                    team={team}
                    isOwner={isOwner}
                    onManageTeam={onManageTeam}
                    onRoleUpdate={handleRoleUpdate}
                    isRoleUpdating={isRoleUpdating}
                    updatingMemberId={updatingMemberId}
                />
            </div>
        </motion.div>
    );
} 