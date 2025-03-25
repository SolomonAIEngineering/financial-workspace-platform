import { stripe } from '@solomonai/lib/server-only/stripe'
import { z } from 'zod'

/**
 * Schema for validating delete customer payment methods options
 */
const DeleteCustomerPaymentMethodsSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
})

/**
 * Type for delete customer payment methods options
 */
type DeleteCustomerPaymentMethodsOptions = z.infer<
  typeof DeleteCustomerPaymentMethodsSchema
>

/**
 * Delete all attached payment methods for a given customer.
 *
 * @param options - Options for deleting payment methods
 * @param options.customerId - The ID of the customer whose payment methods should be deleted
 * @returns Promise resolving when all payment methods are deleted
 * @throws {Stripe.errors.StripeError} If there's an error fetching or deleting payment methods
 * @throws {ZodError} If the input validation fails
 *
 * @example
 * ```ts
 * await deleteCustomerPaymentMethods({
 *   customerId: 'cus_123'
 * });
 * ```
 */
export const deleteCustomerPaymentMethods = async ({
  customerId,
}: DeleteCustomerPaymentMethodsOptions) => {
  // Validate input
  DeleteCustomerPaymentMethodsSchema.parse({ customerId })

  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
  })

  await Promise.all(
    paymentMethods.data.map(async (paymentMethod) =>
      stripe.paymentMethods.detach(paymentMethod.id),
    ),
  )
}
