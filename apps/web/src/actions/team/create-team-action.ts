import { authActionClient } from '../safe-action';
import { revalidatePath } from 'next/cache';
import { trpc } from '@/trpc/server';
import { z } from 'zod';

/**
 * Schema for validating team creation.
 *
 * This schema defines the structure and validation rules for creating a new
 * team:
 *
 * - Name: Required team name with minimum length of 2 characters
 * - Email: Required valid email address for the team
 * - BaseCurrency: Optional currency code, defaults to 'USD'
 */
const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  baseCurrency: z.string().default('USD'),
});

/**
 * Server action for creating a new team.
 *
 * This authenticated action handles the creation of a new team and
 * automatically assigns the current user as the team owner.
 *
 * @remarks
 *   The action uses the authActionClient to ensure the user is authenticated
 *   before allowing the team creation. It validates all input against the
 *   createTeamSchema before processing the creation through the tRPC API.
 *
 *   After a successful creation, it revalidates the teams page to ensure the UI
 *   reflects the latest information.
 * @example
 *   ```tsx
 *   const result = await createTeamAction({
 *     name: "My Team",
 *     email: "team@example.com",
 *     baseCurrency: "USD"
 *   });
 *
 *   if (result.success) {
 *     // Handle success
 *   } else {
 *     // Handle error
 *   }
 *   ```;
 *
 * @param ctx - The context object containing the authenticated user
 * @param parsedInput - The validated input data matching the createTeamSchema
 * @returns A promise that resolves to an object containing:
 *
 *   - Success: A boolean indicating whether the operation was successful
 *   - Team: The created team object (if successful)
 *   - Error: An error message (if unsuccessful)
 */
export const createTeamAction = authActionClient
  .schema(createTeamSchema)
  .action(async ({ ctx: { user }, parsedInput }) => {
    const validated = createTeamSchema.parse(parsedInput);

    try {
      // Use the tRPC router instead of direct Prisma access
      const team = await trpc.team.create({
        name: validated.name,
        email: validated.email,
        baseCurrency: validated.baseCurrency,
      });

      revalidatePath('/teams');
      return { success: true, team };
    } catch (error) {
      console.error('Failed to create team:', error);
      return { success: false, error: 'Failed to create team' };
    }
  });
