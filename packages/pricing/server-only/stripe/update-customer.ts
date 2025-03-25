import { stripe } from '@solomonai/lib/server-only/stripe'
import { z } from 'zod'

/**
 * Schema for validating customer update options
 */
export const UpdateCustomerSchema = z
  .object({
    customerId: z.string().min(1, 'Customer ID is required'),
    name: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
  })
  .refine((data) => data.name || data.email, {
    message: 'At least one of name or email must be provided',
    path: ['name', 'email'],
  })

/**
 * Type for customer update options
 */
export type UpdateCustomerOptions = z.infer<typeof UpdateCustomerSchema>

/**
 * Updates a Stripe customer's information
 *
 * @param options - The options for updating the customer
 * @param options.customerId - The ID of the customer to update
 * @param options.name - Optional new name for the customer
 * @param options.email - Optional new email for the customer
 *
 * @throws {Stripe.errors.StripeError} If there's an error updating the customer
 * @throws {ZodError} If the input validation fails
 *
 * @example
 * ```ts
 * await updateCustomer({
 *   customerId: 'cus_123',
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * ```
 */
export const updateCustomer = async ({
  customerId,
  name,
  email,
}: UpdateCustomerOptions) => {
  // Validate input
  UpdateCustomerSchema.parse({ customerId, name, email })

  return await stripe.customers.update(customerId, {
    name,
    email,
  })
}
