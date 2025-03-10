'use server';

import { authActionClient } from '../safe-action';
import { engine } from '@/lib/engine';
import { reconnectGoCardLessLinkSchema } from './schema';
import { redirect } from 'next/navigation';

/**
 * @example
 *   // This function is typically called from a client component after a reconnection is needed
 *   // Example usage (client-side):
 *   //
 *   // const result = await reconnectGoCardLessLinkAction({
 *   //   id: 'conn_123456',
 *   //   institutionId: 'ins_123456',
 *   //   availableHistory: 90,
 *   //   isDesktop: true,
 *   //   redirectTo: 'https://example.com/connect/callback'
 *   // });
 *
 * @function reconnectGoCardLessLinkAction
 * @param {Object} options - The options for reconnecting the GoCardless link
 * @param {Object} options.parsedInput - The validated input parameters
 * @param {string} options.parsedInput.id - The unique identifier of the
 *   existing connection to reconnect
 * @param {string} options.parsedInput.institutionId - The unique identifier of
 *   the financial institution
 * @param {number} options.parsedInput.availableHistory - The number of days of
 *   transaction history to request access to
 * @param {boolean} options.parsedInput.isDesktop - Whether the reconnection is
 *   being performed from a desktop device
 * @param {string} options.parsedInput.redirectTo - The URL to redirect to after
 *   the reconnection process
 * @param {Object} options.ctx - The context object containing user information
 * @param {Object} options.ctx.user - The authenticated user making the request
 * @returns {Promise<never>} - Redirects to the GoCardless authentication page,
 *   so never returns
 * @throws {Error} - Throws an error if the GoCardless API calls fail, if
 *   there's an issue with the redirect, or if the link data is missing or
 *   invalid
 * @institution
 *
 * Reconnects a previously established GoCardless link for a financial institution.
 *
 * This server action handles the process of reconnecting a financial institution through
 * the GoCardless API when a previous connection has expired or been disconnected. It creates
 * a new agreement with the institution, generates a fresh link for the user to authenticate
 * with the institution, and then redirects the user to that link.
 *
 * The reconnection process is necessary when a user's consent has expired or when there are
 * issues with the existing connection that require re-authentication.
 */
export const reconnectGoCardLessLinkAction = authActionClient
  .schema(reconnectGoCardLessLinkSchema)
  .action(
    async ({
      parsedInput: {
        id,
        institutionId,
        availableHistory,
        redirectTo,
        isDesktop,
      },
      ctx: { user },
    }) => {
      // const reference = `${user.id}:${nanoid()}`;

      const link = new URL(redirectTo);

      link.searchParams.append('id', id);

      if (isDesktop) {
        link.searchParams.append('desktop', 'true');
      }

      try {
        const { data: agreementData } = await engine.apiGocardless.createAgreement(
          {
            institutionId,
            transactionTotalDays: availableHistory,
          }
        );

        const { data: linkData } = await engine.apiGocardless.createLink({
          agreement: agreementData.id,
          institutionId,
          redirect: link.toString(),
          // In the reconnect flow we need the reference based on the team
          // so we can find the correct requestion id on success and update the current reference
          // reference,
        });

        if (!linkData?.link) {
          throw new Error('Failed to create link');
        }

        return redirect(linkData.link);
      } catch (error) {
        // Ignore NEXT_REDIRECT error
        if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
          throw error;
        }

        throw error;
      }
    }
  );
