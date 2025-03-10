'use server';

import { authActionClient } from '../safe-action';
import { createGoCardLessLinkSchema } from '../schema';
import { engine } from '@/lib/engine';
import { redirect } from 'next/navigation';

/**
 * @example
 *   // This function is typically called from a client component after form submission
 *   // Example usage (client-side):
 *   //
 *   // const result = await createGoCardLessLinkAction({
 *   //   institutionId: 'ins_123456',
 *   //   availableHistory: 90,
 *   //   redirectBase: 'https://example.com/connect/callback',
 *   //   step: 'account'
 *   // });
 *
 * @function createGoCardLessLinkAction
 * @param {Object} options - The options for creating the GoCardless link
 * @param {Object} options.parsedInput - The validated input parameters
 * @param {string} options.parsedInput.institutionId - The unique identifier of
 *   the financial institution to connect with
 * @param {number} options.parsedInput.availableHistory - The number of days of
 *   transaction history to request access to
 * @param {string} options.parsedInput.redirectBase - The base URL to redirect
 *   to after the connection process
 * @param {string} options.parsedInput.step - The current step in the connection
 *   flow (defaults to 'account')
 * @param {Object} options.ctx - The context object containing user information
 * @param {Object} options.ctx.user - The authenticated user making the request
 * @returns {Promise<never>} - Redirects to the GoCardless authentication page,
 *   so never returns
 * @throws {Error} - Throws an error if the GoCardless API calls fail or if
 *   there's an issue with the redirect
 * @institution
 *
 * Creates a GoCardless link for connecting a financial institution to the user's account.
 *
 * This server action handles the process of establishing a connection with a financial institution
 * through the GoCardless API. It creates an agreement with the institution, generates a link for
 * the user to authenticate with the institution, and then redirects the user to that link.
 */
export const createGoCardLessLinkAction = authActionClient
  .schema(createGoCardLessLinkSchema)
  .action(
    async ({
      parsedInput: {
        institutionId,
        availableHistory,
        redirectBase,
        step = 'account',
      },
      ctx: { user },
    }) => {
      await engine.apiInstitutions[':id'].usage.$put({
        param: {
          id: institutionId,
        },
      });

      const redirectTo = new URL(redirectBase);

      redirectTo.searchParams.append('step', step);
      redirectTo.searchParams.append('provider', 'gocardless');

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
          redirect: redirectTo.toString(),
        });

        return redirect(linkData.link);
      } catch (error) {
        // Ignore NEXT_REDIRECT error in analytics
        if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
          throw error;
        }

        throw error;
      }
    }
  );
