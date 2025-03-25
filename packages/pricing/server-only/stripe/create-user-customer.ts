import { STRIPE_CUSTOMER_TYPE } from '@solomonai/lib/constants/billing'
import { stripe } from '@solomonai/lib/server-only/stripe'
import { z } from 'zod'

/**
 * Schema for validating create user customer options
 */
const CreateUserCustomerSchema = z.object({
    name: z.string().min(1, 'User name is required'),
    email: z.string().email('Invalid email format'),
    userId: z.string().min(1, 'User ID is required'),
})

/**
 * Type for create user customer options
 */
type CreateUserCustomerOptions = z.infer<typeof CreateUserCustomerSchema>

/**
 * Create a Stripe customer for a given user.
 *
 * @param options - Options for creating the user customer
 * @param options.name - The name of the user
 * @param options.email - The email address for the user
 * @param options.userId - The ID of the user in the database
 * @returns Promise resolving to the created Stripe customer
 * @throws {Stripe.errors.StripeError} If there's an error creating the customer
 * @throws {ZodError} If the input validation fails
 *
 * @example
 * ```ts
 * const customer = await createUserCustomer({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   userId: 'user_123'
 * });
 * console.info(customer.id);
 * ```
 */
export const createUserCustomer = async ({
    name,
    email,
    userId,
}: CreateUserCustomerOptions) => {
    // Validate input
    CreateUserCustomerSchema.parse({ name, email, userId })

    return await stripe.customers.create({
        name,
        email,
        metadata: {
            type: STRIPE_CUSTOMER_TYPE.INDIVIDUAL,
            userId,
        },
    })
}
