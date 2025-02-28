import { type NextRequest, NextResponse } from 'next/server';

import { registerJobs } from '@/jobs';
import { client } from '@/jobs/client';

// Initialize and register all jobs
const jobs = registerJobs();

/** API endpoint for trigger.dev webhooks */
export async function POST(req: NextRequest) {
  try {
    // Handle the webhook request from TriggerDev
    const response = await client.handleRequest(req);

    // Convert the response to a NextResponse
    return new Response(response.body, {
      headers: response.headers,
      status: response.status,
    });
  } catch (error) {
    console.error('Error handling Trigger.dev webhook:', error);

    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Trigger.dev requires GET for health checks
export function GET(_req: NextRequest) {
  // For GET requests, we return a simple health check response
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
