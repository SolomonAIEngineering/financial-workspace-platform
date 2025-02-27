import { type NextRequest, NextResponse } from 'next/server';

import { env } from '@/env';

/**
 * Handle redirects from Stripe checkout or customer portal
 *
 * This route handles redirects when a user completes payment or manages their
 * subscription in Stripe and gets redirected back to the application.
 *
 * It can process 'success' or 'cancel' status from checkout.
 */
export async function GET(req: NextRequest) {
  // Get the URL parameters
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get('status') || 'success';
  const session_id = searchParams.get('session_id');

  // Get the source (checkout or portal)
  const source = searchParams.get('source') || 'checkout';

  // Create a URL to redirect to with the appropriate query parameters
  const redirectUrl = new URL(
    '/settings',
    env.NEXT_PUBLIC_SITE_URL ||
      process.env.VERCEL_URL ||
      'http://localhost:3000'
  );

  // Add status parameter
  redirectUrl.searchParams.append('payment_status', status);

  // Add session ID if available
  if (session_id) {
    redirectUrl.searchParams.append('session_id', session_id);
  }
  // If from customer portal, we know it was subscription management
  if (source === 'portal') {
    redirectUrl.searchParams.append('subscription_updated', 'true');
  }

  // Redirect the user to the settings page with the status
  return NextResponse.redirect(redirectUrl);
}
