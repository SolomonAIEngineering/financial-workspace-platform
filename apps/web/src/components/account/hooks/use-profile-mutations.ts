/**
 * Custom hook that provides mutations for updating different profile sections
 *
 * @file Profile Mutations Hook
 */

import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { api } from '@/trpc/react';

import type { ProfileMutations } from '../types/profile-types';

/**
 * Custom hook that manages all profile-related mutations
 *
 * @example
 *   const mutations = useProfileMutations();
 *   // Later use mutations.updateProfileMutation.mutateAsync({ name: 'New Name' });
 *
 * @returns An object containing all mutations for profile updates
 */
export function useProfileMutations(): ProfileMutations {
  const queryClient = useQueryClient();

  /** Mutation for updating basic profile information */
  const updateProfileMutation = api.user.updateSettings.useMutation({
    onError: (error) => {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', error);
    },
    onSuccess: async () => {
      toast.success('Profile updated successfully');
      await invalidateQueries();
    },
  });

  /** Mutation for updating professional profile details */
  const updateProfessionalProfileMutation =
    api.user.updateProfessionalProfile.useMutation({
      onError: (error) => {
        toast.error('Failed to update professional profile');
        console.error('Error updating professional profile:', error);
      },
      onSuccess: async () => {
        toast.success('Professional profile updated successfully');
        await invalidateQueries();
      },
    });

  /** Mutation for updating organization information */
  const updateOrganizationInfoMutation =
    api.user.updateOrganizationInfo.useMutation({
      onError: (error) => {
        toast.error('Failed to update organization information');
        console.error('Error updating organization information:', error);
      },
      onSuccess: async () => {
        toast.success('Organization information updated successfully');
        await invalidateQueries();
      },
    });

  /** Mutation for updating contact information */
  const updateContactInfoMutation = api.user.updateContactInfo.useMutation({
    onError: (error) => {
      toast.error('Failed to update contact information');
      console.error('Error updating contact information:', error);
    },
    onSuccess: async () => {
      toast.success('Contact information updated successfully');
      await invalidateQueries();
    },
  });

  /** Mutation for updating social profiles */
  const updateSocialProfilesMutation =
    api.user.updateSocialProfiles.useMutation({
      onError: (error) => {
        toast.error('Failed to update social profiles');
        console.error('Error updating social profiles:', error);
      },
      onSuccess: async () => {
        toast.success('Social profiles updated successfully');
        await invalidateQueries();
      },
    });

  /**
   * Helper function to invalidate all relevant queries after mutations
   *
   * @private
   */
  const invalidateQueries = async () => {
    await queryClient.invalidateQueries({
      queryKey: [['user', 'getSettings']],
    });
    await queryClient.invalidateQueries({
      queryKey: [['user', 'getFullProfile']],
    });
    await queryClient.invalidateQueries({ queryKey: [['layout', 'app']] });
  };

  return {
    updateContactInfoMutation,
    updateOrganizationInfoMutation,
    updateProfessionalProfileMutation,
    updateProfileMutation,
    updateSocialProfilesMutation,
  };
}
