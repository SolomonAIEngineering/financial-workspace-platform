'use server';

import { authActionClient } from '@/actions/safe-action';
import { reconnectConnectionSchema } from './schema';
import { refreshConnectionJob } from '@/jobs';

export const reconnectConnectionAction = authActionClient
  .schema(reconnectConnectionSchema)
  .action(
    async ({ parsedInput: { connectionId, provider }, ctx: { user } }) => {
      const event = await refreshConnectionJob.trigger({
        connectionId,
      });

      return event;
    }
  );
