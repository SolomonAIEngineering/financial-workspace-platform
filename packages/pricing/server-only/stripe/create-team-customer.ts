import { STRIPE_CUSTOMER_TYPE } from '@solomonai/lib/constants/billing'
import { stripe } from '@solomonai/lib/server-only/stripe'
import { z } from 'zod'

/**
 * Schema for validating create team customer options
 */
const CreateTeamCustomerSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  email: z.string().email('Invalid email format'),
})

/**
 * Type for create team customer options
 */
type CreateTeamCustomerOptions = z.infer<typeof CreateTeamCustomerSchema>

/**
 * Create a Stripe customer for a given team.
 *
 * @param options - Options for creating the team customer
 * @param options.name - The name of the team
 * @param options.email - The email address for the team
 * @returns Promise resolving to the created Stripe customer
 * @throws {Stripe.errors.StripeError} If there's an error creating the customer
 * @throws {ZodError} If the input validation fails
 *
 * @example
 * ```ts
 * const customer = await createTeamCustomer({
 *   name: 'Acme Corp',
 *   email: 'billing@acme.com'
 * });
 * console.info(customer.id);
 * ```
 */
export const createTeamCustomer = async ({
  name,
  email,
}: CreateTeamCustomerOptions) => {
  // Validate input
  CreateTeamCustomerSchema.parse({ name, email })

  return await stripe.customers.create({
    name,
    email,
    metadata: {
      type: STRIPE_CUSTOMER_TYPE.TEAM,
    },
  })
}
