import { authActionClient } from "../safe-action";
import { revalidatePath } from "next/cache";
import { trpc } from "@/trpc/server";
import { z } from "zod";

// Schema for user preferences
const userPreferencesSchema = z.object({
    userId: z.string(),
    displayPreferences: z
        .object({
            compactMode: z.boolean().optional(),
            fontSize: z.enum(['small', 'medium', 'large']).optional(),
            theme: z.enum(['light', 'dark', 'system']).optional(),
        })
        .optional()
        .nullable(),
    documentPreferences: z
        .object({
            autoSave: z.boolean().optional(),
            defaultView: z.enum(['edit', 'preview']).optional(),
            showComments: z.boolean().optional(),
        })
        .optional()
        .nullable(),
    notificationPreferences: z
        .object({
            documentUpdates: z.boolean().optional(),
            emailNotifications: z.boolean().optional(),
            pushNotifications: z.boolean().optional(),
            teamUpdates: z.boolean().optional(),
        })
        .optional()
        .nullable(),
});

/**
 * Server action for updating a user's preferences.
 * 
 * This authenticated action handles updates to a user's preferences, including display settings,
 * document settings, and notification preferences. It validates all input against the 
 * userPreferencesSchema before processing.
 * 
 * @remarks
 * The action uses the authActionClient to ensure the user is authenticated before
 * allowing the update. It processes all preference fields defined in the userPreferencesSchema,
 * making it suitable for complete preference updates or partial updates of specific sections.
 * 
 * The preferences are organized into three main categories:
 * - displayPreferences: UI settings like theme, font size, and compact mode
 * - documentPreferences: Document handling settings like auto-save and default view
 * - notificationPreferences: Settings for various notification channels and types
 * 
 * After a successful update, it revalidates the profile page to ensure the UI reflects
 * the latest preferences.
 * 
 * @returns An object containing:
 * - success: Boolean indicating if the operation succeeded
 * - user: The updated user object (on success)
 * - error: Error message string (on failure)
 * 
 * @example
 * ```tsx
 * const result = await updateProfilePreferencesAction({
 *   userId: user.id,
 *   displayPreferences: {
 *     theme: 'dark',
 *     fontSize: 'medium'
 *   },
 *   notificationPreferences: {
 *     emailNotifications: true,
 *     pushNotifications: false
 *   }
 * });
 * 
 * if (result.success) {
 *   // Handle success
 * } else {
 *   // Handle error
 * }
 * ```
 */
export const updateProfilePreferencesAction = authActionClient
    .schema(userPreferencesSchema)
    .action(async ({ ctx: { user }, parsedInput }) => {
        const validated = userPreferencesSchema.parse(parsedInput);
        try {
            // Use the tRPC router instead of direct Prisma access
            const user = await trpc.user.updatePreferences({
                displayPreferences: validated.displayPreferences,
                documentPreferences: validated.documentPreferences,
                notificationPreferences: validated.notificationPreferences,
            });

            revalidatePath('/profile');
            return { success: true, user };
        } catch (error) {
            console.error('Failed to update user preferences:', error);
            return { success: false, error: 'Failed to update user preferences' };
        }
    });
