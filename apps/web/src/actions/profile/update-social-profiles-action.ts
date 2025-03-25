'use server';

import { authActionClient } from '../safe-action';
import { revalidatePath } from 'next/cache';
import { trpc } from '@/trpc/server';
import { z } from 'zod';

// Schema for social profiles
const socialProfilesSchema = z.object({
  userId: z.string(),
  githubProfile: z.string().url('Invalid URL').max(255).optional().nullable(),
  linkedinProfile: z.string().url('Invalid URL').max(255).optional().nullable(),
  twitterProfile: z.string().url('Invalid URL').max(255).optional().nullable(),
});

/**
 * Server action for updating a user's social profiles.
 *
 * This authenticated action handles updates to a user's social media profiles,
 * including GitHub, LinkedIn, and Twitter links. It validates all input against
 * the socialProfilesSchema before processing the update through the tRPC API.
 *
 * After a successful update, it revalidates the profile page to ensure the UI
 * reflects the latest information.
 *
 * @param ctx - The context object containing the authenticated user
 * @param parsedInput - The validated input data matching the
 *   socialProfilesSchema
 * @returns A promise that resolves to an object containing:
 *
 *   - Success: A boolean indicating whether the operation was successful
 *   - User: The updated user object (if successful)
 *   - Error: An error message (if unsuccessful)
 */
export const updateSocialProfilesAction = authActionClient
  .schema(socialProfilesSchema)
  .action(async ({ ctx: { user }, parsedInput }) => {
    const validated = socialProfilesSchema.parse(parsedInput);

    try {
      // Use the tRPC router instead of direct Prisma access
      const user = await trpc.user.updateSocialProfiles({
        githubProfile: validated.githubProfile,
        linkedinProfile: validated.linkedinProfile,
        twitterProfile: validated.twitterProfile,
      });

      revalidatePath('/profile');
      return { success: true, user };
    } catch (error) {
      console.error('Failed to update social profiles:', error);
      return { success: false, error: 'Failed to update social profiles' };
    }
  });
