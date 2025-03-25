import { stripe } from '@solomonai/lib/server-only/stripe'
import { z } from 'zod'

/**
 * Schema for validating get invoices options
 */
export const GetInvoicesSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
})

/**
 * Type for get invoices options
 */
export type GetInvoicesOptions = z.infer<typeof GetInvoicesSchema>

/**
 * Retrieves all invoices for a Stripe customer
 *
 * @param options - Options for retrieving invoices
 * @param options.customerId - The ID of the customer to get invoices for
 * @returns Promise resolving to a list of Stripe invoices
 * @throws {Stripe.errors.StripeError} If there's an error fetching the invoices
 * @throws {ZodError} If the input validation fails
 *
 * @example
 * ```ts
 * const invoices = await getInvoices({
 *   customerId: 'cus_123'
 * });
 * console.info(invoices.data);
 * ```
 */
export const getInvoices = async ({ customerId }: GetInvoicesOptions) => {
  // Validate input
  GetInvoicesSchema.parse({ customerId })

  return await stripe.invoices.list({
    customer: customerId,
  })
}
