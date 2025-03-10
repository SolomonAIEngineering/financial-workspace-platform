'use server';

import { authActionClient } from '../safe-action';
import { engine } from '@/lib/engine';
import { nanoid } from 'nanoid';
import { redirect } from 'next/navigation';
import { z } from 'zod';

export const reconnectGoCardLessLinkAction = authActionClient
  .schema(
    z.object({
      id: z.string(),
      institutionId: z.string(),
      availableHistory: z.number(),
      isDesktop: z.boolean(),
      redirectTo: z.string(),
    })
  )
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
          redirect: link.toString(),
          // In the reconnect flow we need the reference based on the team
          // so we can find the correct requestion id on success and update the current reference
          // reference,
        });

        const { data: linkData } = await linkResponse;

        if (!linkData || !linkData.link) {
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
