'use server';

import { authActionClient } from '../safe-action';
import { createGoCardLessLinkSchema } from '../schema';
import { engine } from '@/lib/engine';
import { redirect } from 'next/navigation';

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
      await engine.institutions[':id'].usage.$put({
        param: {
          id: institutionId,
        },
      });

      const redirectTo = new URL(redirectBase);

      redirectTo.searchParams.append('step', step);
      redirectTo.searchParams.append('provider', 'gocardless');

      try {
        const agreementResponse = await engine.auth.gocardless.agreement.create(
          {
            institutionId,
            transactionTotalDays: availableHistory,
          }
        );

        const { data: agreementData } = await agreementResponse;

        const linkResponse = await engine.auth.gocardless.link({
          agreement: agreementData.id,
          institutionId,
          redirect: redirectTo.toString(),
        });

        const { data: linkData } = await linkResponse;

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
