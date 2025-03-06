import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { env } from '@/env';
import { prisma } from '@/server/db';

// Initialize Stripe with your API key
const stripe = new Stripe(env.STRIPE_API_KEY, {
  apiVersion: '2025-02-24.acacia', // Using the current latest version
});

/**
 * Handle Stripe webhook events
 *
 * This endpoint receives webhook events from Stripe and processes them
 * accordingly. It validates the webhook signature for security and handles
 * various event types.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);

    return new NextResponse(
      `Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        status: 400,
      }
    );
  }

  // Process different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Extract customer and subscription details
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Update user with subscription info if a user ID is provided in the metadata
        if (session.metadata?.userId) {
          await handleCheckoutCompleted(session);
        }

        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);

        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);

        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle failed payment
        await handleInvoicePaymentFailed(invoice);

        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        // Handle successful payment
        await handleInvoicePaymentSucceeded(invoice);

        break;
      }

      // You can add more event types as needed

      default:
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/** Handle checkout.session.completed event */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('No userId found in session metadata');

    return;
  }

  // Make sure the customer exists in your database and is linked to this user
  await prisma.user.update({
    data: {
      stripeCustomerId: session.customer as string,
    },
    where: { id: userId },
  });
}

/** Handle customer.subscription.created/updated events */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Find the user associated with this customer ID
  const customer = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customer },
  });

  if (!user) {
    console.error(`No user found for Stripe customer: ${customer}`);

    return;
  }

  // Update user's subscription status, plan, etc.
  // This would depend on how you're storing subscription data
  // For now, we'll just update some fields on the user record

  // Get the subscription item and price details
  const subscriptionItem = subscription.items.data[0];
  const price = subscriptionItem.price;

  // Update user upload limits or other features based on their plan
  // This is just an example; adjust according to your plans
  let uploadLimit = 100_000_000; // Default limit

  if (price.nickname?.includes('Pro')) {
    uploadLimit = 500_000_000;
  } else if (price.nickname?.includes('Team')) {
    uploadLimit = 1_000_000_000;
  }

  await prisma.user.update({
    data: {
      uploadLimit: uploadLimit,
      // You might store other subscription details in a dedicated table
    },
    where: { id: user.id },
  });
}

/** Handle customer.subscription.deleted event */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customer },
  });

  if (!user) {
    console.error(`No user found for Stripe customer: ${customer}`);

    return;
  }

  try {
    // Reset user to free tier limits
    await prisma.user.update({
      data: {
        uploadLimit: 100_000_000, // Reset to default
      },
      where: { id: user.id },
    });
  } catch (error) {
    console.error(
      `Failed to update user after subscription deletion: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/** Handle invoice.payment_succeeded event */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // You might want to log this or update payment history
}

/** Handle invoice.payment_failed event */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customer = invoice.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customer },
  });

  if (!user) {
    console.error(`No user found for Stripe customer: ${customer}`);

    return;
  }

  // TODO: You might want to notify the user or take other action
}
