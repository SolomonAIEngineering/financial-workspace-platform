import { STRIPE_CUSTOMER_TYPE } from '@solomonai/lib/constants/billing'
import type { User } from '@solomonai/prisma/client'
import { onSubscriptionUpdated } from './webhook/on-subscription-updated'
import { prisma } from '@solomonai/prisma/server'
import { stripe } from '@solomonai/lib/server-only/stripe'
import { z } from 'zod'

/**
 * Schema for validating email parameter
 */
const EmailSchema = z.string().email('Invalid email format')

/**
 * Schema for validating customer ID parameter
 */
const CustomerIdSchema = z.string().min(1, 'Customer ID is required')

/**
 * Schema for validating user parameter
 */
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email().nullable(),
  name: z.string().nullable(),
  stripeCustomerId: z.string().nullable(),
})

/**
 * Get a non team Stripe customer by email.
 *
 * @param email - The email address to search for
 * @returns Promise resolving to a Stripe customer or null if not found
 * @throws {Stripe.errors.StripeError} If there's an error fetching the customers
 * @throws {ZodError} If the input validation fails
 */
export const getStripeCustomerByEmail = async (email: string) => {
  // Validate input
  EmailSchema.parse(email)

  const foundStripeCustomers = await stripe.customers.list({
    email,
  })

  return (
    foundStripeCustomers.data.find(
      (customer) => customer.metadata.type !== 'team',
    ) ?? null
  )
}

/**
 * Get a Stripe customer by ID
 *
 * @param stripeCustomerId - The ID of the Stripe customer to retrieve
 * @returns Promise resolving to a Stripe customer or null if not found or deleted
 * @throws {Stripe.errors.StripeError} If there's an error fetching the customer
 * @throws {ZodError} If the input validation fails
 */
export const getStripeCustomerById = async (stripeCustomerId: string) => {
  // Validate input
  CustomerIdSchema.parse(stripeCustomerId)

  try {
    const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId)

    return !stripeCustomer.deleted ? stripeCustomer : null
  } catch {
    return null
  }
}

/**
 * Get a stripe customer by user.
 *
 * Will create a Stripe customer and update the relevant user if one does not exist.
 *
 * @param user - The user to get or create a Stripe customer for
 * @returns Promise resolving to an object containing the user and their Stripe customer
 * @throws {Error} If the Stripe customer is missing
 * @throws {Stripe.errors.StripeError} If there's an error with Stripe operations
 * @throws {ZodError} If the input validation fails
 */
export const getStripeCustomerByUser = async (user: User) => {
  // Validate input
  UserSchema.parse(user)

  if (user.stripeCustomerId) {
    const stripeCustomer = await getStripeCustomerById(user.stripeCustomerId)

    if (!stripeCustomer) {
      throw new Error('Missing Stripe customer')
    }

    return {
      user,
      stripeCustomer,
    }
  }

  if (!user.email) {
    throw new Error('User email is required')
  }

  let stripeCustomer = await getStripeCustomerByEmail(user.email)

  const isSyncRequired = Boolean(stripeCustomer && !stripeCustomer.deleted)

  if (!stripeCustomer) {
    stripeCustomer = await stripe.customers.create({
      name: user.name ?? undefined,
      email: user.email,
      metadata: {
        userId: user.id,
        type: STRIPE_CUSTOMER_TYPE.INDIVIDUAL,
      },
    })
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      stripeCustomerId: stripeCustomer.id,
    },
  })

  // Sync subscriptions if the customer already exists for back filling the DB
  // and local development.
  if (isSyncRequired) {
    await syncStripeCustomerSubscriptions(user.id, stripeCustomer.id).catch(
      (e) => {
        console.error(e)
      },
    )
  }

  return {
    user: updatedUser,
    stripeCustomer,
  }
}

/**
 * Get a Stripe customer ID by user
 *
 * @param user - The user to get the Stripe customer ID for
 * @returns Promise resolving to the Stripe customer ID
 * @throws {Error} If the Stripe customer is missing
 * @throws {Stripe.errors.StripeError} If there's an error with Stripe operations
 * @throws {ZodError} If the input validation fails
 */
export const getStripeCustomerIdByUser = async (user: User) => {
  // Validate input
  UserSchema.parse(user)

  if (user.stripeCustomerId !== null) {
    return user.stripeCustomerId
  }

  return await getStripeCustomerByUser(user).then(
    (session) => session.stripeCustomer.id,
  )
}

/**
 * Sync Stripe customer subscriptions with the database
 *
 * @param userId - The ID of the user
 * @param stripeCustomerId - The ID of the Stripe customer
 * @returns Promise resolving when sync is complete
 * @throws {Stripe.errors.StripeError} If there's an error fetching subscriptions
 */
const syncStripeCustomerSubscriptions = async (
  userId: string,
  stripeCustomerId: string,
) => {
  const stripeSubscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
  })

  await Promise.all(
    stripeSubscriptions.data.map(async (subscription) =>
      onSubscriptionUpdated({
        userId,
        subscription,
      }),
    ),
  )
}
