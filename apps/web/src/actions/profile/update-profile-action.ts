import { authActionClient } from "../safe-action";
import { revalidatePath } from "next/cache";
import { trpc } from "@/trpc/server";
import { z } from "zod";

/**
 * Schema for validating profile updates.
 * 
 * This schema defines the structure and validation rules for updating a user's profile:
 * - userId: Required string identifier for the user
 * - name: Required user's full name with minimum length of 2 characters
 * - email: Required valid email address
 * - profileImageUrl: Optional URL for the user's profile image
 * - firstName: Optional user's first name
 * - lastName: Optional user's last name
 * - phoneNumber: Optional user's phone number
 */
const profileSchema = z.object({
    userId: z.string(),
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    profileImageUrl: z.string().url().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
});

/**
 * Server action for updating a user's profile.
 * 
 * This authenticated action handles updates to a user's profile information,
 * including name, email, profile image, and contact details.
 * 
 * @remarks
 * The action uses the authActionClient to ensure the user is authenticated before
 * allowing the update. It validates all input against the profileSchema
 * before processing the update through the tRPC API.
 * 
 * After a successful update, it revalidates the profile page to ensure the UI reflects
 * the latest information.
 * 
 * @param ctx - The context object containing the authenticated user
 * @param parsedInput - The validated input data matching the profileSchema
 * 
 * @returns A promise that resolves to an object containing:
 *   - success: A boolean indicating whether the operation was successful
 *   - user: The updated user object (if successful)
 *   - error: An error message (if unsuccessful)
 * 
 * @example
 * ```tsx
 * const result = await updateProfileAction({
 *   userId: "user-id",
 *   name: "John Doe",
 *   email: "john@example.com",
 *   firstName: "John",
 *   lastName: "Doe"
 * });
 * 
 * if (result.success) {
 *   // Handle success
 * } else {
 *   // Handle error
 * }
 * ```
 */
export const updateProfileAction = authActionClient
    .schema(profileSchema)
    .action(async ({ ctx: { user }, parsedInput }) => {
        const validated = profileSchema.parse(parsedInput);

        try {
            // Use the tRPC router to update the user's profile
            const updatedUser = await trpc.user.updateSettings({
                bio: undefined, // Not included in the form
                email: validated.email,
                firstName: validated.firstName,
                lastName: validated.lastName,
                name: validated.name,
                profileImageUrl: validated.profileImageUrl,
            });

            // Also update contact info if phone number is provided
            if (validated.phoneNumber) {
                await trpc.user.updateContactInfo({
                    phoneNumber: validated.phoneNumber,
                });
            }

            revalidatePath('/profile');
            revalidatePath('/onboarding/profile');
            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Failed to update profile:', error);
            return { success: false, error: 'Failed to update profile' };
        }
    });