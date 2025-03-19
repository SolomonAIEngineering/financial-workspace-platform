# Trigger.dev Jobs

This directory contains all the Trigger.dev jobs for the SMB Financial Management Platform.

## Getting Started

1. Install the Trigger.dev CLI:

   ```bash
   pnpm install
   ```

2. Login to Trigger.dev:

   ```bash
   pnpm trigger:login
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

   This will start both the Next.js app and the Trigger.dev CLI.

## Directory Structure

- `client.ts` - The Trigger.dev client used to trigger jobs
- `server.ts` - The Trigger.dev server that registers all jobs
- `examples/` - Example jobs to help you get started
- `server/` - Server-side code for Trigger.dev
- `client/` - Client-side code for Trigger.dev

## Creating a New Job

1. Create a new file in the appropriate directory (e.g., `src/jobs/financial/sync-transactions.ts`)
2. Import the client from `../client`
3. Define your job using `schemaTask()`
4. Import your job file in `server.ts`

Example:

```typescript
import { client } from '../client';

schemaTask({
  id: 'sync-transactions',
  name: 'Sync Transactions',
  version: '0.0.1',
  trigger: client.scheduleTrigger({
    schedule: '0 0 * * *', // Run at midnight every day
  }),
  run: async (payload, io, ctx) => {
    // Your job logic here
    return { success: true };
  },
});
```

## Deploying Jobs

To deploy your jobs to production:

```bash
pnpm trigger:deploy
```

## Environment Variables

Make sure to set these environment variables:

- `TRIGGER_API_KEY` - Your Trigger.dev API key
- `TRIGGER_API_URL` - The Trigger.dev API URL (defaults to https://api.trigger.dev)
- `TRIGGER_ENDPOINT_ID` - Your Trigger.dev endpoint ID

## Learn More

- [Trigger.dev Documentation](https://trigger.dev/docs)
- [Trigger.dev Dashboard](https://app.trigger.dev)
